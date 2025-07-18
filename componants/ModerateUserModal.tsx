
import React, { useState, useMemo, useEffect } from 'react';
import { User, UserRole, AuditActionType, NotificationType, AppView } from '../../types';
import Modal from './Modal';
import Button from './Button';

interface ModerateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToModerate: User;
  currentUser: User;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  logAuditAction: (actorId: string, actorName: string, actionType: AuditActionType, details: string) => void;
  createNotification: (userId: string, message: string, type?: NotificationType, linkTo?: any) => void;
}

const getBanOptions = (role: UserRole) => {
  const now = new Date();
  const options = [
    { label: 'None', value: 'none' },
  ];

  if (role === UserRole.MODERATOR || role === UserRole.STAFF || role === UserRole.ADMIN) {
    options.push(
      { label: '1 Hour', value: new Date(now.getTime() + 60 * 60 * 1000).toISOString() },
      { label: '12 Hours', value: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString() },
      { label: '1 Day', value: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() },
      { label: '1 Week', value: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() }
    );
  }
  
  if (role === UserRole.STAFF || role === UserRole.ADMIN) {
     options.push(
      { label: '1 Month', value: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString() },
      { label: '6 Months', value: new Date(now.getFullYear(), now.getMonth() + 6, now.getDate()).toISOString() },
      { label: '1 Year', value: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString() }
    );
  }

  if (role === UserRole.ADMIN) {
    options.push(
      { label: 'Permanent', value: new Date(now.getFullYear() + 100, now.getMonth(), now.getDate()).toISOString() }
    );
  }

  return options;
};


const ModerateUserModal: React.FC<ModerateUserModalProps> = ({ isOpen, onClose, userToModerate, currentUser, users, setUsers, logAuditAction, createNotification }) => {
  const [banDuration, setBanDuration] = useState('none');
  const [reason, setReason] = useState('');
  const [escalate, setEscalate] = useState(false);
  
  const banOptions = useMemo(() => getBanOptions(currentUser.role), [currentUser.role]);

  useEffect(() => {
    if (isOpen) {
        setBanDuration(userToModerate.bannedUntil || 'none');
        setReason(userToModerate.banReason || '');
        setEscalate(userToModerate.isFlaggedForReview || false);
    }
  }, [isOpen, userToModerate]);

  const handleApplyModeration = () => {
    const updatedUser: User = { 
        ...userToModerate,
        banReason: reason || undefined,
        isFlaggedForReview: escalate || undefined,
        bannedUntil: banDuration !== 'none' ? banDuration : undefined,
    };
    
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    
    // Logging and Notifications
    if (banDuration !== (userToModerate.bannedUntil || 'none')) {
        const banLabel = banOptions.find(opt => opt.value === banDuration)?.label || 'None';
        const logDetails = `Set ban duration for ${userToModerate.name} to ${banLabel}. Reason: ${reason || 'Not provided'}`;
        logAuditAction(currentUser.id, currentUser.name, AuditActionType.USER_BANNED, logDetails);
        createNotification(userToModerate.id, `Your community access has been restricted until ${new Date(banDuration).toLocaleString()}. Reason: ${reason || 'Not provided'}.`, NotificationType.WARNING);
    }

    if (escalate && !userToModerate.isFlaggedForReview) {
        const escalationTarget = getEscalationTarget();
        const logDetails = `Escalated user ${userToModerate.name} for review. Reason: ${reason || 'Not provided'}`;
        logAuditAction(currentUser.id, currentUser.name, AuditActionType.USER_FLAGGED, logDetails);
        users.forEach(u => {
            if ((escalationTarget === 'Staff' && (u.role === UserRole.STAFF || u.role === UserRole.ADMIN)) ||
                (escalationTarget === 'Admin' && u.role === UserRole.ADMIN)) {
                createNotification(u.id, `${currentUser.name} has escalated a case for ${userToModerate.name}.`, NotificationType.INFO, AppView.STAFF_PANEL);
            }
        });
    }

    onClose();
  };

  const getEscalationTarget = () => {
      if (currentUser.role === UserRole.MODERATOR) return 'Staff';
      if (currentUser.role === UserRole.STAFF) return 'Admin';
      return null;
  }
  const escalationTarget = getEscalationTarget();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Moderate ${userToModerate.name}`}>
      <div className="space-y-4">
        <div>
          <label htmlFor="ban-duration" className="block text-sm font-medium text-gray-700">Ban Duration</label>
          <select
            id="ban-duration"
            value={banDuration}
            onChange={(e) => setBanDuration(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md"
          >
            {banOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div>
           <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason (Optional)</label>
           <textarea
            id="reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
            placeholder={`Provide a reason for the moderation...`}
           />
        </div>
        {escalationTarget && (
            <div className="relative flex items-start">
                <div className="flex items-center h-5">
                    <input
                    id="escalate"
                    name="escalate"
                    type="checkbox"
                    checked={escalate}
                    onChange={(e) => setEscalate(e.target.checked)}
                    className="focus:ring-pink-500 h-4 w-4 text-pink-600 border-gray-300 rounded"
                    />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="escalate" className="font-medium text-gray-700">Escalate to {escalationTarget}</label>
                    <p className="text-gray-500">Flag this user for review by a higher-level {escalationTarget.toLowerCase()}.</p>
                </div>
            </div>
        )}
        <div className="flex justify-end pt-2 space-x-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleApplyModeration}>Apply Moderation</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModerateUserModal;
