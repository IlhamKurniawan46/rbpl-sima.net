'use client';

import type { ReactNode } from 'react';

interface ActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

const VARIANT_CLASSES = {
  primary: 'bg-maroon-600 text-white hover:bg-maroon-700 active:bg-maroon-700 shadow-sm',
  secondary: 'bg-surface-alt text-text-primary hover:bg-gray-100 active:bg-gray-200 border border-border',
  outline: 'bg-transparent text-maroon-600 border-2 border-maroon-600 hover:bg-maroon-50 active:bg-maroon-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-700 shadow-sm',
  gold: 'bg-gold-400 text-maroon-800 hover:bg-gold-500 active:bg-gold-500 shadow-sm font-semibold',
};

const SIZE_CLASSES = {
  sm: 'h-9 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-11 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2',
};

export default function ActionButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium transition-all duration-200
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.97]'}
      `}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}
