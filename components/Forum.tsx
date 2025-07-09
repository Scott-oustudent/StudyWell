

import React, { useState, useMemo } from 'react';
import { ForumCategory, ForumPost, User, UserRole, AuditActionType, NotificationType, AppView } from '../types';
import { requestNewCategory } from '../services/geminiService';
import Button from './common/Button';
import Modal from './common/Modal';
import Card from './common/Card';
import Spinner from './common/Spinner';
import useLocalStorage from '../hooks/useLocalStorage';
import Icon from './common/Icon';
import ModerateUserModal from './common/ModerateUserModal';
import ReportUserModal from './common/ReportUserModal';

const initialCategories: ForumCategory[] = [
  { id: '1', name: 'General Discussion' },
  { id: '2', name: 'Computer Science' },
  { id: '3', name: 'Biology' },
  { id: '4', name: 'Literature' },
  { id: '5', name: 'Study Groups' },
];

const initialPosts: ForumPost[] = [
    { id: '101', categoryId: '2', title: 'Help with sorting algorithms?', author: 'Student User', createdAt: new Date(Date.now() - 86400000).toISOString(), content: 'I\'m struggling to understand the difference between Merge Sort and Quick Sort. Can anyone explain it in simple terms?', comments: [] },
    { id: '102', categoryId: '4', title: 'Favorite modernist author?', author: 'Banned User', createdAt: new Date(Date.now() - 172800000).toISOString(), content: 'Just finished "The Waste Land" and my mind is blown. Who are your favorite authors from the modernist period?', comments: [] },
    { id: '103', categoryId: '1', title: 'Anyone else using this app?', author: 'Flagged User', createdAt: new Date(Date.now() - 272800000).toISOString(), content: 'This StudyWell app is pretty cool! What\'s your favorite feature?', comments: [] },
];

interface ForumProps {
    currentUser: User;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    logAuditAction: (actorId: string, actorName: string, actionType: AuditActionType, details: string) => void;
    createNotification: (userId: string, message: string, type?: NotificationType, linkTo?: any) => void;
}

