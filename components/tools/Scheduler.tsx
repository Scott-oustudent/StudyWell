import React, { useState, useMemo, useEffect } from 'react';
import { ScheduleEvent } from '../../types';
import { PlusIcon, TrashIcon, CalendarIcon, CogIcon, PrinterIcon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from '../icons/Icons';
import { useSubscription } from '../../context/SubscriptionContext';
import * as db from '../../services/databaseService';
import { createStudyPlan } from '../../services/geminiService';

type View = 'calendar' | 'list';

const EVENT_TYPE_CLASSES: Record<ScheduleEvent['type'], string> = {
  exam: 'bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-200 border border-red-200 dark:border-red-800',
  assignment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800',
  lecture: 'bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200 border border-blue-200 dark:border-blue-800',
  deadline: 'bg-purple-100 text-purple-800 dark:bg-purple-900/70 dark:text-purple-200 border border-purple-200 dark:border-purple-800',
  other: 'bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-200 border border-green-200 dark:border-green-800',
};

const Scheduler: React.FC = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>(() => db.getEvents());
  const [view, setView] = useState<View>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const { isPaid } = useSubscription();

  useEffect(() => {
    db.saveEvents(events);
  }, [events]);

  const addEvent = (event: Omit<ScheduleEvent, 'id'>) => {
    setEvents([...events, { ...event, id: Date.now().toString() }]);
  };

  const addMultipleEvents = (newEvents: Omit<ScheduleEvent, 'id'>[]) => {
    const eventsToAdd = newEvents.map((e, i) => ({...e, id: `${Date.now()}-${i}`}));
    setEvents(prev => [...prev, ...eventsToAdd]);
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
  };
    
  const handlePrint = () => {
    if (!isPaid) return;
    window.print();
  };

  const handleExportIcal = () => {
    if (!isPaid) return;
    const toIcalDate = (date: Date) => date.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

    let icalContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//AIStudentCompanion//EN',
    ];

    events.forEach(event => {
        icalContent.push('BEGIN:VEVENT');
        icalContent.push(`UID:${event.id}@studentcompanion.app`);
        icalContent.push(`DTSTAMP:${toIcalDate(new Date())}`);
        icalContent.push(`DTSTART:${toIcalDate(event.date)}`);
        // Simple 1-hour duration for events
        const endDate = new Date(event.date);
        endDate.setHours(endDate.getHours() + 1);
        icalContent.push(`DTEND:${toIcalDate(endDate)}`);
        icalContent.push(`SUMMARY:${event.title}`);
        icalContent.push('END:VEVENT');
    });

    icalContent.push('END:VCALENDAR');

    const blob = new Blob([icalContent.join('\r\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
    

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div className="flex items-center gap-2">
            <button onClick={() => setView('calendar')} className={`px-3 py-1 text-sm rounded-md ${view === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Calendar</button>
            <button onClick={() => setView('list')} className={`px-3 py-1 text-sm rounded-md ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>List</button>
        </div>
        <div className='flex items-center gap-2'>
            <button onClick={() => setIsAiModalOpen(true)} className={`p-2 rounded-full ${isPaid ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'opacity-50 cursor-not-allowed'}`} title={isPaid ? 'Create Study Plan with AI' : 'Premium Feature'}>
                <SparklesIcon className="w-5 h-5 text-purple-500"/>
            </button>
            <button onClick={handlePrint} className={`p-2 rounded-full ${isPaid ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'opacity-50 cursor-not-allowed'}`} title={isPaid ? 'Print Schedule' : 'Premium Feature'}>
              <PrinterIcon className="w-5 h-5"/>
            </button>
            <button onClick={handleExportIcal} className={`p-2 rounded-full ${isPaid ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'opacity-50 cursor-not-allowed'}`} title={isPaid ? 'Export to iCal' : 'Premium Feature'}>
              <DownloadIcon className="w-5 h-5"/>
            </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <CalendarView currentDate={currentDate} setCurrentDate={setCurrentDate} events={events} />
      ) : (
        <ListView events={events} deleteEvent={deleteEvent} />
      )}

      <button onClick={() => setIsEventModalOpen(true)} className="fixed bottom-24 right-6 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-transform hover:scale-110">
        <PlusIcon className="w-6 h-6" />
      </button>
      
      {isEventModalOpen && <AddEventModal onClose={() => setIsEventModalOpen(false)} addEvent={addEvent} />}
      {isAiModalOpen && isPaid && <AiPlannerModal onClose={() => setIsAiModalOpen(false)} addEvents={addMultipleEvents} />}
    </div>
  );
};

// Calendar View Component
const CalendarView: React.FC<{ currentDate: Date, setCurrentDate: (d: Date) => void, events: ScheduleEvent[] }> = ({ currentDate, setCurrentDate, events }) => {
    const daysInMonth = useMemo(() => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const days = [];
        while (date.getMonth() === currentDate.getMonth()) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [currentDate]);

    const startDayOfMonth = currentDate.getDay();

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    }
    
    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <button onClick={() => changeMonth(-1)}><ChevronLeftIcon className="w-6 h-6"/></button>
                <h3 className="font-bold text-lg">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => changeMonth(1)}><ChevronRightIcon className="w-6 h-6"/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-600 dark:text-gray-400">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-1">
                {Array.from({ length: startDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="border border-gray-200 dark:border-gray-700 rounded-md h-20"></div>)}
                {daysInMonth.map(day => {
                    const dayEvents = events.filter(e => isSameDay(e.date, day));
                    const isToday = isSameDay(new Date(), day);
                    return (
                        <div key={day.toString()} className={`border border-gray-200 dark:border-gray-700 rounded-md h-20 p-1 text-left ${isToday ? 'bg-blue-500/10' : ''}`}>
                            <span className={`text-xs ${isToday ? 'font-bold text-blue-700 dark:text-blue-400' : ''}`}>{day.getDate()}</span>
                            <div className="overflow-y-auto max-h-16 text-xs">
                                {dayEvents.map(e => (
                                    <div key={e.id} className={`truncate rounded px-1 font-medium text-xs mb-0.5 ${EVENT_TYPE_CLASSES[e.type]}`}>{e.title}</div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// List View Component
const ListView: React.FC<{ events: ScheduleEvent[], deleteEvent: (id: string) => void }> = ({ events, deleteEvent }) => {
    const sortedEvents = [...events].sort((a,b) => a.date.getTime() - b.date.getTime());
    return (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {sortedEvents.length > 0 ? sortedEvents.map(event => (
                <div key={event.id} className="bg-white dark:bg-gray-900 p-3 rounded-md flex justify-between items-center border border-gray-200 dark:border-gray-700">
                    <div>
                        <p className="font-bold">{event.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{event.date.toLocaleDateString()} - <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${EVENT_TYPE_CLASSES[event.type]}`}>{event.type}</span></p>
                    </div>
                    <button onClick={() => deleteEvent(event.id)} className="p-2 rounded-full hover:bg-red-500/10 text-gray-500 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                </div>
            )) : <p className="text-center text-gray-600 dark:text-gray-400">No upcoming events.</p>}
        </div>
    );
};

// Add Event Modal
const AddEventModal: React.FC<{onClose: () => void, addEvent: (e: Omit<ScheduleEvent, 'id'>) => void}> = ({ onClose, addEvent }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<ScheduleEvent['type']>('other');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Date from input is local timezone, new Date() will parse it correctly
        addEvent({ title, date: new Date(date + 'T00:00:00'), type });
        onClose();
    }
    
    return (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Add New Event</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Event Title" className="w-full p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md" required />
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md" required />
                    <select value={type} onChange={e => setType(e.target.value as ScheduleEvent['type'])} className="w-full p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md">
                        <option value="exam">Exam</option>
                        <option value="assignment">Assignment</option>
                        <option value="lecture">Lecture</option>
                        <option value="deadline">Deadline</option>
                        <option value="other">Other</option>
                    </select>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 rounded-md text-white">Add Event</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// AI Planner Modal
const AiPlannerModal: React.FC<{onClose: () => void, addEvents: (e: Omit<ScheduleEvent, 'id'>[]) => void}> = ({ onClose, addEvents }) => {
    const [goal, setGoal] = useState('');
    const [timeframe, setTimeframe] = useState('in 2 weeks');
    const [isLoading, setIsLoading] = useState(false);
    const [plan, setPlan] = useState<Omit<ScheduleEvent, 'id'>[] | null>(null);

    const handleGenerate = async () => {
        if (!goal.trim()) return;
        setIsLoading(true);
        const generatedPlan = await createStudyPlan(goal, timeframe);
        setPlan(generatedPlan);
        setIsLoading(false);
    };

    const handleConfirm = () => {
        if (plan) {
            addEvents(plan);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><SparklesIcon className="w-6 h-6 text-purple-500" /> AI Study Planner</h3>
                
                {!plan && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">What is your goal?</label>
                            <input type="text" value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g., Prepare for my History final exam" className="w-full p-2 bg-gray-50 dark:bg-gray-700 border rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">What is the timeframe?</label>
                            <input type="text" value={timeframe} onChange={e => setTimeframe(e.target.value)} placeholder="e.g., over the next 3 weeks" className="w-full p-2 bg-gray-50 dark:bg-gray-700 border rounded-md" required />
                        </div>
                        <button onClick={handleGenerate} disabled={isLoading || !goal} className="w-full bg-purple-600 text-white font-bold py-2 rounded-md disabled:bg-purple-400">
                            {isLoading ? 'Generating...' : 'Create Plan'}
                        </button>
                    </div>
                )}

                {isLoading && !plan && (
                    <div className="text-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Building your study plan...</p>
                    </div>
                )}

                {plan && (
                    <div>
                        <h4 className="font-semibold mb-2">Suggested Plan:</h4>
                        <ul className="space-y-2 max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                            {plan.map((event, i) => (
                                <li key={i}>{new Date(event.date).toLocaleDateString()}: {event.title}</li>
                            ))}
                        </ul>
                        <div className="flex justify-end gap-2 mt-4">
                            <button type="button" onClick={() => setPlan(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Regenerate</button>
                            <button type="submit" onClick={handleConfirm} className="px-4 py-2 bg-blue-600 rounded-md text-white">Add to Calendar</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


export default Scheduler;