import React, { useState } from 'react';
import { User, StaffMessage } from '../types';
import Card from './common/Card';
import Button from './common/Button';

interface ContactStaffProps {
  currentUser: User;
  addStaffMessage: (message: Omit<StaffMessage, 'id' | 'createdAt'>) => void;
}

const ContactStaff: React.FC<ContactStaffProps> = ({ currentUser, addStaffMessage }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      setError('Please fill out both the subject and message fields.');
      return;
    }
    setError('');
    
    addStaffMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      subject,
      body,
      isRead: false,
    });

    setSuccess(true);
    setSubject('');
    setBody('');
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="p-8 h-full flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-2">Contact Staff</h1>
        <p className="text-lg text-gray-600 mb-6">Have a question or concern? Send a message to our staff team.</p>

        <Card className="p-8">
          {success ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-600">Message Sent!</h2>
              <p className="text-gray-700 mt-2">Thank you for reaching out. A staff member will review your message shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500"
                  placeholder="e.g., Question about forum rules"
                  required
                />
              </div>
              <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  id="body"
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500"
                  placeholder="Please describe your question or concern in detail..."
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="text-right">
                <Button type="submit">Send Message</Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ContactStaff;