
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatParticipant, ChatMessage } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import Icon from './common/Icon';
import Spinner from './common/Spinner';

const CHAT_ROOMS = [
    'Africa', 'Asia', 'Australia/Oceania', 'Europe', 'North America', 'South America', 'United Kingdom', 'USA'
];

const MOCK_PARTICIPANTS = ['Alice', 'Bob', 'Charlie', 'Diana'];

const nameToPic = (name: string) => `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`;


const ChatPlatform: React.FC = () => {
    const [activeRoom, setActiveRoom] = useState<string | null>(null);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [participants, setParticipants] = useState<ChatParticipant[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    
    const localUserVideoRef = useRef<HTMLVideoElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    const localUser: ChatParticipant | undefined = participants.find(p => p.id === 'localUser');
    
    const stopMediaStream = useCallback(() => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            setMediaStream(null);
        }
    }, [mediaStream]);

    const handleJoinRoom = async (roomName: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setMediaStream(stream);
            setActiveRoom(roomName);
            
            const localParticipant: ChatParticipant = { id: 'localUser', name: 'You', isMuted: false, isCameraOff: false, isSpeaking: false };
            const remoteParticipants: ChatParticipant[] = MOCK_PARTICIPANTS.map((name, i) => ({
                id: `remote-${i}`, name, isMuted: Math.random() > 0.8, isCameraOff: Math.random() > 0.7, isSpeaking: false
            }));
            setParticipants([localParticipant, ...remoteParticipants]);

            setChatMessages([{id: 'system-1', author: 'System', content: `Welcome to the ${roomName} study room!`}]);

        } catch (err) {
            console.error("Error accessing media devices.", err);
            setError("Could not access camera and microphone. Please check your browser permissions.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeaveRoom = useCallback(() => {
        stopMediaStream();
        setActiveRoom(null);
        setError(null);
        setParticipants([]);
        setChatMessages([]);
    }, [stopMediaStream]);
    
    const toggleMedia = (kind: 'audio' | 'video') => {
        if (!mediaStream) return;
        const tracks = kind === 'audio' ? mediaStream.getAudioTracks() : mediaStream.getVideoTracks();
        tracks.forEach(track => track.enabled = !track.enabled);
        
        setParticipants(prev => prev.map(p => {
            if (p.id === 'localUser') {
                return kind === 'audio' ? { ...p, isMuted: !p.isMuted } : { ...p, isCameraOff: !p.isCameraOff };
            }
            return p;
        }));
    };
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        
        const userMessage: ChatMessage = { id: Date.now().toString(), author: 'You', content: newMessage };
        setChatMessages(prev => [...prev, userMessage]);
        setNewMessage('');
    };
    
    useEffect(() => {
        // Scroll to bottom of chat
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

        // Bot response simulation
        if (chatMessages.length > 0 && chatMessages[chatMessages.length - 1].author === 'You') {
            const timeoutId = setTimeout(() => {
                const botMessage: ChatMessage = { id: `bot-${Date.now()}`, author: 'StudyBot', content: "That's a great point! Keep the discussion going."};
                setChatMessages(prev => [...prev, botMessage]);
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [chatMessages]);

    useEffect(() => {
        if (mediaStream && localUserVideoRef.current) {
            localUserVideoRef.current.srcObject = mediaStream;
        }
    }, [mediaStream, activeRoom]);
    
    useEffect(() => {
        return () => {
            stopMediaStream();
        };
    }, [stopMediaStream]);
    
    const ParticipantVideo: React.FC<{ participant: ChatParticipant }> = ({ participant }) => (
        <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
            {participant.id === 'localUser' && !localUser?.isCameraOff ? (
                <video ref={localUserVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (participant.isCameraOff || participant.id !== 'localUser') ? (
                 <img src={nameToPic(participant.name)} alt={participant.name} className="w-20 h-20 rounded-full"/>
            ) : (
                <div className="w-full h-full bg-black" /> // Placeholder for remote videos
            )}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded-md flex items-center gap-2">
                {participant.isMuted && <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7.5 7.5 0 01-7.5 7.5h-1a7.5 7.5 0 01-7.5-7.5V7.5a4.5 4.5 0 018.25-2.121" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9.75L18 12m0 0L20.25 9.75M18 12V3" /></svg></Icon>}
                {participant.name}
            </div>
        </div>
    );

    if (activeRoom) {
        return (
            <div className="h-full w-full flex flex-col lg:flex-row bg-gray-900 text-white">
                {/* Main Content: Video Grid and Controls */}
                <main className="flex-1 flex flex-col p-4">
                    <h2 className="text-2xl font-bold mb-4">Chat Room: <span className="text-pink-400">{activeRoom}</span></h2>
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                       {participants.map(p => <ParticipantVideo key={p.id} participant={p} />)}
                    </div>
                    {/* Controls */}
                    <div className="flex-shrink-0 flex justify-center items-center gap-4 mt-4 p-4 bg-gray-800 rounded-lg">
                        <button onClick={() => toggleMedia('audio')} className={`p-4 rounded-full transition-colors ${localUser?.isMuted ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-500'}`} aria-label={localUser?.isMuted ? "Unmute" : "Mute"}>
                            <Icon>{localUser?.isMuted ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7.5 7.5 0 01-7.5 7.5h-1a7.5 7.5 0 01-7.5-7.5V7.5a4.5 4.5 0 018.25-2.121" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9.75L18 12m0 0L20.25 9.75M18 12V3" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7.5 7.5 0 01-7.5 7.5h-1a7.5 7.5 0 01-7.5-7.5V7.5A4.5 4.5 0 019 3.375" /></svg>}</Icon>
                        </button>
                        <button onClick={() => toggleMedia('video')} className={`p-4 rounded-full transition-colors ${localUser?.isCameraOff ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-500'}`} aria-label={localUser?.isCameraOff ? "Turn camera on" : "Turn camera off"}>
                            <Icon>{localUser?.isCameraOff ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}</Icon>
                        </button>
                        <Button onClick={handleLeaveRoom} variant="secondary" className="bg-red-600 hover:bg-red-700 text-white">Leave Room</Button>
                    </div>
                </main>

                {/* Chat Sidebar/Section */}
                <aside className="w-full lg:w-80 xl:w-96 flex flex-col bg-gray-800 border-t-2 lg:border-t-0 lg:border-l-2 border-gray-700">
                    <h3 className="text-xl font-bold p-4 border-b border-gray-700">Chat</h3>
                    <div className="flex-grow p-4 overflow-y-auto space-y-4">
                        {chatMessages.map(msg => (
                             <div key={msg.id} className={`flex flex-col ${msg.author === 'You' ? 'items-end' : 'items-start'}`}>
                                <div className={`px-4 py-2 rounded-lg max-w-xs ${msg.author === 'You' ? 'bg-pink-600' : 'bg-gray-700'}`}>
                                    <p className="text-sm font-bold">{msg.author}</p>
                                    <p className="text-white text-base break-words">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-grow bg-gray-700 text-white placeholder-gray-400 rounded-lg p-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                        <Button type="submit" className="!px-4">Send</Button>
                    </form>
                </aside>
            </div>
        );
    }

    return (
        <Card className="p-6 h-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Join a Video Chat Room</h2>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            {isLoading && <div className="text-center py-4"><Spinner /></div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {CHAT_ROOMS.map(room => (
                    <button key={room} onClick={() => handleJoinRoom(room)} disabled={isLoading} className="p-6 bg-gray-100 rounded-lg hover:bg-purple-100 hover:shadow-md transition-all flex flex-col items-center justify-center text-center space-y-2">
                        <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg></Icon>
                        <span className="font-semibold text-gray-700">{room}</span>
                    </button>
                ))}
            </div>
        </Card>
    );
};

export default ChatPlatform;