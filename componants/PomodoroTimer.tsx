

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Button from './common/Button';
import Modal from './common/Modal';
import Icon from './common/Icon';
import { AUDIO_SRC } from '../data/wellnessData';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface Settings {
  work: number;
  shortBreak: number;
  longBreak: number;
  sessionsUntilLongBreak: number;
}

const PomodoroTimer: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4,
  });
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeRemaining, setTimeRemaining] = useState(settings.work * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const modeDurations: Record<TimerMode, number> = {
    work: settings.work * 60,
    shortBreak: settings.shortBreak * 60,
    longBreak: settings.longBreak * 60,
  };

  const resetTimer = useCallback((newMode: TimerMode) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);
    setMode(newMode);
    setTimeRemaining(modeDurations[newMode]);
  }, [modeDurations]);

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      audioRef.current?.play();
      
      let nextMode: TimerMode = 'work';
      if (mode === 'work') {
        const newSessionsCompleted = sessionsCompleted + 1;
        setSessionsCompleted(newSessionsCompleted);
        nextMode = newSessionsCompleted % settings.sessionsUntilLongBreak === 0 ? 'longBreak' : 'shortBreak';
      } else {
        nextMode = 'work';
      }
      resetTimer(nextMode);
      setIsActive(true); // Auto-start next timer
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeRemaining, mode, sessionsCompleted, settings.sessionsUntilLongBreak, resetTimer]);
  
  useEffect(() => {
    resetTimer(mode);
  }, [settings, resetTimer, mode]);


  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleModeChange = (newMode: TimerMode) => {
    resetTimer(newMode);
  };
  
  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    setIsSettingsOpen(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeRemaining / modeDurations[mode]) * circumference;

  const modeStyles = {
    work: { 
        bg: 'bg-gradient-to-r from-red-500 to-orange-400 text-white', 
        text: 'text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500', 
        progressGradient: 'url(#workGradient)' 
    },
    shortBreak: { 
        bg: 'bg-gradient-to-r from-green-500 to-teal-400 text-white', 
        text: 'text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-500', 
        progressGradient: 'url(#shortBreakGradient)' 
    },
    longBreak: { 
        bg: 'bg-gradient-to-r from-sky-500 to-purple-400 text-white', 
        text: 'text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-purple-500', 
        progressGradient: 'url(#longBreakGradient)' 
    },
  };

  return (
    <div className="p-8 flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-2">Pomodoro Timer</h1>
      <p className="text-lg text-gray-600 mb-8">Stay focused and take effective breaks.</p>

      <div className="flex space-x-2 mb-8">
        {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map(m => (
          <button key={m} onClick={() => handleModeChange(m)} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${mode === m ? modeStyles[m].bg : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
            {m === 'work' ? 'Work' : (m === 'shortBreak' ? 'Short Break' : 'Long Break')}
          </button>
        ))}
      </div>

      <div className="relative w-72 h-72 flex items-center justify-center">
        <svg className="absolute w-full h-full" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="workGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
            <linearGradient id="shortBreakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
            <linearGradient id="longBreakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <circle cx="50%" cy="50%" r={radius} strokeWidth="10" className="stroke-gray-200" fill="none" />
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            strokeWidth="10"
            stroke={modeStyles[mode].progressGradient}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            transform="rotate(-90 144 144)"
            className="transition-all duration-500"
          />
        </svg>
        <div className="text-center z-10">
          <div className={`text-6xl font-bold ${modeStyles[mode].text}`}>{formatTime(timeRemaining)}</div>
          <p className="text-gray-500 mt-2">Sessions: {sessionsCompleted}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4 mt-8">
        <Button onClick={handleStartPause} variant="primary" className="w-32">
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={() => resetTimer(mode)} variant="secondary">Reset</Button>
        <button onClick={() => setIsSettingsOpen(true)} className="p-3 bg-gray-200 rounded-lg text-gray-600 hover:bg-gray-300 transition-colors" aria-label="Settings">
            <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></Icon>
        </button>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentSettings={settings}
        onSave={handleSaveSettings}
      />
      <audio ref={audioRef} src={AUDIO_SRC} loop={false} preload="auto" />
    </div>
  );
};


interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSettings: Settings;
    onSave: (newSettings: Settings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({isOpen, onClose, currentSettings, onSave}) => {
    const [tempSettings, setTempSettings] = useState(currentSettings);

    useEffect(() => {
        setTempSettings(currentSettings);
    }, [currentSettings, isOpen]);

    const handleSave = () => {
        onSave(tempSettings);
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTempSettings(prev => ({...prev, [name]: parseInt(value, 10) || 0 }))
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Pomodoro Settings">
            <div className="space-y-4">
                <div className="grid grid-cols-2 items-center gap-4">
                    <label htmlFor="work" className="font-semibold text-gray-700">Work (minutes)</label>
                    <input type="number" id="work" name="work" value={tempSettings.work} onChange={handleInputChange} className="p-2 border border-gray-300 rounded-md"/>
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                    <label htmlFor="shortBreak" className="font-semibold text-gray-700">Short Break (minutes)</label>
                    <input type="number" id="shortBreak" name="shortBreak" value={tempSettings.shortBreak} onChange={handleInputChange} className="p-2 border border-gray-300 rounded-md"/>
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                    <label htmlFor="longBreak" className="font-semibold text-gray-700">Long Break (minutes)</label>
                    <input type="number" id="longBreak" name="longBreak" value={tempSettings.longBreak} onChange={handleInputChange} className="p-2 border border-gray-300 rounded-md"/>
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                    <label htmlFor="sessionsUntilLongBreak" className="font-semibold text-gray-700">Sessions for Long Break</label>
                    <input type="number" id="sessionsUntilLongBreak" name="sessionsUntilLongBreak" value={tempSettings.sessionsUntilLongBreak} onChange={handleInputChange} className="p-2 border border-gray-300 rounded-md"/>
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSave}>Save Changes</Button>
                </div>
            </div>
        </Modal>
    );
}

export default PomodoroTimer;
