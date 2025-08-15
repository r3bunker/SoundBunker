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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h3 className="text-lg font-semibold">Select Chapter</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div className="space-y-2 overflow-y-auto flex-grow pr-2">
                    {chapters.map((chapter, index) => (
                        <div
                            key={chapter.id}
                            onClick={() => { onSelectChapter(index); onClose(); }}
                            className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${
                                index === currentChapter
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                            }`}
                        >
                            <div className="flex-1">
                                <h4 className="font-semibold text-lg">
                                    { (hasIntro && index === 0)
                                        ? 'Introduction'
                                        : String(hasIntro ? index : index + 1).padStart(3, '0')
                                    }
                                </h4>
                                <p className="text-sm opacity-75">
                                    Starts at {formatTime(chapter.startTime)}
                                </p>
                            </div>
                            {index === currentChapter && (
                                <div className="text-xs font-medium bg-white/25 text-white px-3 py-1 rounded-full">
                                    Current
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700 flex-shrink-0">
                    <button onClick={onClose} className="w-full p-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-medium transition-colors">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ChapterSelectorModal;
