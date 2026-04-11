'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, Mail, Lock, AlertCircle, Shield, Zap, Globe, ChevronRight, Eye, EyeOff, Gift, CheckCircle2, Rocket, Star, Wifi, Server } from 'lucide-react'
import dynamic from 'next/dynamic'

const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), { ssr: false })

// Referral info component
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
    <div className="bg-gradient-to-r from-pink-500/[0.06] to-violet-500/[0.06] border border-pink-500/10 rounded-xl p-3.5">
      <div className="flex items-center gap-2 mb-1.5">
        <Gift className="w-4 h-4 text-pink-400" />
        <span className="text-pink-400 text-xs font-bold">มีรหัสเชิญ</span>
      </div>
      {referrerName ? (
        <p className="text-white text-sm">
          คุณได้รับเชิญจาก <span className="font-bold text-pink-400">{referrerName}</span>
        </p>
      ) : (
        <p className="text-white text-sm">รหัสเชิญ: <span className="font-mono text-cyan-400">{referralCode}</span></p>
      )}
      <p className="text-zinc-600 text-xs mt-1">คุณจะได้รับ 0.50 เครดิตเมื่อสมัครสำเร็จ!</p>
      <input type="hidden" name="referralCode" value={referralCode} />
    </div>
  )
}

// Main register form
function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const referralCode = searchParams.get('ref')
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaKey, setCaptchaKey] = useState(Date.now())
  const [showPassword, setShowPassword] = useState(false)
  const [focusField, setFocusField] = useState<string | null>(null)
  const [recaptchaEnabled, setRecaptchaEnabled] = useState(false)
  const [recaptchaSiteKey, setRecaptchaSiteKey] = useState('')
  const [siteName, setSiteName] = useState('')
  const [siteLogo, setSiteLogo] = useState('')

  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setRecaptchaEnabled(data.settings.recaptchaEnabled ?? false)
          setRecaptchaSiteKey(data.settings.googleApiKey || '')
          setSiteName(data.settings.siteName || '')
          setSiteLogo(data.settings.siteLogo || '')
        }
      })
      .catch(() => {})
  }, [])

  const resetCaptcha = () => {
    setCaptchaToken(null)
    setCaptchaKey(Date.now())
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (recaptchaEnabled && !captchaToken) {
      setError('กรุณายืนยันว่าคุณไม่ใช่หุ่นยนต์')
      setLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    if (recaptchaEnabled && captchaToken) {
      formData.append('captchaToken', captchaToken)
    }
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
        resetCaptcha()
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
      resetCaptcha()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans">
      <div className="min-h-screen flex flex-col lg:flex-row">

        {/* ============ LEFT PANEL - Branding (desktop only) ============ */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(34,211,238,0.08),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.06),transparent_60%)]" />
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

           {/* Top: Logo */}
           <div className="relative z-10">
             <Link href="/" className="flex items-center gap-3 group">
               {siteLogo && (
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 p-[1.5px]">
                   <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center overflow-hidden">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img 
                       src={siteLogo} 
                       alt={siteName || 'Logo'} 
                       className="w-full h-full object-contain p-1 scale-125 brightness-110"
                     />
                   </div>
                 </div>
               )}
               {siteName && (
                 <span className="text-white font-black text-lg tracking-tight">
                   {siteName}
                 </span>
               )}
             </Link>
           </div>

          {/* Middle: Hero text */}
          <div className="relative z-10 -mt-8">
            <h1 className="text-4xl xl:text-5xl font-black leading-tight mb-6">
              <span className="text-white">เริ่มต้นใช้งาน</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                อินเทอร์เน็ตที่ดีกว่า
              </span>
            </h1>
            <p className="text-zinc-500 text-base leading-relaxed max-w-sm mb-10">
              สมัครสมาชิกฟรี เข้าถึงเซิร์ฟเวอร์ 20+ แห่งทั่วโลก ด้วยความเร็วสูงสุด 10Gbps
            </p>

            {/* Feature list */}
            <div className="space-y-4">
              {[
                { icon: Shield, text: "เข้ารหัส AES-256 ระดับทหาร", color: "text-emerald-400", bg: "from-emerald-500 to-teal-500" },
                { icon: Zap, text: "ความเร็วสูงสุด 10Gbps ไม่จำกัด", color: "text-amber-400", bg: "from-amber-500 to-orange-500" },
                { icon: Globe, text: "เซิร์ฟเวอร์ 20+ แห่งทั่วโลก", color: "text-blue-400", bg: "from-blue-500 to-indigo-500" },
                { icon: Wifi, text: "Uptime 99.9% เสถียร 24/7", color: "text-cyan-400", bg: "from-cyan-500 to-blue-500" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3.5 group">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.bg} p-[1.5px] flex-shrink-0`}>
                    <div className="w-full h-full bg-black rounded-[6px] flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <span className="text-sm text-zinc-400">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Stats */}
          <div className="relative z-10">
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "1,000+", label: "ผู้ใช้งาน" },
                { value: "20+", label: "เซิร์ฟเวอร์" },
                { value: "99.9%", label: "Uptime" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-xl font-black text-white">{stat.value}</div>
                  <div className="text-[11px] text-zinc-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============ RIGHT PANEL - Form ============ */}
        <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
          
          {/* Mobile top bar */}
          <nav className="lg:hidden border-b border-white/[0.06] bg-black/80 backdrop-blur-xl sticky top-0 z-50">
            <div className="px-4 py-3.5 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5">
                {siteLogo && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 p-[1.5px]">
                    <div className="w-full h-full bg-black rounded-[6px] flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={siteLogo} 
                        alt={siteName || 'Logo'} 
                        className="w-full h-full object-contain p-0.5 scale-125 brightness-110"
                      />
                    </div>
                  </div>
                )}
                {siteName && (
                  <span className="text-white font-black text-base tracking-tight">
                    {siteName}
                  </span>
                )}
              </Link>
              <Link 
                href="/login"
                className="px-4 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white rounded-lg text-sm font-semibold transition-all"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          </nav>

          {/* Form area */}
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 lg:py-12">
            <div className="w-full max-w-[440px]">

              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-[1.5px]">
                    <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                      <Rocket className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-white">สมัครสมาชิก</h1>
                    <p className="text-zinc-500 text-xs">สร้างบัญชีใหม่เพื่อเริ่มใช้งาน</p>
                  </div>
                </div>
              </div>

              {/* Benefits - mobile */}
              <div className="lg:hidden mb-6 flex flex-wrap items-center gap-2">
                {[
                  { icon: CheckCircle2, text: "สมัครฟรี", color: "text-emerald-400" },
                  { icon: Zap, text: "เริ่มต้น 50 ฿/เดือน", color: "text-amber-400" },
                  { icon: Gift, text: "ทดลองใช้ฟรี", color: "text-pink-400" },
                ].map((item, i) => (
                  <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs">
                    <item.icon className={`w-3 h-3 ${item.color}`} />
                    <span className="text-zinc-400">{item.text}</span>
                  </div>
                ))}
              </div>
              
              {/* Error */}
              {error && (
                <div className="bg-red-500/[0.08] border border-red-500/15 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold mb-2">ชื่อผู้ใช้</label>
                  <div className={`relative rounded-xl border transition-all duration-200 ${
                    focusField === 'name' 
                      ? 'border-cyan-500/40 bg-white/[0.03]' 
                      : 'border-white/[0.06] hover:border-white/[0.1]'
                  }`}>
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                      <User className={`w-4 h-4 transition-colors ${focusField === 'name' ? 'text-cyan-400' : 'text-zinc-600'}`} />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      onFocus={() => setFocusField('name')}
                      onBlur={() => setFocusField(null)}
                      className="w-full bg-transparent rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none text-sm"
                      placeholder="ชื่อที่ต้องการแสดง"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold mb-2">อีเมล</label>
                  <div className={`relative rounded-xl border transition-all duration-200 ${
                    focusField === 'email' 
                      ? 'border-cyan-500/40 bg-white/[0.03]' 
                      : 'border-white/[0.06] hover:border-white/[0.1]'
                  }`}>
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                      <Mail className={`w-4 h-4 transition-colors ${focusField === 'email' ? 'text-cyan-400' : 'text-zinc-600'}`} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      onFocus={() => setFocusField('email')}
                      onBlur={() => setFocusField(null)}
                      className="w-full bg-transparent rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none text-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                {/* Password */}
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold mb-2">รหัสผ่าน</label>
                  <div className={`relative rounded-xl border transition-all duration-200 ${
                    focusField === 'password' 
                      ? 'border-cyan-500/40 bg-white/[0.03]' 
                      : 'border-white/[0.06] hover:border-white/[0.1]'
                  }`}>
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                      <Lock className={`w-4 h-4 transition-colors ${focusField === 'password' ? 'text-cyan-400' : 'text-zinc-600'}`} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      minLength={6}
                      onFocus={() => setFocusField('password')}
                      onBlur={() => setFocusField(null)}
                      className="w-full bg-transparent rounded-xl pl-11 pr-11 py-3 text-white placeholder-zinc-600 focus:outline-none text-sm"
                      placeholder="อย่างน้อย 6 ตัวอักษร"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Referral Code */}
                {referralCode ? (
                  <Suspense fallback={
                    <div className="bg-pink-500/[0.06] border border-pink-500/10 rounded-xl p-4 animate-pulse">
                      <div className="h-4 bg-pink-500/20 rounded w-3/4"></div>
                    </div>
                  }>
                    <ReferralInfo referralCode={referralCode} />
                  </Suspense>
                ) : (
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-2">
                      รหัสเชิญ <span className="text-zinc-600 font-normal">(ถ้ามี)</span>
                    </label>
                    <div className={`relative rounded-xl border transition-all duration-200 ${
                      focusField === 'referral' 
                        ? 'border-pink-500/40 bg-white/[0.03]' 
                        : 'border-white/[0.06] hover:border-white/[0.1]'
                    }`}>
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                        <Gift className={`w-4 h-4 transition-colors ${focusField === 'referral' ? 'text-pink-400' : 'text-zinc-600'}`} />
                      </div>
                      <input
                        type="text"
                        name="referralCode"
                        onFocus={() => setFocusField('referral')}
                        onBlur={() => setFocusField(null)}
                        className="w-full bg-transparent rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none text-sm"
                        placeholder="เช่น ABC123"
                      />
                    </div>
                  </div>
                )}

                {/* reCAPTCHA */}
                {recaptchaEnabled && recaptchaSiteKey && (
                  <div className="flex justify-center py-1">
                    <ReCAPTCHA
                      key={captchaKey}
                      sitekey={recaptchaSiteKey}
                      onChange={(token) => setCaptchaToken(token)}
                      onExpired={resetCaptcha}
                      theme="dark"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (recaptchaEnabled && !captchaToken)}
                  className="group w-full relative bg-gradient-to-r from-emerald-500 to-cyan-500 disabled:from-zinc-800 disabled:to-zinc-800 text-white disabled:text-zinc-600 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="relative z-10 text-sm">กำลังสมัคร...</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 relative z-10" />
                      <span className="relative z-10 text-sm">สมัครสมาชิก</span>
                      <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
              
              {/* Login link */}
              <div className="mt-8 pt-6 border-t border-white/[0.04] text-center">
                <p className="text-zinc-600 text-sm mb-3">มีบัญชีอยู่แล้ว?</p>
                <Link 
                  href="/login" 
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-cyan-400 transition-colors"
                >
                  เข้าสู่ระบบ
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// Main page with Suspense
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
