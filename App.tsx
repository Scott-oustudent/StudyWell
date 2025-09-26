import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import ToolsHome from './components/tools/ToolsHome';
import WellnessHome from './components/wellness/WellnessHome';
import CommunityHome from './components/community/CommunityHome';
import ProfilePage from './components/profile/ProfilePage';
import AdminDashboard from './components/dashboards/AdminDashboard';
import StaffDashboard from './components/dashboards/StaffDashboard';
import ModeratorDashboard from './components/dashboards/ModeratorDashboard';
import AuthPage from './components/auth/AuthPage';
import Onboarding from './components/Onboarding';
import GlobalSearch from './components/GlobalSearch';
import { useTheme } from './context/ThemeContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import * as db from './services/databaseService';
// FIX: Import UserSession and other types from types.ts to avoid circular dependencies.
import { UserRole, Section, UserSession } from './types';

function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('tools');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('userSession');
      if (savedSession) {
        setSession(JSON.parse(savedSession));
      }
    } catch (e) {
      console.error("Could not parse user session", e);
      localStorage.removeItem('userSession');
    }
  }, []);

  const handleLogin = (userSession: UserSession) => {
    localStorage.setItem('userSession', JSON.stringify(userSession));
    setSession(userSession);
    setActiveSection('tools'); 

    // Check for onboarding
    const hasOnboarded = db.getOnboardingStatus();
    if (!hasOnboarded) {
        setShowOnboarding(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    setSession(null);
  };

  const handleOnboardingComplete = () => {
    db.setOnboardingStatus(true);
    setShowOnboarding(false);
  };

  const renderSection = () => {
    if (!session) return null;

    switch (activeSection) {
      case 'tools':
        return <ToolsHome />;
      case 'wellness':
        return <WellnessHome />;
      case 'community':
        return <CommunityHome currentUserEmail={session.email} currentUserRole={session.role} />;
      case 'profile':
        return <ProfilePage onLogout={handleLogout} session={session} />;
      case 'admin':
        return session.role === 'Administrator' ? <AdminDashboard currentUserEmail={session.email} /> : null;
      case 'staff':
         return ['Administrator', 'Staff'].includes(session.role) ? <StaffDashboard currentUserEmail={session.email} /> : null;
      case 'moderator':
        return ['Administrator', 'Staff', 'Moderator'].includes(session.role) ? <ModeratorDashboard currentUserEmail={session.email} /> : null;
      default:
        return <ToolsHome />;
    }
  };

  if (!session) {
    return (
      <div className={`w-full min-h-screen font-sans text-gray-900 dark:text-gray-100 ${theme.className}`}>
        <AuthPage onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <SubscriptionProvider session={session}>
      <div className={`w-full min-h-screen font-sans text-gray-900 dark:text-gray-100 ${theme.className}`}>
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
        {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} />}
        <main className="p-4 pb-24 max-w-7xl mx-auto">
          {renderSection()}
        </main>
        <BottomNav 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          role={session.role}
          onSearchClick={() => setShowSearch(true)}
        />
      </div>
    </SubscriptionProvider>
  );
}

export default App;