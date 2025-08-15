
import React from 'react';

interface SleepTimerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSetTimer: (minutes: number) => void;
}

const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ isOpen, onClose, onSetTimer }) => {
    if (!isOpen) return null;

    const timers = [5, 10, 15, 30, 45, 60];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                <h3 className="text-xl font-bold mb-4 text-center">Sleep Timer</h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {timers.map(minutes => (
                        <button key={minutes} onClick={() => { onSetTimer(minutes); onClose(); }} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-sm font-semibold transition-colors">{minutes} min</button>
                    ))}
                </div>
                 <button onClick={() => { onSetTimer(0); onClose(); }} className="w-full p-3 mb-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-full text-sm font-semibold text-red-300 transition-colors">Turn Off</button>
                <button onClick={onClose} className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors mt-2">Cancel</button>
            </div>
        </div>
    );
};

export default SleepTimerModal;
