'use client'

import Link from 'next/link'
import { Wifi, ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Wifi className="w-10 h-10 text-white" />
        </div>
        
        {/* Error Code */}
        <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          404
        </h1>
        
        {/* Message */}
        <h2 className="text-xl font-semibold mb-4">ไม่พบหน้าที่คุณต้องการ</h2>
        <p className="text-gray-400 mb-8">
          ลิงก์ที่คุณเข้าอาจมีปัญหาหรือหน้านี้ถูกย้ายไปแล้ว
        </p>
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            กลับหน้าแรก
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            ย้อนกลับ
          </button>
        </div>

        {/* VPN Info */}
        <div className="mt-10 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500">
            SimonVPNShop - บริการเน็ต VPN ความเร็วสูง
          </p>
        </div>
      </div>
    </div>
  )
}
