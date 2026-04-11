'use client'

import { MessageCircle } from 'lucide-react'

const FACEBOOK_URL = 'https://www.facebook.com/cyberasfe.panvila'

export default function ContactAdmin() {
  return (
    <a
      href={FACEBOOK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
      style={{ boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)' }}
    >
      <MessageCircle className="w-5 h-5" />
      <span className="text-sm font-medium whitespace-nowrap">ติดต่อแอดมินด่วน</span>
    </a>
  )
}
