
import React from 'react';

export enum UserRole {
  STUDENT = 'STUDENT',
  MODERATOR = 'MODERATOR',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
}

export enum SubscriptionTier {
    FREE = 'FREE',
    PREMIUM = 'PREMIUM',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  institution: string;
  profilePicture?: string;
  aboutMe?: string;
  subject?: string;
  hobbies?: string;
  bannedUntil?: string; // ISO string for ban expiry date
  isFlaggedForReview?: boolean;
  banReason?: string;
  isPasswordTemporary?: boolean;
  customerId?: string;
}

export interface NavigationItem {
  view: AppView;
  label: string;
  icon: React.ReactNode;
  roles?: UserRole[];
}


export enum AppView {
  DASHBOARD = 'DASHBOARD',
  NOTE_SUMMARIZER = 'NOTE_SUMMARIZER',
  FLASHCARD_GENERATOR = 'FLASHCARD_GENERATOR',
  CONCEPT_EXPLAINER = 'CONCEPT_EXPLAINER',
  POMODORO_TIMER = 'POMODORO_TIMER',
  CITATION_WIZARD = 'CITATION_WIZARD',
  ESSAY_HELPER = 'ESSAY_HELPER',
  COMMUNITY = 'COMMUNITY',
  SCHEDULER = 'SCHEDULER',
  STUDENT_WELLNESS = 'STUDENT_WELLNESS',
  ADMIN_PANEL = 'ADMIN_PANEL',
  STAFF_PANEL = 'STAFF_PANEL',
  CONTACT_STAFF = 'CONTACT_STAFF',
  STUDENT_PROFILE = 'STUDENT_PROFILE',
  FORCE_PASSWORD_CHANGE = 'FORCE_PASSWORD_CHANGE',
  UPGRADE_PAGE = 'UPGRADE_PAGE',
  LEGAL = 'LEGAL',
  SUPPORT = 'SUPPORT',
}

export interface Flashcard {
  question: string;
  answer: string;
}

export type EventType = 'exam' | 'assignment' | 'lecture' | 'other';

export interface CalendarEvent {
  id: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  title: string;
  type: EventType;
}

export interface ForumCategory {
  id: string;
  name: string;
}

export interface ForumComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  categoryId: string;
  comments: ForumComment[];
}

export interface StaffMessage {
    id: string;
    senderId: string;
    senderName: string;
    subject: string;
    body: string;
    createdAt: string;
    isRead: boolean;
    isReplied?: boolean;
}

export enum NotificationType {
    INFO = 'INFO',
    SUCCESS = 'SUCCESS',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
}

export interface Notification {
    id: string;
    userId: string; // The user who receives the notification
    message: string;
    createdAt: string;
    isRead: boolean;
    type: NotificationType;
    linkTo?: AppView;
}

export enum AuditActionType {
    USER_BANNED = 'User Banned',
    USER_FLAGGED = 'User Flagged for Review',
    FLAG_CLEARED = 'Flag Cleared',
    ROLE_CHANGED = 'Role Changed',
    BAN_LIFTED = 'Ban Lifted',
    POST_DELETED = 'Post Deleted',
    MESSAGE_SENT = 'Message Sent to Staff',
    WELLNESS_ITEM_CREATED = 'Wellness Item Created',
    WELLNESS_ITEM_UPDATED = 'Wellness Item Updated',
    WELLNESS_ITEM_DELETED = 'Wellness Item Deleted',
    USER_REPORTED = 'User Reported',
    USER_CREATED = 'User Created',
    USER_PASSWORD_RESET = 'User Password Reset',
    USER_MFA_RESET = 'User MFA Reset',
    USER_DELETED = 'User Deleted',
    LOGIN_HELP_REQUEST = 'Login Help Request',
    PASSWORD_CHANGED = 'Password Changed',
    USER_UPGRADED_TO_PREMIUM = 'User Upgraded to Premium',
    PAYMENT_SUCCESSFUL = 'Payment Successful',
    KB_ARTICLE_CREATED = 'Knowledge Base Article Created',
    KB_ARTICLE_UPDATED = 'Knowledge Base Article Updated',
    KB_ARTICLE_DELETED = 'Knowledge Base Article Deleted',
    CUSTOMER_PROFILE_CREATED = 'Customer Profile Created',
    STAFF_REPLIED_TO_MESSAGE = 'Staff Replied to Message',
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    actorId: string;
    actorName: string;
    actionType: AuditActionType;
    details: string; // e.g., "Banned user John Doe for 1 week."
}

export type WellnessItemType = 'video' | 'audio' | 'article';

export interface WellnessVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
}

export interface MeditationTrack {
  id: string;
  title: string;
  duration: string;
}

export interface WellnessArticle {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
}

export type DailyUsage = {
    [feature: string]: number;
};

export type UsageData = {
    [date: string]: DailyUsage;
};

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  lastUpdatedAt: string;
  authorId: string;
  authorName: string;
}
