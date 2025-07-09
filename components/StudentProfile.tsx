

import React, { useState } from 'react';
import { User } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import Icon from './common/Icon';
import EditProfileModal from './common/EditProfileModal';

interface StudentProfileProps {
  currentUser: User;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const ProfileField: React.FC<{ label: string; value?: string; children?: React.ReactNode }> = ({ label, value, children }) => (
  <div>
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{label}</h3>
    {value ? <p className="text-lg text-gray-800 mt-1">{value}</p> : children}
  </div>
);

const StudentProfile: React.FC<StudentProfileProps> = ({ currentUser, setUsers }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const handleSaveProfile = (updatedData: Partial<User>) => {
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === currentUser.id ? { ...user, ...updatedData } : user
            )
        );
        setIsEditModalOpen(false);
    };

    return (
      <>
        <div className="p-8 h-full">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-6">My Profile</h1>
            <Card className="p-8 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 flex flex-col items-center text-center">
                        <img 
                            src={currentUser.profilePicture || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`} 
                            alt={`${currentUser.name}'s profile picture`}
                            className="w-40 h-40 rounded-full object-cover ring-4 ring-purple-200 shadow-lg"
                            onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`; }}
                        />
                        <h2 className="text-3xl font-bold text-gray-800 mt-4">{currentUser.name}</h2>
                        <p className="text-gray-600">{currentUser.institution}</p>
                        <p className="text-sm text-gray-500 mt-1">{currentUser.email}</p>
                        <Button onClick={() => setIsEditModalOpen(true)} className="mt-6 w-full">
                            <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></Icon>
                            Edit Profile
                        </Button>
                    </div>
                    <div className="md:col-span-2 space-y-6 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-8">
                        <ProfileField label="About Me" value={currentUser.aboutMe || 'No bio yet.'} />
                        <ProfileField label="Subject" value={currentUser.subject || 'Not specified.'} />
                        <ProfileField label="Hobbies & Interests">
                            {currentUser.hobbies ? (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {currentUser.hobbies.split(',').map(hobby => hobby.trim()).filter(Boolean).map(hobby => (
                                        <span key={hobby} className="bg-pink-100 text-pink-800 text-sm font-medium px-3 py-1 rounded-full">{hobby}</span>
                                    ))}
                                </div>
                            ) : <p className="text-lg text-gray-800 mt-1">No hobbies listed.</p>}
                        </ProfileField>
                    </div>
                </div>
            </Card>
        </div>
        <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveProfile}
            userToEdit={currentUser}
        />
      </>
    );
};

export default StudentProfile;
