import React from 'react';

// --- User & Auth ---
export type UserRole = 'Student' | 'Moderator' | 'Staff' | 'Administrator';

export interface Subscription {
  tier: 'Free' | 'Premium';
  startDate?: Date;
  endDate?: Date;
}

export interface UserData {
  email: string;
  username: string;
  password?: string; // Should be hashed in a real app
  institution: string;
  role: UserRole;
  subscription?: Subscription;
  avatarId: string;
  profilePicture?: string; // URL to a custom uploaded image
}

export interface UserSession {
  email: string;
  role: UserRole;
}

// --- App Navigation ---
export type Section = 'tools' | 'wellness' | 'community' | 'profile' | 'admin' | 'staff' | 'moderator' | 'search';

// --- Tools ---

// Plagiarism Checker
export interface PlagiarismFinding {
  plagiarizedText: string;
  source: string;
  confidence: 'High' | 'Medium' | 'Low';
  status: 'Plagiarized' | 'Referenced';
}

export interface PlagiarismResult {
  summary: string;
  plagiarismScore: number;
  findings: PlagiarismFinding[];
}

// Referencing Wizard
export const ReferencingStyles = ['APA', 'MLA', 'Harvard', 'Chicago', 'Vancouver'] as const;
export type ReferencingStyle = typeof ReferencingStyles[number];

export interface Citation {
    id: string;
    sourceDetails: string;
    formattedCitation: string;
    style: ReferencingStyle;
}

// Flashcard Generator
export interface Flashcard {
  question: string;
  answer: string;
}

// Scheduler
export interface ScheduleEvent {
  id: string;
  title: string;
  date: Date;
  type: 'exam' | 'assignment' | 'lecture' | 'deadline' | 'other';
}

// Pomodoro Timer
export interface PomodoroSession {
  id: string;
  date: Date;
  focusDuration: number;
  breakDuration: number;
  tasks: string[];
}

// FIX: Add Pomodoro goal and progress types to be shared across the application.
export type GoalType = 'daily' | 'weekly' | 'none';

export interface FocusGoal {
    type: GoalType;
    minutes: number;
}

export interface FocusProgress {
    daily: { date: string; minutes: number };
    weekly: { weekStartDate: string; minutes: number };
}

// Note Taker
export interface Note {
  id: string;
  title: string;
  content: string; // HTML content
  lastModified: Date;
}

export interface SharedNote {
    id: string;
    originalNoteId: string;
    sharedByEmail: string;
    sharedToEmail: string;
    sharedAt: Date;
    note: Note; // A snapshot of the note at the time of sharing
}


// --- Wellness ---

// Wellness Tracker
export interface WellnessEntry {
  id: string;
  date: Date;
  mood: 'Happy' | 'Okay' | 'Neutral' | 'Sad' | 'Stressed';
  sleepHours: number;
  stressLevel: 'Low' | 'Medium' | 'High';
}

// Student Tips (used in Wellness & Dashboards)
export interface StudentTip {
    id: string;
    title: string;
    category: 'Time Management' | 'Study Skills' | 'Wellness' | 'Productivity';
    youtubeVideoId: string;
}


// --- Community ---
export interface ChatMessage {
    id: string;
    roomId: string;
    senderEmail: string;
    senderUsername: string;
    senderAvatarId?: string;
    senderProfilePicture?: string;
    text: string;
    timestamp: Date;
    isFlagged?: boolean;
}

export interface DirectMessage {
    id: string;
    senderEmail: string;
    recipientEmail: string;
    text: string;
    timestamp: Date;
    read: boolean;
}

export interface FriendRequest {
    id: string;
    from: string; // email
    to: string; // email
    status: 'pending' | 'accepted' | 'declined';
}


// --- Dashboards & Moderation ---

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    actor: string; // email of the user who performed the action
    action: string;
    details: Record<string, any>;
}

export interface BanRecord {
    userId: string; // email of the banned user
    bannedBy: string; // email of the admin/mod
    reason: string;
    expires: string; // ISO date string
    roleOfBanner: 'Moderator' | 'Staff' | 'Administrator';
}

export interface EscalationRequest {
    id: string;
    subjectUser: string;
    requestedBy: string;
    reason: string;
    fromRole: UserRole;
    toRole: UserRole;
    status: 'pending' | 'approved' | 'rejected';
}


// --- UI & Other ---

export interface Theme {
    id: string;
    name: string;
    className: string;
    isDark: boolean;
}

export interface OnboardingStep {
    title: string;
    content: string;
    targetId: string;
}

export interface Avatar {
    id: string;
    component: React.FC<React.SVGProps<SVGSVGElement>>;
}