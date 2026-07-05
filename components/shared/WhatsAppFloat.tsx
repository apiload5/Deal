// components/shared/WhatsAppFloat.tsx
"use client"

import { Phone } from 'lucide-react'

export function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/923001234567"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
      aria-label="Contact us on WhatsApp"
    >
      <Phone className="h-6 w-6" />
    </a>
  )
}
