import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarDays, Plus } from 'lucide-react';

interface Event {
  id: string;
  date: Date;
  title: string;
  type: 'assignment' | 'exam' | 'tutorial';
}

const StudyCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState<Date | undefined>(new Date());
  const [newEventType, setNewEventType] = useState<'assignment' | 'exam' | 'tutorial'>('assignment');

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setNewEventDate(date); // Set new event date to selected date
  };

  const addEvent = () => {
    if (!newEventTitle || !newEventDate || !newEventType) return;

    const newEvent: Event = {
      id: Date.now().toString(), // Simple unique ID
      date: newEventDate,
      title: newEventTitle,
      type: newEventType,
    };

    setEvents([...events, newEvent]);
    setNewEventTitle('');
    setNewEventDate(selectedDate); // Reset new event date to current selected date
    setNewEventType('assignment');
    setIsDialogOpen(false);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event =>
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  const modifiers = {
    hasEvent: events.map(event => event.date),
  };

  const modifiersStyles = {
    hasEvent: {
      fontWeight: 'bold',
      textDecoration: 'underline',
      color: 'var(--sw-primary)', // Highlight dates with events
    },
  };


  return (
    <Card className="w-full max-w-2xl mx-auto bg-sw-surface text-sw-text border-sw-border rounded-xl shadow-lg p-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl font-bold text-sw-primary">
          Study Calendar
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-sw-accent hover:bg-sw-accent/90 text-sw-text rounded-md shadow-md">
              <Plus className="mr-2 h-5 w-5" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-sw-surface text-sw-text border-sw-border rounded-lg shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-sw-primary">Add New Event</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right text-sw-text">
                  Title
                </Label>
                <Input
                  id="title"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="col-span-3 bg-sw-background border-sw-border text-sw-text"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right text-sw-text">
                  Date
                </Label>
                 {/* Using a simple input for date for now, can integrate date picker later if needed */}
                <Input
                   id="date"
                   type="date"
                   value={newEventDate ? format(newEventDate, 'yyyy-MM-dd') : ''}
                   onChange={(e) => setNewEventDate(e.target.value ? new Date(e.target.value) : undefined)}
                   className="col-span-3 bg-sw-background border-sw-border text-sw-text"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right text-sw-text">
                  Type
                </Label>
                <Select value={newEventType} onValueChange={(value: 'assignment' | 'exam' | 'tutorial') => setNewEventType(value)}>
                  <SelectTrigger className="col-span-3 bg-sw-background border-sw-border text-sw-text">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent className="bg-sw-surface text-sw-text border-sw-border">
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addEvent} className="bg-sw-primary hover:bg-sw-primary/90 text-sw-text rounded-md shadow-md">
                Add Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border bg-sw-background text-sw-text border-sw-border shadow-md"
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
          />
        </div>
        <div className="flex-1 space-y-4">
          <h3 className="text-xl font-semibold text-sw-secondary">
            Events for {selectedDate ? format(selectedDate, 'PPP') : 'Selected Date'}
          </h3>
          <div className="space-y-2">
            {selectedDate && getEventsForDate(selectedDate).length > 0 ? (
              getEventsForDate(selectedDate).map(event => (
                <div key={event.id} className="p-3 border border-sw-border rounded-md bg-sw-background shadow-sm">
                  <p className="font-medium text-sw-text">{event.title}</p>
                  <p className="text-sm text-sw-text-secondary capitalize">{event.type}</p>
                </div>
              ))
            ) : (
              <p className="text-sw-text-secondary">No events scheduled for this date.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyCalendar;
