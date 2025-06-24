import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw } from 'lucide-react';

const WORK_TIME = 25 * 60; // 25 minutes
const SHORT_BREAK = 5 * 60; // 5 minutes
const LONG_BREAK = 15 * 60; // 15 minutes
const CYCLES_BEFORE_LONG_BREAK = 4;

type TimerState = 'idle' | 'running' | 'paused';
type TimerMode = 'work' | 'short-break' | 'long-break';

const PomodoroTimer: React.FC = () => {
  const [timeRemaining, setTimeRemaining] = useState(WORK_TIME);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timerMode, setTimerMode] = useState<TimerMode>('work');
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  const intervalRef = useRef<number | null>(null);

  const startTimer = () => {
    setTimerState('running');
    intervalRef.current = window.setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          // Timer ends
          clearInterval(intervalRef.current!);
          handleTimerEnd();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    setTimerState('paused');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetTimer = () => {
    setTimerState('idle');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimerMode('work');
    setTimeRemaining(WORK_TIME);
    setCyclesCompleted(0);
  };

  const handleTimerEnd = () => {
    if (timerMode === 'work') {
      const newCyclesCompleted = cyclesCompleted + 1;
      setCyclesCompleted(newCyclesCompleted);
      if (newCyclesCompleted % CYCLES_BEFORE_LONG_BREAK === 0) {
        setTimerMode('long-break');
        setTimeRemaining(LONG_BREAK);
      } else {
        setTimerMode('short-break');
        setTimeRemaining(SHORT_BREAK);
      }
    } else {
      // Break ends, go back to work
      setTimerMode('work');
      setTimeRemaining(WORK_TIME);
    }
    setTimerState('idle'); // Set to idle, user needs to start the next phase
  };

  useEffect(() => {
    // Cleanup interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const totalTime = timerMode === 'work' ? WORK_TIME : timerMode === 'short-break' ? SHORT_BREAK : LONG_BREAK;
  const progress = (timeRemaining / totalTime) * 100;

  return (
    <Card className="w-full max-w-md mx-auto bg-sw-surface text-sw-text border-sw-border rounded-xl shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold capitalize text-sw-primary">
          {timerMode.replace('-', ' ')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        <div className="relative w-48 h-48 flex items-center justify-center">
           {/* Simple circle for visual timer representation */}
           <div className="absolute inset-0 rounded-full border-8 border-sw-border opacity-50"></div>
           <div
             className="absolute inset-0 rounded-full border-8 border-sw-primary"
             style={{
               borderTopColor: 'transparent',
               borderRightColor: 'transparent',
               transform: `rotate(${((totalTime - timeRemaining) / totalTime) * 360}deg)`,
               transition: 'transform 1s linear',
             }}
           ></div>
          <span className="text-6xl font-mono text-sw-text">{formatTime(timeRemaining)}</span>
        </div>

        <Progress value={100 - progress} className="w-full h-2 bg-sw-border" indicatorClassName="bg-sw-primary" />

        <div className="flex space-x-4">
          {timerState === 'idle' || timerState === 'paused' ? (
            <Button onClick={startTimer} className="bg-sw-success hover:bg-sw-success/90 text-sw-text rounded-md shadow-md">
              <Play className="mr-2 h-5 w-5" /> Start
            </Button>
          ) : (
            <Button onClick={pauseTimer} className="bg-sw-warning hover:bg-sw-warning/90 text-sw-text rounded-md shadow-md">
              <Pause className="mr-2 h-5 w-5" /> Pause
            </Button>
          )}
          <Button onClick={resetTimer} variant="outline" className="border-sw-border text-sw-text hover:bg-sw-surface/80 rounded-md shadow-md">
            <RotateCcw className="mr-2 h-5 w-5" /> Reset
          </Button>
        </div>
        <p className="text-sm text-sw-text-secondary">Cycles Completed: {cyclesCompleted}</p>
      </CardContent>
    </Card>
  );
};

export default PomodoroTimer;
