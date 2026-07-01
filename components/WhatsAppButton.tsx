'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';

interface WhatsAppProps {
  phone: string;
  title: string;
}

export default function WhatsAppButton({ phone, title }: WhatsAppProps) {
  const formattedPhone = phone.replace(/\D/g, '');
  const baseText = `Assalam o Alaikum, I am interested in your property "${title}" listed on deal.pk. Please share details.`;
  const link = `https://wa.me/92${formattedPhone.replace(/^92|^0/, '')}?text=${encodeURIComponent(baseText)}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur md:bg-transparent md:p-0 md:static border-t md:border-none z-50">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full md:w-auto flex items-center justify-center gap-2.5 bg-emerald-600 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg hover:bg-emerald-700 transition transform active:scale-98 text-center"
      >
        <MessageSquare className="w-5 h-5 fill-current" />
        Contact via WhatsApp
      </a>
    </div>
  );
}
