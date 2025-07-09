
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CalendarEvent, EventType } from '../types';
import Modal from './common/Modal';
import Button from './common/Button';
import Icon from './common/Icon';
import Card from './common/Card';
import ExportMenu from './common/ExportMenu';
import useLocalStorage from '../hooks/useLocalStorage';

const EVENT_TYPE_STYLES: Record<EventType, { bg: string, text: string, border: string, dot: string }> = {
  exam: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500', dot: 'bg-red-500' },
  assignment: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500', dot: 'bg-yellow-500' },
  lecture: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500', dot: 'bg-blue-500' },
  other: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500', dot: 'bg-green-500' },
};
const EVENT_TYPES: EventType[] = ['exam', 'assignment', 'lecture', 'other'];

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const formatTime12hr = (timeStr: string) => {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
};

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, type: EventType, time: string, date: string) => void;
  initialDate: string;
}

const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSave, initialDate }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('assignment');
  const [time, setTime] = useState('12:00');
  const [eventDate, setEventDate] = useState(initialDate);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setType('assignment');
      setTime('12:00');
      setEventDate(initialDate);
    }
  }, [isOpen, initialDate]);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title, type, time, eventDate);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Event`}>
      <div className="space-y-4">
        <div>
          <label htmlFor="event-title" className="block text-sm font-medium text-gray-700">Event Title</label>
          <input
            type="text"
            id="event-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
            placeholder="e.g., Midterm Exam"
          />
        </div>
        <div>
          <label htmlFor="event-date" className="block text-sm font-medium text-gray-700">Event Date</label>
          <input
            type="date"
            id="event-date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
          />
        </div>
         <div>
          <label htmlFor="event-time" className="block text-sm font-medium text-gray-700">Event Time</label>
          <input
            type="time"
            id="event-time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
          />
        </div>
        <div>
          <label htmlFor="event-type" className="block text-sm font-medium text-gray-700">Event Type</label>
          <select
            id="event-type"
            value={type}
            onChange={(e) => setType(e.target.value as EventType)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
          >
            {EVENT_TYPES.map(t => (
              <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave}>Save Event</Button>
        </div>
      </div>
    </Modal>
  );
};


const Scheduler: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('schedulerEvents', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Previous month's padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDay; i > 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthLastDay - i + 1), isCurrentMonth: false });
    }
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    // Next month's padding
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  }, [currentDate]);

  const eventsByDate = useMemo(() => {
    const sortedEvents = [...events].sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
    return sortedEvents.reduce((acc, event) => {
      (acc[event.date] = acc[event.date] || []).push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);
  }, [events]);

  const handleDayClick = useCallback((date: Date) => {
    setSelectedDate(formatDate(date));
  }, []);
  
  const handleAddEvent = useCallback((title: string, type: EventType, time: string, date: string) => {
    const newEvent: CalendarEvent = { id: Date.now(), date: date, title, type, time };
    setEvents(prev => [...prev, newEvent]);
    setIsModalOpen(false);
  }, [setEvents]);
  
  const handleDeleteEvent = useCallback((id: number) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  }, [setEvents]);

  const handlePrevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const selectedDayEvents = eventsByDate[selectedDate] || [];
  const agendaTextContent = useMemo(() => selectedDayEvents.map(event => `${formatTime12hr(event.time)} - ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}: ${event.title}`).join('\n'), [selectedDayEvents]);

  return (
    <div className="p-8 h-full flex flex-col">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-2">Scheduler</h1>
      <p className="text-lg text-gray-600 mb-6">Plan your exams, assignments, and lectures.</p>
      
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
            <div className="flex items-center gap-2">
              <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Previous month"><Icon><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></Icon></button>
              <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Next month"><Icon><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></Icon></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-px text-center font-semibold text-gray-600 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="py-2">{day}</div>)}
          </div>
          <div className="grid grid-cols-7 grid-rows-6 gap-px flex-grow bg-gray-200 border-l border-t">
            {calendarData.map(({ date, isCurrentMonth }, index) => {
              const dateStr = formatDate(date);
              const dayEvents = eventsByDate[dateStr] || [];
              const isToday = dateStr === formatDate(new Date());
              return (
                <div key={index} className={`p-2 bg-white flex flex-col cursor-pointer transition-colors hover:bg-gray-50 ${selectedDate === dateStr ? 'ring-2 ring-pink-500 z-10' : ''}`} onClick={() => handleDayClick(date)}>
                  <span className={`self-start text-sm font-medium ${isToday ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full w-7 h-7 flex items-center justify-center' : 'w-7 h-7 flex items-center justify-center'} ${isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}`}>{date.getDate()}</span>
                  <div className="flex-grow mt-1 space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map(event => (
                      <div key={event.id} className={`flex items-center text-xs truncate rounded px-1 ${EVENT_TYPE_STYLES[event.type].bg} ${EVENT_TYPE_STYLES[event.type].text}`}>
                          <div className={`w-2 h-2 rounded-full mr-1.5 ${EVENT_TYPE_STYLES[event.type].dot}`}></div>
                          <span>{event.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && <div className="text-xs text-gray-500 mt-1">+{dayEvents.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        
        <div className="flex flex-col gap-6">
          <Card className="p-6 flex-grow flex flex-col">
             <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">Agenda for <span className="text-pink-600">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}</span></h2>
                <ExportMenu
                    elementId="agenda-export-list"
                    textContent={agendaTextContent}
                    filename={`agenda-${selectedDate}`}
                    disabled={selectedDayEvents.length === 0}
                />
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
              {selectedDayEvents.length > 0 ? (
                <ul id="agenda-export-list" className="space-y-3">
                  {selectedDayEvents.map(event => (
                    <li key={event.id} className={`p-3 rounded-lg flex justify-between items-start border-l-4 ${EVENT_TYPE_STYLES[event.type].bg} ${EVENT_TYPE_STYLES[event.type].border}`}>
                      <div>
                        <p className={`font-semibold ${EVENT_TYPE_STYLES[event.type].text}`}>{event.title}</p>
                        <div className={`flex items-baseline gap-2 text-sm ${EVENT_TYPE_STYLES[event.type].text}`}>
                            <span className="capitalize font-medium">{event.type}</span>
                            <span className="text-xs font-normal text-gray-600">{formatTime12hr(event.time)}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteEvent(event.id)} className={`text-gray-400 hover:text-red-600 transition-colors`} aria-label="Delete event">
                        <Icon><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></Icon>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div id="agenda-export-list" className="text-center text-gray-500 h-full flex items-center justify-center">
                    <p>No events for this day.</p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button onClick={() => setIsModalOpen(true)} className="w-full">Add New Event</Button>
            </div>
          </Card>
        </div>
      </div>

      <EventFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddEvent}
        initialDate={selectedDate}
      />
    </div>
  );
};

export default Scheduler;
