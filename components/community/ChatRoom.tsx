import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, UserRole } from '../../types';
import * as db from '../../services/databaseService';
import { ChevronLeftIcon, FlagIcon } from '../icons/Icons';
import { getAvatarComponent } from '../../data/avatars';
import { logAction } from '../../services/loggingService';

interface ChatRoomProps {
    roomId: string;
    roomName: string;
    onBack: () => void;
    currentUserEmail: string;
    currentUserRole: UserRole;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, roomName, onBack, currentUserEmail, currentUserRole }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentUser = db.getUser(currentUserEmail);

    const isModerator = ['Moderator', 'Staff', 'Administrator'].includes(currentUserRole);

    const fetchMessages = () => {
        const allMessages = db.getChatMessages();
        setMessages(allMessages.filter(m => m.roomId === roomId));
    };
    
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll for new messages
        return () => clearInterval(interval);
    }, [roomId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        const message: ChatMessage = {
            id: Date.now().toString(),
            roomId,
            senderEmail: currentUser.email,
            senderUsername: currentUser.username,
            senderAvatarId: currentUser.avatarId,
            senderProfilePicture: currentUser.profilePicture,
            text: newMessage,
            timestamp: new Date(),
        };

        const allMessages = db.getChatMessages();
        db.saveChatMessages([...allMessages, message]);
        fetchMessages(); // Immediately update UI
        setNewMessage('');
    };

    const handleFlagMessage = (messageId: string) => {
        if (!window.confirm("Are you sure you want to flag this message for moderator review?")) return;
        
        const allMessages = db.getChatMessages();
        const updatedMessages = allMessages.map(m => m.id === messageId ? { ...m, isFlagged: true } : m);
        db.saveChatMessages(updatedMessages);
        fetchMessages();
        logAction(currentUserEmail, 'FLAG_MESSAGE', { messageId, roomId });
        alert("Message flagged. A moderator will review it shortly.");
    };

    const handleDeleteMessage = (messageId: string) => {
        if (!isModerator || !window.confirm("Are you sure you want to delete this message? This action is permanent.")) return;
        
        const allMessages = db.getChatMessages();
        const updatedMessages = allMessages.filter(m => m.id !== messageId);
        db.saveChatMessages(updatedMessages);
        fetchMessages();
        logAction(currentUserEmail, 'DELETE_CHAT_MESSAGE', { messageId, roomId });
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <button onClick={onBack} className="mr-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">{roomName}</h2>
            </header>

            <main className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map(msg => {
                    const isCurrentUser = msg.senderEmail === currentUserEmail;
                    const Avatar = getAvatarComponent(msg.senderAvatarId);
                    return (
                        <div key={msg.id} className={`flex items-start gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                            {msg.senderProfilePicture ? (
                                <img src={msg.senderProfilePicture} alt={msg.senderUsername} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                            ) : (
                                <Avatar className="w-10 h-10 rounded-full flex-shrink-0" />
                            )}
                            <div className={`p-3 rounded-lg max-w-lg ${isCurrentUser ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                {!isCurrentUser && <p className="font-bold text-sm mb-1">{msg.senderUsername}</p>}
                                <p className="text-sm">{msg.text}</p>
                                <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                {msg.isFlagged && <span className="text-xs text-yellow-500 font-bold block mt-1">FLAGGED FOR REVIEW</span>}
                            </div>
                            <div className="group relative">
                                {!isCurrentUser && (
                                    <button onClick={() => handleFlagMessage(msg.id)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FlagIcon className="w-4 h-4 text-gray-500 hover:text-red-500" />
                                    </button>
                                )}
                                {isModerator && (
                                    <button onClick={() => handleDeleteMessage(msg.id)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-red-500">
                                        Delete
                                    </button>
                                )}
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
                        placeholder="Type a message..."
                        className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">Send</button>
                </form>
            </footer>
        </div>
    );
};

export default ChatRoom;