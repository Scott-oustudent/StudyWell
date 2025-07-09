
import React, { useState, useEffect, useCallback } from 'react';
import { AppView, User, UserRole, StaffMessage, Notification, AuditLogEntry, AuditActionType, NotificationType, KnowledgeBaseArticle } from './types';
import Sidebar from './components/Sidebar';
import NoteSummarizer from './components/NoteSummarizer';
import FlashcardGenerator from './components/FlashcardGenerator';
import ConceptExplainer from './components/ConceptExplainer';
import AuthPage from './components/AuthPage';
import Spinner from './components/common/Spinner';
import PomodoroTimer from './components/PomodoroTimer';
import CitationWizard from './components/CitationWizard';
import EssayHelper from './components/EssayHelper';
import Dashboard from './components/Dashboard';
import Scheduler from './components/Scheduler';
import StudentCommunity from './components/StudentCommunity';
import StudentWellness from './components/StudentWellness';
import AdminPanel from './components/AdminPanel';
import StaffPanel from './components/StaffPanel';
import ContactStaff from './components/ContactStaff';
import StudentProfile from './components/StudentProfile';
import { initialUsers } from './data/userData';
import { initialKnowledgeBaseArticles } from './data/knowledgeBaseData';
import useLocalStorage from './hooks/useLocalStorage';
import ForcePasswordChange from './components/ForcePasswordChange';
import UpgradePage from './components/UpgradePage';
import LegalPage from './components/LegalPage';
import SupportPage from './components/SupportPage';

