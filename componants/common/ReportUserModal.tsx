
import React, { useState } from 'react';
import { User, UserRole, AuditActionType, NotificationType, AppView } from '../../types';
import Modal from './Modal';
import Button from './Button';

interface ReportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToReport: User;
  currentUser: User;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  logAuditAction: (actorId: string, actorName: string, actionType: AuditActionType, details: string) => void;
  createNotification: (userId: string, message: string, type?: NotificationType, linkTo?: any) => void;
  allUsers: User[];
}

const ReportUserModal: React.FC<ReportUserModalProps> = ({
  isOpen,
  onClose,
  userToReport,
  currentUser,
  setUsers,
  logAuditAction,
  createNotification,
  allUsers
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for reporting this user.');
      return;
    }
    setError('');

    // Flag the user for review
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === userToReport.id
          ? { ...u, isFlaggedForReview: true, banReason: `Reported by ${currentUser.name}: ${reason}` }
          : u
      )
    );

    // Log the audit action
    const logDetails = `Reported user ${userToReport.name}. Reason: ${reason}`;
    logAuditAction(currentUser.id, currentUser.name, AuditActionType.USER_REPORTED, logDetails);

    // Notify all staff and admin users
    allUsers.forEach(user => {
      if (user.role === UserRole.STAFF || user.role === UserRole.ADMIN) {
        createNotification(
          user.id,
          `${currentUser.name} reported ${userToReport.name}. Please review the case.`,
          NotificationType.WARNING,
          AppView.STAFF_PANEL
        );
      }
    });
    
    // Reset and close
    setReason('');
    onClose();
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Report ${userToReport.name}`}>
      <div className="space-y-4">
        <p className="text-gray-600">
          Please provide a reason for reporting this user. This will be sent to our moderation team for review.
        </p>
        <div>
          <label htmlFor="report-reason" className="block text-sm font-medium text-gray-700">Reason for Report</label>
          <textarea
            id="report-reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
            placeholder="e.g., The user is posting inappropriate content, spamming, etc."
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end pt-2 space-x-2">
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit Report</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReportUserModal;
