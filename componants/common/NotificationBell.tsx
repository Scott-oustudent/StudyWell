
import React, { useState, useRef, useEffect } from 'react';
import { Notification, AppView } from '../../types';
import Icon from './Icon';

interface NotificationBellProps {
  notifications: Notification[];
  userId: string;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  navigateTo: (view: AppView) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, userId, setNotifications, navigateTo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userNotifications = notifications
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };
  
  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    if (notification.linkTo) {
        navigateTo(notification.linkTo);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none"
        aria-label="View notifications"
      >
        <Icon>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </Icon>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-gray-800" />
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
          <div className="p-2 font-bold text-gray-800 border-b">Notifications</div>
          <div className="max-h-96 overflow-y-auto">
            {userNotifications.length > 0 ? (
              userNotifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 border-l-4 cursor-pointer hover:bg-gray-100 ${
                    n.isRead ? 'border-transparent' : 'border-pink-500 bg-pink-50'
                  }`}
                >
                  <p className="text-sm text-gray-700">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-center text-gray-500">You have no notifications.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