const Forum: React.FC<ForumProps> = ({ currentUser, users, setUsers, logAuditAction, createNotification }) => {
  const [categories, setCategories] = useLocalStorage<ForumCategory[]>('forumCategories', initialCategories);
  const [posts, setPosts] = useLocalStorage<ForumPost[]>('forumPosts', initialPosts);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  
  const [isModerateModalOpen, setIsModerateModalOpen] = useState(false);
  const [userToModerate, setUserToModerate] = useState<User | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [userToReport, setUserToReport] = useState<User | null>(null);

  const canModerate = useMemo(() => {
    return [UserRole.ADMIN, UserRole.MODERATOR, UserRole.STAFF].includes(currentUser.role);
  }, [currentUser.role]);

  const filteredPosts = useMemo(() => {
    return (selectedCategoryId ? posts.filter(p => p.categoryId === selectedCategoryId) : posts)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts, selectedCategoryId]);
  
  const handleRequestCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsRequesting(true);
    setRequestMessage('');
    const response = await requestNewCategory(newCategoryName);
    setRequestMessage(response);
    setIsRequesting(false);
    setNewCategoryName('');
  };

  const handleDeletePost = (post: ForumPost) => {
    if (!canModerate) return;
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        setPosts(prevPosts => prevPosts.filter(p => p.id !== post.id));
        logAuditAction(currentUser.id, currentUser.name, AuditActionType.POST_DELETED, `Deleted post: "${post.title}" by ${post.author}.`);
    }
  };

  const openModerationModal = (authorName: string) => {
    const user = users.find(u => u.name === authorName);
    if (user) {
        setUserToModerate(user);
        setIsModerateModalOpen(true);
    } else {
        alert("Could not find this user to moderate.");
    }
  };

  const openReportModal = (authorName: string) => {
    const user = users.find(u => u.name === authorName);
    if (user) {
        setUserToReport(user);
        setIsReportModalOpen(true);
    } else {
        alert("Could not find this user to report.");
    }
  };

  return (
    <>
    <Card className="p-6 h-full flex flex-col md:flex-row gap-6">
      {/* Categories Sidebar */}
      <aside className="md:w-1/4 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Categories</h2>
        <ul className="space-y-2">
          <li>
            <button onClick={() => setSelectedCategoryId(null)} className={`w-full text-left px-4 py-2 rounded-md transition-colors text-lg ${!selectedCategoryId ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
              All Posts
            </button>
          </li>
          {categories.map(cat => (
            <li key={cat.id}>
              <button onClick={() => setSelectedCategoryId(cat.id)} className={`w-full text-left px-4 py-2 rounded-md transition-colors ${selectedCategoryId === cat.id ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
        <Button onClick={() => setIsRequestModalOpen(true)} variant="secondary" className="w-full mt-6">
          Request a Category
        </Button>
      </aside>
      
      {/* Posts */}
      <main className="flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
                {selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name : 'All Posts'}
            </h2>
            {/* Add New Post Button could go here */}
        </div>
        <div className="space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <Card key={post.id} className="p-4 relative group">
                <div className="absolute top-2 right-2 flex gap-2">
                  {currentUser.name !== post.author && (
                     <button 
                        onClick={() => openReportModal(post.author)}
                        className="p-1.5 bg-gray-100 text-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                        title={`Report ${post.author}`}
                    >
                         <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg></Icon>
                    </button>
                  )}
                  {canModerate && currentUser.name !== post.author && (
                     <button 
                        onClick={() => openModerationModal(post.author)}
                        className="p-1.5 bg-yellow-100 text-yellow-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-yellow-200"
                        title={`Moderate ${post.author}`}
                    >
                         <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></Icon>
                    </button>
                  )}
                  {canModerate && (
                      <button 
                          onClick={() => handleDeletePost(post)}
                          className="p-1.5 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                          title="Delete Post"
                      >
                          <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></Icon>
                      </button>
                  )}
                </div>
                <span className="text-xs font-semibold bg-purple-100 text-purple-800 py-1 px-2 rounded-full">
                  {categories.find(c => c.id === post.categoryId)?.name || 'Uncategorized'}
                </span>
                <h3 className="text-xl font-bold mt-2 hover:text-pink-600 transition-colors cursor-pointer">{post.title}</h3>
                <p className="text-gray-600 mt-2">{post.content}</p>
                <div className="text-sm text-gray-500 mt-3 flex justify-between">
                  <span>by <strong>{post.author}</strong></span>
                  <span>{new Date(post.createdAt).toLocaleString()}</span>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500 py-10">No posts in this category yet.</p>
          )}
        </div>
      </main>

      {/* Category Request Modal */}
      <Modal isOpen={isRequestModalOpen} onClose={() => { setIsRequestModalOpen(false); setRequestMessage(''); }} title="Request a New Category">
        {requestMessage ? (
          <div className="text-center">
            <p className="text-gray-700">{requestMessage}</p>
            <Button onClick={() => { setIsRequestModalOpen(false); setRequestMessage(''); }} className="mt-4">Close</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">Want to discuss something new? Suggest a category for our moderators to review.</p>
            <div>
              <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">Category Name</label>
              <input
                type="text"
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                placeholder="e.g., Quantum Physics"
                disabled={isRequesting}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleRequestCategory} disabled={isRequesting || !newCategoryName.trim()}>
                {isRequesting ? <Spinner size="sm" /> : 'Submit Request'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Card>
    {userToModerate && (
        <ModerateUserModal 
            isOpen={isModerateModalOpen}
            onClose={() => setIsModerateModalOpen(false)}
            currentUser={currentUser}
            userToModerate={userToModerate}
            users={users}
            setUsers={setUsers}
            logAuditAction={logAuditAction}
            createNotification={createNotification}
        />
    )}
    {userToReport && (
      <ReportUserModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        userToReport={userToReport}
        currentUser={currentUser}
        setUsers={setUsers}
        logAuditAction={logAuditAction}
        createNotification={createNotification}
        allUsers={users}
      />
    )}
    </>
  );
};

export default Forum;