
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <input ref={fileInputRef} type="file" accept="audio/*,.m4b,.mp3,.wav,.aac,.ogg" onChange={handleFileChange} className="hidden" />
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm relative">
                {isParsing && (
                    <div className="absolute inset-0 bg-gray-800 bg-opacity-90 flex flex-col items-center justify-center rounded-lg z-10">
                        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-white">Parsing file...</p>
                    </div>
                )}
                <h3 className="text-lg font-semibold mb-4">Select Audio Book</h3>
                <div className="space-y-4">
                    <button onClick={() => fileInputRef.current?.click()} className="w-full p-4 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                        <Upload className="w-5 h-5" />
                        <span>Browse for Audio File</span>
                    </button>
                    <div className="text-sm text-gray-400 text-center">Supported: MP3, M4B, M4A, WAV, AAC, OGG</div>
                    {selectedFile && !isParsing && (
                        <div className="p-3 bg-gray-700 rounded">
                            <p className="text-sm text-green-400">✓ Loaded:</p>
                            <p className="text-sm truncate">{selectedFile.name}</p>
                        </div>
                    )}
                </div>
                <button onClick={onClose} className="w-full mt-4 p-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors">Cancel</button>
            </div>
        </div>
    );
};

export default FileSelectorModal;