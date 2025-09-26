import React, { useState, useEffect } from 'react';
import * as db from '../../services/databaseService';
import { EscalationRequest, BanRecord, ChatMessage } from '../../types';
import { logAction } from '../../services/loggingService';

type View = 'escalations' | 'flagged';

const StaffDashboard: React.FC<{ currentUserEmail: string }> = ({ currentUserEmail }) => {
    const [view, setView] = useState<View>('escalations');
    const [escalations, setEscalations] = useState<EscalationRequest[]>([]);
    const [flaggedMessages, setFlaggedMessages] = useState<ChatMessage[]>([]);

    useEffect(() => {
        setEscalations(db.getEscalationRequests().filter(e => e.status === 'pending'));
        setFlaggedMessages(db.getChatMessages().filter(m => m.isFlagged));
    }, [view]);

    const handleEscalation = (reqId: string, approve: boolean) => {
        const req = db.getEscalationRequests().find(r => r.id === reqId);
        if (!req) return;

        if (approve) {
            const bans: BanRecord[] = db.getBanRecords();
            const expires = new Date();
            expires.setFullYear(expires.getFullYear() + 1); // 1 year ban for escalations

            const newBan: BanRecord = {
                userId: req.subjectUser,
                bannedBy: currentUserEmail,
                reason: `Escalated: ${req.reason}`,
                expires: expires.toISOString(),
                roleOfBanner: 'Staff'
            };
            db.saveBanRecords([...bans, newBan]);
            logAction(currentUserEmail, 'APPROVE_ESCALATION_BAN', { request: req });
        } else {
            logAction(currentUserEmail, 'REJECT_ESCALATION', { request: req });
        }

        // FIX: Explicitly define the new status to satisfy the EscalationRequest type.
        const updatedReqs = db.getEscalationRequests().map(r => {
            if (r.id === reqId) {
                const newStatus: 'approved' | 'rejected' = approve ? 'approved' : 'rejected';
                return { ...r, status: newStatus };
            }
            return r;
        });
        db.saveEscalationRequests(updatedReqs);
        setEscalations(updatedReqs.filter(e => e.status === 'pending'));
    };
    
    const handleMessageAction = (msgId: string, keep: boolean) => {
        const allMessages = db.getChatMessages();
        let updatedMessages;
        if (keep) {
            // FIX: Ensure isFlagged property is explicitly set to false
            updatedMessages = allMessages.map(m => m.id === msgId ? { ...m, isFlagged: false } : m);
            logAction(currentUserEmail, 'UNFLAG_MESSAGE', { messageId: msgId });
        } else {
            updatedMessages = allMessages.filter(m => m.id !== msgId);
            logAction(currentUserEmail, 'DELETE_FLAGGED_MESSAGE', { messageId: msgId });
        }
        db.saveChatMessages(updatedMessages);
        setFlaggedMessages(updatedMessages.filter(m => m.isFlagged));
    };

    const renderContent = () => {
        switch (view) {
            case 'escalations':
                return (
                    <div>
                        <h3 className="text-lg font-bold mb-4">Escalation Requests</h3>
                        {escalations.length > 0 ? (
                            <div className="space-y-3">
                                {escalations.map(req => (
                                    <div key={req.id} className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-md">
                                        <p><strong>User:</strong> {req.subjectUser}</p>
                                        <p><strong>Reason:</strong> {req.reason}</p>
                                        <p className="text-xs"><strong>From:</strong> {req.requestedBy} ({req.fromRole})</p>
                                        <div className="mt-2 text-right">
                                            <button onClick={() => handleEscalation(req.id, true)} className="bg-red-600 text-white px-2 py-1 text-sm rounded mr-2">Approve Ban (1 Year)</button>
                                            <button onClick={() => handleEscalation(req.id, false)} className="bg-gray-400 px-2 py-1 text-sm rounded">Reject</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p>No pending escalations.</p>}
                    </div>
                );
            case 'flagged':
                 return (
                    <div>
                        <h3 className="text-lg font-bold mb-4">Flagged Messages</h3>
                         {flaggedMessages.length > 0 ? (
                            <div className="space-y-3">
                                {flaggedMessages.map(msg => (
                                    <div key={msg.id} className="p-3 bg-red-100 dark:bg-red-900/50 rounded-md">
                                        <p className="italic">"{msg.text}"</p>
                                        <p className="text-xs mt-1"><strong>Sender:</strong> {msg.senderEmail}</p>
                                        <div className="mt-2 text-right">
                                            <button onClick={() => handleMessageAction(msg.id, false)} className="bg-red-600 text-white px-2 py-1 text-sm rounded mr-2">Delete Message</button>
                                            <button onClick={() => handleMessageAction(msg.id, true)} className="bg-green-600 text-white px-2 py-1 text-sm rounded">Keep Message (unflag)</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p>No messages are currently flagged for review.</p>}
                    </div>
                );
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center text-purple-700 dark:text-purple-400">Staff Dashboard</h2>
            <div className="flex justify-center border-b border-gray-200 dark:border-gray-700 mb-4">
                <button onClick={() => setView('escalations')} className={`px-4 py-2 font-semibold text-sm ${view === 'escalations' ? 'border-b-2 border-purple-500' : ''}`}>Escalations</button>
                <button onClick={() => setView('flagged')} className={`px-4 py-2 font-semibold text-sm ${view === 'flagged' ? 'border-b-2 border-purple-500' : ''}`}>Flagged Content</button>
            </div>
             <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                {renderContent()}
            </div>
        </div>
    );
};

export default StaffDashboard;