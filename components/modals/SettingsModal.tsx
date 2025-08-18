
import React from 'react';
import { BLUETOOTH_ACTION_OPTIONS } from '../../constants';

const SettingsModal = ({ isOpen, onClose, bluetoothControls, setBluetoothControls, executeBluetoothAction }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between mb-6 flex-shrink-0">
                    <h3 className="text-xl font-bold">Settings</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </div>
                <div className="space-y-6 overflow-y-auto pr-2">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-semibold mb-4">Bluetooth Headset Control</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-300 text-sm mb-2">Previous file button</label>
                                <select value={bluetoothControls.previousFile} onChange={(e) => setBluetoothControls(c => ({ ...c, previousFile: e.target.value }))} className="w-full p-3 bg-black/30 text-white rounded-lg border border-white/10 focus:ring-violet-500 focus:border-violet-500">
                                    {BLUETOOTH_ACTION_OPTIONS.map(o => <option key={o} value={o} className="bg-slate-800">{o}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm mb-2">Next file button</label>
                                <select value={bluetoothControls.nextFile} onChange={(e) => setBluetoothControls(c => ({ ...c, nextFile: e.target.value }))} className="w-full p-3 bg-black/30 text-white rounded-lg border border-white/10 focus:ring-violet-500 focus:border-violet-500">
                                    {BLUETOOTH_ACTION_OPTIONS.map(o => <option key={o} value={o} className="bg-slate-800">{o}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center space-x-3 pt-2">
                                <input type="checkbox" id="swapButtons" checked={bluetoothControls.swapButtons} onChange={(e) => setBluetoothControls(c => ({...c, swapButtons: e.target.checked}))} className="w-4 h-4 rounded text-violet-500 bg-black/30 border-white/20 focus:ring-violet-500"/>
                                <label htmlFor="swapButtons" className="text-gray-300 text-sm">Swap button actions</label>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                        <h5 className="text-sm text-gray-400 mb-3">Test Bluetooth Controls:</h5>
                        <div className="flex space-x-3">
                            <button onClick={() => executeBluetoothAction(bluetoothControls.swapButtons ? bluetoothControls.nextFile : bluetoothControls.previousFile)} className="flex-1 p-3 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors">Previous</button>
                            <button onClick={() => executeBluetoothAction(bluetoothControls.swapButtons ? bluetoothControls.previousFile : bluetoothControls.nextFile)} className="flex-1 p-3 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors">Next</button>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="w-full mt-6 p-3 bg-gradient-to-br from-purple-500 to-violet-700 hover:from-purple-600 hover:to-violet-800 rounded-full font-semibold transition-colors flex-shrink-0">Done</button>
            </div>
        </div>
    );
};

export default SettingsModal;