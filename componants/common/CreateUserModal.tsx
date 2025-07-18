


import React, { useState, useMemo } from 'react';
import { User, UserRole, AuditActionType, SubscriptionTier } from '../../types';
import Modal from './Modal';
import Button from './Button';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  logAuditAction: (actorId: string, actorName: string, actionType: AuditActionType, details: string) => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, currentUser, users, setUsers, logAuditAction }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [error, setError] = useState('');

  const ACADEMIC_EMAIL_REGEX = /\.(ac\.[a-z]{2}|edu(\.[a-z]{2})?)$/i;

  const availableRoles = useMemo(() => {
    if (currentUser.role === UserRole.ADMIN) {
      return Object.values(UserRole);
    }
    if (currentUser.role === UserRole.STAFF) {
      return [UserRole.STUDENT, UserRole.MODERATOR];
    }
    return [];
  }, [currentUser.role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !institution.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (!ACADEMIC_EMAIL_REGEX.test(email)) {
        setError('Please provide a valid university or college email address.');
        return;
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        setError('An account with this email already exists.');
        return;
    }
    
    setError('');
    
    const subscriptionTier = [UserRole.ADMIN, UserRole.MODERATOR].includes(role) 
      ? SubscriptionTier.PREMIUM 
      : SubscriptionTier.FREE;

    const newUser: User = {
      id: String(Date.now()),
      name,
      email,
      institution,
      role,
      subscriptionTier: subscriptionTier,
      profilePicture: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`,
      aboutMe: '',
      subject: '',
      hobbies: '',
      customerId: `cus_mock_${Date.now()}`
    };

    setUsers(prev => [...prev, newUser]);
    logAuditAction(currentUser.id, currentUser.name, AuditActionType.USER_CREATED, `Created new user ${name} (${email}) with role ${role}.`);

    handleClose();
  };
  
  const handleClose = () => {
    setName('');
    setEmail('');
    setInstitution('');
    setRole(UserRole.STUDENT);
    setError('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New User">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="create-name" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            id="create-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="create-email" className="block text-sm font-medium text-gray-700">Academic Email</label>
          <input
            id="create-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="create-institution" className="block text-sm font-medium text-gray-700">Institution</label>
          <input
            id="create-institution"
            type="text"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="create-role" className="block text-sm font-medium text-gray-700">Role</label>
          <select
            id="create-role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
          >
            {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end pt-4 space-x-2">
          <Button variant="secondary" type="button" onClick={handleClose}>Cancel</Button>
          <Button type="submit">Create User</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUserModal;