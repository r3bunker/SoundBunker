
import React from 'react';
import { Play, Pause, StopCircle } from 'lucide-react';
import { formatTime } from '../../utils';

const ClipPlayerModal = ({ isOpen, onClose, clip, isPlaying, currentTime, onTogglePlay, onStop, onSeek, onGoToBook, audiobookTitle }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Playing Clip</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </div>
                <div className="text-center mb-6">
                    <h4 className="text-2xl font-bold mb-2">{clip.title}</h4>
                    <p className="text-gray-400 text-sm mb-1">From: {audiobookTitle}</p>
                    <p className="text-gray-500 text-xs">Chapter {clip.chapter + 1}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(clip.duration)}</span>
                </div>
                <div className="mb-6 h-2 bg-white/10 rounded-full cursor-pointer group" onClick={onSeek}>
                    <div className="h-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full relative" style={{ width: `${(currentTime / clip.duration) * 100}%` }}>
                        <div className="absolute right-0 top-1/2 -mt-1.5 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2"></div>
                    </div>
                </div>
                <div className="flex items-center justify-center space-x-8 mb-6">
                    <button onClick={onTogglePlay} className="bg-gradient-to-br from-purple-500 to-violet-700 hover:from-purple-600 hover:to-violet-800 rounded-full p-4 transition-colors">
                        {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </button>
                    
                </div>
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                    <p className="text-gray-300 text-sm leading-relaxed italic">"{clip.text}"</p>
                </div>
                <div className="flex space-x-3">
                    <button onClick={() => { onGoToBook(clip.originalStartTime); onClose(); }} className="flex-1 p-3 bg-gradient-to-br from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800 rounded-full font-medium transition-colors">Go to Book</button>
                    <button onClick={onClose} className="flex-1 p-3 bg-white/10 hover:bg-white/20 rounded-full font-medium transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};

export default ClipPlayerModal;