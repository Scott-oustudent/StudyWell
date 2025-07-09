

import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import Modal from './Modal';
import Button from './Button';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: Partial<User>) => void;
  userToEdit: User;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
  const [formData, setFormData] = useState({
    profilePicture: '',
    aboutMe: '',
    subject: '',
    hobbies: '',
  });

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        profilePicture: userToEdit.profilePicture || '',
        aboutMe: userToEdit.aboutMe || '',
        subject: userToEdit.subject || '',
        hobbies: userToEdit.hobbies || '',
      });
    }
  }, [userToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Profile">
      <div className="space-y-4">
        <div>
          <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">Profile Picture URL</label>
          <input
            type="text"
            id="profilePicture"
            name="profilePicture"
            value={formData.profilePicture}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="https://example.com/your-image.png"
          />
        </div>
        <div>
          <label htmlFor="aboutMe" className="block text-sm font-medium text-gray-700">About Me</label>
          <textarea
            id="aboutMe"
            name="aboutMe"
            rows={4}
            value={formData.aboutMe}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="Tell us a little about yourself..."
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject / Major</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="e.g., Computer Science, History, Medicine"
          />
        </div>
        <div>
          <label htmlFor="hobbies" className="block text-sm font-medium text-gray-700">Hobbies & Interests</label>
          <input
            type="text"
            id="hobbies"
            name="hobbies"
            value={formData.hobbies}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="e.g., Reading, Hiking, Coding (comma-separated)"
          />
           <p className="text-xs text-gray-500 mt-1">Separate different hobbies with a comma.</p>
        </div>
        <div className="flex justify-end pt-4 space-x-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditProfileModal;
