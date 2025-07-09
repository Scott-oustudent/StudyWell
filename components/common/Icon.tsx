
import React from 'react';

interface IconProps {
  children: React.ReactNode;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ children, className }) => {
  return (
    <span className={className}>
      {children}
    </span>
  );
};

export default Icon;
