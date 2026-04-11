'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  ArrowLeft, Users, Clock, MessageCircle, ExternalLink, 
  Loader2, UserCircle, AlertCircle, Headphones, Shield,
  Sparkles, Zap, ChevronRight
} from 'lucide-react'

interface AdminContact {
  id: string
  nickname: string
  role: string | null
  avatar: string | null
  facebookUrl: string
  availableFrom: string | null
  availableTo: string | null
  description: string | null
}

// ─── Avatar ──────────────────────────────────────────────────────
function AvatarImage({ src, name, size = 'md' }: { src: string | null; name: string; size?: 'md' | 'lg' }) {
  const [error, setError] = useState(false)
  const sizeClass = size === 'lg' ? 'text-3xl' : 'text-xl'

  if (!src || error) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 flex items-center justify-center">
        <span className={`${sizeClass} font-black text-white drop-shadow-md`}>{name.charAt(0).toUpperCase()}</span>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className="w-full h-full object-cover"
      onError={() => setError(true)}
    />
  )
}

// ─── Time Helpers ────────────────────────────────────────────────
function formatTime(time: string | null) {
  if (!time) return null
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  return `${hour.toString().padStart(2, '0')}:${m}`
}

function isCurrentlyAvailable(from: string | null, to: string | null): boolean {
  if (!from || !to) return false
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  
  const [fh, fm] = from.split(':').map(Number)
  const [th, tm] = to.split(':').map(Number)
  const fromMinutes = fh * 60 + fm
  const toMinutes = th * 60 + tm

  if (toMinutes > fromMinutes) {
    return currentMinutes >= fromMinutes && currentMinutes <= toMinutes
  } else {
    return currentMinutes >= fromMinutes || currentMinutes <= toMinutes
  }
}

