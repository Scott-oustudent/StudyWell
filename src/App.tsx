import React, { useState, useEffect } from 'react';
import './App.css';
import PomodoroTimer from './components/PomodoroTimer';
import StudyCalendar from './components/StudyCalendar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Timer, CalendarDays, BookOpen, LogOut } from 'lucide-react';
import AuthPage from './auth/AuthPage'; // Import the AuthPage
import { supabase } from '@/lib/supabase'; // Import supabase client
import { Session } from '@supabase/supabase-js'; // Import Session type
import { Button } from '@/components/ui/button'; // Import Button
import useSupabaseConnectionTest from './hooks/useSupabaseConnectionTest'; // Import the test hook

function App() {
  const [activeTab, setActiveTab] = useState('timer');
  const [session, setSession] = useState<Session | null>(null); // State to hold the user session
  const [loading, setLoading] = useState(true); // Loading state for initial session check

  // Run the connection test hook
  useSupabaseConnectionTest();

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false); // Ensure loading is false after any auth state change
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange listener will update the session state
  };

  if (loading) {
    // Optional: Render a loading spinner or screen while checking session
    return <div className="min-h-screen w-full bg-sw-background text-sw-text flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    // If no session, show the authentication page
    return <AuthPage />;
  }

  // If session exists, show the main app content
  return (
    <div className="min-h-screen w-full bg-sw-background text-sw-text p-4 flex flex-col items-center">
      <header className="w-full max-w-4xl flex justify-between items-center py-6">
        <div className="flex items-center space-x-2 text-sw-primary text-3xl font-bold">
           <BookOpen className="h-8 w-8" />
           <h1>StudyWell</h1>
        </div>
        <Button onClick={handleLogout} variant="outline" className="border-sw-border text-sw-text hover:bg-sw-surface/80 rounded-md shadow-md">
           <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col items-center">
          <TabsList className="bg-sw-surface border border-sw-border rounded-md shadow-md p-1">
            <TabsTrigger value="timer" className="data-[state=active]:bg-sw-primary data-[state=active]:text-sw-text data-[state=active]:shadow-sm rounded-sm px-4 py-2 transition-colors">
              <Timer className="mr-2 h-4 w-4" /> Pomodoro Timer
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-sw-primary data-[state=active]:text-sw-text data-[state[active]:shadow-sm rounded-sm px-4 py-2 transition-colors">
              <CalendarDays className="mr-2 h-4 w-4" /> Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timer" className="w-full mt-8">
            <PomodoroTimer />
          </TabsContent>
          <TabsContent value="calendar" className="w-full mt-8">
            <StudyCalendar />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
