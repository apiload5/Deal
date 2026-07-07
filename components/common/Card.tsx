'use client'

import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  interactive?: boolean
}

export function Card({ children, className = '', interactive = false }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
        interactive ? 'hover:shadow-xl hover:scale-105 hover:-translate-y-2 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
