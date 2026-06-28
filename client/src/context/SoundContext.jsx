import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getMuteState, 
  toggleMuteState, 
  playClick, 
  playCorrect, 
  playIncorrect, 
  playLevelComplete, 
  playLevelUp 
} from '../utils/soundSynth';

const SoundContext = createContext();

export function SoundProvider({ children }) {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Sync initial state
    setIsMuted(getMuteState());
  }, []);

  const toggleMute = () => {
    const nextState = toggleMuteState();
    setIsMuted(nextState);
  };

  const soundService = {
    isMuted,
    toggleMute,
    click: () => { playClick(); },
    correct: () => { playCorrect(); },
    incorrect: () => { playIncorrect(); },
    levelComplete: () => { playLevelComplete(); },
    levelUp: () => { playLevelUp(); }
  };

  return (
    <SoundContext.Provider value={soundService}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}
