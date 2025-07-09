import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({ children, onClick, disabled = false, className = '', variant = 'primary', type = 'button' }) => {
  const baseStyles = 'px-6 py-3 font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300';
  
  const variantStyles = {
    primary: 'text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg disabled:bg-gray-400 disabled:bg-gradient-none disabled:cursor-not-allowed focus:ring-pink-500 bg-[length:200%_auto] hover:animate-background-pan',
    secondary: 'text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed focus:ring-gray-400',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;