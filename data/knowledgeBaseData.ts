
import { KnowledgeBaseArticle } from '../types';

const now = new Date().toISOString();

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
