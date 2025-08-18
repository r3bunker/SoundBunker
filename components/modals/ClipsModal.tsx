
import React from 'react';

const ClipsModal = ({ isOpen, onClose, clips, onPlayClip, onJumpToClipStart, onDeleteClip }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h3 className="text-xl font-bold">Audio Clips</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </div>

                <div className="space-y-3 overflow-y-auto flex-grow pr-2">
                    {clips.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-gray-400 text-center py-8">No clips yet. Use the Clip button to save audio segments!</p>
                        </div>
                    ) : (
                        clips.map(clip => (
                            <div key={clip.id} className="bg-white/5 rounded-xl p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <h4 className="font-semibold text-gray-200">{clip.title}</h4>
                                    <div className="flex items-center space-x-3 flex-shrink-0 ml-2">
                                        <button onClick={() => onPlayClip(clip)} className="text-violet-400 hover:text-violet-300 text-sm font-medium">Play</button>
                                        <button onClick={() => { onJumpToClipStart(clip.originalStartTime); onClose(); }} className="text-green-400 hover:text-green-300 text-sm font-medium">Go to</button>
                                        <button onClick={() => onDeleteClip(clip.id)} className="text-red-400 hover:text-red-300 text-sm font-medium">Delete</button>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">"{clip.text}"</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
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