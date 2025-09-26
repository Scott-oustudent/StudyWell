import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '../icons/Icons';

type BreathingPattern = 'Box Breathing' | '4-7-8 Breathing';
type DurationOption = { label: string; seconds: number };

const patterns = {
    'Box Breathing': {
        phases: [
            { name: 'inhale', duration: 4000, instruction: 'Breathe In...' },
            { name: 'hold', duration: 4000, instruction: 'Hold' },
            { name: 'exhale', duration: 4000, instruction: 'Breathe Out...' },
            { name: 'hold-inhale', duration: 4000, instruction: 'Hold' },
        ],
        description: "A simple technique to calm your nervous system. Inhale, hold, exhale, and hold again, all for 4 seconds each."
    },
    '4-7-8 Breathing': {
        phases: [
            { name: 'inhale', duration: 4000, instruction: 'Breathe In...' },
            { name: 'hold', duration: 7000, instruction: 'Hold' },
            { name: 'exhale', duration: 8000, instruction: 'Breathe Out...' },
        ],
        description: "Known as the 'relaxing breath,' this pattern involves a longer exhale to help reduce anxiety and promote sleep."
    }
};

const durationOptions: DurationOption[] = [
    { label: '1 Min', seconds: 60 },
    { label: '3 Min', seconds: 180 },
    { label: '5 Min', seconds: 300 },
    { label: 'Infinite', seconds: 0 },
];

