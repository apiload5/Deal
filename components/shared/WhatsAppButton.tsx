// components/shared/WhatsAppButton.tsx
"use client"

import { Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WhatsAppButtonProps {
  phoneNumber: string
  className?: string
}

export function WhatsAppButton({ phoneNumber, className = "" }: WhatsAppButtonProps) {
  const handleClick = () => {
    // Remove any non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, "")
    const url = `https://wa.me/92${cleanNumber}`
    window.open(url, "_blank")
  }

  return (
    <Button
      onClick={handleClick}
      className={`bg-green-500 hover:bg-green-600 text-white shadow-lg ${className}`}
    >
      <Phone className="h-4 w-4 mr-2" />
      Contact on WhatsApp
    </Button>
  )
}
