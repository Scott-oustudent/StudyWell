

import React from 'react';
import { User, UserRole, AuditActionType, NotificationType } from '../types';
import UserManagement from './UserManagement';

interface AdminPanelProps {
    currentUser: User;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    logAuditAction: (actorId: string, actorName: string, actionType: AuditActionType, details: string) => void;
    createNotification: (userId: string, message: string, type?: NotificationType, linkTo?: any) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    if (props.currentUser.role !== UserRole.ADMIN) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="p-8 h-full flex flex-col">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-2">Admin Panel</h1>
            <p className="text-lg text-gray-600 mb-6">Manage all users, roles, and system settings.</p>
            <div className="flex-grow">
                 <UserManagement {...props} />
            </div>
        </div>
    );
};

export default AdminPanel;