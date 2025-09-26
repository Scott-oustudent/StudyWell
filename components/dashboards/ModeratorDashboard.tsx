import React, { useState } from 'react';
import { BanRecord, EscalationRequest } from '../../types';
import { logAction } from '../../services/loggingService';

const ModeratorDashboard: React.FC<{ currentUserEmail: string }> = ({ currentUserEmail }) => {
    const [userToBan, setUserToBan] = useState('');
    const [reason, setReason] = useState('');
    const [duration, setDuration] = useState(7); // days

    const handleBan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userToBan.trim() || !reason.trim()) {
            alert("Please fill in all fields.");
            return;
        }

        const bans: BanRecord[] = JSON.parse(localStorage.getItem('banRecords') || '[]');
        const expires = new Date();
        expires.setDate(expires.getDate() + duration);

        const newBan: BanRecord = {
            userId: userToBan,
            bannedBy: currentUserEmail,
            reason,
            expires: expires.toISOString(),
            roleOfBanner: 'Moderator'
        };

        localStorage.setItem('banRecords', JSON.stringify([...bans, newBan]));
        logAction(currentUserEmail, 'BAN_USER', { targetUser: userToBan, durationDays: duration, reason });
        alert(`User ${userToBan} has been banned for ${duration} days.`);
        setUserToBan('');
        setReason('');
    };

    const handleEscalate = () => {
        if (!userToBan.trim() || !reason.trim()) {
            alert("Please provide the user's email and a reason before escalating.");
            return;
        }

        const escalations: EscalationRequest[] = JSON.parse(localStorage.getItem('escalationRequests') || '[]');
        const newEscalation: EscalationRequest = {
            id: Date.now().toString(),
            subjectUser: userToBan,
            requestedBy: currentUserEmail,
            reason,
            fromRole: 'Moderator',
            toRole: 'Staff',
            status: 'pending'
        };
        localStorage.setItem('escalationRequests', JSON.stringify([...escalations, newEscalation]));
        logAction(currentUserEmail, 'ESCALATE_TO_STAFF', { targetUser: userToBan, reason });
        alert('Request has been escalated to Staff for review.');
        setUserToBan('');
        setReason('');
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center text-amber-700 dark:text-amber-400">Moderator Dashboard</h2>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4">Community Moderation Tools</h3>
                <form onSubmit={handleBan} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Student's Email to Ban</label>
                        <input 
                            type="email" 
                            value={userToBan}
                            onChange={e => setUserToBan(e.target.value)}
                            className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700"
                            placeholder="student@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Reason for Ban</label>
                        <textarea 
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700"
                            placeholder="Provide a clear reason for the ban."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Ban Duration (1-30 days)</label>
                        <input 
                            type="number" 
                            value={duration}
                            onChange={e => setDuration(Math.max(1, Math.min(30, Number(e.target.value))))}
                            className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700"
                            min="1"
                            max="30"
                        />
                    </div>
                    <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-md">
                        Issue Ban
                    </button>
                </form>
                <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-600">
                     <h4 className="font-semibold mb-2">Longer Ban Needed?</h4>
                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">If a user requires a ban longer than 30 days, fill out the form above and click here to send an escalated request to Staff.</p>
                     <button onClick={handleEscalate} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-md">
                        Escalate to Staff
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModeratorDashboard;