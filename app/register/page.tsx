'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, Mail, Lock, AlertCircle, ArrowLeft, Menu, X, Wifi, LogIn, ChevronRight, Gift } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamic import for ReCAPTCHA to avoid SSR issues
const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), { ssr: false })

const RECAPTCHA_SITE_KEY = '6LfLFHgsAAAAAHv1RrfFcJmPBG_srvd-kMtXt6oY'

// Separate component for referral logic
function ReferralInfo({ referralCode }: { referralCode: string }) {
  const [referrerName, setReferrerName] = useState('')
  
  useEffect(() => {
    if (referralCode) {
      fetch(`/api/user/referral/check?code=${referralCode}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.name) {
            setReferrerName(data.name)
          }
        })
        .catch(() => {})
    }
  }, [referralCode])

  return (
    <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Gift className="w-4 h-4 text-pink-400" />
        <span className="text-pink-400 text-sm font-medium">มีรหัสเชิญ</span>
      </div>
      {referrerName ? (
        <p className="text-white text-sm">
          คุณได้รับเชิญจาก <span className="font-semibold text-pink-400">{referrerName}</span>
        </p>
      ) : (
        <p className="text-white text-sm">รหัสเชิญ: {referralCode}</p>
      )}
      <p className="text-zinc-500 text-xs mt-1">คุณจะได้รับ 0.50 เครดิตเมื่อสมัครสำเร็จ!</p>
      <input type="hidden" name="referralCode" value={referralCode} />
    </div>
  )
}

// Main form component
function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const referralCode = searchParams.get('ref')
  
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

    if (!captchaToken) {
      setError('กรุณายืนยันว่าคุณไม่ใช่หุ่นยนต์')
      setLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.append('captchaToken', captchaToken)
    if (referralCode) {
      formData.append('referralCode', referralCode)
    }
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      
      if (data.success) {
        router.push('/')
        router.refresh()
      } else {
        setError(data.error || 'สมัครสมาชิกไม่สำเร็จ')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
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
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-xl transition-colors"
              >
                <LogIn className="w-5 h-5" />
                เข้าสู่ระบบ
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
            <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">สมัครสมาชิก</h1>
            <p className="text-gray-500 text-sm mt-1">สร้างบัญชีใหม่เพื่อใช้งาน</p>
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
              <label className="block text-gray-400 text-sm mb-2">ชื่อ</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="ชื่อของคุณ"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">อีเมล</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="your@email.com"
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
                  minLength={6}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-gray-600 text-xs mt-1">ต้องมีอย่างน้อย 6 ตัวอักษร</p>
            </div>

            {/* Referral Code Display */}
            {referralCode && (
              <Suspense fallback={
                <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-pink-500/20 rounded w-3/4"></div>
                </div>
              }>
                <ReferralInfo referralCode={referralCode} />
              </Suspense>
            )}

            {/* Manual Referral Code Input (if not from URL) */}
            {!referralCode && (
              <div>
                <label className="block text-gray-400 text-sm mb-2">รหัสเชิญ (ถ้ามี)</label>
                <div className="relative">
                  <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="text"
                    name="referralCode"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                    placeholder="เช่น ABC123"
                  />
                </div>
              </div>
            )}

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                key={captchaKey}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
                onExpired={resetCaptcha}
                theme="dark"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !captchaToken}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </form>
          
          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-6">
            มีบัญชีแล้ว?{' '}
            <Link href="/login" className="text-green-400 hover:text-green-300 font-medium">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

// Main page with Suspense
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
