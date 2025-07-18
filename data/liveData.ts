
import { 
    User, UserRole, SubscriptionTier, StaffMessage, Notification, NotificationType, AuditLogEntry, AuditActionType, 
    KnowledgeBaseArticle, ForumCategory, ForumPost, CalendarEvent, WellnessVideo, MeditationTrack, WellnessArticle,
    AppView
} from '../types';

const nameToPic = (name: string) => `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`;
const now = new Date().toISOString();

// --- LIVE USERS ---
export const initialUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@studywell.edu', role: UserRole.ADMIN, subscriptionTier: SubscriptionTier.PREMIUM, institution: 'StudyWell University', profilePicture: nameToPic('Admin User'), customerId: 'cus_admin12345' },
  { id: '2', name: 'Moderator User', email: 'moderator@studywell.ac.uk', role: UserRole.MODERATOR, subscriptionTier: SubscriptionTier.PREMIUM, institution: 'College of Digital Studies', profilePicture: nameToPic('Moderator User'), customerId: 'cus_moderator123' },
  { id: '3', name: 'Staff User', email: 'staff@studywell.edu.au', role: UserRole.STAFF, subscriptionTier: SubscriptionTier.FREE, institution: 'StudyWell University', profilePicture: nameToPic('Staff User'), customerId: 'cus_staff12345' },
  { id: '4', name: 'Alice Johnson', email: 'alice.j@studywell.ac.jp', role: UserRole.STUDENT, subscriptionTier: SubscriptionTier.PREMIUM, institution: 'Tokyo Tech', profilePicture: nameToPic('Alice Johnson'), customerId: 'cus_alice123' },
  { id: '5', name: 'Bob Williams', email: 'bob.w@studywell.com', role: UserRole.STUDENT, subscriptionTier: SubscriptionTier.FREE, institution: 'Internet University', profilePicture: nameToPic('Bob Williams'), bannedUntil: new Date(Date.now() + 86400000).toISOString(), banReason: 'Spamming forum with off-topic content.', customerId: 'cus_bob123' },
  { id: '6', name: 'Charlie Brown', email: 'charlie.b@studywell.com', role: UserRole.STUDENT, subscriptionTier: SubscriptionTier.FREE, institution: 'Online Academy', profilePicture: nameToPic('Charlie Brown'), isFlaggedForReview: true, banReason: 'Needs review for repeated minor offenses.', customerId: 'cus_charlie123' },
  { id: '7', name: 'Diana Miller', email: 'diana.m@studywell.edu', role: UserRole.STUDENT, subscriptionTier: SubscriptionTier.FREE, institution: 'State University', profilePicture: nameToPic('Diana Miller'), customerId: 'cus_diana123' },
  { id: '8', name: 'Edward Garcia', email: 'ed.g@studywell.ac.uk', role: UserRole.STUDENT, subscriptionTier: SubscriptionTier.PREMIUM, institution: 'Imperial College', profilePicture: nameToPic('Edward Garcia'), customerId: 'cus_edward123' },
  { id: '9', name: 'Fiona Clark', email: 'f.clark@studywell.edu.au', role: UserRole.STUDENT, subscriptionTier: SubscriptionTier.FREE, institution: 'Melbourne University', profilePicture: nameToPic('Fiona Clark'), customerId: 'cus_fiona123' },
  { id: '10', name: 'George Lewis', email: 'g.lewis@studywell.edu', role: UserRole.STUDENT, subscriptionTier: SubscriptionTier.FREE, institution: 'State University', profilePicture: nameToPic('George Lewis'), customerId: 'cus_george123' },
];

