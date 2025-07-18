
import React from 'react';
import { User } from '../../types';
import Modal from './Modal';
import Button from './Button';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userToReset: User;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose, onConfirm, userToReset }) => {
  if (!isOpen) return null;

  const handleConfirmClick = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reset Password for ${userToReset.name}`}>
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to reset the password for{' '}
          <strong className="text-gray-900">{userToReset.name} ({userToReset.email})</strong>?
        </p>
        <p className="text-sm text-yellow-700 bg-yellow-100 p-3 rounded-md">
          This action will force the user to set a new password the next time they log in. They will receive a notification about this change.
        </p>
        <div className="flex justify-end pt-4 space-x-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirmClick}>
            Confirm Reset
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ResetPasswordModal;
