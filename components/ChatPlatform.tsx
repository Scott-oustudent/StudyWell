import React, { useState, useRef, useEffect } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import Icon from './common/Icon';
import Spinner from './common/Spinner';

const CHAT_ROOMS = [
    'Africa', 'Asia', 'Australia/Oceania', 'Europe', 'North America', 'South America', 'United Kingdom', 'USA'
];

const ChatPlatform: React.FC = () => {
    const [activeRoom, setActiveRoom] = useState<string | null>(null);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (mediaStream && videoRef.current) {
            videoRef.current.srcObject = mediaStream;
        }
    }, [mediaStream]);
    
    const stopMediaStream = () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            setMediaStream(null);
        }
    };

    const handleJoinRoom = async (roomName: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setMediaStream(stream);
            setActiveRoom(roomName);
        } catch (err) {
            console.error("Error accessing media devices.", err);
            setError("Could not access camera and microphone. Please check your browser permissions.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeaveRoom = () => {
        stopMediaStream();
        setActiveRoom(null);
        setError(null);
        setIsMuted(false);
        setIsCameraOff(false);
    };
    
    const toggleMute = () => {
        if (!mediaStream) return;
        mediaStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
        setIsMuted(!isMuted);
    };

    const toggleCamera = () => {
        if (!mediaStream) return;
        mediaStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
        setIsCameraOff(!isCameraOff);
    };
    
    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            stopMediaStream();
        };
    }, []);

    if (activeRoom) {
        return (
            <Card className="p-4 h-full flex flex-col bg-gray-900 text-white">
                <h2 className="text-2xl font-bold mb-4">Chat Room: <span className="text-pink-400">{activeRoom}</span></h2>
                <div className="flex-grow bg-black rounded-lg relative flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain rounded-lg" />
                    {isCameraOff && (
                        <div className="absolute flex flex-col items-center text-gray-400">
                             <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></Icon>
                             <p className="mt-2 text-lg">Camera is off</p>
                        </div>
                    )}
                </div>
                <div className="flex justify-center items-center gap-4 mt-4 p-4 bg-gray-800 rounded-lg">
                    <button onClick={toggleMute} className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-500'}`} aria-label={isMuted ? "Unmute" : "Mute"}>
                        <Icon>{isMuted ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7.5 7.5 0 01-7.5 7.5h-1a7.5 7.5 0 01-7.5-7.5V7.5a4.5 4.5 0 018.25-2.121" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9.75L18 12m0 0L20.25 9.75M18 12V3" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7.5 7.5 0 01-7.5 7.5h-1a7.5 7.5 0 01-7.5-7.5V7.5A4.5 4.5 0 019 3.375" /></svg>}</Icon>
                    </button>
                    <button onClick={toggleCamera} className={`p-4 rounded-full transition-colors ${isCameraOff ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-500'}`} aria-label={isCameraOff ? "Turn camera on" : "Turn camera off"}>
                        <Icon>{isCameraOff ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}</Icon>
                    </button>
                    <Button onClick={handleLeaveRoom} variant="secondary" className="bg-red-600 hover:bg-red-700 text-white">Leave Room</Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 h-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Join a Video Chat Room</h2>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            {isLoading && <div className="text-center py-4"><Spinner /></div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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