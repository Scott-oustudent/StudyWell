// FIX: Import FocusGoal and FocusProgress from types.ts
import { Note, UserData, ScheduleEvent, PomodoroSession, StudentTip, ChatMessage, DirectMessage, FriendRequest, BanRecord, EscalationRequest, SharedNote, FocusGoal, FocusProgress } from '../types';
import * as supabaseService from './supabaseService';
import * as audit from './auditService';

const ENABLE_SUPABASE = import.meta.env.VITE_ENABLE_SUPABASE === 'true';

const initialStudentTipsData: StudentTip[] = [
    { id: '1', title: 'The Pomodoro Technique', category: 'Time Management', youtubeVideoId: 'H0k0c5up5vI' },
    { id: '2', title: 'Active Recall', category: 'Study Skills', youtubeVideoId: 'ukLnPbIffxE' },
    { id: '3', title: 'How to Beat Procrastination', category: 'Productivity', youtubeVideoId: 'Qvcx7-2X9Jc' },
    { id: '4', title: 'Managing Student Stress', category: 'Wellness', youtubeVideoId: 'I9A5KBe_hns' },
];


// --- Generic LocalStorage Handler ---
const getItem = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const setItem = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};

// --- Users ---
export const getAllUsers = (): UserData[] => getItem('users', []);
export const getUser = (email: string): UserData | null => {
    if ((import.meta.env.VITE_ENABLE_SUPABASE as any) === 'true') {
        // runtime: callers should use getUserRemote when using Supabase; keep local fallback for now
        console.warn('Supabase enabled - prefer using async supabaseService.getUserRemote in new code. Falling back to local read for sync API.');
    }
    return getAllUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

export const saveUser = (user: UserData): void => {
    if ((import.meta.env.VITE_ENABLE_SUPABASE as any) === 'true') {
        // Fire-and-forget remote save; we keep local copy as well
        supabaseService.saveUserRemote(user).catch(err => console.error('Supabase saveUser error', err));
    }
    const users = getAllUsers();
    const index = users.findIndex(u => u.email === user.email);
    if (index > -1) {
        users[index] = user;
    } else {
        users.push(user);
    }
    setItem('users', users);
    try { audit.logAudit('user.save', user.email, { user }); } catch (e) { console.error(e); }
};

export const deleteUser = (email: string): void => {
    let users = getAllUsers();
    users = users.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    setItem('users', users);
    try { audit.logAudit('user.delete', null, { email }); } catch (e) { console.error(e); }
};


// --- Onboarding ---
export const getOnboardingStatus = (): boolean => getItem('onboardingComplete', false);
export const setOnboardingStatus = (status: boolean): void => setItem('onboardingComplete', status);

// --- Notes ---
export const getNotes = (): Note[] => getItem<Note[]>('notes', []).map(n => ({...n, lastModified: new Date(n.lastModified)}));
export const saveNotes = (notes: Note[]): void => {
    if ((import.meta.env.VITE_ENABLE_SUPABASE as any) === 'true') {
        supabaseService.saveNotesRemote(notes).catch(err => console.error('Supabase saveNotes error', err));
    }
    setItem('notes', notes);
    try { audit.logAudit('notes.save', null, { count: notes.length }); } catch (e) { console.error(e); }
};

export const savePayment = (payment: any): void => {
    try {
        const payments = getItem<any[]>('payments', []);
        payments.push(payment);
        setItem('payments', payments);
    } catch (err) {
        console.error('Failed to save local payment', err);
    }
    if ((import.meta.env.VITE_ENABLE_SUPABASE as any) === 'true') {
        supabaseService.savePaymentRemote(payment).catch(err => console.error('Supabase savePayment error', err));
    }
    try { audit.logAudit('payment.save', payment.user_email || payment.userEmail || null, { payment }); } catch (e) { console.error(e); }
};
export const getSharedNotes = (): SharedNote[] => getItem<SharedNote[]>('sharedNotes', []).map(n => ({...n, sharedAt: new Date(n.sharedAt), note: {...n.note, lastModified: new Date(n.note.lastModified)}}));
export const shareNote = (note: SharedNote): void => {
    const notes = getSharedNotes();
    setItem('sharedNotes', [...notes, note]);
    try { audit.logAudit('note.shared', note.sharedByEmail || null, { note }); } catch (e) { console.error(e); }
};

// --- Scheduler ---
export const getEvents = (): ScheduleEvent[] => getItem<ScheduleEvent[]>('scheduleEvents', []).map(e => ({...e, date: new Date(e.date)}));
export const saveEvents = (events: ScheduleEvent[]): void => setItem('scheduleEvents', events);

// --- Pomodoro ---
export const getPomodoroSessions = (): PomodoroSession[] => getItem<PomodoroSession[]>('pomodoroHistory', []).map(s => ({...s, date: new Date(s.date)}));
export const savePomodoroSessions = (sessions: PomodoroSession[]): void => setItem('pomodoroHistory', sessions);
export const getPomodoroGoal = (defaultGoal: FocusGoal): FocusGoal => getItem('pomodoroGoal', defaultGoal);
export const savePomodoroGoal = (goal: FocusGoal): void => setItem('pomodoroGoal', goal);
export const getPomodoroProgress = (defaultProgress: FocusProgress): FocusProgress => getItem('pomodoroProgress', defaultProgress);
export const savePomodoroProgress = (progress: FocusProgress): void => setItem('pomodoroProgress', progress);


// --- Student Tips ---
export const getStudentTips = (): StudentTip[] => getItem('studentTips', initialStudentTipsData);
export const saveStudentTips = (tips: StudentTip[]): void => setItem('studentTips', tips);

// --- Community ---
export const getChatMessages = (): ChatMessage[] => getItem<ChatMessage[]>('chatMessages', []).map(m => ({...m, timestamp: new Date(m.timestamp)}));
export const saveChatMessages = (messages: ChatMessage[]): void => setItem('chatMessages', messages);
export const getDirectMessages = (): DirectMessage[] => getItem<DirectMessage[]>('directMessages', []).map(m => ({...m, timestamp: new Date(m.timestamp)}));
export const saveDirectMessage = (message: DirectMessage): void => {
    const dms = getDirectMessages();
    setItem('directMessages', [...dms, message]);
};
export const getFriends = (userEmail: string): string[] => getItem<Record<string, string[]>>('friends', {})[userEmail] || [];
export const saveFriends = (userEmail: string, friendEmails: string[]): void => {
    const allFriends = getItem<Record<string, string[]>>('friends', {});
    allFriends[userEmail] = friendEmails;
    setItem('friends', allFriends);
};
export const getFriendRequests = (): FriendRequest[] => getItem('friendRequests', []);
export const saveFriendRequests = (requests: FriendRequest[]): void => setItem('friendRequests', requests);

// --- Moderation ---
export const getBanRecords = (): BanRecord[] => getItem('banRecords', []);
export const saveBanRecords = (records: BanRecord[]): void => setItem('banRecords', records);
export const getEscalationRequests = (): EscalationRequest[] => getItem('escalationRequests', []);
export const saveEscalationRequests = (requests: EscalationRequest[]): void => setItem('escalationRequests', requests);

// --- Global Search ---
export const searchAll = (query: string): { notes: Note[], events: ScheduleEvent[] } => {
    const lowerQuery = query.toLowerCase();
    const notes = getNotes().filter(n => n.title.toLowerCase().includes(lowerQuery) || n.content.toLowerCase().includes(lowerQuery));
    const events = getEvents().filter(e => e.title.toLowerCase().includes(lowerQuery));
    return { notes, events };
};