const App: React.FC = () => {
  const [users, setUsers] = useLocalStorage<User[]>('users', initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [staffMessages, setStaffMessages] = useLocalStorage<StaffMessage[]>('staffMessages', []);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('notifications', []);
  const [auditLog, setAuditLog] = useLocalStorage<AuditLogEntry[]>('auditLog', []);
  const [knowledgeBaseArticles, setKnowledgeBaseArticles] = useLocalStorage<KnowledgeBaseArticle[]>('knowledgeBase', initialKnowledgeBaseArticles);

  const createNotification = useCallback((userId: string, message: string, type: NotificationType = NotificationType.INFO, linkTo?: AppView) => {
    const newNotification: Notification = {
      id: String(Date.now()),
      userId,
      message,
      createdAt: new Date().toISOString(),
      isRead: false,
      type,
      linkTo,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, [setNotifications]);

  const logAuditAction = useCallback((actorId: string, actorName: string, actionType: AuditActionType, details: string) => {
    const newLogEntry: AuditLogEntry = {
      id: String(Date.now()),
      timestamp: new Date().toISOString(),
      actorId,
      actorName,
      actionType,
      details,
    };
    setAuditLog(prev => [newLogEntry, ...prev]);
  }, [setAuditLog]);

  const addStaffMessage = useCallback((message: Omit<StaffMessage, 'id' | 'createdAt'>) => {
      const newMessage: StaffMessage = {
          ...message,
          id: String(Date.now()),
          createdAt: new Date().toISOString(),
      };
      setStaffMessages(prev => [newMessage, ...prev]);
      
      logAuditAction(message.senderId, message.senderName, AuditActionType.MESSAGE_SENT, `Sent message with subject: "${message.subject}"`);
      
      users.forEach(user => {
        if (user.role === UserRole.STAFF || user.role === UserRole.ADMIN) {
            createNotification(user.id, `New message from ${message.senderName}: "${message.subject}"`, NotificationType.INFO, AppView.STAFF_PANEL);
        }
      });
  }, [setStaffMessages, createNotification, logAuditAction, users]);
  
  const handleSendReply = useCallback((messageId: string, replyBody: string) => {
    const originalMessage = staffMessages.find(msg => msg.id === messageId);
    if (!originalMessage || !currentUser) return;

    setStaffMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isReplied: true, isRead: true } : msg
    ));

    createNotification(
        originalMessage.senderId,
        `A staff member replied to your message: "${originalMessage.subject}"`,
        NotificationType.SUCCESS
    );
    
    logAuditAction(
        currentUser.id,
        currentUser.name,
        AuditActionType.STAFF_REPLIED_TO_MESSAGE,
        `Replied to message from ${originalMessage.senderName} (Subject: "${originalMessage.subject}")`
    );

    // In a real app, the replyBody would be sent somewhere (e.g., email). For this demo, we'll just log it.
    console.log(`Reply to ${originalMessage.senderName} regarding "${originalMessage.subject}":`, replyBody);

}, [staffMessages, setStaffMessages, createNotification, logAuditAction, currentUser]);


  const handleLoginHelpRequest = useCallback((name: string, email: string, institution: string, issue: string) => {
    const messageBody = `Login Issue Report:\nUser: ${name} (${email})\nInstitution: ${institution}\nIssue: ${issue}`;
    const staffMessage: StaffMessage = {
        id: String(Date.now()),
        createdAt: new Date().toISOString(),
        senderId: 'system-help-request',
        senderName: name,
        subject: `Login Help Request from ${name}`,
        body: messageBody,
        isRead: false
    };
    setStaffMessages(prev => [staffMessage, ...prev]);
    logAuditAction('system', name, AuditActionType.LOGIN_HELP_REQUEST, `User ${name} (${email}) requested help with a login issue.`);
    users.forEach(user => {
        if (user.role === UserRole.STAFF || user.role === UserRole.ADMIN) {
            createNotification(user.id, `New login help request from ${name}.`, NotificationType.WARNING, AppView.STAFF_PANEL);
        }
      });
  }, [setStaffMessages, logAuditAction, createNotification, users]);

  const manageKbArticle = useCallback((articleData: Omit<KnowledgeBaseArticle, 'id'> & { id?: string }, action: 'save' | 'delete') => {
    if (action === 'delete') {
      if (!articleData.id) return;
      const articleToDelete = knowledgeBaseArticles.find(a => a.id === articleData.id);
      if (articleToDelete) {
        setKnowledgeBaseArticles(prev => prev.filter(a => a.id !== articleData.id));
        logAuditAction(currentUser!.id, currentUser!.name, AuditActionType.KB_ARTICLE_DELETED, `Deleted KB article: "${articleToDelete.title}"`);
      }
    } else { // save
      const isNew = !articleData.id;
      const articleToSave: KnowledgeBaseArticle = {
        ...articleData,
        id: articleData.id || String(Date.now()),
        lastUpdatedAt: new Date().toISOString(),
        authorId: currentUser!.id,
        authorName: currentUser!.name,
        createdAt: isNew ? new Date().toISOString() : (knowledgeBaseArticles.find(a => a.id === articleData.id)?.createdAt || new Date().toISOString()),
      };

      setKnowledgeBaseArticles(prev => isNew ? [...prev, articleToSave] : prev.map(a => a.id === articleToSave.id ? articleToSave : a));
      const auditAction = isNew ? AuditActionType.KB_ARTICLE_CREATED : AuditActionType.KB_ARTICLE_UPDATED;
      logAuditAction(currentUser!.id, currentUser!.name, auditAction, `${isNew ? 'Created' : 'Updated'} KB article: "${articleToSave.title}"`);
    }
  }, [setKnowledgeBaseArticles, logAuditAction, currentUser, knowledgeBaseArticles]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
         const parsedUser = JSON.parse(storedUser);
         const freshUser = users.find(u => u.id === parsedUser.id) || parsedUser;
         setCurrentUser(freshUser);
      }
    } catch (error) { console.error("Could not access localStorage:", error); }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (currentUser) {
        const freshUser = users.find(u => u.id === currentUser.id);
        if (freshUser && JSON.stringify(freshUser) !== JSON.stringify(currentUser)) {
            setCurrentUser(freshUser);
            try { localStorage.setItem('currentUser', JSON.stringify(freshUser)); } 
            catch (error) { console.error("Could not write to localStorage:", error); }
        }
    }
  }, [users, currentUser]);

  const handleLoginSuccess = (user: User) => {
    try {
      const userToSet = users.find(u => u.id === user.id) || user;
      localStorage.setItem('currentUser', JSON.stringify(userToSet));
      setCurrentUser(userToSet);
      
      if (userToSet.isPasswordTemporary) {
        setActiveView(AppView.FORCE_PASSWORD_CHANGE);
      } else {
        setActiveView(AppView.DASHBOARD);
      }
    } catch (error) { console.error("Could not access localStorage:", error); }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
    } catch (error) { console.error("Could not access localStorage:", error); }
  };

  const navigateTo = (view: AppView) => {
    setActiveView(view);
  };

  const renderActiveView = () => {
    const commonProps = { currentUser: currentUser!, users, setUsers, logAuditAction, createNotification };
    switch (activeView) {
      case AppView.DASHBOARD:
        return <Dashboard navigateTo={navigateTo} />;
      case AppView.NOTE_SUMMARIZER:
        return <NoteSummarizer currentUser={currentUser!} navigateTo={navigateTo} />;
      case AppView.FLASHCARD_GENERATOR:
        return <FlashcardGenerator currentUser={currentUser!} navigateTo={navigateTo} />;
      case AppView.CONCEPT_EXPLAINER:
        return <ConceptExplainer currentUser={currentUser!} navigateTo={navigateTo} />;
      case AppView.SCHEDULER:
        return <Scheduler />;
      case AppView.POMODORO_TIMER:
        return <PomodoroTimer />;
      case AppView.CITATION_WIZARD:
        return <CitationWizard currentUser={currentUser!} navigateTo={navigateTo} />;
      case AppView.ESSAY_HELPER:
        return <EssayHelper currentUser={currentUser!} navigateTo={navigateTo} />;
      case AppView.COMMUNITY:
        return <StudentCommunity {...commonProps} />;
      case AppView.STUDENT_WELLNESS:
        return <StudentWellness currentUser={currentUser!} logAuditAction={logAuditAction} />;
       case AppView.CONTACT_STAFF:
        return <ContactStaff currentUser={currentUser!} addStaffMessage={addStaffMessage} />;
      case AppView.STUDENT_PROFILE:
        return <StudentProfile currentUser={currentUser!} setUsers={setUsers} />;
       case AppView.STAFF_PANEL:
        return [UserRole.STAFF, UserRole.ADMIN].includes(currentUser?.role!) 
            ? <StaffPanel {...commonProps} staffMessages={staffMessages} setStaffMessages={setStaffMessages} auditLog={auditLog} knowledgeBaseArticles={knowledgeBaseArticles} manageKbArticle={manageKbArticle} handleSendReply={handleSendReply} />
            : <Dashboard navigateTo={navigateTo} />;
      case AppView.ADMIN_PANEL:
        return currentUser?.role === UserRole.ADMIN 
            ? <AdminPanel {...commonProps} />
            : <Dashboard navigateTo={navigateTo} />;
      case AppView.FORCE_PASSWORD_CHANGE:
        return <ForcePasswordChange currentUser={currentUser!} setUsers={setUsers} navigateTo={navigateTo} logAuditAction={logAuditAction} />;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (activeView === AppView.FORCE_PASSWORD_CHANGE && currentUser) {
      return renderActiveView();
  }

  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} users={users} setUsers={setUsers} onLoginHelpRequest={handleLoginHelpRequest} />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-sans">
      <Sidebar 
        currentUser={currentUser} 
        activeView={activeView} 
        navigateTo={navigateTo} 
        onLogout={handleLogout}
        notifications={notifications}
        setNotifications={setNotifications}
      />
      <main className="flex-1 overflow-y-auto">
        {renderActiveView()}
      </main>
    </div>
  );
};

export default App;
