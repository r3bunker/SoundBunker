
import React from 'react';
import { Play, Pause } from 'lucide-react';
import { Clip } from '../../types';
import { formatTime } from '../../utils';

interface ClipPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    clip: Clip;
    isPlaying: boolean;
    currentTime: number;
    onTogglePlay: () => void;
    onStop: () => void;
    onSeek: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onGoToBook: (time: number) => void;
    audiobookTitle: string;
}

const ClipPlayerModal: React.FC<ClipPlayerModalProps> = ({ isOpen, onClose, clip, isPlaying, currentTime, onTogglePlay, onStop, onSeek, onGoToBook, audiobookTitle }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Playing Clip</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div className="text-center mb-6">
                    <h4 className="text-xl font-bold mb-2">{clip.title}</h4>
                    <p className="text-gray-400 text-sm mb-1">From: {audiobookTitle}</p>
                    <p className="text-gray-500 text-sm">Chapter {clip.chapter + 1}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(clip.duration)}</span>
                </div>
                <div className="mb-6">
                    <div className="w-full h-2 bg-gray-700 rounded-full cursor-pointer" onClick={onSeek}>
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${(currentTime / clip.duration) * 100}%` }} />
                    </div>
                </div>
                <div className="flex items-center justify-center space-x-8 mb-6">
                    <button onClick={onTogglePlay} className="bg-blue-500 hover:bg-blue-600 rounded-full p-4 transition-colors">
                        {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </button>
                    <button onClick={onStop} className="bg-gray-600 hover:bg-gray-500 rounded-full p-3 transition-colors">
                        <div className="w-6 h-6 bg-white rounded-sm"></div>
                    </button>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <p className="text-gray-300 text-sm leading-relaxed">"{clip.text}"</p>
                </div>
                <div className="flex space-x-3">
                    <button onClick={() => { onGoToBook(clip.originalStartTime); onClose(); }} className="flex-1 p-3 bg-green-600 hover:bg-green-700 rounded font-medium transition-colors">Go to Book Position</button>
                    <button onClick={onClose} className="flex-1 p-3 bg-gray-600 hover:bg-gray-500 rounded font-medium transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};

export default ClipPlayerModal;
