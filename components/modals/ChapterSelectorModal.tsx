import React from 'react';
import { Chapter } from '../../types';
import { formatTime } from '../../utils';

interface ChapterSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    chapters: Chapter[];
    currentChapter: number;
    onSelectChapter: (index: number) => void;
}

const ChapterSelectorModal: React.FC<ChapterSelectorModalProps> = ({ isOpen, onClose, chapters, currentChapter, onSelectChapter }) => {
    if (!isOpen) return null;

    const hasIntro = chapters[0]?.title === 'Introduction';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h3 className="text-xl font-bold">Select Chapter</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </div>
                <div className="space-y-2 overflow-y-auto flex-grow pr-2">
                    {chapters.map((chapter, index) => {
                        const isCurrent = index === currentChapter;
                        const isIntro = hasIntro && index === 0;

                        const title = isIntro
                            ? 'Introduction'
                            : `Chapter ${String(hasIntro ? index : index + 1).padStart(2, '0')}`;

                        const subtitle = `Starts at ${formatTime(chapter.startTime)}`;

                        return (
                            <div
                                key={chapter.id}
                                onClick={() => { onSelectChapter(index); onClose(); }}
                                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                                    isCurrent
                                        ? 'bg-gradient-to-br from-purple-500 to-violet-700 text-white shadow-lg border-transparent'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-200'
                                }`}
                            >
                                <div className="flex-1">
                                    <h4 className="font-semibold text-lg">{title}</h4>
                                    <p className={`text-sm ${isCurrent ? 'text-white/80' : 'text-gray-400'}`}>
                                        {subtitle}
                                    </p>
                                </div>
                                {isCurrent && (
                                    <div className="text-xs font-medium bg-white/30 px-3 py-1 rounded-full">
                                        Current
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex-shrink-0">
                    <button onClick={onClose} className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-full font-medium transition-colors">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ChapterSelectorModal;
