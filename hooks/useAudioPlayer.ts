import { useState, useRef, useEffect, useCallback } from 'react';
import { DEFAULT_AUDIOBOOK } from '../constants';
import { formatTime, encodeAudioBufferToWav } from '../utils';
import { parseM4BChapters } from '../utils/m4bParser.js';
import type { Chapter, Bookmark, Clip, Stats, Audiobook } from '../types';
import { initDB, addBook, getBook, getAllBooks } from '../utils/db.js';
import type { StoredAudiobook } from '../utils/db.js';
import { getCoverForBook } from '../utils/coverFetcher.js';

const defaultStats: Stats = {
    listeningActivity: {}, // { 'YYYY-MM-DD': seconds }
    books: {} // { 'filename.m4b': { duration: 3600 } }
};

export const useAudioPlayer = (
    audioRef,
    clipAudioRef
) => {
    const [audiobook, setAudiobook] = useState<Audiobook>(DEFAULT_AUDIOBOOK);
    const [selectedFile, setSelectedFile] = useState<{name: string} | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [volume, setVolume] = useState(1.0);
    const [sleepTimer, setSleepTimer] = useState(0);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [clips, setClips] = useState<Clip[]>([]);
    const [currentChapter, setCurrentChapter] = useState(0);
    const [isCreatingClip, setIsCreatingClip] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    
    const [stats, setStats] = useState<Stats>(defaultStats);
    const [library, setLibrary] = useState<Omit<StoredAudiobook, 'fileBuffer'>[]>([]);
    const secondsListenedRef = useRef(0);

    // Modals visibility state
    const [showSettings, setShowSettings] = useState(false);
    const [showSleepTimer, setShowSleepTimer] = useState(false);
    const [showClips, setShowClips] = useState(false);
    const [showFileSelector, setShowFileSelector] = useState(true);
    const [showChapterSelector, setShowChapterSelector] = useState(false);
    const [showClipPlayer, setShowClipPlayer] = useState(false);
    const [showReport, setShowReport] = useState(false);

    // Clip playback state
    const [currentClip, setCurrentClip] = useState(null);
    const [isPlayingClip, setIsPlayingClip] = useState(false);
    const [clipCurrentTime, setClipCurrentTime] = useState(0);
    const [savedBookPosition, setSavedBookPosition] = useState(0);
    const [isDownloadingClipId, setIsDownloadingClipId] = useState<number | null>(null);

    const [bluetoothControls, setBluetoothControls] = useState({
        previousFile: 'Rewind 45 s',
        nextFile: 'Create clip',
        swapButtons: false,
        previousFileLong: 'Previous chapter',
        nextFileLong: 'Next chapter'
    });

    const sleepTimerRef = useRef(null);
    const hasLoadedInitialData = useRef(false);

    // --- DATA PERSISTENCE & INITIAL LOAD ---
    useEffect(() => {
        if (hasLoadedInitialData.current) return;
        hasLoadedInitialData.current = true;

        const loadInitialData = async () => {
            try {
                // 1. Initialize DB and load library
                await initDB();
                const books = await getAllBooks();
                setLibrary(books);

                // 2. Load global settings and stats from localStorage
                const savedData = JSON.parse(localStorage.getItem('audiobookPlayerData') || '{}');
                if (savedData.globalSettings?.bluetoothControls) {
                    setBluetoothControls(prev => ({...prev, ...savedData.globalSettings.bluetoothControls}));
                }
                setStats(savedData.stats || defaultStats);

                // 3. Load the last played book
                if (savedData.lastPlayedFile && books.some(b => b.key === savedData.lastPlayedFile)) {
                    await loadBook(savedData.lastPlayedFile);
                } else if (books.length > 0) {
                    setShowFileSelector(true);
                } else {
                    setShowFileSelector(true);
                }

            } catch (e) {
                console.error("Failed to load initial data", e);
                setShowFileSelector(true);
                setStats(defaultStats);
            }
        };

        loadInitialData();
    }, []);

    // Debounced save effect
    const saveState = useCallback(() => {
        if (!selectedFile?.name) return;
        try {
            const savedData = JSON.parse(localStorage.getItem('audiobookPlayerData') || '{}');
            
            const newBookData = { ...(savedData.bookData || {}) };
            newBookData[selectedFile.name] = {
                currentTime,
                bookmarks,
                clips
            };
            
            const dataToSave = {
                globalSettings: { bluetoothControls },
                stats,
                bookData: newBookData,
                lastPlayedFile: selectedFile.name
            };
            localStorage.setItem('audiobookPlayerData', JSON.stringify(dataToSave));
        } catch (e) {
            console.error("Failed to save data", e);
        }
    }, [selectedFile, bluetoothControls, stats, currentTime, bookmarks, clips]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if(selectedFile) saveState();
        }, 2000); // Save 2 seconds after the last change
        return () => clearTimeout(handler);
    }, [currentTime, bookmarks, clips, stats, bluetoothControls, saveState, selectedFile]);

    // --- LISTENING TRACKER ---
    useEffect(() => {
        let intervalId;
        const flushSeconds = () => {
            if (secondsListenedRef.current > 0) {
                 const today = new Date().toISOString().split('T')[0];
                 setStats(prevStats => {
                    const newActivity = { ...prevStats.listeningActivity };
                    const elapsed = Math.round(secondsListenedRef.current);
                    newActivity[today] = (newActivity[today] || 0) + elapsed;
                    return { ...prevStats, listeningActivity: newActivity };
                });
                secondsListenedRef.current = 0;
            }
        };

        if (isPlaying) {
            intervalId = setInterval(() => {
                secondsListenedRef.current += 1;
                if (secondsListenedRef.current > 0 && secondsListenedRef.current % 15 === 0) {
                    flushSeconds();
                }
            }, 1000);
        } else {
            flushSeconds();
        }
        return () => {
            clearInterval(intervalId);
            flushSeconds();
        }
    }, [isPlaying]);

    // Main Audio Listeners Effect
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        
        const setAudioData = () => {
            const newDuration = isFinite(audio.duration) ? audio.duration : 0;
            setDuration(newDuration);
            // Update stats with duration for new books
            if (selectedFile?.name && newDuration > 0) {
                const currentBookStats = stats.books[selectedFile.name];
                if (!currentBookStats || currentBookStats.duration !== newDuration) {
                    setStats(prev => ({
                        ...prev,
                        books: {
                            ...prev.books,
                            [selectedFile.name]: { duration: newDuration }
                        }
                    }));
                }
            }
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            const chapterIndex = audiobook.chapters.findIndex((chap, i) => {
                const nextChap = audiobook.chapters[i + 1];
                return audio.currentTime >= chap.startTime && (!nextChap || audio.currentTime < nextChap.startTime);
            });
            if (chapterIndex !== -1 && chapterIndex !== currentChapter) {
                setCurrentChapter(chapterIndex);
            }
        };
        
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        audio.addEventListener('loadedmetadata', setAudioData);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handlePause);
        
        if (audio.readyState > 0) {
            setAudioData();
        }

        return () => {
            audio.removeEventListener('loadedmetadata', setAudioData);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handlePause);
        };
    }, [audioRef, audiobook.audioUrl, audiobook.chapters, currentChapter, selectedFile, stats.books]);
    
    // Clip Audio Listeners Effect
    useEffect(() => {
        const clipAudio = clipAudioRef.current;
        if (!clipAudio || !currentClip) return;

        const updateClipTime = () => {
            if (isPlayingClip) {
                const relativeTime = clipAudio.currentTime - currentClip.startTime;
                if (relativeTime >= currentClip.duration) {
                    clipAudio.pause();
                    setIsPlayingClip(false);
                    clipAudio.currentTime = currentClip.endTime;
                }
                setClipCurrentTime(Math.max(0, Math.min(relativeTime, currentClip.duration)));
            }
        };

        clipAudio.addEventListener('timeupdate', updateClipTime);
        return () => clipAudio.removeEventListener('timeupdate', updateClipTime);
    }, [clipAudioRef, currentClip, isPlayingClip]);

    // Sleep Timer Effect
    useEffect(() => {
        if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
        if (sleepTimer > 0 && isPlaying) {
            sleepTimerRef.current = setTimeout(() => {
                const newTime = sleepTimer - 1;
                if (newTime <= 0) {
                    if (audioRef.current) audioRef.current.pause();
                    setSleepTimer(0);
                } else {
                    setSleepTimer(newTime);
                }
            }, 1000);
        }
        return () => clearTimeout(sleepTimerRef.current);
    }, [sleepTimer, isPlaying, audioRef]);

    // Cleanup Blob URLs Effect
    useEffect(() => {
        const currentAudioUrl = audiobook.audioUrl;
        return () => {
            if (currentAudioUrl && currentAudioUrl.startsWith('blob:')) {
                URL.revokeObjectURL(currentAudioUrl);
            }
        };
    }, [audiobook.audioUrl]);

    const seekTo = useCallback((time) => {
        if (audioRef.current && isFinite(time)) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    }, [audioRef]);
    
    const togglePlayPause = useCallback(() => {
        if (isPlayingClip) {
            if (clipAudioRef.current) clipAudioRef.current.pause();
            setIsPlayingClip(false);
            return;
        }

        if (!audioRef.current || !audiobook.audioUrl) return;

        if (audioRef.current.paused) {
            audioRef.current.play().catch(console.error);
        } else {
            audioRef.current.pause();
        }
    }, [isPlayingClip, audiobook.audioUrl, audioRef, clipAudioRef]);
    
    const skip = useCallback((amount) => {
        seekTo(Math.max(0, Math.min(duration, currentTime + amount)));
    }, [currentTime, duration, seekTo]);
    
    const addBookmark = useCallback(() => {
        const newBookmark = {
            id: Date.now(),
            time: currentTime,
            title: `Bookmark at ${formatTime(currentTime)}`,
            chapter: currentChapter
        };
        setBookmarks(prev => [...prev, newBookmark].sort((a,b) => a.time - b.time));
    }, [currentTime, currentChapter]);

    const createClip = useCallback(async () => {
        if (!audioRef.current?.src || currentTime < 1) {
            alert('Cannot create clip. Load an audio file and play for a bit.');
            return;
        }
        setIsCreatingClip(true);
        const clipStart = Math.max(0, currentTime - 60);
        const clipEnd = currentTime;
        const clipDuration = clipEnd - clipStart;

        // The actual playback uses the original audio file and seeks to the correct time.
        const clipText = `Audio clip from ${formatTime(clipStart)} to ${formatTime(clipEnd)}. [Transcription would appear here]`;

        const newClip: Clip = {
            id: Date.now(),
            startTime: clipStart,
            endTime: clipEnd,
            duration: clipDuration,
            text: clipText,
            title: `Clip ${formatTime(clipStart)}-${formatTime(clipEnd)}`,
            chapter: currentChapter,
            createdAt: new Date().toLocaleDateString(),
            originalAudioUrl: audiobook.audioUrl,
            originalStartTime: clipStart,
            originalEndTime: clipEnd
        };
        setClips(prev => [newClip, ...prev]);
        setIsCreatingClip(false);
        alert(`Audio clip created! Duration: ${Math.round(clipDuration)} seconds`);
    }, [currentTime, currentChapter, audiobook.audioUrl]);
    
    const changePlaybackRate = useCallback((rate) => {
        setPlaybackRate(rate);
        if (audioRef.current) audioRef.current.playbackRate = rate;
    }, [audioRef]);
    
    const changeVolume = useCallback((vol) => {
        setVolume(vol);
        if (audioRef.current) audioRef.current.volume = vol;
    }, [audioRef]);
    
    const executeBluetoothAction = useCallback((action) => {
        const actions = {
            'Rewind 10 s': () => skip(-10),
            'Rewind 30 s': () => skip(-30),
            'Rewind 45 s': () => skip(-45),
            'Rewind 60 s': () => skip(-60),
            'Fast forward 10 s': () => skip(10),
            'Fast forward 30 s': () => skip(30),
            'Fast forward 60 s': () => skip(60),
            'Add bookmark': addBookmark,
            'Create clip': createClip,
            'Previous chapter': () => seekTo(audiobook.chapters[Math.max(0, currentChapter - 1)].startTime),
            'Next chapter': () => seekTo(audiobook.chapters[Math.min(audiobook.chapters.length - 1, currentChapter + 1)].startTime),
            'Play/Pause': togglePlayPause,
            'Volume up': () => changeVolume(Math.min(1, volume + 0.1)),
            'Volume down': () => changeVolume(Math.max(0, volume - 0.1)),
            'Nothing': () => {}
        };
        actions[action]?.();
    }, [skip, addBookmark, createClip, audiobook.chapters, currentChapter, seekTo, togglePlayPause, changeVolume, volume]);

    // --- MEDIA SESSION API ---
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;

        let prevTrackTimeout = null;
        let isPrevTrackLongPress = false;
        let nextTrackTimeout = null;
        let isNextTrackLongPress = false;
        const LONG_PRESS_THRESHOLD = 400; // ms for detecting rapid presses

        const handlePreviousTrack = () => {
            const singlePressAction = bluetoothControls.swapButtons ? bluetoothControls.nextFile : bluetoothControls.previousFile;
            const longPressAction = bluetoothControls.swapButtons ? bluetoothControls.nextFileLong : bluetoothControls.previousFileLong;
            
            if (prevTrackTimeout) { 
                clearTimeout(prevTrackTimeout);
                if (!isPrevTrackLongPress) {
                    isPrevTrackLongPress = true;
                    executeBluetoothAction(longPressAction);
                }
            }
            
            prevTrackTimeout = setTimeout(() => {
                if (!isPrevTrackLongPress) {
                    executeBluetoothAction(singlePressAction);
                }
                prevTrackTimeout = null;
                isPrevTrackLongPress = false;
            }, LONG_PRESS_THRESHOLD);
        };
        
        const handleNextTrack = () => {
            const singlePressAction = bluetoothControls.swapButtons ? bluetoothControls.previousFile : bluetoothControls.nextFile;
            const longPressAction = bluetoothControls.swapButtons ? bluetoothControls.previousFileLong : bluetoothControls.nextFileLong;

            if (nextTrackTimeout) {
                clearTimeout(nextTrackTimeout);
                if (!isNextTrackLongPress) {
                    isNextTrackLongPress = true;
                    executeBluetoothAction(longPressAction);
                }
            }
            
            nextTrackTimeout = setTimeout(() => {
                if (!isNextTrackLongPress) {
                    executeBluetoothAction(singlePressAction);
                }
                nextTrackTimeout = null;
                isNextTrackLongPress = false;
            }, LONG_PRESS_THRESHOLD);
        };
        
        try {
            navigator.mediaSession.setActionHandler('previoustrack', handlePreviousTrack);
            navigator.mediaSession.setActionHandler('nexttrack', handleNextTrack);
            navigator.mediaSession.setActionHandler('play', () => togglePlayPause());
            navigator.mediaSession.setActionHandler('pause', () => togglePlayPause());
        } catch(e) { 
            console.error('Could not set media session action handlers', e); 
        }

        navigator.mediaSession.metadata = new MediaMetadata({
            title: audiobook.title,
            artist: audiobook.author,
            album: 'Smart Audiobook Player',
            artwork: [{ src: audiobook.cover, type: 'image/jpeg' }]
        });
        
        return () => {
            if ('mediaSession' in navigator) {
                navigator.mediaSession.setActionHandler('previoustrack', null);
                navigator.mediaSession.setActionHandler('nexttrack', null);
                navigator.mediaSession.setActionHandler('play', null);
                navigator.mediaSession.setActionHandler('pause', null);
            }
        };
    }, [bluetoothControls, executeBluetoothAction, audiobook.title, audiobook.author, audiobook.cover, togglePlayPause]);


    const loadBook = useCallback(async (fileKey: string) => {
        if (selectedFile?.name && selectedFile.name !== fileKey) {
            saveState();
        }
        
        setIsParsing(true);
        try {
            const storedBook = await getBook(fileKey);
            if (!storedBook) throw new Error("Book not found in DB");
    
            const { fileBuffer, ...metadata } = storedBook;
            
            if (audiobook.audioUrl && audiobook.audioUrl.startsWith('blob:')) {
                URL.revokeObjectURL(audiobook.audioUrl);
            }
            const audioUrl = URL.createObjectURL(new Blob([fileBuffer]));
    
            setAudiobook({ ...metadata, audioUrl, transcript: [] });
            setSelectedFile({ name: fileKey });
    
            const savedData = JSON.parse(localStorage.getItem('audiobookPlayerData') || '{}');
            const bookData = savedData.bookData?.[fileKey];
    
            setBookmarks(bookData?.bookmarks || []);
            
            const loadedClips = bookData?.clips || [];
            const updatedClips = loadedClips.map(clip => ({ ...clip, originalAudioUrl: audioUrl }));
            setClips(updatedClips);
            
            const seekTime = bookData?.currentTime || 0;

            if (audioRef.current) {
                const onCanPlay = () => {
                    seekTo(seekTime);
                    audioRef.current.removeEventListener('canplay', onCanPlay);
                };
                audioRef.current.addEventListener('canplay', onCanPlay);
                if (audioRef.current.readyState >= 3) {
                   onCanPlay();
                }
            } else {
                setCurrentTime(seekTime);
            }
            
            const chapterIndex = metadata.chapters.findIndex((chap, i) => {
                const nextChap = metadata.chapters[i + 1];
                return seekTime >= chap.startTime && (!nextChap || seekTime < nextChap.startTime);
            });
            setCurrentChapter(chapterIndex > -1 ? chapterIndex : 0);
    
            setShowFileSelector(false);
            setIsPlaying(false);
    
        } catch (error) {
            console.error("Error loading book from DB:", error);
            alert("Sorry, there was an error loading that book from your library.");
        } finally {
            setIsParsing(false);
        }
    }, [selectedFile, saveState, audiobook.audioUrl, audioRef, seekTo, setIsParsing, setAudiobook, setSelectedFile, setBookmarks, setClips, setCurrentTime, setCurrentChapter, setShowFileSelector, setIsPlaying]);
    
    const handleFileSelect = useCallback(async (file) => {
        if (!file) return;
        setIsParsing(true);
        
        try {
            const fileBuffer = await file.arrayBuffer();
            const filename = file.name.replace(/\.[^/.]+$/, "");
            
            let title = filename;
            let author = "Unknown Author";
            const parts = filename.split(/ [-–—] /);
            if (parts.length > 1) {
                author = parts.pop()?.trim() || "Unknown Author";
                title = parts.join(' - ').trim();
            }

            let chapters: Chapter[] = [{ id: 1, title: "Start", startTime: 0 }];
            if (file.name.endsWith('.m4b') || file.type === 'audio/mp4' || file.type === 'audio/x-m4a') {
                try {
                    const parsedChapters = await parseM4BChapters(fileBuffer);
                    if (parsedChapters.length > 0) chapters = parsedChapters;
                } catch (error) {
                    console.warn("Could not parse chapter data:", error);
                }
            }
            
            const defaultCover = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%231f2937'/%3E%3Ctext x='100' y='140' text-anchor='middle' fill='white' font-size='12' font-family='sans-serif'%3E${title.substring(0, 20)}%3C/text%3E%3Ctext x='100' y='160' text-anchor='middle' fill='white' font-size='12' font-family='sans-serif'%3EAudiobook%3C/text%3E%3C/svg%3E`;

            const newBookForDB: StoredAudiobook = {
                key: file.name,
                title: title,
                author: author,
                narrator: "Unknown Narrator",
                cover: defaultCover,
                chapters,
                fileBuffer
            };
    
            try {
                const coverUrl = await getCoverForBook(title, author);
                if (coverUrl) {
                    newBookForDB.cover = coverUrl;
                }
            } catch (e) {
                console.error("Failed to fetch cover art, using default.", e);
            }
    
            await addBook(newBookForDB);
    
            const { fileBuffer: _, ...bookForLibrary } = newBookForDB;
            setLibrary(prev => {
                const existingIndex = prev.findIndex(b => b.key === bookForLibrary.key);
                if (existingIndex > -1) {
                    const newLibrary = [...prev];
                    newLibrary[existingIndex] = bookForLibrary;
                    return newLibrary;
                }
                return [...prev, bookForLibrary];
            });
    
            await loadBook(file.name);
    
        } catch (error) {
            console.error("Error processing and saving file:", error);
            alert("Sorry, there was an error saving that file to your library.");
        } finally {
            setIsParsing(false);
        }
    }, [loadBook, setLibrary, setIsParsing]);

    const playClip = useCallback((clip) => {
        setSavedBookPosition(currentTime);
        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
        }
        setCurrentClip(clip);
        setClipCurrentTime(0);
        setShowClipPlayer(true);
        setShowClips(false);
    }, [currentTime, isPlaying, audioRef]);

    const toggleClipPlayPause = useCallback(() => {
        if (!currentClip || !clipAudioRef.current) return;
        
        if(isPlayingClip){
            clipAudioRef.current.pause();
        } else {
            clipAudioRef.current.src = currentClip.originalAudioUrl;
            clipAudioRef.current.currentTime = currentClip.startTime + clipCurrentTime;
            clipAudioRef.current.volume = volume;
            clipAudioRef.current.playbackRate = playbackRate;
            clipAudioRef.current.play().catch(console.error);
        }
        setIsPlayingClip(!isPlayingClip);

    }, [currentClip, isPlayingClip, clipCurrentTime, volume, playbackRate, clipAudioRef]);
    
    const stopClipPlayback = useCallback(() => {
        if(clipAudioRef.current) clipAudioRef.current.pause();
        setIsPlayingClip(false);
    }, [clipAudioRef]);


    const closeClipPlayer = useCallback(() => {
        if (clipAudioRef.current) {
            clipAudioRef.current.pause();
            clipAudioRef.current.src = "";
        }
        setIsPlayingClip(false);
        setShowClipPlayer(false);
        setCurrentClip(null);
        setClipCurrentTime(0);
        seekTo(savedBookPosition);
    }, [clipAudioRef, savedBookPosition, seekTo]);
    
    const handleClipSeek = useCallback((e) => {
        if (!currentClip || !clipAudioRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newRelativeTime = percent * currentClip.duration;
        clipAudioRef.current.currentTime = currentClip.startTime + newRelativeTime;
        setClipCurrentTime(newRelativeTime);
    }, [clipAudioRef, currentClip]);

    const deleteClip = useCallback((clipId) => {
        setClips(prev => prev.filter(c => c.id !== clipId));
    }, []);
    
    const downloadClip = useCallback(async (clipToDownload: Clip) => {
        if (!clipToDownload.originalAudioUrl) {
            alert("Clip data is not available for download.");
            return;
        }

        setIsDownloadingClipId(clipToDownload.id);
        
        try {
            // 1. Fetch the original audio file as an ArrayBuffer
            const response = await fetch(clipToDownload.originalAudioUrl);
            const arrayBuffer = await response.arrayBuffer();

            // 2. Use Web Audio API to decode it
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const sourceAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            // 3. Use OfflineAudioContext to precisely clip the audio
            const { numberOfChannels, sampleRate, duration: sourceDuration } = sourceAudioBuffer;
            let clipDuration = clipToDownload.duration;

            if (clipDuration <= 0) {
                throw new Error("Invalid clip duration for download.");
            }
            if (clipToDownload.startTime + clipDuration > sourceDuration) {
                console.warn("Clip extends beyond audio duration. Truncating.");
                clipDuration = sourceDuration - clipToDownload.startTime;
            }

            const offlineContext = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(
                numberOfChannels,
                Math.ceil(clipDuration * sampleRate), // length in samples
                sampleRate
            );

            const sourceNode = offlineContext.createBufferSource();
            sourceNode.buffer = sourceAudioBuffer;
            sourceNode.connect(offlineContext.destination);
            
            // Start playing the source from the clip's start time for the clip's duration.
            sourceNode.start(0, clipToDownload.startTime, clipDuration);

            // 4. Render the clipped audio and encode it to a WAV Blob
            const clippedAudioBuffer = await offlineContext.startRendering();
            const wavBlob = encodeAudioBufferToWav(clippedAudioBuffer);
            
            // 5. Trigger the download
            const downloadUrl = URL.createObjectURL(wavBlob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;
            const fileName = `${clipToDownload.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.wav`;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            
            // 6. Clean up
            window.URL.revokeObjectURL(downloadUrl);
            a.remove();
            
        } catch (error) {
            console.error("Error downloading clip:", error);
            alert("Sorry, there was an error preparing your clip for download.");
        } finally {
            setIsDownloadingClipId(null);
        }
    }, []);

    return {
        audiobook, selectedFile, isPlaying, currentTime, duration, playbackRate, volume, sleepTimer,
        bookmarks, clips, currentChapter, isCreatingClip, isParsing, showSettings, showSleepTimer, showClips,
        showFileSelector, showChapterSelector, showClipPlayer, currentClip, isPlayingClip, clipCurrentTime,
        showReport, stats, library, isDownloadingClipId,
        bluetoothControls, setBluetoothControls,
        handleFileSelect, loadBook, seekTo, togglePlayPause, skip, addBookmark, createClip, playClip,
        toggleClipPlayPause, stopClipPlayback, closeClipPlayer, handleClipSeek, deleteClip, downloadClip,
        changePlaybackRate, changeVolume, executeBluetoothAction,
        setSleepTimer, setShowSettings, setShowSleepTimer, setShowClips, setShowFileSelector,
        setShowChapterSelector, setShowReport
    };
};