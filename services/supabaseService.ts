import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Note, UserData, ScheduleEvent, StudentTip, ChatMessage, DirectMessage } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

const supabase: SupabaseClient = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Users
export const getAllUsersRemote = async (): Promise<UserData[]> => {
  // 💡 Fix: Removed <UserData> generic from .select()
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  // Use type assertion to ensure the result matches the desired type
  return (data as UserData[]) || []; 
};

export const getUserRemote = async (email: string): Promise<UserData | null> => {
  const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
  if (error) throw error;
  return (data as UserData) || null; // Use type assertion
};

export const saveUserRemote = async (user: UserData): Promise<void> => {
  const { error } = await supabase.from('users').upsert(user);
  if (error) throw error;
};

// Notes
export const getNotesRemote = async (): Promise<Note[]> => {
  // 💡 Fix: Removed generic types from .from()
  const { data, error } = await supabase.from('notes').select('*'); 
  if (error) throw error;
  // Assert 'n' as Note in the map function to resolve property/constraint errors
  return (data as Note[] || []).map((n: Note) => ({ ...n, lastModified: new Date(n.lastModified) }));
};

export const saveNotesRemote = async (notes: Note[]): Promise<void> => {
  const { error } = await supabase.from('notes').upsert(notes);
  if (error) throw error;
};

// Events
export const getEventsRemote = async (): Promise<ScheduleEvent[]> => {
  // 💡 Fix: Removed <ScheduleEvent> generic from .select()
  const { data, error } = await supabase.from('events').select('*'); 
  if (error) throw error;
  // Assert 'e' as ScheduleEvent in the map function to resolve property/constraint errors
  return (data as ScheduleEvent[] || []).map((e: ScheduleEvent) => ({ ...e, date: new Date(e.date) }));
};

export const saveEventsRemote = async (events: ScheduleEvent[]): Promise<void> => {
  const { error } = await supabase.from('events').upsert(events);
  if (error) throw error;
};

// Simple chat/messages
export const getChatMessagesRemote = async (): Promise<ChatMessage[]> => {
  // 💡 Fix: Removed <ChatMessage> generic from .from()
  const { data, error } = await supabase.from('chatMessages').select('*');
  if (error) throw error;
  // Assert 'm' as ChatMessage in the map function
  return (data as ChatMessage[] || []).map((m: ChatMessage) => ({ ...m, timestamp: new Date(m.timestamp) }));
};

export const saveChatMessageRemote = async (message: ChatMessage): Promise<void> => {
  // 💡 Fix: Removed <ChatMessage> generic from .from()
  const { error } = await supabase.from('chatMessages').insert(message);
  if (error) throw error;
};

export const savePaymentRemote = async (paymentRecord: any): Promise<void> => {
  const { error } = await supabase.from('payments').insert(paymentRecord);
  if (error) throw error;
};

export const saveAuditRemote = async (auditRecord: any): Promise<void> => {
  const { error } = await supabase.from('audit_logs').insert(auditRecord);
  if (error) throw error;
};

export const getAuditLogsRemote = async (): Promise<any[]> => {
  const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
  if (error) throw error;
  return data || [];
};

export default supabase;