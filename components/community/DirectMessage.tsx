import React, { useState, useEffect, useRef } from 'react';
import { DirectMessage as DMType, UserData } from '../../types';
import * as db from '../../services/databaseService';
import { ChevronLeftIcon } from '../icons/Icons';
import { getAvatarComponent } from '../../data/avatars';

interface DirectMessageProps {
    recipient: UserData;
    onBack: () => void;
    currentUserEmail: string;
}

const DirectMessage: React.FC<DirectMessageProps> = ({ recipient, onBack, currentUserEmail }) => {
    const [messages, setMessages] = useState<DMType[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentUser = db.getUser(currentUserEmail);

    const fetchMessages = () => {
        const allDMs = db.getDirectMessages();
        const conversation = allDMs.filter(dm => 
            (dm.senderEmail === currentUserEmail && dm.recipientEmail === recipient.email) ||
            (dm.senderEmail === recipient.email && dm.recipientEmail === currentUserEmail)
        );
        setMessages(conversation.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [currentUserEmail, recipient.email]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;
        
        const message: DMType = {
            id: Date.now().toString(),
            senderEmail: currentUserEmail,
            recipientEmail: recipient.email,
            text: newMessage,
            timestamp: new Date(),
            read: false,
        };
        db.saveDirectMessage(message);
        fetchMessages();
        setNewMessage('');
    };

    const UserAvatar = getAvatarComponent(currentUser?.avatarId);
    const RecipientAvatar = getAvatarComponent(recipient.avatarId);

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <button onClick={onBack} className="mr-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                    {recipient.profilePicture ? (
                        <img src={recipient.profilePicture} alt={recipient.username} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <RecipientAvatar className="w-8 h-8 rounded-full" />
                    )}
                    <h2 className="text-xl font-bold">{recipient.username}</h2>
                </div>
            </header>

            <main className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map(msg => {
                    const isCurrentUser = msg.senderEmail === currentUserEmail;
                    const sender = isCurrentUser ? currentUser : recipient;
                    const Avatar = isCurrentUser ? UserAvatar : RecipientAvatar;
                    return (
                        <div key={msg.id} className={`flex items-start gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                            {sender?.profilePicture ? (
                                <img src={sender.profilePicture} alt={sender.username} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                            ) : (
                                <Avatar className="w-8 h-8 rounded-full flex-shrink-0" />
                            )}
                            <div className={`p-3 rounded-lg max-w-lg ${isCurrentUser ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    );
                })}
                 <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Message ${recipient.username}...`}
                        className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">Send</button>
                </form>
            </footer>
        </div>
    );
};

export default DirectMessage;