import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-200 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark',
    outline: 'border-2 border-primary bg-transparent hover:bg-primary text-primary hover:text-white',
    ghost: 'bg-transparent hover:bg-primary/10 text-primary',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm rounded-md',
    md: 'h-10 px-4 py-2 rounded-lg',
    lg: 'h-12 px-8 text-lg rounded-lg',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