// --- LIVE STAFF MESSAGES ---
export const initialStaffMessages: StaffMessage[] = [
    { id: 'sm1', senderId: '7', senderName: 'Diana Miller', subject: 'Question about Premium', body: 'Hi, I was wondering what the benefits of Premium are. The upgrade page is a little vague.', createdAt: new Date(Date.now() - 80000000).toISOString(), isRead: false, isReplied: false },
    { id: 'sm2', senderId: '9', senderName: 'Fiona Clark', subject: 'Problem with Citation Wizard', body: 'The Chicago style citation for a website seems to be incorrect. Can you check?', createdAt: new Date(Date.now() - 160000000).toISOString(), isRead: true, isReplied: true },
    { id: 'sm3', senderId: '10', senderName: 'George Lewis', subject: 'Login Help Request from George Lewis', body: 'Login Issue Report:\nUser: George Lewis (g.lewis@studywell.edu)\nInstitution: State University\nIssue: I forgot my password and the reset link isn\'t working.', createdAt: new Date(Date.now() - 240000000).toISOString(), isRead: true, isReplied: false },
];

// --- LIVE NOTIFICATIONS ---
export const initialNotifications: Notification[] = [
    { id: 'n1', userId: '1', message: 'New message from Diana Miller: "Question about Premium"', createdAt: new Date(Date.now() - 80000000).toISOString(), isRead: false, type: NotificationType.INFO, linkTo: AppView.STAFF_PANEL },
    { id: 'n2', userId: '4', message: 'Your password has been reset by an administrator.', createdAt: new Date().toISOString(), isRead: false, type: NotificationType.WARNING },
    { id: 'n3', userId: '3', message: 'Charlie Brown has been escalated for review.', createdAt: new Date().toISOString(), isRead: true, type: NotificationType.INFO, linkTo: AppView.STAFF_PANEL },
];

// --- LIVE AUDIT LOG ---
export const initialAuditLog: AuditLogEntry[] = [
    { id: 'al1', timestamp: new Date(Date.now() - 500000).toISOString(), actorId: '1', actorName: 'Admin User', actionType: AuditActionType.ROLE_CHANGED, details: 'Changed Bob Williams\'s role to STUDENT.' },
    { id: 'al2', timestamp: new Date(Date.now() - 80000000).toISOString(), actorId: '7', actorName: 'Diana Miller', actionType: AuditActionType.MESSAGE_SENT, details: 'Sent message with subject: "Question about Premium"' },
    { id: 'al3', timestamp: new Date(Date.now() - 170000000).toISOString(), actorId: '3', actorName: 'Staff User', actionType: AuditActionType.STAFF_REPLIED_TO_MESSAGE, details: 'Replied to message from Fiona Clark (Subject: "Problem with Citation Wizard")' },
    { id: 'al4', timestamp: new Date(Date.now() - 250000000).toISOString(), actorId: '2', actorName: 'Moderator User', actionType: AuditActionType.USER_BANNED, details: 'Set ban duration for Bob Williams to 1 Day. Reason: Spamming' },
];

