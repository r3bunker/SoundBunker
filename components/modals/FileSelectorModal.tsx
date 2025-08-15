
import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFileSelect: (file: File) => void;
    selectedFile: File | null;
    isParsing: boolean;
}

const FileSelectorModal: React.FC<FileSelectorModalProps> = ({ isOpen, onClose, onFileSelect, selectedFile, isParsing }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    if (!isOpen) return null;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <input ref={fileInputRef} type="file" accept="audio/*,.m4b,.mp3,.wav,.aac,.ogg" onChange={handleFileChange} className="hidden" />
            <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full max-w-sm relative text-center shadow-2xl">
                {isParsing && (
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center rounded-3xl z-10">
                        <div className="w-8 h-8 border-4 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-white">Parsing file...</p>
                    </div>
                )}
                <h3 className="text-2xl font-bold mb-2">Select Audiobook</h3>
                <p className="text-gray-400 mb-6">Choose a file to begin listening.</p>
                <div className="space-y-4">
                    <button onClick={() => fileInputRef.current?.click()} className="w-full p-4 bg-gradient-to-br from-purple-500 to-violet-700 hover:from-purple-600 hover:to-violet-800 rounded-full flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                        <Upload className="w-5 h-5" />
                        <span className="font-semibold">Browse Local Files</span>
                    </button>
                    <div className="text-xs text-gray-500 pt-2">Supported: MP3, M4B, M4A, WAV, etc.</div>
                    {selectedFile && !isParsing && (
                        <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-left">
                            <p className="text-sm font-medium text-green-300">✓ Loaded:</p>
                            <p className="text-sm text-gray-300 truncate">{selectedFile.name}</p>
                        </div>
                    )}
                </div>
                <button onClick={onClose} className="w-full mt-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-sm">Cancel</button>
            </div>
        </div>
    );
};

export default FileSelectorModal;