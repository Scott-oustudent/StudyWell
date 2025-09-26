import React, { useState } from 'react';
import { UserSession, UserData } from '../../types';
import * as db from '../../services/databaseService';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../context/ThemeContext';
import { avatars, getAvatarComponent } from '../../data/avatars';
import SubscriptionPage from './SubscriptionPage';
import HelpPage from './HelpPage';

interface ProfilePageProps {
  onLogout: () => void;
  session: UserSession;
}

type ProfileTab = 'profile' | 'subscription' | 'help';

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout, session }) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [userData, setUserData] = useState<UserData | null>(() => db.getUser(session.email));
  const { theme, setTheme } = useTheme();

  if (!userData) {
    // This should not happen if the user is logged in
    return <div>Error: Could not load user data.</div>;
  }

  const handleUpdate = (field: keyof UserData, value: any) => {
    const updatedUser = { ...userData, [field]: value };
    setUserData(updatedUser);
    db.saveUser(updatedUser);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        // FIX: The component returned by getAvatarComponent must be capitalized (PascalCase) to be used as a JSX element.
        const Avatar = getAvatarComponent(userData.avatarId);
        return (
          <div>
            <div className="text-center mb-6">
              <div className="relative inline-block">
                {userData.profilePicture ? (
                   <img src={userData.profilePicture} alt={userData.username} className="w-24 h-24 rounded-full object-cover mx-auto" />
                ) : (
                  <Avatar className="w-24 h-24 mx-auto" />
                )}
              </div>
              <h2 className="text-2xl font-bold mt-2">{userData.username}</h2>
              <p className="text-sm text-gray-500">{userData.email}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Username</label>
                <input type="text" value={userData.username} onChange={e => handleUpdate('username', e.target.value)} className="w-full p-2 border rounded-md bg-white dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium">Institution</label>
                <input type="text" value={userData.institution} onChange={e => handleUpdate('institution', e.target.value)} className="w-full p-2 border rounded-md bg-white dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Avatar</label>
                <div className="flex flex-wrap gap-2">
                  {avatars.map(avatar => (
                    <button key={avatar.id} onClick={() => handleUpdate('avatarId', avatar.id)} className={`p-1 rounded-full ${userData.avatarId === avatar.id ? 'ring-2 ring-blue-500' : ''}`}>
                      <avatar.component className="w-12 h-12" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {themes.map(t => (
                    <button key={t.id} onClick={() => setTheme(t)} className={`p-2 rounded-md text-sm border-2 ${theme.id === t.id ? 'border-blue-500' : 'border-transparent'}`}>
                      <div className={`w-full h-8 rounded ${t.className}`}></div>
                      <span className="mt-1 block">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'subscription':
        return <SubscriptionPage />;
      case 'help':
        return <HelpPage />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-center border-b border-gray-200 dark:border-gray-700 mb-6">
        <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 font-semibold text-sm ${activeTab === 'profile' ? 'border-b-2 border-blue-500' : ''}`}>Profile & Settings</button>
        <button onClick={() => setActiveTab('subscription')} className={`px-4 py-2 font-semibold text-sm ${activeTab === 'subscription' ? 'border-b-2 border-blue-500' : ''}`}>Subscription</button>
        <button onClick={() => setActiveTab('help')} className={`px-4 py-2 font-semibold text-sm ${activeTab === 'help' ? 'border-b-2 border-blue-500' : ''}`}>Help</button>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        {renderContent()}
      </div>

      <button
        onClick={onLogout}
        className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

export default ProfilePage;