const BreathingExercise: React.FC = () => {
    const [pattern, setPattern] = useState<BreathingPattern>('Box Breathing');
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const [phaseCountdown, setPhaseCountdown] = useState(0);
    const [duration, setDuration] = useState(60); // Default to 1 min
    const [sessionTimeLeft, setSessionTimeLeft] = useState(60);
    const [isMuted, setIsMuted] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const activeAudioNodesRef = useRef<{ source: AudioBufferSourceNode, gain: GainNode }[]>([]);
    const phaseTimeoutRef = useRef<number | null>(null);
    const phaseIntervalRef = useRef<number | null>(null);
    const sessionIntervalRef = useRef<number | null>(null);

    const currentPhases = patterns[pattern].phases;
    const currentPhase = currentPhases[currentPhaseIndex];

    const playBreathSound = useCallback((type: 'inhale' | 'exhale', duration: number) => {
        if (isMuted || !audioContextRef.current) return;

        const now = audioContextRef.current.currentTime;
        const durationInSeconds = duration / 1000;

        const bufferSize = audioContextRef.current.sampleRate * 2;
        const noiseBuffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const noiseSource = audioContextRef.current.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter = audioContextRef.current.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = type === 'inhale' ? 1000 : 500;
        filter.Q.value = type === 'inhale' ? 1.5 : 1;

        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.05, now + durationInSeconds * 0.2);
        gainNode.gain.linearRampToValueAtTime(0, now + durationInSeconds);

        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        noiseSource.start(now);
        noiseSource.stop(now + durationInSeconds);

        const activeNode = { source: noiseSource, gain: gainNode };
        activeAudioNodesRef.current.push(activeNode);
        noiseSource.onended = () => {
            noiseSource.disconnect();
            filter.disconnect();
            gainNode.disconnect();
            activeAudioNodesRef.current = activeAudioNodesRef.current.filter(n => n !== activeNode);
        };
    }, [isMuted]);

    const stopAllTimersAndSounds = useCallback(() => {
        if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
        if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current);
        if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
        
        activeAudioNodesRef.current.forEach(({ source, gain }) => {
            try {
                if (audioContextRef.current) {
                    const now = audioContextRef.current.currentTime;
                    gain.gain.cancelScheduledValues(now);
                    gain.gain.setValueAtTime(gain.gain.value, now);
                    gain.gain.linearRampToValueAtTime(0, now + 0.1);
                    source.stop(now + 0.1);
                } else {
                  source.stop();
                }
            } catch (e) { /* Ignore errors if source already stopped */ }
        });
        activeAudioNodesRef.current = [];
    }, []);

    const stopSession = useCallback(() => {
        setIsAnimating(false);
        stopAllTimersAndSounds();
        setSessionTimeLeft(duration);
        setCurrentPhaseIndex(0);
    }, [duration, stopAllTimersAndSounds]);

    useEffect(() => {
        if (!isAnimating) {
            stopAllTimersAndSounds();
            return;
        }

        setPhaseCountdown(Math.ceil(currentPhase.duration / 1000));
        
        if (currentPhase.name === 'inhale') playBreathSound('inhale', currentPhase.duration);
        else if (currentPhase.name === 'exhale') playBreathSound('exhale', currentPhase.duration);

        phaseTimeoutRef.current = window.setTimeout(() => {
            setCurrentPhaseIndex((prevIndex) => (prevIndex + 1) % currentPhases.length);
        }, currentPhase.duration);

        phaseIntervalRef.current = window.setInterval(() => {
            setPhaseCountdown(prev => (prev > 1 ? prev - 1 : 1));
        }, 1000);

        return () => {
            if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
            if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current);
        };
    }, [isAnimating, currentPhaseIndex, currentPhases, playBreathSound, stopAllTimersAndSounds]);


    useEffect(() => {
        if (isAnimating && duration > 0) {
            sessionIntervalRef.current = window.setInterval(() => {
                setSessionTimeLeft(prev => {
                    if (prev <= 1) {
                        stopSession();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
        };
    }, [isAnimating, duration, stopSession]);

    const handleStartStop = () => {
        if (!audioContextRef.current) {
            try {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) {
                console.error("Web Audio API is not supported in this browser.");
            }
        }

        if (isAnimating) {
            stopSession();
        } else {
            setSessionTimeLeft(duration);
            setCurrentPhaseIndex(0);
            setIsAnimating(true);
        }
    };

    const handlePatternChange = (newPattern: BreathingPattern) => {
        setPattern(newPattern);
        if (isAnimating) stopSession();
    };

    const handleDurationChange = (seconds: number) => {
        setDuration(seconds);
        setSessionTimeLeft(seconds);
        if (isAnimating) {
            stopSession();
        }
    }
    
    const formatTime = (seconds: number) => {
        if (seconds === 0) return '∞';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getRingScale = () => {
        if (!isAnimating) return 'scale-75';
        switch (currentPhase.name) {
            case 'inhale':
            case 'hold':
                return 'scale-100';
            case 'exhale':
            case 'hold-inhale':
                return 'scale-75';
            default:
                return 'scale-75';
        }
    };

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-lg text-center flex flex-col items-center overflow-hidden relative border border-gray-200 dark:border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-300 via-rose-300 to-amber-300 bg-[size:200%_200%] animate-calm-bg -z-10 opacity-50 dark:opacity-30"></div>
            
            <div className="w-full max-w-sm z-10">
                <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Pattern:</label>
                    <select value={pattern} onChange={(e) => handlePatternChange(e.target.value as BreathingPattern)} className="p-2 bg-white/70 dark:bg-gray-700/70 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-orange-500 focus:border-orange-500 backdrop-blur-sm" disabled={isAnimating}>
                        <option value="Box Breathing">Box Breathing</option>
                        <option value="4-7-8 Breathing">4-7-8 Breathing</option>
                    </select>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 min-h-[2.5rem]">{patterns[pattern].description}</p>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Session Duration:</label>
                    <div className="flex justify-center bg-white/70 dark:bg-gray-700/70 rounded-lg p-1 space-x-1 backdrop-blur-sm border border-gray-300 dark:border-gray-600">
                        {durationOptions.map(opt => (
                            <button key={opt.seconds} onClick={() => handleDurationChange(opt.seconds)} disabled={isAnimating} className={`flex-1 py-1 px-2 text-sm rounded-md transition-colors ${duration === opt.seconds ? 'bg-orange-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}>{opt.label}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative w-64 h-64 flex items-center justify-center my-4 z-10">
                <div className={`absolute inset-0 border-8 border-orange-500 rounded-full transition-transform ease-linear ${getRingScale()}`} style={{ transitionDuration: `${currentPhase.duration}ms` }} />
                <div className="relative z-10 flex flex-col items-center justify-center">
                    {isAnimating ? (
                        <>
                            <span className="text-6xl font-bold font-mono text-gray-900 dark:text-gray-100">{phaseCountdown}</span>
                            <span className="text-xl text-gray-600 dark:text-gray-400 tracking-widest">{currentPhase.instruction}</span>
                        </>
                    ) : (
                        <span className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Ready?</span>
                    )}
                </div>
            </div>
            
            <div className="w-full max-w-sm z-10">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" aria-label={isMuted ? "Unmute" : "Mute"}>
                        {isMuted ? <SpeakerXMarkIcon className="w-6 h-6" /> : <SpeakerWaveIcon className="w-6 h-6" />}
                    </button>
                    <div className="text-lg font-mono text-gray-600 dark:text-gray-400">
                        {formatTime(sessionTimeLeft)}
                    </div>
                </div>
                <button onClick={handleStartStop} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 text-xl tracking-wider">
                    {isAnimating ? 'Stop' : 'Start'}
                </button>
            </div>
        </div>
    );
};

export default BreathingExercise;