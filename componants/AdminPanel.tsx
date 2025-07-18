import React, { useState } from 'react';
import { User, UserRole, AuditActionType, NotificationType, WellnessVideo, MeditationTrack, WellnessArticle, AppView } from '../types';
import UserManagement from './UserManagement';
import StudentWellness from './StudentWellness';

interface AdminPanelProps {
    currentUser: User;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    logAuditAction: (actorId: string, actorName: string, actionType: AuditActionType, details: string) => void;
    createNotification: (userId: string, message: string, type?: NotificationType, linkTo?: any) => void;
    isSandboxMode: boolean;
    wellness: {
      videos: WellnessVideo[];
      tracks: MeditationTrack[];
      articles: WellnessArticle[];
    };
    setWellness: {
        setVideos: React.Dispatch<React.SetStateAction<WellnessVideo[]>>;
        setTracks: React.Dispatch<React.SetStateAction<MeditationTrack[]>>;
        setArticles: React.Dispatch<React.SetStateAction<WellnessArticle[]>>;
    };
}

type AdminTab = 'usermanagement' | 'wellnesscontent';

const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    const { currentUser, isSandboxMode, wellness, setWellness } = props;
    const [activeTab, setActiveTab] = useState<AdminTab>('usermanagement');
    
    if (currentUser.role !== UserRole.ADMIN) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
            </div>
        );
    }
    
    const TabButton: React.FC<{tab: AdminTab; label: string;}> = ({tab, label}) => (
         <button
            onClick={() => setActiveTab(tab)}
            className={`${
              activeTab === tab
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base transition-colors focus:outline-none flex items-center gap-2`}
            aria-current={activeTab === tab ? 'page' : undefined}
          >
            {label}
          </button>
    );
    
    const renderContent = () => {
        switch(activeTab) {
            case 'wellnesscontent':
                return <StudentWellness 
                    currentUser={currentUser} 
                    logAuditAction={props.logAuditAction} 
                    isSandboxMode={isSandboxMode} 
                    wellness={wellness} 
                    setWellness={setWellness} 
                />;
            case 'usermanagement':
            default:
                return <UserManagement {...props} />;
        }
    };

    return (
        <div className="p-8 h-full flex flex-col">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-2">Admin Panel</h1>
            <p className="text-lg text-gray-600 mb-6">Manage all users, roles, and system settings.</p>

            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton tab="usermanagement" label="User Management" />
                    <TabButton tab="wellnesscontent" label="Wellness Content" />
                </nav>
            </div>

            <div className="flex-grow">
                 {renderContent()}
            </div>
        </div>
    );
};

export default AdminPanel;