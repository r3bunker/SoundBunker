
import React from 'react';
import SmartAudioBookPlayer from './components/SmartAudioBookPlayer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-black font-sans text-gray-200 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[60vh] bg-violet-800/50 blur-[200px] rounded-full z-0 pointer-events-none"></div>
      <div className="relative z-10">
        <SmartAudioBookPlayer />
      </div>
    </div>
  );
};

export default App;