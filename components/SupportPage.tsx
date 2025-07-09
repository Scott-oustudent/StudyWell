import React, { useState, useMemo } from 'react';
import { User, KnowledgeBaseArticle, AppView, StaffMessage, AuditActionType, NotificationType, UserRole } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import Icon from './common/Icon';

interface SupportPageProps {
  currentUser: User;
  allUsers: User[];
  knowledgeBaseArticles: KnowledgeBaseArticle[];
  addStaffMessage: (message: Omit<StaffMessage, 'id' | 'createdAt'>) => void;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  logAuditAction: (actorId: string, actorName: string, actionType: AuditActionType, details: string) => void;
  createNotification: (userId: string, message: string, type?: NotificationType, linkTo?: AppView) => void;
}

const SupportPage: React.FC<SupportPageProps> = (props) => {
  const { currentUser, allUsers, knowledgeBaseArticles, addStaffMessage, setUsers, logAuditAction, createNotification } = props;
  
  // State for KB search
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for Contact Staff form
  const [contactSubject, setContactSubject] = useState('');
  const [contactBody, setContactBody] = useState('');
  const [contactError, setContactError] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  
  // State for Report User form
  const [userToReportId, setUserToReportId] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const filteredArticles = useMemo(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    if (!lowerCaseSearch) return knowledgeBaseArticles;
    return knowledgeBaseArticles.filter(
      article =>
        article.title.toLowerCase().includes(lowerCaseSearch) ||
        article.content.toLowerCase().includes(lowerCaseSearch) ||
        article.category.toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchTerm, knowledgeBaseArticles]);
  
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactSubject.trim() || !contactBody.trim()) {
      setContactError('Please fill out both subject and message fields.');
      return;
    }
    setContactError('');
    addStaffMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      subject: contactSubject,
      body: contactBody,
      isRead: false,
    });
    setContactSuccess(true);
    setContactSubject('');
    setContactBody('');
    setTimeout(() => setContactSuccess(false), 5000);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToReportId || !reportReason.trim()) {
      setReportError('Please select a user and provide a reason.');
      return;
    }
    const userToReport = allUsers.find(u => u.id === userToReportId);
    if (!userToReport) {
        setReportError('Selected user not found.');
        return;
    }

    setReportError('');
    setUsers(prev => prev.map(u => u.id === userToReportId ? { ...u, isFlaggedForReview: true, banReason: `Reported by ${currentUser.name}: ${reportReason}` } : u));
    logAuditAction(currentUser.id, currentUser.name, AuditActionType.USER_REPORTED, `Reported user ${userToReport.name}. Reason: ${reportReason}`);
    allUsers.forEach(user => {
      if (user.role === UserRole.STAFF || user.role === UserRole.ADMIN) {
        createNotification(user.id, `${currentUser.name} reported ${userToReport.name}. Please review the case.`, NotificationType.WARNING, AppView.STAFF_PANEL);
      }
    });

    setReportSuccess(true);
    setUserToReportId('');
    setReportReason('');
    setTimeout(() => setReportSuccess(false), 5000);
  };


  return (
    <div className="p-8 h-full flex flex-col bg-gray-50">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-2">Help & Support</h1>
      <p className="text-lg text-gray-600 mb-6">Find answers, get help, and report issues.</p>
      
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Knowledge Base */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Knowledge Base</h2>
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500 mb-6"
            />
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {filteredArticles.length > 0 ? filteredArticles.map(article => (
                <details key={article.id} className="bg-gray-100 rounded-lg group">
                  <summary className="p-4 font-semibold text-gray-700 cursor-pointer list-none flex justify-between items-center group-hover:bg-gray-200 rounded-t-lg">
                    {article.title}
                    <Icon><svg className="h-5 w-5 transition-transform duration-300 group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></Icon>
                  </summary>
                  <div className="p-4 border-t border-gray-200 text-gray-600 leading-relaxed">
                    <p className="whitespace-pre-wrap font-sans">{article.content}</p>
                    <p className="text-xs text-gray-400 mt-4">Category: {article.category} | Last updated: {new Date(article.lastUpdatedAt).toLocaleDateString()}</p>
                  </div>
                </details>
              )) : (
                <p className="text-center text-gray-500 py-10">No articles found matching your search.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Support Actions */}
        <div className="space-y-8">
            {/* Contact Staff */}
            <Card className="p-6">
                 <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Staff</h2>
                 {contactSuccess ? (
                    <div className="text-center text-green-700 bg-green-100 p-4 rounded-lg">
                        <p className="font-semibold">Message Sent!</p>
                        <p className="text-sm">A staff member will review your message shortly.</p>
                    </div>
                 ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700">Subject</label>
                            <input id="contact-subject" type="text" value={contactSubject} onChange={e => setContactSubject(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="contact-body" className="block text-sm font-medium text-gray-700">Message</label>
                            <textarea id="contact-body" rows={5} value={contactBody} onChange={e => setContactBody(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        {contactError && <p className="text-red-500 text-sm">{contactError}</p>}
                        <Button type="submit" className="w-full">Send Message</Button>
                    </form>
                 )}
            </Card>

            {/* Report a User */}
            <Card className="p-6">
                 <h2 className="text-2xl font-bold text-gray-800 mb-4">Report a User</h2>
                 {reportSuccess ? (
                    <div className="text-center text-green-700 bg-green-100 p-4 rounded-lg">
                        <p className="font-semibold">Report Submitted</p>
                        <p className="text-sm">Thank you for helping keep our community safe.</p>
                    </div>
                 ) : (
                    <form onSubmit={handleReportSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="user-to-report" className="block text-sm font-medium text-gray-700">User to Report</label>
                            <select id="user-to-report" value={userToReportId} onChange={e => setUserToReportId(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" required>
                                <option value="">Select a user...</option>
                                {allUsers.filter(u => u.id !== currentUser.id).map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="report-reason" className="block text-sm font-medium text-gray-700">Reason</label>
                            <textarea id="report-reason" rows={5} value={reportReason} onChange={e => setReportReason(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="Please provide specific details..." required />
                        </div>
                        {reportError && <p className="text-red-500 text-sm">{reportError}</p>}
                        <Button type="submit" className="w-full">Submit Report</Button>
                    </form>
                 )}
            </Card>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;