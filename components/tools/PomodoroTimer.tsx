import React, { useState, useEffect, useCallback, useRef } from 'react';
// FIX: Import FocusGoal, FocusProgress, and GoalType from the centralized types file.
import { PomodoroSession, GoalType, FocusGoal, FocusProgress } from '../../types';
import { PlusIcon, CogIcon, ClockIcon, TrashIcon, DownloadIcon } from '../icons/Icons';
import { useSubscription } from '../../context/SubscriptionContext';
import * as db from '../../services/databaseService';
import * as notificationService from '../../services/notificationService';

// Helper to get the start of the week (Sunday)
const getWeekStartDate = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setHours(0, 0, 0, 0);
    return new Date(d.setDate(diff));
};


const PomodoroTimer: React.FC = () => {
    const [focusMinutes, setFocusMinutes] = useState(25);
    const [breakMinutes, setBreakMinutes] = useState(5);
    const [timeRemaining, setTimeRemaining] = useState(focusMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [tasks, setTasks] = useState<{ id: string; text: string; completed: boolean }[]>([]);
    const [currentTask, setCurrentTask] = useState('');
    const [history, setHistory] = useState<PomodoroSession[]>(() => db.getPomodoroSessions());
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [goal, setGoal] = useState<FocusGoal>(() => db.getPomodoroGoal({ type: 'none', minutes: 120 }));
    const [progress, setProgress] = useState<FocusProgress>(() => db.getPomodoroProgress({
        daily: { date: '', minutes: 0 },
        weekly: { weekStartDate: '', minutes: 0 },
    }));
    const [notificationsEnabled, setNotificationsEnabled] = useState(notificationService.getNotificationPermissionStatus() === 'granted');
    const { isPaid } = useSubscription();


    const timerRef = useRef<number | null>(null);
    
    // Save state to db service on change
    useEffect(() => {
        db.savePomodoroGoal(goal);
    }, [goal]);

    useEffect(() => {
        db.savePomodoroProgress(progress);
    }, [progress]);

    useEffect(() => {
        db.savePomodoroSessions(history);
    }, [history]);

    const updateProgress = useCallback((minutesToAdd: number) => {
        setProgress(currentProgress => {
            const todayStr = new Date().toISOString().split('T')[0];
            const weekStartStr = getWeekStartDate(new Date()).toISOString().split('T')[0];

            const newDailyMinutes = currentProgress.daily.date === todayStr ? currentProgress.daily.minutes + minutesToAdd : minutesToAdd;
            const newWeeklyMinutes = currentProgress.weekly.weekStartDate === weekStartStr ? currentProgress.weekly.minutes + minutesToAdd : minutesToAdd;

            return {
                daily: { date: todayStr, minutes: newDailyMinutes },
                weekly: { weekStartDate: weekStartStr, minutes: newWeeklyMinutes },
            };
        });
    }, []);

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const handleTimerEnd = useCallback(() => {
        if (isBreak) { // Break finished
            if (notificationsEnabled) {
                notificationService.showNotification("Break's Over!", { body: "Time to get back to focus." });
            }
            setIsBreak(false);
            setTimeRemaining(focusMinutes * 60);
        } else { // Focus session finished
            if (notificationsEnabled) {
                notificationService.showNotification("Focus Session Complete!", { body: `Time for a ${breakMinutes}-minute break.` });
            }
            setIsBreak(true);
            setTimeRemaining(breakMinutes * 60);
            updateProgress(focusMinutes);
            const session: PomodoroSession = {
                id: Date.now().toString(),
                date: new Date(),
                focusDuration: focusMinutes,
                breakDuration: breakMinutes,
                tasks: tasks.filter(t => t.completed).map(t => t.text)
            };
            setHistory(prev => [session, ...prev]);
        }
         // Keep running into next session
         setIsActive(true);
    }, [isBreak, notificationsEnabled, focusMinutes, breakMinutes, updateProgress, tasks]);

    useEffect(() => {
        if (isActive) {
            timerRef.current = window.setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive]);

    useEffect(() => {
        document.title = `${isBreak ? 'Break' : 'Focus'} - ${formatTime(timeRemaining)}`;
        if (timeRemaining < 0) {
            handleTimerEnd();
        }
    }, [timeRemaining, isBreak, formatTime, handleTimerEnd]);
    
    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setIsBreak(false);
        setTimeRemaining(focusMinutes * 60);
    };
    
    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentTask.trim()) return;
        setTasks([...tasks, { id: Date.now().toString(), text: currentTask, completed: false }]);
        setCurrentTask('');
    };
    
    const toggleTask = (id: string) => {
        setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
    };

    const handleExportHistory = () => {
        const dataStr = JSON.stringify(history, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', 'pomodoro_history.json');
        linkElement.click();
        document.body.removeChild(linkElement);
    };

    const handleNotificationToggle = async () => {
        if (!notificationsEnabled) {
            const permissionGranted = await notificationService.requestNotificationPermission();
            setNotificationsEnabled(permissionGranted);
        } else {
            // Cannot programmatically disable notifications, user must do it in browser settings.
            // We can only reflect the current state.
            alert("To disable notifications, please manage them in your browser's site settings for this page.");
        }
    };

    const totalSeconds = (isBreak ? breakMinutes : focusMinutes) * 60;
    const progressPercentage = totalSeconds > 0 ? (totalSeconds - timeRemaining) / totalSeconds * 100 : 0;

    const currentGoalProgress = goal.type === 'daily' ? progress.daily.minutes : (goal.type === 'weekly' ? progress.weekly.minutes : 0);
    const goalProgressPercentage = goal.minutes > 0 ? Math.min((currentGoalProgress / goal.minutes) * 100, 100) : 0;

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg text-center border border-gray-200 dark:border-gray-700 relative">
            <button onClick={() => setIsSettingsOpen(true)} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" title="Settings">
                <CogIcon className="w-6 h-6" />
            </button>
            <div className={`relative w-48 h-48 mx-auto rounded-full flex items-center justify-center text-4xl font-mono font-bold transition-colors duration-300 ${isBreak ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'}`}>
                <svg className="absolute w-full h-full" viewBox="0 0 120 120">
                    <circle className="stroke-current text-gray-200 dark:text-gray-700" strokeWidth="8" fill="transparent" r="56" cx="60" cy="60" />
                    <circle
                        className={`stroke-current ${isBreak ? 'text-blue-500' : 'text-red-500'}`}
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 56}
                        strokeDashoffset={(2 * Math.PI * 56) * (1 - progressPercentage / 100)}
                        strokeLinecap="round"
                        fill="transparent"
                        r="56" cx="60" cy="60"
                        transform="rotate(-90 60 60)"
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                </svg>
                <div className="z-10 flex flex-col">
                    <span>{formatTime(timeRemaining)}</span>
                    <span className="text-sm font-sans font-normal tracking-wider">{isBreak ? 'Break' : 'Focus'}</span>
                </div>
            </div>

            <div className="flex justify-center gap-4 mt-6">
                <button onClick={toggleTimer} className="w-28 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md text-lg">
                    {isActive ? 'Pause' : 'Start'}
                </button>
                <button onClick={resetTimer} className="w-28 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-3 px-4 rounded-md text-lg">
                    Reset
                </button>
            </div>

            <div className="mt-8 text-left max-w-sm mx-auto">
                <h3 className="font-bold text-lg mb-2">Tasks for this session</h3>
                <form onSubmit={handleAddTask} className="flex gap-2 mb-2">
                    <input type="text" value={currentTask} onChange={(e) => setCurrentTask(e.target.value)} placeholder="Add a task" className="flex-grow p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    <button type="submit" className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md" aria-label="Add task"><PlusIcon className="w-5 h-5" /></button>
                </form>
                <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {tasks.map(task => (
                        <li key={task.id} onClick={() => toggleTask(task.id)} className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md cursor-pointer">
                            <input type="checkbox" readOnly checked={task.completed} className="form-checkbox h-5 w-5 rounded text-blue-600 bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 focus:ring-blue-500" />
                            <span className={`${task.completed ? 'line-through text-gray-500' : ''}`}>{task.text}</span>
                        </li>
                    ))}
                </ul>
            </div>
            
            {(isPaid && goal.type !== 'none') && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 max-w-sm mx-auto">
                    <h3 className="font-bold text-lg mb-4">Focus Goals</h3>
                     <div>
                        <div className="flex justify-between items-center text-sm mb-1">
                            <span className="font-semibold capitalize">{goal.type} Goal</span>
                            <span>{currentGoalProgress} / {goal.minutes} min</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${goalProgressPercentage}%` }}></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 max-w-sm mx-auto">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg">Session History</h3>
                    {isPaid && history.length > 0 && (
                        <button onClick={handleExportHistory} className="flex items-center gap-1 text-sm text-blue-600 hover:underline" title="Export History">
                            <DownloadIcon className="w-4 h-4" /> Export
                        </button>
                    )}
                </div>
                <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {history.length > 0 ? history.map(session => (
                        <li key={session.id} className="text-left text-sm p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                            <p className="font-semibold">{session.date.toLocaleDateString()}</p>
                            <p className="text-gray-600 dark:text-gray-400">{session.focusDuration} min focus / {session.breakDuration} min break</p>
                        </li>
                    )) : <p className="text-sm text-gray-500">No completed sessions yet.</p>}
                </ul>
            </div>
            
            {isSettingsOpen && (
                <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4" onClick={() => setIsSettingsOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Focus Duration (minutes)</label>
                                <input type="number" value={focusMinutes} onChange={e => setFocusMinutes(Number(e.target.value))} min="1" className="w-full p-2 bg-gray-100 dark:bg-gray-700 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Break Duration (minutes)</label>
                                <input type="number" value={breakMinutes} onChange={e => setBreakMinutes(Number(e.target.value))} min="1" className="w-full p-2 bg-gray-100 dark:bg-gray-700 border rounded-md" />
                            </div>
                             <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium">Enable Notifications</label>
                                <button onClick={handleNotificationToggle} className={`px-3 py-1 text-sm rounded-full ${notificationsEnabled ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                                    {notificationsEnabled ? 'Enabled' : 'Disabled'}
                                </button>
                            </div>
                             {isPaid && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Focus Goal</label>
                                        <select value={goal.type} onChange={e => setGoal(g => ({ ...g, type: e.target.value as GoalType }))} className="w-full p-2 bg-gray-100 dark:bg-gray-700 border rounded-md">
                                            <option value="none">None</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                        </select>
                                    </div>
                                    {goal.type !== 'none' && (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Goal Minutes</label>
                                            <input type="number" value={goal.minutes} onChange={e => setGoal(g => ({ ...g, minutes: Number(e.target.value) }))} min="1" className="w-full p-2 bg-gray-100 dark:bg-gray-700 border rounded-md" />
                                        </div>
                                    )}
                                </>
                             )}
                        </div>
                         <div className="mt-6 text-right">
                            <button onClick={() => { setIsSettingsOpen(false); resetTimer(); }} className="px-4 py-2 bg-blue-600 text-white rounded-md">
                                Save & Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default PomodoroTimer;