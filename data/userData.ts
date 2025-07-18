


import { User, UserRole, SubscriptionTier } from '../types';

const nameToPic = (name: string) => `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`;

export const initialUsers: User[] = [
  { 
    id: '1', name: 'Admin User', email: 'admin@studywell.edu', role: UserRole.ADMIN, 
    subscriptionTier: SubscriptionTier.PREMIUM,
    institution: 'StudyWell University', profilePicture: nameToPic('Admin User'),
    aboutMe: 'Overseeing the StudyWell platform and ensuring a great user experience for all students and staff.',
    subject: 'Platform Administration', hobbies: 'Reading, Hiking, Chess',
    customerId: 'cus_admin12345'
  },
  { 
    id: '2', name: 'Moderator User', email: 'moderator@studywell.ac.uk', role: UserRole.MODERATOR,
    subscriptionTier: SubscriptionTier.PREMIUM,
    institution: 'College of Digital Studies', profilePicture: nameToPic('Moderator User'),
    aboutMe: 'Keeping the community forums clean and helpful. Feel free to reach out with any questions about our guidelines!',
    subject: 'Digital Communications', hobbies: 'Community Management, Online Gaming',
    customerId: 'cus_moderator123'
  },
  { 
    id: '3', name: 'Staff User', email: 'staff@studywell.edu.au', role: UserRole.STAFF,
    subscriptionTier: SubscriptionTier.FREE,
    institution: 'StudyWell University', profilePicture: nameToPic('Staff User'),
    aboutMe: 'Here to help with any escalated issues and manage wellness content. Dedicated to student success.',
    subject: 'Student Affairs', hobbies: 'Yoga, Content Creation, Psychology',
    customerId: 'cus_staff12345'
  },
  { 
    id: '4', name: 'Student User', email: 'student@studywell.ac.jp', role: UserRole.STUDENT,
    subscriptionTier: SubscriptionTier.FREE,
    institution: 'Tokyo Tech', profilePicture: nameToPic('Student User'),
    aboutMe: 'Just a student trying to get through midterms. Love using the flashcard generator!',
    subject: 'Computer Science', hobbies: 'Coding, Anime, Photography',
    customerId: 'cus_student12345'
  },
  { 
    id: '5', name: 'Banned User', email: 'banned@studywell.com', role: UserRole.STUDENT,
    subscriptionTier: SubscriptionTier.FREE,
    institution: 'Internet University', profilePicture: nameToPic('Banned User'),
    bannedUntil: new Date(Date.now() + 86400000).toISOString(), banReason: 'Spamming forum with off-topic content.',
    customerId: 'cus_banned12345'
  },
  { 
    id: '6', name: 'Flagged User', email: 'flagged@studywell.com', role: UserRole.STUDENT,
    subscriptionTier: SubscriptionTier.FREE,
    institution: 'Online Academy', profilePicture: nameToPic('Flagged User'),
    isFlaggedForReview: true, banReason: 'Needs review for repeated minor offenses.',
    customerId: 'cus_flagged12345'
  },
];