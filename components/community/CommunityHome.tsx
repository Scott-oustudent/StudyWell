import React, { useState, useEffect } from 'react';
import ChatRoom from './ChatRoom';
import DirectMessage from './DirectMessage';
import { UserRole, FriendRequest, UserData } from '../../types';
import * as db from '../../services/databaseService';
import { getAvatarComponent } from '../../data/avatars';

type CommunityTab = 'rooms' | 'friends';

// --- FriendsList Component (nested to avoid new file) ---
const FriendsList: React.FC<{ currentUserEmail: string }> = ({ currentUserEmail }) => {
    const [friends, setFriends] = useState<UserData[]>([]);
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [allUsers, setAllUsers] = useState<UserData[]>([]);
    const [search, setSearch] = useState('');
    const [activeDM, setActiveDM] = useState<UserData | null>(null);

    const updateData = () => {
        const friendEmails = db.getFriends(currentUserEmail);
        const allDbUsers = db.getAllUsers();
        setAllUsers(allDbUsers.filter(u => u.email !== currentUserEmail));
        setFriends(allDbUsers.filter(u => friendEmails.includes(u.email)));
        setRequests(db.getFriendRequests().filter(r => r.to === currentUserEmail && r.status === 'pending'));
    };
    
    useEffect(() => {
        updateData();
    }, [currentUserEmail]);

    const handleRequestResponse = (reqId: string, accept: boolean) => {
        const req = db.getFriendRequests().find(r => r.id === reqId);
        if (!req) return;
        
        if (accept) {
            const userFriends = db.getFriends(req.to);
            const senderFriends = db.getFriends(req.from);
            db.saveFriends(req.to, [...userFriends, req.from]);
            db.saveFriends(req.from, [...senderFriends, req.to]);
        }
        
        // FIX: Explicitly define the new status to prevent TypeScript from widening the type to 'string'.
        const updatedReqs = db.getFriendRequests().map(r => {
            if (r.id === reqId) {
                const newStatus: 'accepted' | 'declined' = accept ? 'accepted' : 'declined';
                return { ...r, status: newStatus };
            }
            return r;
        });
        db.saveFriendRequests(updatedReqs);
        updateData();
    };
    
    const handleAddFriend = (email: string) => {
        const existingReq = db.getFriendRequests().find(r => (r.from === currentUserEmail && r.to === email) || (r.from === email && r.to === currentUserEmail));
        if (existingReq) {
            alert("You already have a pending request with this user.");
            return;
        }
        
        const newReq: FriendRequest = {
            id: Date.now().toString(),
            from: currentUserEmail,
            to: email,
            status: 'pending'
        };
        const allReqs = db.getFriendRequests();
        db.saveFriendRequests([...allReqs, newReq]);
        alert(`Friend request sent to ${email}`);
    };
    
    const searchResults = search.length > 1 ? allUsers.filter(u => u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) : [];

    if (activeDM) {
        return <DirectMessage recipient={activeDM} onBack={() => setActiveDM(null)} currentUserEmail={currentUserEmail} />
    }

    return (
        <div className="space-y-6">
            {/* Friend Requests */}
            {requests.length > 0 && (
                <div>
                    <h3 className="font-bold text-lg mb-2">Friend Requests</h3>
                    {requests.map(req => {
                        const sender = allUsers.find(u => u.email === req.from);
                        return (
                            <div key={req.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700/50 rounded">
                                <span>{sender?.username || req.from} wants to be your friend.</span>
                                <div>
                                    <button onClick={() => handleRequestResponse(req.id, true)} className="text-sm bg-green-500 text-white px-2 py-1 rounded mr-2">Accept</button>
                                    <button onClick={() => handleRequestResponse(req.id, false)} className="text-sm bg-red-500 text-white px-2 py-1 rounded">Decline</button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Friends List */}
            <div>
                <h3 className="font-bold text-lg mb-2">My Friends ({friends.length})</h3>
                {friends.length > 0 ? (
                    <div className="space-y-2">
                        {friends.map(friend => {
                            const Avatar = getAvatarComponent(friend.avatarId);
                            return (
                                <div key={friend.email} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                    <div className="flex items-center gap-3">
                                        {friend.profilePicture ? (
                                            <img src={friend.profilePicture} alt={friend.username} className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <Avatar className="w-8 h-8" />
                                        )}
                                        <span>{friend.username}</span>
                                    </div>
                                    <button onClick={() => setActiveDM(friend)} className="text-sm bg-blue-500 text-white px-3 py-1 rounded">Message</button>
                                </div>
                            );
                        })}
                    </div>
                ) : <p className="text-sm text-gray-500">You haven't added any friends yet.</p>}
            </div>
            
            {/* Add Friends */}
            <div>
                <h3 className="font-bold text-lg mb-2">Find Friends</h3>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by username or email" className="w-full p-2 border rounded bg-white dark:bg-gray-700" />
                <div className="mt-2 space-y-1">
                    {searchResults.map(user => {
                        const isFriend = friends.some(f => f.email === user.email);
                        if (isFriend) return null;
                        return (
                            <div key={user.email} className="flex justify-between items-center p-2">
                                <span>{user.username} ({user.email})</span>
                                <button onClick={() => handleAddFriend(user.email)} className="text-sm bg-green-500 text-white px-2 py-1 rounded">Add</button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

const CommunityHome: React.FC<{ currentUserEmail: string; currentUserRole: UserRole }> = ({ currentUserEmail, currentUserRole }) => {
    const [activeTab, setActiveTab] = useState<CommunityTab>('rooms');
    const [activeRoom, setActiveRoom] = useState<string | null>(null);
    
    const allRooms = [
        { id: 'accounting-finance', name: 'Accounting & Finance' },
        { id: 'aerospace-engineering', name: 'Aerospace Engineering' },
        { id: 'agriculture', name: 'Agriculture' },
        { id: 'anthropology', name: 'Anthropology' },
        { id: 'archaeology', name: 'Archaeology' },
        { id: 'architecture', name: 'Architecture' },
        { id: 'art-design', name: 'Art & Design' },
        { id: 'biochemistry', name: 'Biochemistry' },
        { id: 'biology', name: 'Biology' },
        { id: 'biomedical-science', name: 'Biomedical Science' },
        { id: 'business-management', name: 'Business & Management' },
        { id: 'chemical-engineering', name: 'Chemical Engineering' },
        { id: 'chemistry', name: 'Chemistry' },
        { id: 'civil-engineering', name: 'Civil Engineering' },
        { id: 'classics', name: 'Classics' },
        { id: 'computer-science', name: 'Computer Science' },
        { id: 'dentistry', name: 'Dentistry' },
        { id: 'drama-theatre', name: 'Drama & Theatre' },
        { id: 'economics', name: 'Economics' },
        { id: 'education', name: 'Education' },
        { id: 'electrical-engineering', name: 'Electrical Engineering' },
        { id: 'english-literature', name: 'English Literature' },
        { id: 'environmental-science', name: 'Environmental Science' },
        { id: 'film-studies', name: 'Film Studies' },
        { id: 'forensic-science', name: 'Forensic Science' },
        { id: 'geography', name: 'Geography' },
        { id: 'geology', name: 'Geology' },
        { id: 'history', name: 'History' },
        { id: 'hospitality-tourism', name: 'Hospitality & Tourism' },
        { id: 'journalism', name: 'Journalism' },
        { id: 'law', name: 'Law' },
        { id: 'linguistics', name: 'Linguistics' },
        { id: 'marketing', name: 'Marketing' },
        { id: 'materials-science', name: 'Materials Science' },
        { id: 'mathematics', name: 'Mathematics' },
        { id: 'mechanical-engineering', name: 'Mechanical Engineering' },
        { id: 'media-communications', name: 'Media & Communications' },
        { id: 'medicine', name: 'Medicine' },
        { id: 'modern-languages', name: 'Modern Languages' },
        { id: 'music', name: 'Music' },
        { id: 'nursing-midwifery', name: 'Nursing & Midwifery' },
        { id: 'nutrition', name: 'Nutrition' },
        { id: 'pharmacy-pharmacology', name: 'Pharmacy & Pharmacology' },
        { id: 'philosophy', name: 'Philosophy' },
        { id: 'physics-astronomy', name: 'Physics & Astronomy' },
        { id: 'physiotherapy', name: 'Physiotherapy' },
        { id: 'politics', name: 'Politics' },
        { id: 'psychology', name: 'Psychology' },
        { id: 'social-work', name: 'Social Work' },
        { id: 'sociology', name: 'Sociology' },
        { id: 'sports-science', name: 'Sports Science' },
        { id: 'veterinary-medicine', name: 'Veterinary Medicine' },
    ];
    
    const sortedRooms = allRooms.sort((a, b) => a.name.localeCompare(b.name));

    const chatRooms = [
        { id: 'common-room', name: 'Student Common Room' },
        { id: 'study-group-finder', name: 'Study Group Finder' },
        ...sortedRooms
    ];


    if (activeRoom) {
        return <ChatRoom roomId={activeRoom} roomName={chatRooms.find(r => r.id === activeRoom)?.name || 'Chat'} onBack={() => setActiveRoom(null)} currentUserEmail={currentUserEmail} currentUserRole={currentUserRole} />;
    }

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center">Community Hub</h2>
            <div className="flex justify-center border-b border-gray-200 dark:border-gray-700 mb-4">
                <button onClick={() => setActiveTab('rooms')} className={`px-4 py-2 font-semibold text-sm ${activeTab === 'rooms' ? 'border-b-2 border-green-500' : ''}`}>Chat Rooms</button>
                <button onClick={() => setActiveTab('friends')} className={`px-4 py-2 font-semibold text-sm ${activeTab === 'friends' ? 'border-b-2 border-green-500' : ''}`}>Friends & DMs</button>
            </div>

            {activeTab === 'rooms' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {chatRooms.map(room => (
                        <button key={room.id} onClick={() => setActiveRoom(room.id)} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-left w-full border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-green-700 dark:text-green-400">{room.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Join the conversation</p>
                        </button>
                    ))}
                </div>
            )}
            
            {activeTab === 'friends' && (
                <FriendsList currentUserEmail={currentUserEmail} />
            )}
        </div>
    );
};

export default CommunityHome;