
import React from 'react';
import { BluetoothControls } from '../../types';
import { BLUETOOTH_ACTION_OPTIONS } from '../../constants';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    bluetoothControls: BluetoothControls;
    setBluetoothControls: React.Dispatch<React.SetStateAction<BluetoothControls>>;
    executeBluetoothAction: (action: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, bluetoothControls, setBluetoothControls, executeBluetoothAction }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Settings</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div className="space-y-6">
                    <div className="bg-gray-700 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-4">Bluetooth Headset Control</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-white text-sm mb-2">Previous file button</label>
                                <select value={bluetoothControls.previousFile} onChange={(e) => setBluetoothControls(c => ({ ...c, previousFile: e.target.value }))} className="w-full p-2 bg-gray-600 text-white rounded border-none">
                                    {BLUETOOTH_ACTION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-white text-sm mb-2">Next file button</label>
                                <select value={bluetoothControls.nextFile} onChange={(e) => setBluetoothControls(c => ({ ...c, nextFile: e.target.value }))} className="w-full p-2 bg-gray-600 text-white rounded border-none">
                                    {BLUETOOTH_ACTION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center space-x-3">
                                <input type="checkbox" id="swapButtons" checked={bluetoothControls.swapButtons} onChange={(e) => setBluetoothControls(c => ({...c, swapButtons: e.target.checked}))} className="w-4 h-4 rounded text-blue-500 bg-gray-600 border-gray-500 focus:ring-blue-500"/>
                                <label htmlFor="swapButtons" className="text-white text-sm">Swap button actions</label>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-gray-600">
                        <h5 className="text-sm text-gray-400 mb-3">Test Bluetooth Controls:</h5>
                        <div className="flex space-x-2">
                            <button onClick={() => executeBluetoothAction(bluetoothControls.swapButtons ? bluetoothControls.nextFile : bluetoothControls.previousFile)} className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors">Previous</button>
                            <button onClick={() => executeBluetoothAction(bluetoothControls.swapButtons ? bluetoothControls.previousFile : bluetoothControls.nextFile)} className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors">Next</button>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="w-full mt-6 p-3 bg-blue-500 hover:bg-blue-600 rounded font-medium transition-colors">Done</button>
            </div>
        </div>
    );
};

export default SettingsModal;
