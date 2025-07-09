
import React, { useState } from 'react';
import { User, AppView, AuditActionType } from '../types';
import Button from './common/Button';
import Card from './common/Card';

interface ForcePasswordChangeProps {
  currentUser: User;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  navigateTo: (view: AppView) => void;
  logAuditAction: (actorId: string, actorName: string, actionType: AuditActionType, details: string) => void;
}

const ForcePasswordChange: React.FC<ForcePasswordChangeProps> = ({ currentUser, setUsers, navigateTo, logAuditAction }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');

    // Update user state, removing the temporary flag
    setUsers(prevUsers =>
      prevUsers.map(user => {
        if (user.id === currentUser.id) {
          const { isPasswordTemporary, ...rest } = user;
          return rest as User;
        }
        return user;
      })
    );

    logAuditAction(currentUser.id, currentUser.name, AuditActionType.PASSWORD_CHANGED, 'User successfully changed their temporary password.');

    // Navigate to the dashboard
    navigateTo(AppView.DASHBOARD);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-sky-100 font-sans">
      <div className="w-full max-w-md p-4">
        <div className="flex justify-center items-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-pink-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 00.788 1.84L10 5.382l6.606 2.038a1 1 0 00.788-1.84l-7-3.5zM3 9.382L10 12l7-2.618v5.236a1 1 0 01-1 1H4a1 1 0 01-1-1V9.382zM10 15a1 1 0 001 1h5a1 1 0 100-2h-5a1 1 0 00-1 1z" />
            </svg>
            <h1 className="text-4xl font-bold ml-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">StudyWell</h1>
        </div>
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Create a New Password
          </h2>
          <p className="text-center text-gray-600 mb-8">
            For your security, you must create a new password to continue.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2" htmlFor="new-password">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2" htmlFor="confirm-password">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>
            {error && <p className="text-red-500 text-center mb-4" role="alert">{error}</p>}
            <Button type="submit" className="w-full">
              Set New Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ForcePasswordChange;
