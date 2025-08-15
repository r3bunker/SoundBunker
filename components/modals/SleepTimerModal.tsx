
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm">
                <h3 className="text-lg font-semibold mb-4">Sleep Timer</h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {timers.map(minutes => (
                        <button key={minutes} onClick={() => { onSetTimer(minutes); onClose(); }} className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors">{minutes}m</button>
                    ))}
                    <button onClick={() => { onSetTimer(0); onClose(); }} className="p-2 col-span-3 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors">Turn Off</button>
                </div>
                <button onClick={onClose} className="w-full p-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors">Cancel</button>
            </div>
        </div>
    );
};

export default SleepTimerModal;
