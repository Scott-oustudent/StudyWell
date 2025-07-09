
import React, { useState, useMemo } from 'react';
import { User, UserRole, StaffMessage, AuditLogEntry, AuditActionType, NotificationType, KnowledgeBaseArticle } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import ModerateUserModal from './common/ModerateUserModal';
import AuditLog from './common/AuditLog';
import UserManagement from './UserManagement';
import KnowledgeBaseModal from './common/KnowledgeBaseModal';
import Icon from './common/Icon';
import PaymentsManagement from './PaymentsManagement';
import ReplyModal from './common/ReplyModal';

interface StaffPanelProps {
    currentUser: User;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    staffMessages: StaffMessage[];
    setStaffMessages: React.Dispatch<React.SetStateAction<StaffMessage[]>>;
    auditLog: AuditLogEntry[];
    logAuditAction: (actorId: string, actorName: string, actionType: AuditActionType, details: string) => void;
    createNotification: (userId: string, message: string, type?: NotificationType, linkTo?: any) => void;
    knowledgeBaseArticles: KnowledgeBaseArticle[];
    manageKbArticle: (articleData: Partial<KnowledgeBaseArticle>, action: 'save' | 'delete') => void;
    handleSendReply: (messageId: string, replyBody: string) => void;
}

type StaffTab = 'review' | 'inbox' | 'audit' | 'usermanagement' | 'knowledgebase' | 'payments';