// ─── Contact Card ────────────────────────────────────────────────
function ContactCard({ contact, index }: { contact: AdminContact; index: number }) {
  const available = isCurrentlyAvailable(contact.availableFrom, contact.availableTo)
  const fromFormatted = formatTime(contact.availableFrom)
  const toFormatted = formatTime(contact.availableTo)

  // Cycle through accent colors
  const accents = [
    { gradient: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/20', ring: 'ring-blue-500/25', bg: 'bg-blue-500/[0.06]', border: 'border-blue-500/15', text: 'text-blue-400', btnBg: 'bg-blue-600 hover:bg-blue-500', btnShadow: 'shadow-blue-600/25' },
    { gradient: 'from-violet-500 to-purple-500', glow: 'shadow-violet-500/20', ring: 'ring-violet-500/25', bg: 'bg-violet-500/[0.06]', border: 'border-violet-500/15', text: 'text-violet-400', btnBg: 'bg-violet-600 hover:bg-violet-500', btnShadow: 'shadow-violet-600/25' },
    { gradient: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20', ring: 'ring-emerald-500/25', bg: 'bg-emerald-500/[0.06]', border: 'border-emerald-500/15', text: 'text-emerald-400', btnBg: 'bg-emerald-600 hover:bg-emerald-500', btnShadow: 'shadow-emerald-600/25' },
    { gradient: 'from-rose-500 to-pink-500', glow: 'shadow-rose-500/20', ring: 'ring-rose-500/25', bg: 'bg-rose-500/[0.06]', border: 'border-rose-500/15', text: 'text-rose-400', btnBg: 'bg-rose-600 hover:bg-rose-500', btnShadow: 'shadow-rose-600/25' },
    { gradient: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/20', ring: 'ring-amber-500/25', bg: 'bg-amber-500/[0.06]', border: 'border-amber-500/15', text: 'text-amber-400', btnBg: 'bg-amber-600 hover:bg-amber-500', btnShadow: 'shadow-amber-600/25' },
  ]
  const c = accents[index % accents.length]

  return (
    <div
      className="ct-fade-up relative group"
      style={{ animationDelay: `${0.15 + index * 0.1}s` }}
    >
      <div className={`relative overflow-hidden bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl sm:rounded-3xl transition-all duration-300 hover:shadow-2xl ${c.glow}`}>
        
        {/* Top accent line */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${c.gradient} opacity-50`} />

        {/* Background glow */}
        <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${c.gradient} opacity-[0.03] rounded-full blur-3xl pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-500`} />

        <div className="relative p-5 sm:p-6">
          {/* Top Row: Avatar + Info + Status */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl overflow-hidden ring-2 ${c.ring} shadow-xl ${c.glow}`}>
                <AvatarImage src={contact.avatar} name={contact.nickname} />
              </div>
              {/* Online indicator dot on avatar */}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-[#0a0a0a] ${available ? 'bg-emerald-400' : 'bg-zinc-600'}`}>
                {available && <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white truncate">{contact.nickname}</h3>
                {available && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">Online</span>
                  </span>
                )}
              </div>
              {contact.role && (
                <span className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 ${c.bg} border ${c.border} rounded-lg text-[10px] font-bold ${c.text}`}>
                  <Shield className="w-2.5 h-2.5" />
                  {contact.role}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {contact.description && (
            <p className="mt-4 text-[13px] sm:text-sm text-zinc-400 leading-relaxed">
              {contact.description}
            </p>
          )}

          {/* Available hours */}
          {fromFormatted && toFormatted && (
            <div className="flex items-center gap-2.5 mt-4 px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <div className="w-7 h-7 bg-white/[0.05] rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">เวลาให้บริการ</span>
                <p className="text-xs font-bold text-white mt-0.5">{fromFormatted} - {toFormatted} น.</p>
              </div>
              {available ? (
                <span className="text-[10px] font-bold text-emerald-400">พร้อมรับสาย</span>
              ) : (
                <span className="text-[10px] font-bold text-zinc-600">นอกเวลา</span>
              )}
            </div>
          )}

          {/* Action Button */}
          <a
            href={contact.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-4 flex items-center justify-center gap-2.5 w-full py-3 sm:py-3.5 ${c.btnBg} rounded-xl sm:rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.97] shadow-xl ${c.btnShadow} group/btn`}
          >
            <MessageCircle className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            <span>แชทผ่าน Facebook</span>
            <ChevronRight className="w-4 h-4 opacity-50 group-hover/btn:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────
export default function ContactsPage() {
  const [contacts, setContacts] = useState<AdminContact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch('/api/contacts')
        const data = await res.json()
        if (data.contacts) {
          setContacts(data.contacts)
        } else {
          setError('ไม่สามารถโหลดข้อมูลได้')
        }
      } catch {
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
      } finally {
        setLoading(false)
        setTimeout(() => setReady(true), 50)
      }
    }
    fetchContacts()
  }, [])

  const onlineCount = contacts.filter(c => isCurrentlyAvailable(c.availableFrom, c.availableTo)).length

  // ─── Loading ───
  if (loading) {
    return (
      <div className="min-h-dvh bg-black text-white">
        <CtStyles />
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="flex items-center h-14">
              <Link href="/" className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-all active:scale-95">
                <ArrowLeft className="w-5 h-5 text-zinc-400" />
              </Link>
              <div className="ml-3">
                <h1 className="text-sm font-bold text-white flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-blue-400" />
                  ติดต่อแอดมิน
                </h1>
                <p className="text-[10px] text-zinc-500">กำลังโหลด...</p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-32 gap-5">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-[3px] border-blue-500/10 rounded-full" />
            <div className="absolute inset-0 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-3 border-[3px] border-violet-400/10 rounded-full" />
            <div className="absolute inset-3 border-[3px] border-violet-400 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Headphones className="w-6 h-6 text-blue-500/40" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-zinc-400">กำลังโหลดรายชื่อแอดมิน</p>
            <p className="text-[10px] text-zinc-600">โปรดรอสักครู่...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-dvh bg-transparent text-white ${ready ? 'ct-ready' : ''}`}>
      <CtStyles />

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-15%] w-[70%] h-[50%] bg-blue-600/[0.03] rounded-full blur-[200px]" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[45%] bg-violet-600/[0.03] rounded-full blur-[200px]" />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-400/20 ct-float-particle"
            style={{
              left: `${15 + i * 14}%`,
              top: `${25 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${5 + (i % 3) * 2}s`,
            }}
          />
        ))}
      </div>

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-all active:scale-95"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-400" />
              </Link>
              <div>
                <h1 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-blue-400" />
                  ติดต่อแอดมิน
                </h1>
                <p className="text-[10px] text-zinc-500">ทีมงานพร้อมช่วยเหลือ 24/7</p>
              </div>
            </div>
            {contacts.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400">{onlineCount}/{contacts.length} Online</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">

        {/* ─── Hero Section ─── */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl ct-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.08] via-zinc-900/80 to-violet-500/[0.05]" />
          <div className="absolute -top-24 -right-24 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative border border-white/[0.06] rounded-2xl sm:rounded-3xl p-5 sm:p-8">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                  <Headphones className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md" />
                </div>
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent ct-shimmer" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-300 rounded-full ct-sparkle shadow-lg shadow-blue-400/50" />
                <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 bg-violet-300 rounded-full ct-sparkle" style={{ animationDelay: '0.5s' }} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  ทีมงานของเรา
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  เลือกแอดมินที่ว่างแล้วแชทได้เลย
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-5 sm:mt-6 pt-5 border-t border-white/5">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center ct-fade-up" style={{ animationDelay: '0.25s' }}>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-1.5">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                <p className="text-lg sm:text-2xl font-black text-white">{contacts.length}</p>
                <p className="text-[8px] sm:text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-0.5">ทีมงาน</p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center ct-fade-up" style={{ animationDelay: '0.35s' }}>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-1.5">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                </div>
                <p className="text-lg sm:text-2xl font-black text-emerald-400">{onlineCount}</p>
                <p className="text-[8px] sm:text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-0.5">ออนไลน์</p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center ct-fade-up" style={{ animationDelay: '0.45s' }}>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-violet-500/10 rounded-xl flex items-center justify-center mx-auto mb-1.5">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />
                </div>
                <p className="text-lg sm:text-2xl font-black text-violet-400">24/7</p>
                <p className="text-[8px] sm:text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-0.5">ซัพพอร์ต</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/15 rounded-2xl ct-fade-up">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-400 font-bold">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!error && contacts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center ct-fade-up">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto">
              <UserCircle className="w-10 h-10 text-zinc-700" />
            </div>
            <h3 className="text-lg font-bold text-white mt-5">ยังไม่มีแอดมินในระบบ</h3>
            <p className="text-xs text-zinc-500 mt-1.5">กรุณาลองใหม่ภายหลัง</p>
          </div>
        )}

        {/* ─── Contact Cards ─── */}
        {!error && contacts.length > 0 && (
          <>
            <h3 className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-widest px-1 ct-fade-up" style={{ animationDelay: '0.2s' }}>
              รายชื่อแอดมิน ({contacts.length} คน)
            </h3>

            {/* Desktop: 2 columns, Mobile: 1 column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {contacts.map((contact, i) => (
                <ContactCard key={contact.id} contact={contact} index={i} />
              ))}
            </div>
          </>
        )}

        {/* ─── Footer Note ─── */}
        <div className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl sm:rounded-2xl ct-fade-up" style={{ animationDelay: '0.6s' }}>
          <Sparkles className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[11px] sm:text-xs font-bold text-zinc-500">หมายเหตุ</p>
            <p className="text-[10px] sm:text-[11px] text-zinc-600 leading-relaxed">
              สถานะ Online/Offline คำนวณจากเวลาทำการ กรณีเร่งด่วนนอกเวลาทำการ สามารถส่งข้อความไว้ได้เลย แอดมินจะตอบกลับโดยเร็วที่สุด
            </p>
          </div>
        </div>

        {/* Back button */}
        <Link
          href="/"
          className="block w-full py-3.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.1] rounded-xl sm:rounded-2xl text-center text-sm font-bold text-zinc-400 hover:text-white transition-all active:scale-[0.98] ct-fade-up"
          style={{ animationDelay: '0.7s' }}
        >
          กลับหน้าแรก
        </Link>
      </main>
    </div>
  )
}

// ─── CSS Animations ──────────────────────────────────────────────
function CtStyles() {
  return (
    <style jsx global>{`
      .ct-fade-up {
        opacity: 0;
        transform: translateY(16px);
        animation: ctFadeUp 0.6s ease-out forwards;
      }
      @keyframes ctFadeUp {
        to { opacity: 1; transform: translateY(0); }
      }

      .ct-shimmer {
        animation: ctShimmer 3s ease-in-out infinite;
      }
      @keyframes ctShimmer {
        0% { transform: translateX(-100%); }
        30% { transform: translateX(100%); }
        100% { transform: translateX(100%); }
      }

      .ct-sparkle {
        animation: ctSparkle 2s ease-in-out infinite;
      }
      @keyframes ctSparkle {
        0%, 100% { opacity: 0.4; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1.2); }
      }

      .ct-float-particle {
        animation: ctFloat 5s ease-in-out infinite;
      }
      @keyframes ctFloat {
        0%, 100% { transform: translateY(0) scale(1); opacity: 0.15; }
        50% { transform: translateY(-25px) scale(1.4); opacity: 0.4; }
      }
    `}</style>
  )
}
