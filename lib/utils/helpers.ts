import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function extractTikTokId(url: string): string | null {
  const match = url.match(/video\/(\d+)/);
  return match ? match[1] : null;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function formatPhoneNumber(phone: string): string {
  // Format for WhatsApp: 92XXXXXXXXXX
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('92')) return cleaned;
  if (cleaned.startsWith('0')) return '92' + cleaned.slice(1);
  return '92' + cleaned;
}

export function isPremiumActive(premiumUntil: string | null): boolean {
  if (!premiumUntil) return false;
  return new Date(premiumUntil) > new Date();
}
