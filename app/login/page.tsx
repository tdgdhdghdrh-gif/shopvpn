'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Lock, AlertCircle, ArrowLeft, Menu, X, Wifi, ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamic import for ReCAPTCHA to avoid SSR issues
const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), { ssr: false })

const RECAPTCHA_SITE_KEY = '6LfLFHgsAAAAAHv1RrfFcJmPBG_srvd-kMtXt6oY'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaKey, setCaptchaKey] = useState(Date.now())

  const resetCaptcha = () => {
    setCaptchaToken(null)
    setCaptchaKey(Date.now())
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check if captcha is verified
    if (!captchaToken) {
      setError('กรุณายืนยันว่าคุณไม่ใช่บอท')
      setLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    
    try {
      // First verify captcha
      const captchaRes = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken })
      })

      const captchaData = await captchaRes.json()

      if (!captchaData.success) {
        setError(captchaData.error || 'ตรวจพบพฤติกรรมบอท')
        setLoading(false)
        resetCaptcha()
        return
      }

      // Then proceed with login
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      
      if (data.success) {
        if (data.isAdmin) {
          router.push('/admin')
        } else {
          router.push('/')
        }
        router.refresh()
      } else {
        setError(data.error || 'เข้าสู่ระบบไม่สำเร็จ')
        resetCaptcha()
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
      resetCaptcha()
    } finally {
      setLoading(false)
    }
  }

  function onCaptchaChange(token: string | null) {
    setCaptchaToken(token)
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-transparent">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://i.postimg.cc/7PC1vHmY/812-removebg-preview.png" 
                alt="simonvpnshop" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-semibold text-lg tracking-tight">simonvpnshop</span>
          </Link>
          
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="border-t border-gray-800 bg-black/95 backdrop-blur-md">
            <div className="max-w-lg mx-auto px-4 py-3 space-y-1">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-colors"
              >
                <Wifi className="w-5 h-5" />
                หน้าแรก
              </Link>
              
              <div className="border-t border-gray-800 my-2"></div>
              
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-xl transition-colors"
              >
                <User className="w-5 h-5" />
                สมัครสมาชิก
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-400 text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับหน้าแรก
        </Link>

        {/* Card */}
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">เข้าสู่ระบบ</h1>
            <p className="text-gray-500 text-sm mt-1">เข้าสู่ระบบเพื่อใช้งาน</p>
          </div>
          
          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">อีเมลหรือชื่อผู้ใช้</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input
                  type="text"
                  name="username"
                  required
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="อีเมลหรือชื่อผู้ใช้"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                key={captchaKey}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={onCaptchaChange}
                theme="dark"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !captchaToken}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
          
          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-6">
            ยังไม่มีบัญชี?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
