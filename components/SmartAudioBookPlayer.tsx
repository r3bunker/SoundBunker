import React, { useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Bookmark, Clock, Settings, Folder, Scissors, FileText, BarChart2 } from 'lucide-react';
import { useAudioPlayer } from '../hooks/useAudioPlayer.js';
import { formatTime } from '../utils';
import { PLAYBACK_RATES } from '../constants';
import ClipsModal from './modals/ClipsModal.jsx';
import ClipPlayerModal from './modals/ClipPlayerModal.jsx';
import ChapterSelectorModal from './modals/ChapterSelectorModal.jsx';
import FileSelectorModal from './modals/FileSelectorModal.jsx';
import SettingsModal from './modals/SettingsModal.jsx';
import SleepTimerModal from './modals/SleepTimerModal.jsx';
import AudioVisualizer from './AudioVisualizer.jsx';
import Report from './Report.jsx';

const SmartAudioBookPlayer = () => {
    const audioRef = useRef(null);
    const clipAudioRef = useRef(null);

    const {
        audiobook, selectedFile, isPlaying, currentTime, duration, playbackRate, sleepTimer,
        bookmarks, clips, currentChapter, isCreatingClip, isParsing, showSettings, showSleepTimer, showClips,
        showFileSelector, showChapterSelector, showClipPlayer, currentClip, isPlayingClip, clipCurrentTime,
        showReport, stats, bluetoothControls, setBluetoothControls, library, isDownloadingClipId,
        handleFileSelect, loadBook, seekTo, togglePlayPause, skip, addBookmark, createClip, playClip,
        toggleClipPlayPause, stopClipPlayback, closeClipPlayer, handleClipSeek, deleteClip, downloadClip,
        changePlaybackRate, executeBluetoothAction,
        setSleepTimer, setShowSettings, setShowSleepTimer, setShowClips, setShowFileSelector,
        setShowChapterSelector, setShowReport
    } = useAudioPlayer(audioRef, clipAudioRef);

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        seekTo(percent * duration);
    };

    const hasIntro = audiobook.chapters[0]?.title === 'Introduction';
    const displayChapterNumber = hasIntro ? currentChapter : currentChapter + 1;

    const currentChapterTitleDisplay = (hasIntro && currentChapter === 0)
        ? audiobook.chapters[0].title
        : `Chapter ${String(displayChapterNumber).padStart(2, '0')}`;


    return (
        <div className="max-w-md mx-auto text-white min-h-screen flex flex-col p-4 pt-8">
            <audio ref={audioRef} src={audiobook.audioUrl ?? undefined} crossOrigin="anonymous" />
            <audio ref={clipAudioRef} />

            <header className="flex items-center justify-between w-full">
                <h1 className="text-xl font-bold text-gray-200">Now Playing</h1>
                <button onClick={() => setShowFileSelector(true)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <Folder className="w-6 h-6" />
                </button>
            </header>

            <main className="flex-grow pt-8 flex flex-col justify-center relative">
                 <div className="absolute top-0 left-0 w-full h-40 -mt-10 opacity-30 pointer-events-none">
                    <AudioVisualizer audioRef={audioRef} isPlaying={isPlaying} />
                </div>

                <div className="text-center relative">
                    <img
                        src={audiobook.cover}
                        alt={audiobook.title}
                        className="w-56 h-80 mx-auto rounded-2xl shadow-[0_0_45px_rgba(168,85,247,0.5)] mb-8 object-cover transition-shadow duration-500"
                    />
                    <h2 className="text-2xl font-bold mb-1 truncate">{audiobook.title}</h2>
                    <p className="text-gray-400 text-sm">by {audiobook.author}</p>
                </div>

                <div className="mt-8">
                    <div className="mb-2">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                    
                    <div className="mb-6 h-2 bg-white/10 rounded-full cursor-pointer group" onClick={handleSeek}>
                        <div
                            className="h-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full relative"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -mt-2 w-4 h-4 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2"></div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-8">
                        <p className="text-lg font-semibold text-gray-200 truncate flex-1">{currentChapterTitleDisplay}</p>
                        <button
                            onClick={() => setShowChapterSelector(true)}
                            className="ml-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm text-gray-300 transition-colors"
                        >
                            Chapters
                        </button>
                    </div>

                    <div className="flex items-center justify-center space-x-6 mb-8">
                        <button onClick={() => skip(-30)} className="p-2 text-gray-400 hover:text-white transition-colors"><SkipBack className="w-8 h-8" /></button>
                        <button onClick={togglePlayPause} className="bg-gradient-to-br from-purple-500 to-violet-700 hover:from-purple-600 hover:to-violet-800 rounded-full p-5 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] transform hover:scale-105">
                            {isPlaying ? <Pause className="w-10 h-10 text-white" /> : <Play className="w-10 h-10 ml-1 text-white" />}
                        </button>
                        <button onClick={() => skip(30)} className="p-2 text-gray-400 hover:text-white transition-colors"><SkipForward className="w-8 h-8" /></button>
                    </div>

                     <div className="flex items-center justify-around bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-full">
                        <button onClick={addBookmark} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2"><Bookmark className="w-5 h-5" /></button>
                        <button onClick={createClip} disabled={isCreatingClip} className="flex items-center space-x-2 text-gray-400 hover:text-white disabled:opacity-50 transition-colors p-2"><Scissors className="w-5 h-5" /></button>
                        <button onClick={() => setShowReport(true)} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2">
                            <BarChart2 className="w-5 h-5" />
                        </button>
                        {clips.length > 0 && (
                            <button onClick={() => setShowClips(true)} className="relative p-2 text-gray-400 hover:text-white transition-colors">
                                <FileText className="w-5 h-5" />
                                <span className="absolute top-0 right-0 bg-violet-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{clips.length}</span>
                            </button>
                        )}
                        <button onClick={() => setShowSleepTimer(true)} className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors p-2">
                            <Clock className="w-5 h-5" />
                            {sleepTimer > 0 && <span className="text-sm text-violet-400">{Math.ceil(sleepTimer / 60)}m</span>}
                        </button>
                        <button onClick={() => setShowSettings(true)} className="text-gray-400 hover:text-white transition-colors p-2"><Settings className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex items-center justify-center space-x-2">
                        {PLAYBACK_RATES.map(rate => (
                            <button key={rate} onClick={() => changePlaybackRate(rate)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${playbackRate === rate ? 'bg-gradient-to-br from-purple-500 to-violet-700 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>{rate}x</button>
                        ))}
                    </div>
                </div>
            </main>

            {bookmarks.length > 0 && (
                <footer className="w-full mt-auto">
                    <h3 className="text-base font-semibold mb-3 text-gray-300">Bookmarks</h3>
                    <div className="space-y-2 max-h-24 overflow-y-auto">
                        {bookmarks.map(bookmark => (
                            <div key={bookmark.id} onClick={() => seekTo(bookmark.time)} className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                                <span className="text-sm font-medium">{bookmark.title}</span>
                                <span className="text-xs text-gray-400">{formatTime(bookmark.time)}</span>
                            </div>
                        ))}
                    </div>
                </footer>
            )}

            <ClipsModal isOpen={showClips} onClose={() => setShowClips(false)} clips={clips} onPlayClip={playClip} onJumpToClipStart={seekTo} onDeleteClip={deleteClip} onDownloadClip={downloadClip} isDownloadingClipId={isDownloadingClipId} />
            {currentClip && <ClipPlayerModal isOpen={showClipPlayer} onClose={closeClipPlayer} clip={currentClip} isPlaying={isPlayingClip} currentTime={clipCurrentTime} onTogglePlay={toggleClipPlayPause} onStop={stopClipPlayback} onSeek={handleClipSeek} onGoToBook={seekTo} audiobookTitle={audiobook.title}/>}
            <ChapterSelectorModal isOpen={showChapterSelector} onClose={() => setShowChapterSelector(false)} chapters={audiobook.chapters} currentChapter={currentChapter} onSelectChapter={(index) => seekTo(audiobook.chapters[index].startTime)} />
            <FileSelectorModal isOpen={showFileSelector} onClose={() => selectedFile && setShowFileSelector(false)} onFileSelect={handleFileSelect} isParsing={isParsing} library={library} onLoadBook={loadBook} canBeClosed={!!selectedFile} />
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} bluetoothControls={bluetoothControls} setBluetoothControls={setBluetoothControls} executeBluetoothAction={executeBluetoothAction} />
            <SleepTimerModal isOpen={showSleepTimer} onClose={() => setShowSleepTimer(false)} onSetTimer={(mins) => setSleepTimer(mins * 60)} />
            <Report isOpen={showReport} onClose={() => setShowReport(false)} stats={stats} currentTime={currentTime} duration={duration} />
        </div>
    );
};

export default SmartAudioBookPlayer;