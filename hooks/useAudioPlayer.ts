import { useState, useRef, useEffect, useCallback, RefObject } from 'react';
import { Audiobook, Bookmark, Clip, BluetoothControls, Chapter } from '../types';
import { DEFAULT_AUDIOBOOK } from '../constants';
import { formatTime } from '../utils';
import { parseM4BChapters } from '../utils/m4bParser';

export const useAudioPlayer = (
    audioRef: RefObject<HTMLAudioElement>,
    clipAudioRef: RefObject<HTMLAudioElement>
) => {
    const [audiobook, setAudiobook] = useState<Audiobook>(DEFAULT_AUDIOBOOK);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

    // Modals visibility state
    const [showSettings, setShowSettings] = useState(false);
    const [showSleepTimer, setShowSleepTimer] = useState(false);
    const [showClips, setShowClips] = useState(false);
    const [showFileSelector, setShowFileSelector] = useState(true);
    const [showChapterSelector, setShowChapterSelector] = useState(false);
    const [showClipPlayer, setShowClipPlayer] = useState(false);

    // Clip playback state
    const [currentClip, setCurrentClip] = useState<Clip | null>(null);
    const [isPlayingClip, setIsPlayingClip] = useState(false);
    const [clipCurrentTime, setClipCurrentTime] = useState(0);
    const [savedBookPosition, setSavedBookPosition] = useState(0);

    const [bluetoothControls, setBluetoothControls] = useState<BluetoothControls>({
        previousFile: 'Rewind 45 s',
        nextFile: 'Add bookmark',
        swapButtons: false
    });

    const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Main Audio Listeners Effect
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => {
            setDuration(isFinite(audio.duration) ? audio.duration : 0);
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
    }, [audioRef, audiobook.audioUrl, audiobook.chapters, currentChapter]);
    
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
        // Clear any existing timer
        if (sleepTimerRef.current) {
            clearTimeout(sleepTimerRef.current);
        }

        // Set a new timer only if the timer is active and audio is playing
        if (sleepTimer > 0 && isPlaying) {
            sleepTimerRef.current = setTimeout(() => {
                setSleepTimer(prev => {
                    const newTime = prev - 1;
                    if (newTime <= 0) {
                        if (audioRef.current) {
                            audioRef.current.pause();
                        }
                        return 0; // Timer finished
                    }
                    return newTime; // Continue countdown
                });
            }, 1000);
        }

        // Cleanup on unmount or when dependencies change
        return () => {
            if (sleepTimerRef.current) {
                clearTimeout(sleepTimerRef.current);
            }
        };
    }, [sleepTimer, isPlaying, audioRef]);

    // Cleanup Blob URLs Effect
    useEffect(() => {
        return () => {
            clips.forEach(clip => URL.revokeObjectURL(clip.clipBlobUrl));
        };
    }, [clips]);

    const handleFileSelect = useCallback(async (file: File) => {
        if (!file) return;

        setIsParsing(true);
        setSelectedFile(file);
        
        try {
            const fileBuffer = await file.arrayBuffer();
            const audioUrl = URL.createObjectURL(new Blob([fileBuffer], { type: file.type }));
            const filename = file.name.replace(/\.[^/.]+$/, "");
            
            let chapters: Chapter[] = [{ id: 1, title: "Start", startTime: 0 }];
            if (file.name.endsWith('.m4b') || file.type === 'audio/mp4' || file.type === 'audio/x-m4a') {
                try {
                    const parsedChapters = await parseM4BChapters(fileBuffer);
                    if (parsedChapters.length > 0) {
                        chapters = parsedChapters;
                    }
                } catch (error) {
                    console.warn("Could not parse chapter data:", error);
                    // Fallback to default single chapter
                }
            }

            const newAudiobook: Audiobook = {
                title: filename,
                author: "Unknown Author",
                narrator: "Unknown Narrator",
                cover: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%231f2937'/%3E%3Ctext x='100' y='140' text-anchor='middle' fill='white' font-size='12' font-family='sans-serif'%3E${filename.substring(0, 20)}%3C/text%3E%3Ctext x='100' y='160' text-anchor='middle' fill='white' font-size='12' font-family='sans-serif'%3EAudiobook%3C/text%3E%3C/svg%3E`,
                chapters,
                audioUrl: audioUrl,
                transcript: []
            };
            setAudiobook(newAudiobook);
            setShowFileSelector(false);
            setCurrentTime(0);
            setCurrentChapter(0);
            setIsPlaying(false);
            setBookmarks([]);
            setClips([]);
        } catch (error) {
            console.error("Error processing file:", error);
            alert("Sorry, there was an error loading that file.");
        } finally {
            setIsParsing(false);
        }
    }, []);

    const seekTo = useCallback((time: number) => {
        if (audioRef.current) {
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
    
    const skip = useCallback((amount: number) => {
        seekTo(Math.max(0, Math.min(duration, currentTime + amount)));
    }, [currentTime, duration, seekTo]);

    const addBookmark = useCallback(() => {
        const newBookmark: Bookmark = {
            id: Date.now(),
            time: currentTime,
            title: `Bookmark at ${formatTime(currentTime)}`,
            chapter: currentChapter
        };
        setBookmarks(prev => [...prev, newBookmark]);
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

        const simulatedClipBlob = new Blob(
            [`Simulated audio clip from ${formatTime(clipStart)} to ${formatTime(clipEnd)}`],
            { type: 'audio/mpeg' }
        );
        const clipBlobUrl = URL.createObjectURL(simulatedClipBlob);
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
            clipBlobUrl,
            originalStartTime: clipStart,
            originalEndTime: clipEnd
        };
        setClips(prev => [newClip, ...prev]);
        setIsCreatingClip(false);
        alert(`Audio clip created! Duration: ${Math.round(clipDuration)} seconds`);
    }, [currentTime, currentChapter, audiobook.audioUrl]);

    const playClip = useCallback((clip: Clip) => {
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
            clipAudioRef.current.src = currentClip.originalAudioUrl!;
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
    
    const handleClipSeek = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!currentClip || !clipAudioRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newRelativeTime = percent * currentClip.duration;
        clipAudioRef.current.currentTime = currentClip.startTime + newRelativeTime;
        setClipCurrentTime(newRelativeTime);
    }, [clipAudioRef, currentClip]);

    const deleteClip = useCallback((clipId: number) => {
        const clipToDelete = clips.find(c => c.id === clipId);
        if (clipToDelete) URL.revokeObjectURL(clipToDelete.clipBlobUrl);
        setClips(prev => prev.filter(c => c.id !== clipId));
    }, [clips]);
    
    const changePlaybackRate = useCallback((rate: number) => {
        setPlaybackRate(rate);
        if (audioRef.current) audioRef.current.playbackRate = rate;
    }, [audioRef]);
    
    const changeVolume = useCallback((vol: number) => {
        setVolume(vol);
        if (audioRef.current) audioRef.current.volume = vol;
    }, [audioRef]);
    
    const executeBluetoothAction = useCallback((action: string) => {
        const actions: { [key: string]: () => void } = {
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

    return {
        audiobook, selectedFile, isPlaying, currentTime, duration, playbackRate, volume, sleepTimer,
        bookmarks, clips, currentChapter, isCreatingClip, isParsing, showSettings, showSleepTimer, showClips,
        showFileSelector, showChapterSelector, showClipPlayer, currentClip, isPlayingClip, clipCurrentTime,
        bluetoothControls, setBluetoothControls,
        handleFileSelect, seekTo, togglePlayPause, skip, addBookmark, createClip, playClip,
        toggleClipPlayPause, stopClipPlayback, closeClipPlayer, handleClipSeek, deleteClip,
        changePlaybackRate, changeVolume, executeBluetoothAction,
        setSleepTimer, setShowSettings, setShowSleepTimer, setShowClips, setShowFileSelector,
        setShowChapterSelector, setShowClipPlayer
    };
};