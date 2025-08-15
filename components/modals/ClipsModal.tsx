
import React from 'react';
import { Clip } from '../../types';
import { formatTime } from '../../utils';

interface ClipsModalProps {
    isOpen: boolean;
    onClose: () => void;
    clips: Clip[];
    onPlayClip: (clip: Clip) => void;
    onJumpToClipStart: (time: number) => void;
    onDeleteClip: (id: number) => void;
}

const ClipsModal: React.FC<ClipsModalProps> = ({ isOpen, onClose, clips, onPlayClip, onJumpToClipStart, onDeleteClip }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h3 className="text-lg font-semibold">Audio Clips ({clips.length})</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                <div className="space-y-3 overflow-y-auto flex-grow">
                    {clips.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No clips yet. Use the Clip button to save audio segments!</p>
                    ) : (
                        clips.map(clip => (
                            <div key={clip.id} className="bg-gray-700 rounded-lg p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm">{clip.title}</h4>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => onPlayClip(clip)} className="text-blue-400 hover:text-blue-300 text-sm">Play</button>
                                        <button onClick={() => { onJumpToClipStart(clip.originalStartTime); onClose(); }} className="text-green-400 hover:text-green-300 text-sm">Go to</button>
                                        <button onClick={() => onDeleteClip(clip.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">"{clip.text}"</p>
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>Chapter {clip.chapter + 1}</span>
                                    <span>{clip.createdAt}</span>
                                    <span>{Math.round(clip.duration)}s</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClipsModal;
