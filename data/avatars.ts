import React from 'react';
import { 
    AvatarIcon1, 
    AvatarIcon2, 
    AvatarIcon3, 
    AvatarIcon4, 
    AvatarIcon5, 
    AvatarIcon6,
    UserCircleIcon
} from '../components/icons/Icons';

export type Avatar = {
    id: string;
    component: React.FC<React.SVGProps<SVGSVGElement>>;
};

export const avatars: Avatar[] = [
    { id: 'avatar1', component: AvatarIcon1 },
    { id: 'avatar2', component: AvatarIcon2 },
    { id: 'avatar3', component: AvatarIcon3 },
    { id: 'avatar4', component: AvatarIcon4 },
    { id: 'avatar5', component: AvatarIcon5 },
    { id: 'avatar6', component: AvatarIcon6 },
];

const avatarMap = new Map(avatars.map(a => [a.id, a.component]));

export const getAvatarComponent = (avatarId?: string): React.FC<React.SVGProps<SVGSVGElement>> => {
    return (avatarId && avatarMap.get(avatarId)) || UserCircleIcon;
};
