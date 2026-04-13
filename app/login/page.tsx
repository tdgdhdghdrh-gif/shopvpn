'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  User, Lock, AlertCircle, Shield, Zap, Globe, ChevronRight, Eye, EyeOff,
  Sparkles, Wifi, LogIn, Gamepad2, Crown, Droplets, Sun, Building2, Star,
} from 'lucide-react'
import dynamic from 'next/dynamic'

const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), { ssr: false })

// ═══════════════════════════════════════════
// Theme definitions
// ═══════════════════════════════════════════
type AuthTemplateId = 'classic' | 'minimal' | 'gaming' | 'corporate' | 'premium' | 'songkran'

interface ThemeDef {
  // Left panel
  bgGradient: string
  orb1: string
  orb2: string
  heroTitle: [string, string]
  heroSub: string
  features: { icon: any; text: string; bg: string }[]
  // Accents
  accentFrom: string
  accentTo: string
  focusBorder: string
  focusIcon: string
  btnGradient: string
  btnShadow: string
  mobileBtnGradient: string
  // Stats
  stats: { value: string; label: string }[]
}

const themes: Record<AuthTemplateId, ThemeDef> = {
  classic: {
    bgGradient: 'from-black via-zinc-950 to-black',
    orb1: 'rgba(34,211,238,0.08)',
    orb2: 'rgba(99,102,241,0.06)',
    heroTitle: ['ยินดีต้อนรับกลับ', 'เข้าสู่ระบบของคุณ'],
    heroSub: 'เข้าสู่ระบบเพื่อจัดการเซิร์ฟเวอร์ VPN และเริ่มท่องอินเทอร์เน็ตอย่างปลอดภัย',
    features: [
      { icon: Shield, text: 'เข้ารหัส AES-256 ระดับทหาร', bg: 'from-emerald-500 to-teal-500' },
      { icon: Zap, text: 'ความเร็วสูงสุด 10Gbps ไม่จำกัด', bg: 'from-amber-500 to-orange-500' },
      { icon: Globe, text: 'เซิร์ฟเวอร์ 20+ แห่งทั่วโลก', bg: 'from-blue-500 to-indigo-500' },
      { icon: Wifi, text: 'Uptime 99.9% เสถียร 24/7', bg: 'from-cyan-500 to-blue-500' },
    ],
    accentFrom: 'from-cyan-500', accentTo: 'to-blue-600',
    focusBorder: 'border-cyan-500/40', focusIcon: 'text-cyan-400',
    btnGradient: 'from-cyan-500 to-blue-600', btnShadow: 'hover:shadow-cyan-500/20',
    mobileBtnGradient: 'from-cyan-500 to-blue-600',
    stats: [{ value: '1,000+', label: 'ผู้ใช้งาน' }, { value: '20+', label: 'เซิร์ฟเวอร์' }, { value: '99.9%', label: 'Uptime' }],
  },
  minimal: {
    bgGradient: 'from-zinc-950 via-black to-zinc-950',
    orb1: 'rgba(161,161,170,0.05)',
    orb2: 'rgba(161,161,170,0.03)',
    heroTitle: ['เข้าสู่ระบบ', 'บัญชีของคุณ'],
    heroSub: 'ลงชื่อเข้าใช้เพื่อเชื่อมต่อ VPN อย่างรวดเร็ว',
    features: [
      { icon: Zap, text: 'เชื่อมต่อภายใน 1 วินาที', bg: 'from-zinc-600 to-zinc-500' },
      { icon: Shield, text: 'ปลอดภัย 100%', bg: 'from-zinc-600 to-zinc-500' },
      { icon: Globe, text: 'เซิร์ฟเวอร์ทั่วโลก', bg: 'from-zinc-600 to-zinc-500' },
    ],
    accentFrom: 'from-zinc-400', accentTo: 'to-zinc-300',
    focusBorder: 'border-zinc-500/40', focusIcon: 'text-zinc-300',
    btnGradient: 'from-white to-zinc-200', btnShadow: 'hover:shadow-white/10',
    mobileBtnGradient: 'from-white to-zinc-200',
    stats: [{ value: '1,000+', label: 'ผู้ใช้' }, { value: '20+', label: 'เซิร์ฟเวอร์' }, { value: '<5ms', label: 'Ping' }],
  },
  gaming: {
    bgGradient: 'from-black via-[#0a0f0a] to-black',
    orb1: 'rgba(34,197,94,0.1)',
    orb2: 'rgba(16,185,129,0.06)',
    heroTitle: ['GAME ON', 'ล็อกอินเพื่อเล่นเกม'],
    heroSub: 'เชื่อมต่อ VPN Ping ต่ำสุด เล่นเกมลื่นไม่มีสะดุด',
    features: [
      { icon: Gamepad2, text: 'Ping ต่ำสุด <5ms', bg: 'from-green-500 to-emerald-500' },
      { icon: Zap, text: 'Speed 10Gbps ไม่ Lag', bg: 'from-lime-500 to-green-500' },
      { icon: Shield, text: 'Anti-DDoS Protection', bg: 'from-emerald-500 to-teal-500' },
      { icon: Globe, text: 'เซิร์ฟเวอร์ Gaming ทั่วโลก', bg: 'from-green-600 to-emerald-600' },
    ],
    accentFrom: 'from-green-500', accentTo: 'to-emerald-500',
    focusBorder: 'border-green-500/40', focusIcon: 'text-green-400',
    btnGradient: 'from-green-500 to-emerald-600', btnShadow: 'hover:shadow-green-500/20',
    mobileBtnGradient: 'from-green-500 to-emerald-600',
    stats: [{ value: '<5ms', label: 'Ping' }, { value: '10Gbps', label: 'Speed' }, { value: '0%', label: 'Packet Loss' }],
  },
  corporate: {
    bgGradient: 'from-slate-950 via-slate-900 to-slate-950',
    orb1: 'rgba(59,130,246,0.06)',
    orb2: 'rgba(99,102,241,0.05)',
    heroTitle: ['ยินดีต้อนรับ', 'เข้าสู่ระบบองค์กร'],
    heroSub: 'ระบบ VPN สำหรับองค์กร ปลอดภัยระดับสูงสุด เชื่อถือได้',
    features: [
      { icon: Building2, text: 'Enterprise Grade Security', bg: 'from-blue-600 to-indigo-600' },
      { icon: Shield, text: 'SOC2 Compliance Ready', bg: 'from-slate-600 to-slate-500' },
      { icon: Globe, text: 'เครือข่ายทั่วโลก', bg: 'from-blue-500 to-blue-600' },
      { icon: Wifi, text: 'SLA 99.99%', bg: 'from-indigo-500 to-blue-600' },
    ],
    accentFrom: 'from-blue-600', accentTo: 'to-indigo-600',
    focusBorder: 'border-blue-500/40', focusIcon: 'text-blue-400',
    btnGradient: 'from-blue-600 to-indigo-600', btnShadow: 'hover:shadow-blue-500/20',
    mobileBtnGradient: 'from-blue-600 to-indigo-600',
    stats: [{ value: '99.99%', label: 'SLA' }, { value: 'AES-256', label: 'Encryption' }, { value: '24/7', label: 'Support' }],
  },
  premium: {
    bgGradient: 'from-black via-[#1a1000] to-black',
    orb1: 'rgba(251,191,36,0.08)',
    orb2: 'rgba(245,158,11,0.05)',
    heroTitle: ['Welcome Back', 'สมาชิก Premium'],
    heroSub: 'เข้าสู่ระบบเพื่อสัมผัสประสบการณ์ VPN ระดับ Premium',
    features: [
      { icon: Crown, text: 'Premium Priority Access', bg: 'from-amber-500 to-yellow-500' },
      { icon: Zap, text: '10Gbps Dedicated Speed', bg: 'from-amber-600 to-orange-500' },
      { icon: Star, text: 'Priority Support 24/7', bg: 'from-yellow-500 to-amber-500' },
      { icon: Shield, text: 'Military-Grade Encryption', bg: 'from-amber-500 to-amber-600' },
    ],
    accentFrom: 'from-amber-500', accentTo: 'to-yellow-500',
    focusBorder: 'border-amber-500/40', focusIcon: 'text-amber-400',
    btnGradient: 'from-amber-500 to-yellow-500', btnShadow: 'hover:shadow-amber-500/20',
    mobileBtnGradient: 'from-amber-500 to-yellow-500',
    stats: [{ value: 'VIP', label: 'Access' }, { value: '10Gbps', label: 'Speed' }, { value: '24/7', label: 'Priority' }],
  },
  songkran: {
    bgGradient: 'from-[#060e1f] via-[#0c1f3d] to-[#060e1f]',
    orb1: 'rgba(56,189,248,0.08)',
    orb2: 'rgba(251,191,36,0.06)',
    heroTitle: ['สาดน้ำสนุก', 'เข้าสู่ระบบสงกรานต์'],
    heroSub: 'สนุกกับเทศกาลสงกรานต์ เข้าสู่ระบบเพื่อสาดความเร็ว VPN',
    features: [
      { icon: Droplets, text: 'สาดความเร็ว 10Gbps', bg: 'from-sky-500 to-cyan-500' },
      { icon: Sun, text: 'ร้อนแค่ไหนก็เร็ว', bg: 'from-amber-500 to-orange-500' },
      { icon: Shield, text: 'ปลอดภัยดั่งน้ำมนต์', bg: 'from-sky-400 to-blue-500' },
      { icon: Globe, text: 'เซิร์ฟเวอร์ทั่วโลก', bg: 'from-cyan-500 to-sky-500' },
    ],
    accentFrom: 'from-sky-500', accentTo: 'to-cyan-500',
    focusBorder: 'border-sky-500/40', focusIcon: 'text-sky-400',
    btnGradient: 'from-sky-500 to-cyan-500', btnShadow: 'hover:shadow-sky-500/20',
    mobileBtnGradient: 'from-sky-500 to-cyan-500',
    stats: [{ value: '50K+', label: 'ผู้ใช้' }, { value: '20+', label: 'เซิร์ฟเวอร์' }, { value: '<5ms', label: 'Ping' }],
  },
}

