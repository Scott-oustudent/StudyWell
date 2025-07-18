
import React, { useState, useEffect, useCallback } from 'react';
import { AppView, User, UserRole, StaffMessage, Notification, AuditLogEntry, AuditActionType, NotificationType, KnowledgeBaseArticle, ForumCategory, ForumPost, CalendarEvent, WellnessVideo, MeditationTrack, WellnessArticle, SavedCitation, UsageData } from './types';
import Sidebar from './componants/Sidebar';
import NoteSummarizer from './componants/NoteSummarizer';
import { FlashcardGenerator } from './componants/FlashcardGenerator';
import ConceptExplainer from './componants/ConceptExplainer';
import AuthPage from './componants/AuthPage';
import Spinner from './componants/common/Spinner';
import PomodoroTimer from './componants/PomodoroTimer';
import StudentLoanCalculator from './componants/StudentLoanCalculator';
import CitationWizard from './componants/CitationWizard';
import EssayHelper from './componants/EssayHelper';
import Dashboard from './componants/Dashboard';
import Scheduler from './componants/Scheduler';
import StudentCommunity from './componants/StudentCommunity';
import StudentWellness from './componants/StudentWellness';
import AdminPanel from './componants/AdminPanel';
import StaffPanel from './componants/StaffPanel';
import ContactStaff from './componants/ContactStaff';
import StudentProfile from './componants/StudentProfile';
import ForcePasswordChange from './componants/ForcePasswordChange';
import UpgradePage from './componants/UpgradePage';
import LegalPage from './componants/LegalPage';
import SupportPage from './componants/SupportPage';
import AIHelper from './componants/common/AIHelper';
import Card from './componants/common/Card';

interface AppProps {
  isSandboxMode: boolean;
  toggleSandboxMode: () => void;
}