// --- LIVE KB ARTICLES ---
export const initialKnowledgeBaseArticles: KnowledgeBaseArticle[] = [
  {
    id: 'kb1',
    title: 'How to Sign Up and Log In',
    content: 'To sign up, click the "Sign Up" button on the login page and fill in your details using a valid academic email (.edu, .ac.uk, etc.). If you already have an account, simply enter your email and password to log in. If you have trouble logging in, use the "Forgot your password?" link for assistance.',
    category: 'Getting Started',
    createdAt: now,
    lastUpdatedAt: now,
    authorId: '1',
    authorName: 'Admin User',
  },
  {
    id: 'kb12',
    title: 'What is Sandbox Mode?',
    content: "Sandbox Mode provides a read-only demonstration of StudyWell with a full set of sample data, including premium features and administrative views. When Sandbox Mode is active, any changes you make (like creating events or saving citations) are temporary and will not be saved. This allows you to explore the app's full capabilities without affecting your own data. To create or save your own work, please turn off Sandbox Mode from the toggle in the sidebar.",
    category: 'Getting Started',
    createdAt: now,
    lastUpdatedAt: now,
    authorId: '1',
    authorName: 'Admin User',
  },
  {
    id: 'kb15',
    title: 'What is the AI Study Coach?',
    content: "The AI Study Coach is your personal AI assistant, available via the floating lightbulb button in the bottom-right corner. Click it to open a chat window where you can ask for study advice, tips on using StudyWell's tools, or general guidance. You can either select a suggested prompt or type your own question to get helpful, encouraging tips to support your learning journey.",
    category: 'Getting Started',
    createdAt: now,
    lastUpdatedAt: now,
    authorId: '1',
    authorName: 'Admin User',
  },
  {
    id: 'kb2',
    title: 'Using the Note Summarizer',
    content: 'Navigate to the "Summarizer" from the dashboard. Paste your text into the large text area and click "Summarize". The AI will generate a concise summary of the key points. Free users have a daily limit on summaries.',
    category: 'Student Tools',
    createdAt: now,
    lastUpdatedAt: now,
    authorId: '1',
    authorName: 'Admin User',
  },
  {
    id: 'kb3',
    title: 'Generating Flashcards',
    content: 'Go to the "Flashcards" tool. Enter a topic, concept, or subject into the input field and click "Generate". A set of flashcards will be created for you. Click on a card to flip it and see the answer. You can navigate through the cards using the "Previous" and "Next" buttons.',
    category: 'Student Tools',
    createdAt: now,
    lastUpdatedAt: now,
    authorId: '1',
    authorName: 'Admin User',
  },
    {
    id: 'kb7',
    title: 'How to Use the Concept Explainer',
    content: 'Stuck on a difficult topic? Navigate to the "Explainer" tool. Enter the concept you\'re struggling with (e.g., "Quantum Entanglement", "Supply and Demand") and click "Explain". Our AI will provide a simple, easy-to-understand explanation, often using analogies to make it clearer. It\'s perfect for breaking down complex ideas into manageable pieces.',
    category: 'Student Tools',
    createdAt: now,
    lastUpdatedAt: now,
    authorId: '1',
    authorName: 'Admin User',
  },
  {
    id: 'kb8',
    title: 'Mastering the Essay Helper',
    content: `The Essay Helper is a powerful suite of tools to assist your writing process from start to finish. It includes:
- **Thesis Generator**: Enter your essay topic, and the AI will suggest several strong, arguable thesis statements.
- **Outline Creator**: Provide your topic and thesis statement to generate a structured essay outline, complete with an introduction, body paragraphs, and a conclusion.
- **Content Expander**: Take a single sentence or point from your outline and have the AI expand it into a full, well-developed paragraph.
- **Proofreader**: Paste your completed text to check for grammar, spelling, and punctuation errors. It also provides stylistic suggestions to improve clarity and flow.`,
    category: 'Student Tools',
    createdAt: now,
    lastUpdatedAt: now,
    authorId: '1',
    authorName: 'Admin User',
  },
   {
    id: 'kb13',
    title: 'How do I use the Plagiarism Checker?',
    content: 'The Plagiarism Checker is a tool within the Essay Helper. To use it, navigate to Essay Helper and select the "Plagiarism Checker" tab. Paste your text into the input box and click "Generate". The tool uses Google Search to compare your text against public web sources. The results will show an analysis of potential matches and a list of the source URLs that were found, which you can click to review.',
    category: 'Student Tools',
    createdAt: now,
    lastUpdatedAt: now,
    authorId: '1',
    authorName: 'Admin User',
  },
  {
    id: 'kb9',
    title: 'Generating Citations with the Citation Wizard',
    content: 'Properly citing sources is easy with the Citation Wizard. First, select your required citation style (e.g., APA, MLA). Next, choose your source type (e.g., book, journal article, website). Fill in the relevant details in the form provided and click "Generate". You can then copy the citation or save it to your list for later. Free users can save up to 10 citations.',
    category: 'Student Tools',
    createdAt: now,
    lastUpdatedAt: now,
    authorId: '1',
    authorName: 'Admin User',
  },
  {
    id: 'kb10',
    title: 'Organizing Your Time with the Scheduler',
    content: 'The Scheduler is your personal academic calendar. Click on any day to see a detailed agenda for that date. To add a new event, click the "Add New Event" button, fill in the details (title, date, time, and type), and save. You can create events for exams, assignments, lectures, and more. Events can be deleted directly from the agenda view.',
    category: 'Student Tools',
    createdAt: now,
    lastUpdatedAt: now,
    authorId: '1',
    authorName: 'Admin User',
  },
  {
    id: 'kb11',
    title: 'Boosting Focus with the Pomodoro Timer',
    content: 'The Pomodoro Timer helps you work in focused bursts. It operates on the principle of working for a set period (e.g., 25 minutes) and then taking a short break. After several work sessions, you take a longer break. You can switch between "Work", "Short Break", and "Long Break" modes. The timer will automatically switch to the next mode when one is complete. You can customize the duration of each session in the settings.',
    category: 'Student Tools',
    createdAt: now,
    lastUpdatedAt: now,
    authorId: '1',
    authorName: 'Admin User',
  },
  {
    id: 'kb4',
    title: 'Community Guidelines',
    content: 'Our community is a place for respectful collaboration. Prohibited actions include spamming, posting inappropriate content, harassment, and academic dishonesty. Violations may result in a temporary or permanent ban. Please report any user who violates these guidelines.',
    category: 'Community',
    createdAt: now,
    lastUpdatedAt: now,
    authorId: '1',
    authorName: 'Admin User',
  },
   {
    id: 'kb14',
    title: 'How do Video Chat Rooms work?',
    content: 'The Video Chat Rooms, found under the "Community" section, allow you to join virtual study sessions with other students. Simply choose a room from the list to join. You will need to grant permission for your browser to use your camera and microphone. Once inside, you can see other participants, mute your microphone, or turn off your camera using the controls at the bottom. There is also an integrated chat box to send text messages to the group.',
    category: 'Community',
    createdAt: now,
    lastUpdatedAt: now,
    authorId: '1',
    authorName: 'Admin User',
  },
  {
    id: 'kb5',
    title: 'Upgrading to Premium',
    content: 'To get unlimited access to all features, you can upgrade to a Premium subscription. Click the "Go Premium" button in the sidebar to open the payment page. All payments are securely handled by Stripe.',
    category: 'Account',
    createdAt: now,
    lastUpdatedAt: now,
    authorId: '1',
    authorName: 'Admin User',
  },
  {
    id: 'kb6',
    title: 'User Roles and Rules',
    content: `Understanding the roles and responsibilities on StudyWell helps maintain a safe and productive environment. Each role has specific capabilities and expectations.

**Student**
Students are the core of our community. Their rules are focused on maintaining a positive and respectful learning environment.
- Be respectful in all interactions.
- Do not share personal or confidential information.
- Uphold academic integrity; no plagiarism or cheating.
- Report any violations of community guidelines to help keep the platform safe.

**Moderator**
Moderators are trusted community members who help enforce guidelines.
- Actively monitor the community forums for guideline violations.
- Review user reports and flagged content in a timely manner.
- Authorized to issue temporary bans (up to 1 week) for minor offenses.
- Must escalate complex or severe cases to the Staff team.
- Cannot permanently ban, delete users, or change user roles.

**Staff**
Staff members are official StudyWell employees responsible for higher-level support and content management.
- Address escalated cases from Moderators.
- Manage and curate content in the Wellness and Knowledge Base sections.
- Authorized to issue longer-term bans (up to 1 year).
- Can assist users with password and MFA resets.
- Can promote users to the Moderator role.
- Report critical system issues to an Administrator.

**Admin**
Admins have complete oversight and technical control of the platform.
- Has full control over the platform, including all user accounts.
- Manages all users, including creating, deleting, and assigning any role.
- Holds the authority to issue permanent bans for severe violations.
- Can manage all content across the entire platform.
- Responsible for the final say in all moderation disputes and platform policies.`,
    category: 'Community',
    createdAt: now,
    lastUpdatedAt: now,
    authorId: '1',
    authorName: 'Admin User',
  },
   {
    id: 'kb16',
    title: "How do I reset a user's password? (For Staff/Admin)",
    content: "Staff and Admins can reset a user's password from the User Management panel. Find the user in the list and click the \"Reset Pass\" button. A confirmation modal will appear. After confirming, the user's password will be marked as temporary. On their next login, they will be required to set a new password. The user will also receive a notification about this action.",
    category: 'Staff & Admin',
    createdAt: now,
    lastUpdatedAt: now,
    authorId: '1',
    authorName: 'Admin User',
  },
];


