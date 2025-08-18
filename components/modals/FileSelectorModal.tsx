import React, { useRef } from 'react';
import { Upload, BookOpen } from 'lucide-react';

const FileSelectorModal = ({ isOpen, onClose, onFileSelect, isParsing, library, onLoadBook, canBeClosed }) => {
    const fileInputRef = useRef(null);
    
    if (!isOpen) return null;

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <input ref={fileInputRef} type="file" accept="audio/*,.m4b,.mp3,.wav,.aac,.ogg" onChange={handleFileChange} className="hidden" />
            <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col relative text-center shadow-2xl">
                {isParsing && (
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center rounded-3xl z-20">
                        <div className="w-8 h-8 border-4 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-white">Processing Audiobook...</p>
                    </div>
                )}
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h3 className="text-2xl font-bold text-left">Your Library</h3>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-gradient-to-br from-purple-500 to-violet-700 hover:from-purple-600 hover:to-violet-800 rounded-full flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                        <Upload className="w-5 h-5" />
                        <span className="font-semibold text-sm pr-2">Add New Book</span>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto -mr-2 pr-2">
                    {library.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-10">
                            <BookOpen className="w-16 h-16 text-gray-500 mb-4" />
                            <h4 className="text-lg font-semibold text-gray-300">Library is Empty</h4>
                            <p className="text-gray-400 mt-1">Click 'Add New Book' to start listening.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                           {library.map(book => (
                                <div key={book.key} onClick={() => onLoadBook(book.key)} className="cursor-pointer group">
                                    <img 
                                        src={book.cover} 
                                        alt={book.title}
                                        className="w-full aspect-[2/3] rounded-lg object-cover bg-slate-800 shadow-md group-hover:shadow-violet-500/40 group-hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1"
                                    />
                                    <h5 className="mt-2 text-sm font-semibold truncate group-hover:text-violet-300 transition-colors">{book.title}</h5>
                                </div>
                           ))}
                        </div>
                    )}
                </div>
                 
                <button onClick={onClose} disabled={!canBeClosed} className="w-full mt-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-sm flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                    Close
                </button>
            </div>
        </div>
    );
};

export default FileSelectorModal;