const StaffPanel: React.FC<StaffPanelProps> = (props) => {
    const { currentUser, users, setUsers, staffMessages, setStaffMessages, auditLog, knowledgeBaseArticles, manageKbArticle, handleSendReply } = props;
    const [userToModerate, setUserToModerate] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<StaffTab>('review');
    const [isKbModalOpen, setIsKbModalOpen] = useState(false);
    const [editingKbArticle, setEditingKbArticle] = useState<Partial<KnowledgeBaseArticle> | null>(null);
    const [messageToReply, setMessageToReply] = useState<StaffMessage | null>(null);

    const flaggedUsers = useMemo(() => users.filter(u => u.isFlaggedForReview), [users]);
    const unreadMessagesCount = useMemo(() => staffMessages.filter(m => !m.isRead).length, [staffMessages]);

    const handleOpenModeration = (user: User) => setUserToModerate(user);

    const handleClearFlag = (userId: string) => {
        const userToClear = users.find(u => u.id === userId);
        if (!userToClear) return;

        if (window.confirm('Are you sure you want to clear this flag? The user will no longer be marked for review.')) {
            setUsers(prevUsers => prevUsers.map(user => 
                user.id === userId ? { ...user, isFlaggedForReview: false, banReason: user.banReason?.replace('Needs review for ', '') } : user
            ));
            props.logAuditAction(currentUser.id, currentUser.name, AuditActionType.FLAG_CLEARED, `Cleared review flag for ${userToClear.name}.`);
        }
    };
    
    const handleMarkAsRead = (messageId: string) => {
        setStaffMessages(prev => prev.map(msg => msg.id === messageId ? {...msg, isRead: true} : msg));
    }

    const handleOpenKbModal = (article: Partial<KnowledgeBaseArticle> | null = null) => {
        setEditingKbArticle(article);
        setIsKbModalOpen(true);
    };

    const handleSaveKbArticle = (articleData: Partial<KnowledgeBaseArticle>) => {
        manageKbArticle(articleData, 'save');
        setIsKbModalOpen(false);
    };

    const handleDeleteKbArticle = (article: KnowledgeBaseArticle) => {
        if (window.confirm(`Are you sure you want to delete the article "${article.title}"? This cannot be undone.`)) {
            manageKbArticle(article, 'delete');
        }
    };

    const TabButton: React.FC<{tab: StaffTab; label: string; count?: number}> = ({tab, label, count}) => (
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
            {count !== undefined && count > 0 && 
                <span className="bg-pink-100 text-pink-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">{count}</span>
            }
          </button>
    )

    const renderContent = () => {
        switch (activeTab) {
            case 'inbox':
                return (
                    <Card className="p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Inbox</h2>
                        <ul className="space-y-4">
                            {[...staffMessages].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(msg => (
                                <li key={msg.id} className={`p-4 rounded-lg border-l-4 ${msg.isRead ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-400'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-900">{msg.subject}</p>
                                            <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap font-sans">{msg.body}</p>
                                            <p className="text-xs text-gray-500 mt-3">From: {msg.senderName} on {new Date(msg.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
                                            {msg.isReplied ? (
                                                <span className="flex items-center text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                                                    <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></Icon>
                                                    Replied
                                                </span>
                                            ) : (
                                                <Button onClick={() => setMessageToReply(msg)} className="!px-3 !py-1 text-xs">Reply</Button>
                                            )}
                                            {!msg.isRead && !msg.isReplied && (
                                                <Button onClick={() => handleMarkAsRead(msg.id)} variant="secondary" className="!px-2 !py-1 text-xs w-full text-center">Mark Read</Button>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                         {staffMessages.length === 0 && <p className="text-center text-gray-500 py-4">The inbox is empty.</p>}
                    </Card>
                );
            case 'audit':
                return <AuditLog logEntries={auditLog} />;
            case 'usermanagement':
                return <UserManagement {...props} />;
            case 'payments':
                return <PaymentsManagement {...props} />;
            case 'knowledgebase':
                return (
                    <Card className="p-6 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Knowledge Base Management</h2>
                            <Button onClick={() => handleOpenKbModal()}>
                                <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></Icon>
                                Add Article
                            </Button>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {knowledgeBaseArticles.map(article => (
                                        <tr key={article.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{article.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{article.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(article.lastUpdatedAt).toLocaleString()} by {article.authorName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <Button onClick={() => handleOpenKbModal(article)} variant="secondary" className="!px-3 !py-1 text-xs">Edit</Button>
                                                {currentUser.role === UserRole.ADMIN && (
                                                    <Button onClick={() => handleDeleteKbArticle(article)} variant="secondary" className="!px-3 !py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200">Delete</Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                );
            case 'review':
            default:
                return (
                    <Card className="p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Users Flagged for Review</h2>
                        {flaggedUsers.length > 0 ? (
                            <ul className="space-y-4">
                                {flaggedUsers.map(user => (
                                    <li key={user.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-yellow-900">{user.name}</p>
                                                <p className="text-sm text-yellow-700">{user.email}</p>
                                                {user.banReason && <p className="text-sm text-yellow-800 mt-2"><strong>Reason:</strong> {user.banReason}</p>}
                                            </div>
                                            <div className="flex flex-col items-end space-y-2 flex-shrink-0 ml-2">
                                                <Button onClick={() => handleOpenModeration(user)} className="text-xs !px-3 !py-1">Moderate</Button>
                                                <Button onClick={() => handleClearFlag(user.id)} variant="secondary" className="text-xs !px-3 !py-1">Clear Flag</Button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 py-4">No users are currently flagged for review.</p>
                        )}
                    </Card>
                );
        }
    }

    return (
        <>
        <div className="p-8 h-full flex flex-col">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-2">Staff Panel</h1>
            <p className="text-lg text-gray-600 mb-6">Review moderation escalations, manage messages, and view activity logs.</p>
            
             <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton tab="review" label="Review Queue" count={flaggedUsers.length} />
                    <TabButton tab="inbox" label="Inbox" count={unreadMessagesCount} />
                    <TabButton tab="usermanagement" label="User Management" />
                    <TabButton tab="payments" label="Payments" />
                    <TabButton tab="knowledgebase" label="Knowledge Base" />
                    <TabButton tab="audit" label="Audit Log" />
                </nav>
            </div>

            <div className="flex-grow overflow-y-auto">
                {renderContent()}
            </div>
        </div>
        {userToModerate && (
            <ModerateUserModal
                isOpen={!!userToModerate}
                onClose={() => setUserToModerate(null)}
                userToModerate={userToModerate}
                currentUser={currentUser}
                users={users}
                setUsers={setUsers}
                logAuditAction={props.logAuditAction}
                createNotification={props.createNotification}
            />
        )}
        <KnowledgeBaseModal
            isOpen={isKbModalOpen}
            onClose={() => setIsKbModalOpen(false)}
            onSave={handleSaveKbArticle}
            itemToEdit={editingKbArticle}
        />
        {messageToReply && (
            <ReplyModal
                isOpen={!!messageToReply}
                onClose={() => setMessageToReply(null)}
                message={messageToReply}
                onSendReply={handleSendReply}
            />
        )}
        </>
    );
};

export default StaffPanel;