// ═══════════════════════════════════════════
// Main Login Form
// ═══════════════════════════════════════════
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaKey, setCaptchaKey] = useState(Date.now())
  const [showPassword, setShowPassword] = useState(false)
  const [focusField, setFocusField] = useState<string | null>(null)
  const [recaptchaEnabled, setRecaptchaEnabled] = useState(false)
  const [recaptchaSiteKey, setRecaptchaSiteKey] = useState('')
  const [defaultHomePage, setDefaultHomePage] = useState('/')
  const [siteName, setSiteName] = useState('')
  const [siteLogo, setSiteLogo] = useState('')
  const [template, setTemplate] = useState<AuthTemplateId>('classic')

  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setRecaptchaEnabled(data.settings.recaptchaEnabled ?? false)
          setRecaptchaSiteKey(data.settings.googleApiKey || '')
          setDefaultHomePage(data.settings.defaultHomePage || '/')
          setSiteName(data.settings.siteName || '')
          setSiteLogo(data.settings.siteLogo || '')
          const t = data.settings.loginTemplate || 'classic'
          if (t in themes) setTemplate(t as AuthTemplateId)
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
      setError('กรุณายืนยันว่าคุณไม่ใช่บอท')
      setLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)

    try {
      if (recaptchaEnabled && captchaToken) {
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
      }

      const res = await fetch('/api/auth/login', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.success) {
        if (redirectUrl) {
          router.push(redirectUrl)
        } else if (data.isAdmin || data.isSuperAdmin || data.isRevenueAdmin || data.isAgent) {
          router.push('/admin')
        } else {
          router.push(defaultHomePage)
        }
        router.refresh()
      } else {
        setError(data.error || 'เข้าสู่ระบบไม่สำเร็จ')
        resetCaptcha()
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
      resetCaptcha()
    } finally {
      setLoading(false)
    }
  }

  const t = themes[template]
  const isMinimal = template === 'minimal'

  return (
    <div className="min-h-screen bg-transparent text-white font-sans">
      <div className="min-h-screen flex flex-col lg:flex-row">

        {/* ============ LEFT PANEL - Themed Branding (desktop only) ============ */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden">
          {/* Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${t.bgGradient}`} />
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at top left, ${t.orb1}, transparent 60%)` }} />
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at bottom right, ${t.orb2}, transparent 60%)` }} />
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

          {/* Songkran floating drops */}
          {template === 'songkran' && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute animate-pulse" style={{
                  left: `${10 + i * 15}%`, top: `${15 + (i % 3) * 25}%`,
                  fontSize: i % 2 === 0 ? 20 : 16, opacity: 0.15,
                  animation: `float ${3 + i}s ease-in-out infinite alternate`,
                }}>
                  {i % 3 === 0 ? '💧' : i % 3 === 1 ? '🌸' : '☀️'}
                </div>
              ))}
            </div>
          )}

          {/* Gaming grid pattern */}
          {template === 'gaming' && (
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }} />
          )}

          {/* Top: Logo */}
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 group">
              {siteLogo && (
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.accentFrom} ${t.accentTo} p-[1.5px]`}>
                  <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={siteLogo} alt={siteName || 'Logo'} className="w-full h-full object-contain p-1 scale-125 brightness-110" />
                  </div>
                </div>
              )}
              {siteName && <span className="text-white font-black text-lg tracking-tight">{siteName}</span>}
            </Link>
          </div>

          {/* Middle: Hero text */}
          <div className="relative z-10 -mt-8">
            <h1 className="text-4xl xl:text-5xl font-black leading-tight mb-6">
              <span className="text-white">{t.heroTitle[0]}</span>
              <br />
              <span className={`bg-gradient-to-r ${t.accentFrom} ${t.accentTo} bg-clip-text text-transparent`}>
                {t.heroTitle[1]}
              </span>
            </h1>
            <p className="text-zinc-500 text-base leading-relaxed max-w-sm mb-10">{t.heroSub}</p>

            {/* Feature list */}
            <div className="space-y-4">
              {t.features.map((item, i) => (
                <div key={i} className="flex items-center gap-3.5">
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
            <div className={`grid grid-cols-${t.stats.length} gap-4`}>
              {t.stats.map((stat, i) => (
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
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${t.accentFrom} ${t.accentTo} p-[1.5px]`}>
                    <div className="w-full h-full bg-black rounded-[6px] flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={siteLogo} alt={siteName || 'Logo'} className="w-full h-full object-contain p-0.5 scale-125 brightness-110" />
                    </div>
                  </div>
                )}
                {siteName && <span className="text-white font-black text-base tracking-tight">{siteName}</span>}
              </Link>
              <Link
                href="/register"
                className={`px-4 py-1.5 bg-gradient-to-r ${t.mobileBtnGradient} ${isMinimal ? 'text-black' : 'text-white'} rounded-lg text-sm font-semibold hover:shadow-lg transition-all`}
              >
                สมัครสมาชิก
              </Link>
            </div>
          </nav>

          {/* Form area */}
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 lg:py-12">
            <div className="w-full max-w-[440px]">

              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.accentFrom} ${t.accentTo} p-[1.5px]`}>
                    <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-white">ยินดีต้อนรับกลับ</h1>
                    <p className="text-zinc-500 text-xs">เข้าสู่ระบบเพื่อใช้งาน{siteName ? ` ${siteName}` : ''}</p>
                  </div>
                </div>
              </div>

              {/* Benefits - mobile */}
              <div className="lg:hidden mb-6 flex flex-wrap items-center gap-2">
                {t.features.slice(0, 3).map((item, i) => (
                  <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs">
                    <item.icon className={`w-3 h-3 ${t.focusIcon}`} />
                    <span className="text-zinc-400">{item.text.split(' ').slice(0, 2).join(' ')}</span>
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
                {/* Username */}
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold mb-2">อีเมลหรือชื่อผู้ใช้</label>
                  <div className={`relative rounded-xl border transition-all duration-200 ${
                    focusField === 'username'
                      ? `${t.focusBorder} bg-white/[0.03]`
                      : 'border-white/[0.06] hover:border-white/[0.1]'
                  }`}>
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                      <User className={`w-4 h-4 transition-colors ${focusField === 'username' ? t.focusIcon : 'text-zinc-600'}`} />
                    </div>
                    <input
                      type="text" name="username" required
                      onFocus={() => setFocusField('username')}
                      onBlur={() => setFocusField(null)}
                      className="w-full bg-transparent rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none text-sm"
                      placeholder="อีเมลหรือชื่อผู้ใช้"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold mb-2">รหัสผ่าน</label>
                  <div className={`relative rounded-xl border transition-all duration-200 ${
                    focusField === 'password'
                      ? `${t.focusBorder} bg-white/[0.03]`
                      : 'border-white/[0.06] hover:border-white/[0.1]'
                  }`}>
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                      <Lock className={`w-4 h-4 transition-colors ${focusField === 'password' ? t.focusIcon : 'text-zinc-600'}`} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'} name="password" required
                      onFocus={() => setFocusField('password')}
                      onBlur={() => setFocusField(null)}
                      className="w-full bg-transparent rounded-xl pl-11 pr-11 py-3 text-white placeholder-zinc-600 focus:outline-none text-sm"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* reCAPTCHA */}
                {recaptchaEnabled && recaptchaSiteKey && (
                  <div className="flex justify-center py-1">
                    <ReCAPTCHA
                      key={captchaKey} sitekey={recaptchaSiteKey}
                      onChange={(token: string | null) => setCaptchaToken(token)}
                      onExpired={resetCaptcha} theme="dark"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (recaptchaEnabled && !captchaToken)}
                  className={`group w-full relative bg-gradient-to-r ${t.btnGradient} disabled:from-zinc-800 disabled:to-zinc-800 ${isMinimal ? 'text-black disabled:text-zinc-600' : 'text-white disabled:text-zinc-600'} font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-lg ${t.btnShadow} active:scale-[0.98] overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="relative z-10 text-sm">กำลังเข้าสู่ระบบ...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 relative z-10" />
                      <span className="relative z-10 text-sm">เข้าสู่ระบบ</span>
                      <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Register link */}
              <div className="mt-8 pt-6 border-t border-white/[0.04] text-center">
                <p className="text-zinc-600 text-sm mb-3">ยังไม่มีบัญชี?</p>
                <Link
                  href="/register"
                  className={`group inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:${t.focusIcon} transition-colors`}
                >
                  สมัครสมาชิกใหม่
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Songkran float animation */}
      {template === 'songkran' && (
        <style jsx global>{`
          @keyframes float { 0% { transform: translateY(0px); } 100% { transform: translateY(-15px); } }
        `}</style>
      )}
    </div>
  )
}

// Main page with Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
