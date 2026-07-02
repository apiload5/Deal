// components/WhatsAppButton.tsx
'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WhatsAppButtonProps {
  phoneNumber: string
  propertyTitle: string
}

export function WhatsAppButton({ phoneNumber, propertyTitle }: WhatsAppButtonProps) {
  // Format phone number for Pakistan (+92)
  const formattedPhone = phoneNumber.startsWith('92') ? phoneNumber : `92${phoneNumber}`
  const message = encodeURIComponent(`Hi, I am interested in ${propertyTitle} on deal.online`)
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-button fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8"
    >
      <Button
        size="lg"
        className="bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg rounded-full p-4 h-14 w-14"
      >
        <MessageCircle className="h-7 w-7" />
        <span className="sr-only">Chat on WhatsApp</span>
      </Button>
    </a>
  )
}
