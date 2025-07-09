



import React from 'react';
import { AppView, User, UserRole, NavigationItem, Notification, SubscriptionTier } from '../types';
import { STUDENT_TOOLS_ITEMS, CONNECT_THRIVE_ITEMS, STAFF_ITEMS, ADMIN_ITEMS, UPGRADE_ITEM } from '../constants';
import Icon from './common/Icon';
import NotificationBell from './common/NotificationBell';

interface SidebarProps {
  currentUser: User;
  activeView: AppView;
  navigateTo: (view: AppView) => void;
  onLogout: () => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const NavLink: React.FC<{
  item: NavigationItem;
  activeView: AppView;
  navigateTo: (view: AppView) => void;
  className?: string;
}> = ({ item, activeView, navigateTo, className = '' }) => (
  <li className={`px-4 py-1 ${className}`}>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        navigateTo(item.view);
      }}
      className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
        activeView === item.view
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {item.icon}
      <span className="ml-4 font-medium">{item.label}</span>
    </a>
  </li>
);


const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeView, navigateTo, onLogout, notifications, setNotifications }) => {
  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          navigateTo(AppView.DASHBOARD);
        }}
        className="p-6 flex items-center justify-center transition-colors hover:bg-gray-700"
        aria-label="Go to dashboard"
      >
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          StudyWell
        </h1>
      </a>
      <nav className="mt-4 flex-1 space-y-6">
        <div>
          <h3 className="px-7 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Student Tools
          </h3>
          <ul>
            {STUDENT_TOOLS_ITEMS.map((item) => (
              <NavLink key={item.view} item={item} activeView={activeView} navigateTo={navigateTo} />
            ))}
          </ul>
        </div>
        <div>
          <h3 className="px-7 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Connect & Thrive
          </h3>
          <ul>
            {CONNECT_THRIVE_ITEMS.map((item) => (
              <NavLink key={item.view} item={item} activeView={activeView} navigateTo={navigateTo} />
            ))}
          </ul>
        </div>
        
        {[UserRole.STAFF, UserRole.ADMIN].includes(currentUser.role) && (
           <div>
            <h3 className="px-7 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Staff
            </h3>
            <ul>
              {STAFF_ITEMS.map((item) => (
                <NavLink key={item.view} item={item} activeView={activeView} navigateTo={navigateTo} />
              ))}
            </ul>
          </div>
        )}

        {currentUser.role === UserRole.ADMIN && (
           <div>
            <h3 className="px-7 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Admin
            </h3>
            <ul>
              {ADMIN_ITEMS.map((item) => (
                <NavLink key={item.view} item={item} activeView={activeView} navigateTo={navigateTo} />
              ))}
            </ul>
          </div>
        )}

      </nav>
      <div className="p-4 border-t border-gray-700">
        {currentUser.subscriptionTier === SubscriptionTier.FREE && (
             <NavLink
                item={UPGRADE_ITEM}
                activeView={activeView}
                navigateTo={navigateTo}
                className="!p-0 mb-2"
            />
        )}
        <div className="flex justify-between items-center px-3 py-2">
            <div>
              <div className="flex items-center gap-2">
                 <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                 {currentUser.subscriptionTier === SubscriptionTier.PREMIUM && (
                    <span className="text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-2 py-0.5 rounded-full">PREMIUM</span>
                 )}
              </div>
              <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
            </div>
            <NotificationBell 
              notifications={notifications}
              userId={currentUser.id}
              setNotifications={setNotifications}
              navigateTo={navigateTo}
            />
        </div>
        <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onLogout();
            }}
            className="flex items-center p-3 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-red-600 hover:text-white mt-2"
            aria-label="Logout"
          >
            <Icon>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </Icon>
            <span className="ml-4 font-medium">Logout</span>
          </a>
      </div>
      <div className="p-4 pt-0 text-xs text-gray-400 flex justify-between items-center">
        <span>&copy; 2024 StudyWell</span>
        <a href="#" onClick={(e) => {e.preventDefault(); navigateTo(AppView.LEGAL);}} className="hover:text-white transition-colors">Policies & Terms</a>
      </div>
    </div>
  );
};

export default Sidebar;