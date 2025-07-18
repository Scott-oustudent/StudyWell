
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  const baseClasses = 'bg-white rounded-xl shadow-md overflow-hidden';
  const interactiveClasses = onClick ? 'transition-transform duration-300 hover:scale-105 hover:shadow-lg cursor-pointer' : '';

  return (
    <div className={`${baseClasses} ${interactiveClasses} ${className || ''}`} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
