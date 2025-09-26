import React, { useMemo } from 'react';
// FIX: Import Section from types.ts to break circular dependency with App.tsx.
import { Section, UserRole } from '../types';
import { BookOpenIcon, HeartIcon, UsersIcon, UserCircleIcon, ShieldCheckIcon, MagnifyingGlassIcon } from './icons/Icons';

interface BottomNavProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  role: UserRole;
  onSearchClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeSection, setActiveSection, role, onSearchClick }) => {
  const navItems = useMemo(() => {
    const baseItems = [
      { id: 'tools', label: 'Tools', icon: BookOpenIcon, action: () => setActiveSection('tools') },
      { id: 'wellness', label: 'Wellness', icon: HeartIcon, action: () => setActiveSection('wellness') },
      { id: 'search', label: 'Search', icon: MagnifyingGlassIcon, action: onSearchClick },
      { id: 'community', label: 'Community', icon: UsersIcon, action: () => setActiveSection('community') },
      { id: 'profile', label: 'Profile', icon: UserCircleIcon, action: () => setActiveSection('profile') },
    ];

    const adminItems = [];
    if (role === 'Administrator') {
        adminItems.push({ id: 'admin', label: 'Admin', icon: ShieldCheckIcon, action: () => setActiveSection('admin') });
    }
    if (['Administrator', 'Staff'].includes(role)) {
        adminItems.push({ id: 'staff', label: 'Staff', icon: ShieldCheckIcon, action: () => setActiveSection('staff') });
    }
    if (['Administrator', 'Staff', 'Moderator'].includes(role)) {
        adminItems.push({ id: 'moderator', label: 'Moderator', icon: ShieldCheckIcon, action: () => setActiveSection('moderator') });
    }
    
    const uniqueAdminItems = adminItems.filter((item, index, self) => 
        index === self.findIndex((t) => t.id === item.id)
    );
    
    // In this setup, we replace base items with admin items if they exist
    // A more sophisticated logic could be used if needed. For now, let's keep it simple.
    // We will just show the admin items first.
    return [...uniqueAdminItems, ...baseItems.filter(item => !uniqueAdminItems.some(adminItem => adminItem.id === item.id))];
  }, [role, setActiveSection, onSearchClick]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 shadow-lg flex justify-around p-2 z-20">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={item.action}
          className={`flex flex-col items-center justify-center w-20 p-2 rounded-lg transition-colors duration-200 ${
            activeSection === item.id ? 'bg-blue-500/10 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          aria-label={item.label}
        >
          <item.icon className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;