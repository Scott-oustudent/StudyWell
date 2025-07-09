

import React, { useState } from 'react';
import Forum from './Forum';
import ChatPlatform from './ChatPlatform';
import { User, AuditLogEntry, Notification, NotificationType, AuditActionType } from '../types';
import Card from './common/Card';

interface StudentCommunityProps {
  currentUser: User;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  logAuditAction: (actorId: string, actorName: string, actionType: AuditActionType, details: string) => void;
  createNotification: (userId: string, message: string, type?: NotificationType, linkTo?: any) => void;
}

const StudentCommunity: React.FC<StudentCommunityProps> = ({ currentUser, users, setUsers, logAuditAction, createNotification }) => {
  const [activeTab, setActiveTab] = useState<'forum' | 'chat'>('forum');

  const banExpiry = currentUser.bannedUntil ? new Date(currentUser.bannedUntil) : null;
  const isBanned = banExpiry && banExpiry > new Date();

  if (isBanned) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
          <Card className="p-8 text-center max-w-lg">
            <h1 className="text-3xl font-bold text-red-600">Access Restricted</h1>
            <p className="text-lg text-gray-700 mt-4">You have been temporarily banned from the community.</p>
            {currentUser.banReason && <p className="text-gray-600 mt-2"><strong>Reason:</strong> {currentUser.banReason}</p>}
            <p className="text-gray-600 mt-2">Your access will be restored on:</p>
            <p className="font-semibold text-xl text-gray-800 mt-1">{banExpiry.toLocaleString()}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 font-sans">
      <header className="px-8 pt-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-2">Student Community</h1>
        <p className="text-lg text-gray-600 mb-6">Connect with peers, discuss topics, or join a study session.</p>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('forum')}
              className={`${
                activeTab === 'forum'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base transition-colors focus:outline-none`}
               aria-current={activeTab === 'forum' ? 'page' : undefined}
            >
              Discussion Forum
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`${
                activeTab === 'chat'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base transition-colors focus:outline-none`}
              aria-current={activeTab === 'chat' ? 'page' : undefined}
            >
              Video Chat Rooms
            </button>
          </nav>
        </div>
      </header>
      <div className="flex-grow p-8 overflow-y-auto">
        {activeTab === 'forum' ? <Forum currentUser={currentUser} users={users} setUsers={setUsers} logAuditAction={logAuditAction} createNotification={createNotification} /> : <ChatPlatform />}
      </div>
    </div>
  );
};

export default StudentCommunity;