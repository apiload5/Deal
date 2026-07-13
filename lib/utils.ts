import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPKR = (amount: number): string => {
  return `Rs ${amount.toLocaleString('en-PK')}`
}

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
  return formatDate(d)
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-')
}

export const generateWhatsAppLink = (phone: string, message: string): string => {
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}

export const generatePropertyShareLink = (propertyId: string): string => {
  return `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/property/${propertyId}`
}

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
