
import React, { useState, useEffect } from 'react';
import { StaffMessage } from '../../types';
import Modal from './Modal';
import Button from './Button';

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: StaffMessage;
  onSendReply: (messageId: string, replyBody: string) => void;
}

const ReplyModal: React.FC<ReplyModalProps> = ({ isOpen, onClose, message, onSendReply }) => {
  const [replyBody, setReplyBody] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setReplyBody(''); // Reset when modal is closed or message changes
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!replyBody.trim()) {
      alert("Reply cannot be empty.");
      return;
    }
    onSendReply(message.id, replyBody);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reply to ${message.senderName}`}>
      <div className="space-y-4">
        <div className="bg-gray-100 p-3 rounded-md border border-gray-200 max-h-48 overflow-y-auto">
          <p className="font-semibold text-gray-800">Original Message</p>
          <p className="text-sm font-bold text-gray-700 mt-1">Subject: {message.subject}</p>
          <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap font-sans">{message.body}</p>
        </div>
        <div>
          <label htmlFor="reply-body" className="block text-sm font-medium text-gray-700">Your Reply</label>
          <textarea
            id="reply-body"
            rows={6}
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500"
            placeholder="Type your reply here..."
          />
        </div>
        <div className="flex justify-end pt-2 space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSend} disabled={!replyBody.trim()}>Send Reply</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReplyModal;
