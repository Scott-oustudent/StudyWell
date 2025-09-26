import React, { useState, useEffect, useMemo } from 'react';
import { WellnessEntry } from '../../types';
import { TrashIcon } from '../icons/Icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { useSubscription } from '../../context/SubscriptionContext';


const MOOD_OPTIONS: { mood: WellnessEntry['mood']; emoji: string }[] = [
  { mood: 'Happy', emoji: '😊' },
  { mood: 'Okay', emoji: '🙂' },
  { mood: 'Neutral', emoji: '😐' },
  { mood: 'Sad', emoji: '😟' },
  { mood: 'Stressed', emoji: '😠' },
];

const STRESS_LEVEL_OPTIONS: WellnessEntry['stressLevel'][] = ['Low', 'Medium', 'High'];

const moodMap: Record<WellnessEntry['mood'], number> = {
    'Happy': 5,
    'Okay': 4,
    'Neutral': 3,
    'Sad': 2,
    'Stressed': 1,
};

const stressMap: Record<WellnessEntry['stressLevel'], number> = {
    'High': 3,
    'Medium': 2,
    'Low': 1,
};


const WellnessChart: React.FC<{ entries: WellnessEntry[] }> = ({ entries }) => {
    const { theme } = useTheme();
    const isDark = theme.isDark;

    const chartData = useMemo(() => {
        if (entries.length < 2) return [];
        return entries
            .slice() // Create a copy
            .reverse() // Sort chronologically
            .map(entry => ({
                date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                Mood: moodMap[entry.mood],
                Stress: stressMap[entry.stressLevel],
            }));
    }, [entries]);

    if (chartData.length < 2) {
        return (
            <div className="text-center p-8 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">Log at least two days of entries to see your wellness trends.</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="date" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                    <YAxis
                        stroke={isDark ? '#9ca3af' : '#6b7280'}
                        domain={[0, 5]}
                        ticks={[1, 2, 3, 4, 5]}
                    />
                    <Tooltip
                        contentStyle={{ 
                            backgroundColor: isDark ? '#1f2937' : '#ffffff', 
                            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
                        }}
                        labelStyle={{ color: isDark ? '#f3f4f6' : '#374151' }}
                    />
                    <Legend wrapperStyle={{ color: isDark ? '#f3f4f6' : '#374151' }} />
                    <Line type="monotone" dataKey="Mood" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="Stress" stroke="#ff7300" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};


const WellnessTracker: React.FC = () => {
  const [entries, setEntries] = useState<WellnessEntry[]>(() => {
    try {
      const savedEntries = localStorage.getItem('wellnessEntries');
      return savedEntries ? JSON.parse(savedEntries).map((e: any) => ({ ...e, date: new Date(e.date) })) : [];
    } catch (error) {
      console.error("Failed to load wellness entries from localStorage", error);
      return [];
    }
  });

  const [mood, setMood] = useState<WellnessEntry['mood']>('Neutral');
  const [sleepHours, setSleepHours] = useState<number>(8);
  const [stressLevel, setStressLevel] = useState<WellnessEntry['stressLevel']>('Low');
  const { isPaid } = useSubscription();

  useEffect(() => {
    try {
      localStorage.setItem('wellnessEntries', JSON.stringify(entries));
    } catch (error) {
      console.error("Failed to save wellness entries to localStorage", error);
    }
  }, [entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    // Check if an entry for today already exists
    const hasTodayEntry = entries.some(entry => new Date(entry.date).toDateString() === today.toDateString());

    if (hasTodayEntry) {
      alert("You've already logged an entry for today.");
      return;
    }

    const newEntry: WellnessEntry = {
      id: Date.now().toString(),
      date: today,
      mood,
      sleepHours,
      stressLevel,
    };
    setEntries(prev => [newEntry, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg space-y-8 border border-gray-200 dark:border-gray-700">
      {/* Entry Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-xl font-bold text-center text-orange-500">Log Today's Wellness</h3>
        
        {/* Mood Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">How are you feeling?</label>
          <div className="flex justify-center gap-2 sm:gap-4">
            {MOOD_OPTIONS.map(({ mood: moodOption, emoji }) => (
              <button
                key={moodOption}
                type="button"
                onClick={() => setMood(moodOption)}
                className={`p-2 sm:p-3 rounded-full text-3xl transition-transform duration-200 ${mood === moodOption ? 'bg-orange-500/20 ring-2 ring-orange-500 scale-110' : 'hover:scale-110'}`}
                aria-label={moodOption}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Sleep Hours */}
        <div>
          <label htmlFor="sleepHours" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Hours of Sleep</label>
          <input
            id="sleepHours"
            type="number"
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            min="0"
            max="24"
            step="0.5"
            className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Stress Level */}
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Stress Level</label>
          <div className="flex justify-between gap-2">
            {STRESS_LEVEL_OPTIONS.map(level => (
              <button
                key={level}
                type="button"
                onClick={() => setStressLevel(level)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${stressLevel === level ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
        >
          Save Entry
        </button>
      </form>

      {/* History */}
      {entries.length > 0 && (
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-center text-orange-500">Wellness History</h3>
          
          {isPaid ? (
             <div className="mb-6">
                <WellnessChart entries={entries} />
            </div>
          ) : (
            <div className="text-center p-4 mb-6 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 rounded-lg">
                Upgrade to Premium to visualize your wellness trends over time.
            </div>
          )}

          <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {entries.map(entry => (
              <li key={entry.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex justify-between items-center border border-gray-200 dark:border-gray-600">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span>{MOOD_OPTIONS.find(m => m.mood === entry.mood)?.emoji} {entry.mood}</span>
                    <span>😴 {entry.sleepHours} hrs</span>
                    <span>🤯 {entry.stressLevel} Stress</span>
                  </div>
                </div>
                <button 
                    onClick={() => deleteEntry(entry.id)} 
                    className="p-2 rounded-full text-gray-400 hover:bg-red-500/10 hover:text-red-500"
                    aria-label="Delete entry"
                >
                    <TrashIcon className="w-5 h-5"/>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WellnessTracker;