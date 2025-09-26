import React, { useState, useEffect } from 'react';
import * as db from '../../services/databaseService';
import { UserData, UserRole, AuditLogEntry } from '../../types';
import * as supabaseService from '../../services/supabaseService';
import ManageStudentTips from './shared/ManageStudentTips';
import { PlusIcon, TrashIcon } from '../icons/Icons';
import { avatars } from '../../data/avatars';

const AddUserModal: React.FC<{onClose: () => void, onSave: (user: Omit<UserData, 'role' | 'subscription' | 'avatarId' | 'institution'>) => boolean}> = ({ onClose, onSave }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = onSave({ email, username, password });
        if (success) {
            onClose();
        }
    }
    
    return (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Add New User</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md" required />
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md" required />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Temporary Password" className="w-full p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md" required />
                    
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 rounded-md text-white">Save User</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminDashboard: React.FC<{ currentUserEmail: string }> = ({ currentUserEmail }) => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [view, setView] = useState<'users' | 'tips' | 'logs'>('users');
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

    const refreshData = () => {
        setUsers(db.getAllUsers());
        try {
            // If Supabase is configured, try to fetch remote audit logs
            if ((import.meta.env.VITE_ENABLE_SUPABASE as any) === 'true') {
                supabaseService.getAuditLogsRemote().then((remoteLogs) => {
                    setLogs(remoteLogs.map((r: any) => ({ id: r.id || `${r.timestamp}`, timestamp: r.timestamp, actor: r.actor || '', action: r.action, details: r.details || {} } as AuditLogEntry)));
                }).catch(() => {
                    const auditLogs = JSON.parse(localStorage.getItem('auditLog') || '[]');
                    setLogs(auditLogs.sort((a: AuditLogEntry, b: AuditLogEntry) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
                });
                return;
            }
            const auditLogs = JSON.parse(localStorage.getItem('auditLog') || '[]');
            setLogs(auditLogs.sort((a: AuditLogEntry, b: AuditLogEntry) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        } catch {
            setLogs([]);
        }
    };

    useEffect(() => {
        refreshData();
    }, [view]);

    const handleRoleChange = (email: string, newRole: UserRole) => {
        const user = db.getUser(email);
        if (user) {
            db.saveUser({ ...user, role: newRole });
            refreshData();
        }
    };

    const handleDeleteUser = (email: string) => {
        if (window.confirm(`Are you sure you want to delete the user ${email}? This action cannot be undone.`)) {
            db.deleteUser(email);
            refreshData();
        }
    };

    const handleAddUser = (newUser: Omit<UserData, 'role' | 'subscription' | 'avatarId' | 'institution'>) => {
        if (db.getUser(newUser.email)) {
            alert('User with this email already exists.');
            return false;
        }
        const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
        const userToAdd: UserData = {
            ...newUser,
            institution: 'N/A', // Admin added users don't have an institution by default
            email: newUser.email.toLowerCase(),
            role: 'Student',
            subscription: { tier: 'Free' },
            avatarId: randomAvatar.id,
        };
        db.saveUser(userToAdd);
        refreshData();
        setIsAddUserModalOpen(false);
        return true;
    };

    const renderContent = () => {
        switch (view) {
            case 'users':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Manage Users</h3>
                            <button onClick={() => setIsAddUserModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1">
                                <PlusIcon className="w-4 h-4" />
                                Add User
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b dark:border-gray-700">
                                        <th className="p-2">Email</th>
                                        <th className="p-2">Username</th>
                                        <th className="p-2">Role</th>
                                        <th className="p-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.email} className="border-b dark:border-gray-700">
                                            <td className="p-2">{user.email}</td>
                                            <td className="p-2">{user.username}</td>
                                            <td className="p-2">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.email, e.target.value as UserRole)}
                                                    className="p-1 rounded bg-gray-100 dark:bg-gray-700"
                                                    disabled={user.email === currentUserEmail} // Can't change own role
                                                >
                                                    <option value="Student">Student</option>
                                                    <option value="Moderator">Moderator</option>
                                                    <option value="Staff">Staff</option>
                                                    <option value="Administrator">Administrator</option>
                                                </select>
                                            </td>
                                            <td className="p-2 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(user.email)}
                                                    disabled={user.email === currentUserEmail}
                                                    className="text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed p-1"
                                                    title={user.email === currentUserEmail ? "Cannot delete yourself" : "Delete User"}
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'tips':
                return <ManageStudentTips />;
            case 'logs':
                return (
                    <div>
                        <h3 className="text-lg font-bold mb-4">Audit Log</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {logs.map(log => (
                                <div key={log.id} className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md text-xs">
                                    <p><strong>{log.action}</strong> by <em>{log.actor}</em> at {new Date(log.timestamp).toLocaleString()}</p>
                                    <pre className="text-xs whitespace-pre-wrap"><code>{JSON.stringify(log.details, null, 2)}</code></pre>
                                </div>
                            ))}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center text-red-700 dark:text-red-400">Admin Dashboard</h2>
            <div className="flex justify-center border-b border-gray-200 dark:border-gray-700 mb-4">
                <button onClick={() => setView('users')} className={`px-4 py-2 font-semibold text-sm ${view === 'users' ? 'border-b-2 border-red-500' : ''}`}>Users</button>
                <button onClick={() => setView('tips')} className={`px-4 py-2 font-semibold text-sm ${view === 'tips' ? 'border-b-2 border-red-500' : ''}`}>Student Tips</button>
                <button onClick={() => setView('logs')} className={`px-4 py-2 font-semibold text-sm ${view === 'logs' ? 'border-b-2 border-red-500' : ''}`}>Audit Log</button>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                {renderContent()}
            </div>
            {isAddUserModalOpen && <AddUserModal onClose={() => setIsAddUserModalOpen(false)} onSave={handleAddUser} />}
        </div>
    );
};

export default AdminDashboard;