// --- LIVE FORUM ---
export const initialForumCategories: ForumCategory[] = [
    { id: '1', name: 'General Discussion' }, { id: '2', name: 'Computer Science' }, { id: '3', name: 'Biology' },
    { id: '4', name: 'Literature' }, { id: '5', name: 'Study Groups' }, { id: '6', name: 'Physics' },
];

export const initialForumPosts: ForumPost[] = [
    { id: '101', categoryId: '2', title: 'Help with sorting algorithms?', author: 'Alice Johnson', createdAt: new Date(Date.now() - 86400000).toISOString(), content: 'I\'m struggling to understand the difference between Merge Sort and Quick Sort. Can anyone explain it in simple terms?', comments: [] },
    { id: '102', categoryId: '4', title: 'Favorite modernist author?', author: 'Bob Williams', createdAt: new Date(Date.now() - 172800000).toISOString(), content: 'Just finished "The Waste Land" and my mind is blown. Who are your favorite authors from the modernist period?', comments: [] },
    { id: '103', categoryId: '1', title: 'Anyone else using this app?', author: 'Charlie Brown', createdAt: new Date(Date.now() - 272800000).toISOString(), content: 'This StudyWell app is pretty cool! What\'s your favorite feature?', comments: [] },
    { id: '104', categoryId: '3', title: 'Krebs Cycle resources?', author: 'Diana Miller', createdAt: new Date(Date.now() - 300000000).toISOString(), content: 'Looking for good videos or diagrams explaining the Krebs cycle. Any recommendations?', comments: [] },
];

