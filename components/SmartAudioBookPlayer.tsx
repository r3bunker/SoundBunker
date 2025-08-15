
import React, { useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Bookmark, Clock, Settings, Folder, Scissors, FileText, ChevronLeft } from 'lucide-react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { formatTime } from '../utils';
import { PLAYBACK_RATES } from '../constants';
import ClipsModal from './modals/ClipsModal';
import ClipPlayerModal from './modals/ClipPlayerModal';
import ChapterSelectorModal from './modals/ChapterSelectorModal';
import FileSelectorModal from './modals/FileSelectorModal';
import SettingsModal from './modals/SettingsModal';
import SleepTimerModal from './modals/SleepTimerModal';

const SmartAudioBookPlayer: React.FC = () => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const clipAudioRef = useRef<HTMLAudioElement>(null);

    const {
        audiobook, selectedFile, isPlaying, currentTime, duration, playbackRate, sleepTimer,
        bookmarks, clips, currentChapter, isCreatingClip, isParsing, showSettings, showSleepTimer, showClips,
        showFileSelector, showChapterSelector, showClipPlayer, currentClip, isPlayingClip, clipCurrentTime,
        bluetoothControls, setBluetoothControls,
        handleFileSelect, seekTo, togglePlayPause, skip, addBookmark, createClip, playClip,
        toggleClipPlayPause, stopClipPlayback, closeClipPlayer, handleClipSeek, deleteClip,
        changePlaybackRate, executeBluetoothAction,
        setSleepTimer, setShowSettings, setShowSleepTimer, setShowClips, setShowFileSelector,
        setShowChapterSelector
    } = useAudioPlayer(audioRef, clipAudioRef);

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        seekTo(percent * duration);
    };

    const hasIntro = audiobook.chapters[0]?.title === 'Introduction';
    const displayChapterNumber = hasIntro ? currentChapter : currentChapter + 1;
    const totalDisplayChapters = hasIntro ? audiobook.chapters.length - 1 : audiobook.chapters.length;

    const chapterProgressText = (hasIntro && currentChapter === 0)
        ? 'Introduction'
        : `Chapter ${displayChapterNumber} of ${totalDisplayChapters}`;
    
    const currentChapterTitleDisplay = (hasIntro && currentChapter === 0)
        ? audiobook.chapters[0].title
        : String(displayChapterNumber).padStart(3, '0');


    return (
        <div className="max-w-md mx-auto bg-gray-900 text-white min-h-screen flex flex-col">
            <audio ref={audioRef} src={audiobook.audioUrl ?? undefined} />
            <audio ref={clipAudioRef} />

            <header className="flex items-center justify-between p-4 bg-gray-800 shadow-md">
                <button className="p-2 invisible"><ChevronLeft className="w-6 h-6" /></button>
                <h1 className="text-lg font-semibold truncate">Smart AudioBook Player</h1>
                <button onClick={() => setShowFileSelector(true)} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                    <Folder className="w-6 h-6" />
                </button>
            </header>

            <main className="flex-grow p-6 flex flex-col justify-between">
                <div className="text-center">
                    <img
                        src={audiobook.cover}
                        alt={audiobook.title}
                        className="w-48 h-72 mx-auto rounded-lg shadow-2xl mb-4 object-cover"
                    />
                    <h2 className="text-xl font-bold mb-1 truncate">{audiobook.title}</h2>
                    <p className="text-gray-400 mb-1">by {audiobook.author}</p>
                    <p className="text-gray-500 text-sm">Narrated by {audiobook.narrator}</p>
                </div>

                <div>
                    <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                            <span>{chapterProgressText}</span>
                            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-300 truncate flex-1">{currentChapterTitleDisplay}</p>
                            <button
                                onClick={() => setShowChapterSelector(true)}
                                className="ml-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 transition-colors"
                            >
                                Chapters
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="w-full h-2 bg-gray-700 rounded-full cursor-pointer group" onClick={handleSeek}>
                            <div
                                className="h-2 bg-blue-500 rounded-full relative"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -mt-2 w-4 h-4 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center space-x-8 mb-4">
                        <button onClick={() => skip(-30)} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><SkipBack className="w-8 h-8" /></button>
                        <button onClick={togglePlayPause} className="bg-blue-500 hover:bg-blue-600 rounded-full p-4 transition-colors shadow-lg">
                            {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 ml-1 text-white" />}
                        </button>
                        <button onClick={() => skip(30)} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><SkipForward className="w-8 h-8" /></button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button onClick={addBookmark} className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"><Bookmark className="w-5 h-5" /><span className="text-sm">Bookmark</span></button>
                            <button onClick={createClip} disabled={isCreatingClip} className="flex items-center space-x-1 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"><Scissors className="w-5 h-5" /><span className="text-sm">{isCreatingClip ? 'Creating...' : 'Clip'}</span></button>
                        </div>
                        <div className="flex items-center space-x-4">
                            {clips.length > 0 && (
                                <button onClick={() => setShowClips(true)} className="relative p-1 text-gray-400 hover:text-white transition-colors">
                                    <FileText className="w-5 h-5" />
                                    <span className="absolute -top-1 -right-2 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{clips.length}</span>
                                </button>
                            )}
                            <button onClick={() => setShowSleepTimer(true)} className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
                                <Clock className="w-5 h-5" />
                                {sleepTimer > 0 && <span className="text-sm text-blue-400">{Math.ceil(sleepTimer / 60)}m</span>}
                            </button>
                            <button onClick={() => setShowSettings(true)} className="text-gray-400 hover:text-white transition-colors p-1"><Settings className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex items-center justify-center space-x-2">
                        <span className="text-sm text-gray-400">Speed:</span>
                        {PLAYBACK_RATES.map(rate => (
                            <button key={rate} onClick={() => changePlaybackRate(rate)} className={`px-3 py-1 rounded text-sm transition-colors ${playbackRate === rate ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{rate}x</button>
                        ))}
                    </div>
                </div>
            </main>

            {bookmarks.length > 0 && (
                <footer className="p-6 pt-0">
                    <h3 className="text-lg font-semibold mb-3">Bookmarks</h3>
                    <div className="space-y-2 max-h-24 overflow-y-auto">
                        {bookmarks.map(bookmark => (
                            <div key={bookmark.id} onClick={() => seekTo(bookmark.time)} className="flex items-center justify-between p-2 bg-gray-800 rounded cursor-pointer hover:bg-gray-700 transition-colors">
                                <span className="text-sm">{bookmark.title}</span>
                                <span className="text-xs text-gray-400">{formatTime(bookmark.time)}</span>
                            </div>
                        ))}
                    </div>
                </footer>
            )}

            <ClipsModal isOpen={showClips} onClose={() => setShowClips(false)} clips={clips} onPlayClip={playClip} onJumpToClipStart={seekTo} onDeleteClip={deleteClip} />
            {currentClip && <ClipPlayerModal isOpen={showClipPlayer} onClose={closeClipPlayer} clip={currentClip} isPlaying={isPlayingClip} currentTime={clipCurrentTime} onTogglePlay={toggleClipPlayPause} onStop={stopClipPlayback} onSeek={handleClipSeek} onGoToBook={seekTo} audiobookTitle={audiobook.title}/>}
            <ChapterSelectorModal isOpen={showChapterSelector} onClose={() => setShowChapterSelector(false)} chapters={audiobook.chapters} currentChapter={currentChapter} onSelectChapter={(index) => seekTo(audiobook.chapters[index].startTime)} />
            <FileSelectorModal isOpen={showFileSelector} onClose={() => setShowFileSelector(false)} onFileSelect={handleFileSelect} selectedFile={selectedFile} isParsing={isParsing} />
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} bluetoothControls={bluetoothControls} setBluetoothControls={setBluetoothControls} executeBluetoothAction={executeBluetoothAction} />
            <SleepTimerModal isOpen={showSleepTimer} onClose={() => setShowSleepTimer(false)} onSetTimer={(mins) => setSleepTimer(mins * 60)} />
        </div>
    );
};

export default SmartAudioBookPlayer;
