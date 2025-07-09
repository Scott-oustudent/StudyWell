


import React, { useState } from 'react';
import { User, UserRole, AuditActionType, NotificationType, SubscriptionTier } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import Icon from './common/Icon';
import CreateUserModal from './common/CreateUserModal';
import ManualPaymentModal from './common/ManualPaymentModal';

interface UserManagementProps {
    currentUser: User;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    logAuditAction: (actorId: string, actorName: string, actionType: AuditActionType, details: string) => void;
    createNotification: (userId: string, message: string, type?: NotificationType, linkTo?: any) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser, users, setUsers, logAuditAction, createNotification }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [userForPayment, setUserForPayment] = useState<User | null>(null);

    const handleRoleChange = (userId: string, newRole: UserRole) => {
        const targetUser = users.find(u => u.id === userId);
        if (!targetUser) return;
        
        const isNowPremium = [UserRole.ADMIN, UserRole.MODERATOR].includes(newRole);
        
        setUsers(users.map(user => user.id === userId ? { 
            ...user, 
            role: newRole,
            subscriptionTier: isNowPremium ? SubscriptionTier.PREMIUM : SubscriptionTier.FREE
        } : user));
        
        logAuditAction(currentUser.id, currentUser.name, AuditActionType.ROLE_CHANGED, `Changed ${targetUser.name}'s role to ${newRole}.`);
        createNotification(userId, `Your role has been updated to ${newRole} by ${currentUser.name}.`, NotificationType.INFO);
    };
    
    const handleResetPassword = (userId: string) => {
        const targetUser = users.find(u => u.id === userId);
        if (!targetUser) return;
        if(window.confirm(`Are you sure you want to reset the password for ${targetUser.name}? This will require them to set a new one on their next login.`)){
             setUsers(prevUsers => prevUsers.map(user => 
                user.id === userId ? { ...user, isPasswordTemporary: true } : user
             ));
             logAuditAction(currentUser.id, currentUser.name, AuditActionType.USER_PASSWORD_RESET, `Reset password for ${targetUser.name}.`);
             createNotification(userId, `Your password has been reset by an administrator. You will be required to set a new password on your next login.`, NotificationType.WARNING);
             alert(`Password for ${targetUser.name} has been reset. They will be prompted to change it at next login.`);
        }
    };
    
    const handleResetMfa = (userId: string) => {
        const targetUser = users.find(u => u.id === userId);
        if (!targetUser) return;
        if(window.confirm(`Are you sure you want to reset MFA for ${targetUser.name}?`)){
             logAuditAction(currentUser.id, currentUser.name, AuditActionType.USER_MFA_RESET, `Reset MFA for ${targetUser.name}.`);
             createNotification(userId, `Your MFA has been reset by ${currentUser.name}.`, NotificationType.WARNING);
             alert(`MFA for ${targetUser.name} has been reset (simulated).`);
        }
    };

    const handleDeleteUser = (userId: string) => {
        const targetUser = users.find(u => u.id === userId);
        if (!targetUser) return;
        if(window.confirm(`Are you sure you want to PERMANENTLY DELETE ${targetUser.name}? This action cannot be undone.`)){
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            logAuditAction(currentUser.id, currentUser.name, AuditActionType.USER_DELETED, `Deleted user ${targetUser.name} (ID: ${targetUser.id}).`);
        }
    };
    
    const openPaymentModal = (user: User) => {
        setUserForPayment(user);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = (updatedUser: User) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }

    const roleColors: Record<UserRole, string> = {
        [UserRole.ADMIN]: 'bg-red-200 text-red-800',
        [UserRole.STAFF]: 'bg-blue-200 text-blue-800',
        [UserRole.MODERATOR]: 'bg-yellow-200 text-yellow-800',
        [UserRole.STUDENT]: 'bg-green-200 text-green-800',
    };

    const canChangeRole = (targetRole: UserRole) => {
        if (currentUser.role === UserRole.ADMIN) return true;
        if (currentUser.role === UserRole.STAFF) {
            return targetRole === UserRole.STUDENT || targetRole === UserRole.MODERATOR;
        }
        return false;
    }

    const availableRoles = Object.values(UserRole).filter(role => {
        if (currentUser.role === UserRole.ADMIN) return true;
        if (currentUser.role === UserRole.STAFF) return role === UserRole.STUDENT || role === UserRole.MODERATOR;
        return false;
    });

    return (
        <>
        <Card className="overflow-x-auto h-full flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">User Management</h2>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></Icon>
                    Create User
                </Button>
            </div>
            <div className="flex-grow overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Subscription</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        {user.id === currentUser.id || !canChangeRole(user.role) ? (
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role]}`}>
                                                {user.role}
                                            </span>
                                        ) : (
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                                className="p-1 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 text-xs"
                                            >
                                                {availableRoles.map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                        )}
                                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.subscriptionTier === SubscriptionTier.PREMIUM ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-800'}`}>
                                            {user.subscriptionTier}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center flex-wrap gap-2">
                                        <Button variant="secondary" onClick={() => openPaymentModal(user)} className="text-xs !px-2 !py-1" disabled={user.id === currentUser.id || user.subscriptionTier === SubscriptionTier.PREMIUM}>Manual Payment</Button>
                                        <Button variant="secondary" onClick={() => handleResetPassword(user.id)} className="text-xs !px-2 !py-1" disabled={user.id === currentUser.id}>Reset Pass</Button>
                                        <Button variant="secondary" onClick={() => handleResetMfa(user.id)} className="text-xs !px-2 !py-1" disabled={user.id === currentUser.id}>Reset MFA</Button>
                                        {currentUser.role === UserRole.ADMIN && (
                                            <Button variant="secondary" onClick={() => handleDeleteUser(user.id)} className="text-xs !px-2 !py-1 bg-red-100 text-red-700 hover:bg-red-200" disabled={user.id === currentUser.id}>Delete</Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
        <CreateUserModal 
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            currentUser={currentUser}
            users={users}
            setUsers={setUsers}
            logAuditAction={logAuditAction}
        />
        {userForPayment && (
            <ManualPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                userToPay={userForPayment}
                onSuccess={handlePaymentSuccess}
                logAuditAction={logAuditAction}
                createNotification={createNotification}
                actor={currentUser}
            />
        )}
        </>
    );
};

export default UserManagement;