// Helper to make API calls
const apiCall = async (endpoint: string, method: string = 'GET', body: any = null) => {
    const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(endpoint, options);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API call to ${endpoint} failed: ${errorText}`);
    }
    return response.json();
};

const App: React.FC<AppProps> = ({ isSandboxMode, toggleSandboxMode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialUserLoaded, setInitialUserLoaded] = useState(false);

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [staffMessages, setStaffMessages] = useState<StaffMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [knowledgeBaseArticles, setKnowledgeBaseArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [forumCategories, setForumCategories] = useState<ForumCategory[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [schedulerEvents, setSchedulerEvents] = useState<CalendarEvent[]>([]);
  const [wellnessVideos, setWellnessVideos] = useState<WellnessVideo[]>([]);
  const [meditationTracks, setMeditationTracks] = useState<MeditationTrack[]>([]);
  const [wellnessArticles, setWellnessArticles] = useState<WellnessArticle[]>([]);
  const [savedCitations, setSavedCitations] = useState<SavedCitation[]>([]);

  // Fetches all data needed to bootstrap the app
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setInitialUserLoaded(false);
    try {
        const data = await apiCall(`/api/data?sandbox=${isSandboxMode}`);
        setUsers(data.users);
        setStaffMessages(data.staffMessages);
        setNotifications(data.notifications);
        setAuditLog(data.auditLog);
        setKnowledgeBaseArticles(data.knowledgeBaseArticles);
        setForumCategories(data.forumCategories);
        setForumPosts(data.forumPosts);
        setSchedulerEvents(data.schedulerEvents);
        setWellnessVideos(data.wellnessVideos);
        setMeditationTracks(data.meditationTracks);
        setWellnessArticles(data.wellnessArticles);
        setSavedCitations(data.savedCitations || []);

        // This logic must run after users state is set
        let userToSet: User | null = null;
        if (isSandboxMode) {
          userToSet = data.users.find((u: User) => u.role === UserRole.ADMIN) || null;
          if (userToSet) localStorage.setItem('currentUser', JSON.stringify(userToSet));
        } else {
            const storedUserJson = localStorage.getItem('currentUser');
            if (storedUserJson) {
                const storedUser = JSON.parse(storedUserJson);
                userToSet = data.users.find((u: User) => u.id === storedUser.id) || null;
            }
        }
        setCurrentUser(userToSet);
    } catch (error) {
        console.error("Failed to load initial data:", error);
    } finally {
        setInitialUserLoaded(true);
        setIsLoading(false);
    }
  }, [isSandboxMode]);
  
  useEffect(() => {
    loadInitialData();
  }, [isSandboxMode, loadInitialData]);

  // Generic state updater functions that also call the backend
  const createApiUpdateFunction = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, endpoint: string) => {
      return useCallback(async (action: React.SetStateAction<T[]>) => {
          const newItems = typeof action === 'function' ? action(await apiCall(endpoint)) : action;
          try {
              const updatedData = await apiCall(endpoint, 'PUT', { data: newItems });
              setter(updatedData);
          } catch (error) {
              console.error(`Failed to update ${endpoint}:`, error);
          }
      }, [setter, endpoint]);
  };

  const handleSetUsers = createApiUpdateFunction(setUsers, '/api/users');
  const handleSetStaffMessages = createApiUpdateFunction(setStaffMessages, '/api/staff-messages');
  const handleSetNotifications = createApiUpdateFunction(setNotifications, '/api/notifications');
  const handleSetSchedulerEvents = createApiUpdateFunction(setSchedulerEvents, '/api/scheduler-events');
  const handleSetSavedCitations = createApiUpdateFunction(setSavedCitations, '/api/saved-citations');
  const handleSetForumPosts = createApiUpdateFunction(setForumPosts, '/api/forum-posts');
  const handleSetForumCategories = createApiUpdateFunction(setForumCategories, '/api/forum-categories');

  const wellnessSetters = {
    setVideos: createApiUpdateFunction(setWellnessVideos, '/api/wellness/videos'),
    setTracks: createApiUpdateFunction(setMeditationTracks, '/api/wellness/tracks'),
    setArticles: createApiUpdateFunction(setWellnessArticles, '/api/wellness/articles'),
  };

  const logAuditAction = useCallback(async (actorId: string, actorName: string, actionType: AuditActionType, details: string) => {
      const updatedLog = await apiCall('/api/audit-log', 'POST', { actorId, actorName, actionType, details });
      setAuditLog(updatedLog);
  }, []);
  
  const createNotification = useCallback(async (userId: string, message: string, type: NotificationType = NotificationType.INFO, linkTo?: AppView) => {
    const updatedNotifications = await apiCall('/api/notifications', 'POST', { userId, message, type, linkTo });
    setNotifications(updatedNotifications);
  }, []);

  const addStaffMessage = useCallback(async (message: Omit<StaffMessage, 'id' | 'createdAt'>) => {
     const { updatedMessages, updatedLog, updatedNotifications } = await apiCall('/api/staff-messages', 'POST', { message });
     setStaffMessages(updatedMessages);
     setAuditLog(updatedLog);
     setNotifications(updatedNotifications);
  }, []);
  
  const handleSendReply = useCallback(async (messageId: string, replyBody: string) => {
    if (!currentUser) return;
    const { updatedMessages, updatedLog, updatedNotifications } = await apiCall(`/api/staff-messages/${messageId}/reply`, 'POST', { replyBody, actor: currentUser });
    setStaffMessages(updatedMessages);
    setAuditLog(updatedLog);
    setNotifications(updatedNotifications);
  }, [currentUser]);

  const handleLoginHelpRequest = useCallback(async (name: string, email: string, institution: string, issue: string) => {
      const { updatedMessages, updatedLog, updatedNotifications } = await apiCall('/api/login-help', 'POST', { name, email, institution, issue });
      setStaffMessages(updatedMessages);
      setAuditLog(updatedLog);
      setNotifications(updatedNotifications);
  }, []);
  
  const manageKbArticle = useCallback(async (articleData: Omit<KnowledgeBaseArticle, 'id'> & { id?: string }, action: 'save' | 'delete') => {
    if (!currentUser) return;
    const { updatedArticles, updatedLog } = await apiCall('/api/kb', 'POST', { articleData, action, actor: currentUser });
    setKnowledgeBaseArticles(updatedArticles);
    setAuditLog(updatedLog);
  }, [currentUser]);
  
  const handleLogout = useCallback(async () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setActiveView(AppView.DASHBOARD);
  }, []);
  
  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    if (!isSandboxMode) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    if (user.isPasswordTemporary) {
      setActiveView(AppView.FORCE_PASSWORD_CHANGE);
    } else {
      setActiveView(AppView.DASHBOARD);
    }
  };

  const navigateTo = (view: AppView) => {
    setActiveView(view);
  };
  
  // This effect ensures if the user data is updated elsewhere (e.g. by an admin), the local currentUser state reflects it.
  useEffect(() => {
    if (initialUserLoaded && currentUser) {
      const freshUser = users.find(u => u.id === currentUser.id);
      if (freshUser && JSON.stringify(freshUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(freshUser);
        if (!isSandboxMode) {
           localStorage.setItem('currentUser', JSON.stringify(freshUser));
        }
      } else if (!freshUser && !isSandboxMode) { // User was deleted
        handleLogout();
      }
    }
  }, [users, currentUser, isSandboxMode, handleLogout, initialUserLoaded]);


  const renderActiveView = () => {
    if (!currentUser) return null;
    
    const banExpiry = currentUser!.bannedUntil ? new Date(currentUser!.bannedUntil) : null;
    const isBannedFromCommunity = !!banExpiry && banExpiry > new Date();

    if (activeView === AppView.COMMUNITY && isBannedFromCommunity) {
      return (
        <div className="p-8 flex items-center justify-center h-full">
          <Card className="p-8 text-center max-w-lg">
            <h1 className="text-3xl font-bold text-red-600">Access Restricted</h1>
            <p className="text-lg text-gray-700 mt-4">You have been temporarily banned from the community.</p>
            {currentUser!.banReason && <p className="text-gray-600 mt-2"><strong>Reason:</strong> {currentUser!.banReason}</p>}
            <p className="text-gray-600 mt-2">Your access will be restored on:</p>
            <p className="font-semibold text-xl text-gray-800 mt-1">{banExpiry.toLocaleString()}</p>
          </Card>
        </div>
      );
    }

    const commonProps = { currentUser: currentUser!, users, setUsers: handleSetUsers, logAuditAction, createNotification, isSandboxMode };
    switch (activeView) {
      case AppView.DASHBOARD:
        return <Dashboard navigateTo={navigateTo} />;
      case AppView.NOTE_SUMMARIZER:
        return <NoteSummarizer {...commonProps} navigateTo={navigateTo} />;
      case AppView.FLASHCARD_GENERATOR:
        return <FlashcardGenerator {...commonProps} navigateTo={navigateTo} />;
      case AppView.CONCEPT_EXPLAINER:
        return <ConceptExplainer {...commonProps} navigateTo={navigateTo} />;
      case AppView.SCHEDULER:
        return <Scheduler isSandboxMode={isSandboxMode} events={schedulerEvents} setEvents={handleSetSchedulerEvents} />;
      case AppView.STUDENT_LOAN_CALCULATOR:
        return <StudentLoanCalculator />;
      case AppView.POMODORO_TIMER:
        return <PomodoroTimer />;
      case AppView.CITATION_WIZARD:
        return <CitationWizard {...commonProps} savedCitations={savedCitations} setSavedCitations={handleSetSavedCitations} navigateTo={navigateTo} />;
      case AppView.ESSAY_HELPER:
        return <EssayHelper {...commonProps} navigateTo={navigateTo} />;
      case AppView.COMMUNITY:
        return <StudentCommunity {...commonProps} forumPosts={forumPosts} setForumPosts={handleSetForumPosts} forumCategories={forumCategories} setForumCategories={handleSetForumCategories} />;
      case AppView.STUDENT_WELLNESS:
        return <StudentWellness {...commonProps} wellness={{ videos: wellnessVideos, tracks: meditationTracks, articles: wellnessArticles }} setWellness={wellnessSetters} />;
      case AppView.CONTACT_STAFF:
        return <ContactStaff currentUser={currentUser!} addStaffMessage={addStaffMessage} isSandboxMode={isSandboxMode} />;
      case AppView.STUDENT_PROFILE:
        return <StudentProfile currentUser={currentUser!} setUsers={handleSetUsers} isSandboxMode={isSandboxMode} />;
      case AppView.STAFF_PANEL:
        return [UserRole.STAFF, UserRole.ADMIN].includes(currentUser?.role!)
          ? <StaffPanel {...commonProps} staffMessages={staffMessages} setStaffMessages={handleSetStaffMessages} auditLog={auditLog} knowledgeBaseArticles={knowledgeBaseArticles} manageKbArticle={manageKbArticle} handleSendReply={handleSendReply} wellness={{ videos: wellnessVideos, tracks: meditationTracks, articles: wellnessArticles }} setWellness={wellnessSetters} />
          : <Dashboard navigateTo={navigateTo} />;
      case AppView.ADMIN_PANEL:
        return currentUser?.role === UserRole.ADMIN
          ? <AdminPanel {...commonProps} wellness={{ videos: wellnessVideos, tracks: meditationTracks, articles: wellnessArticles }} setWellness={wellnessSetters} />
          : <Dashboard navigateTo={navigateTo} />;
      case AppView.FORCE_PASSWORD_CHANGE:
        return <ForcePasswordChange currentUser={currentUser!} setUsers={handleSetUsers} navigateTo={navigateTo} logAuditAction={logAuditAction} />;
      case AppView.UPGRADE_PAGE:
        return <UpgradePage {...commonProps} navigateTo={navigateTo} />;
      case AppView.LEGAL:
        return <LegalPage />;
      case AppView.SUPPORT:
        return <SupportPage {...commonProps} allUsers={users} knowledgeBaseArticles={knowledgeBaseArticles} addStaffMessage={addStaffMessage} />;
      default:
        return <Dashboard navigateTo={navigateTo} />;
    }
  };

  if (isLoading || !initialUserLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Spinner size="lg" />
      </div>
    );
  }

  if (activeView === AppView.FORCE_PASSWORD_CHANGE && currentUser?.isPasswordTemporary) {
    return renderActiveView();
  }

  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} onLoginHelpRequest={handleLoginHelpRequest} isSandboxMode={isSandboxMode} />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-violet-100 via-purple-100 to-pink-100 font-sans">
      <Sidebar
        currentUser={currentUser}
        activeView={activeView}
        navigateTo={navigateTo}
        onLogout={handleLogout}
        notifications={notifications}
        setNotifications={handleSetNotifications}
        isSandboxMode={isSandboxMode}
        toggleSandboxMode={toggleSandboxMode}
      />
      <main className="flex-1 overflow-y-auto">
        {isSandboxMode && (
          <div className="bg-yellow-400 text-yellow-900 text-center font-bold p-2 text-sm shadow-md sticky top-0 z-10">
            Sandbox Mode Active - Data is for demonstration and will not be saved to the database.
          </div>
        )}
        {renderActiveView()}
      </main>
      <AIHelper />
    </div>
  );
};

export default App;