// --- LIVE SCHEDULER EVENTS ---
export const initialSchedulerEvents: CalendarEvent[] = [
    { id: 1, date: new Date().toISOString().split('T')[0], time: '10:00', title: 'Biology Midterm', type: 'exam' },
    { id: 2, date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], time: '23:59', title: 'CompSci Project Due', type: 'assignment' },
    { id: 3, date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], time: '14:00', title: 'Physics Lecture', type: 'lecture' },
];

// --- LIVE WELLNESS CONTENT ---
export const initialWellnessVideos: WellnessVideo[] = [
  { id: 'v1', title: '10-Minute Morning Yoga', description: 'A gentle yoga flow to wake up your body and mind.', thumbnailUrl: 'https://placehold.co/600x400/a3e635/4d7c0f?text=Yoga' },
  { id: 'v2', title: 'Stress & Anxiety Relief Meditation', description: 'A guided meditation to help you find calm and release tension.', thumbnailUrl: 'https://placehold.co/600x400/93c5fd/1e40af?text=Meditation' },
];
export const initialMeditationTracks: MeditationTrack[] = [
  { id: 'm1', title: 'Mindful Breathing', duration: '5:00' },
  { id: 'm2', title: 'Body Scan for Relaxation', duration: '10:00' },
];
export const initialWellnessArticles: WellnessArticle[] = [
  { id: 'a1', title: 'The Importance of a Balanced Diet for Academic Success', description: 'Discover how the food you eat can directly impact your focus, memory, and overall cognitive function.', source: 'University Health News', url: '#' },
  { id: 'a2', title: 'Managing Exam Stress: 7 Proven Techniques', description: 'Learn practical strategies to reduce anxiety and perform your best during exam season.', source: 'Student Minds Hub', url: '#' },
];
