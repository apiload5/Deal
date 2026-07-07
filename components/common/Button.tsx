'use client'

import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  onClick,
  type = 'button',
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-300 cursor-pointer'
  
  const variantStyles = {
    primary: 'bg-gradient-primary text-white hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/20 disabled:opacity-50',
    ghost: 'hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  )
}
