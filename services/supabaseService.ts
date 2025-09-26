import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Note, UserData, ScheduleEvent, StudentTip, ChatMessage, DirectMessage } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
        console.error("Failed to create Supabase client:", e);
    }
} else {
    console.warn('Supabase not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

// Helper mock function to prevent crashes if Supabase is not initialized
const mockPromise = (name: string, defaultValue: any = []) => {
    console.error(`Supabase client is not initialized. Cannot run ${name}.`);
    return Promise.resolve(defaultValue);
};

// Users
export const getAllUsersRemote = async (): Promise<UserData[]> => {
  if (!supabase) return mockPromise('getAllUsersRemote');
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return (data as UserData[]) || []; 
};

export const getUserRemote = async (email: string): Promise<UserData | null> => {
  if (!supabase) return mockPromise('getUserRemote', null);
  const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
  if (error) throw error;
  return (data as UserData) || null;
};

export const saveUserRemote = async (user: UserData): Promise<void> => {
  if (!supabase) return mockPromise('saveUserRemote');
  const { error } = await supabase.from('users').upsert(user);
  if (error) throw error;
};

// Notes
export const getNotesRemote = async (): Promise<Note[]> => {
  if (!supabase) return mockPromise('getNotesRemote');
  const { data, error } = await supabase.from('notes').select('*'); 
  if (error) throw error;
  return (data as Note[] || []).map((n: Note) => ({ ...n, lastModified: new Date(n.lastModified) }));
};

export const saveNotesRemote = async (notes: Note[]): Promise<void> => {
  if (!supabase) return mockPromise('saveNotesRemote');
  const { error } = await supabase.from('notes').upsert(notes);
  if (error) throw error;
};

// Events
export const getEventsRemote = async (): Promise<ScheduleEvent[]> => {
  if (!supabase) return mockPromise('getEventsRemote');
  const { data, error } = await supabase.from('events').select('*'); 
  if (error) throw error;
  return (data as ScheduleEvent[] || []).map((e: ScheduleEvent) => ({ ...e, date: new Date(e.date) }));
};

export const saveEventsRemote = async (events: ScheduleEvent[]): Promise<void> => {
  if (!supabase) return mockPromise('saveEventsRemote');
  const { error } = await supabase.from('events').upsert(events);
  if (error) throw error;
};

// Simple chat/messages
export const getChatMessagesRemote = async (): Promise<ChatMessage[]> => {
  if (!supabase) return mockPromise('getChatMessagesRemote');
  const { data, error } = await supabase.from('chatMessages').select('*');
  if (error) throw error;
  return (data as ChatMessage[] || []).map((m: ChatMessage) => ({ ...m, timestamp: new Date(m.timestamp) }));
};

export const saveChatMessageRemote = async (message: ChatMessage): Promise<void> => {
  if (!supabase) return mockPromise('saveChatMessageRemote');
  const { error } = await supabase.from('chatMessages').insert(message);
  if (error) throw error;
};

export const savePaymentRemote = async (paymentRecord: any): Promise<void> => {
  if (!supabase) return mockPromise('savePaymentRemote');
  const { error } = await supabase.from('payments').insert(paymentRecord);
  if (error) throw error;
};

export const saveAuditRemote = async (auditRecord: any): Promise<void> => {
  if (!supabase) return mockPromise('saveAuditRemote');
  const { error } = await supabase.from('audit_logs').insert(auditRecord);
  if (error) throw error;
};

export const getAuditLogsRemote = async (): Promise<any[]> => {
  if (!supabase) return mockPromise('getAuditLogsRemote');
  const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
  if (error) throw error;
  return data || [];
};

export default supabase;
