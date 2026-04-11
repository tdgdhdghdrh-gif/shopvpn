'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Send,
  Shield,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Loader2,
  Mail,
  Calendar,
  Wallet,
  Trash2,
} from 'lucide-react'

interface Message {
  id: string
  message: string
  isAdmin: boolean
  createdAt: string
}

interface TicketDetail {
  id: string
  subject: string
  category: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  user: { id: string; name: string; email: string; balance: number; createdAt: string }
  messages: Message[]
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  open: { label: 'รอตอบ', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', icon: <Clock className="w-3.5 h-3.5" /> },
  answered: { label: 'ตอบแล้ว', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  closed: { label: 'ปิดแล้ว', color: 'text-zinc-500', bg: 'bg-zinc-500/10 border-zinc-500/30', icon: <XCircle className="w-3.5 h-3.5" /> },
}

const categoryLabels: Record<string, string> = {
  general: 'ทั่วไป',
  payment: 'การชำระเงิน',
  vpn: 'VPN / การเชื่อมต่อ',
  account: 'บัญชีผู้ใช้',
  bug: 'แจ้งปัญหา',
  other: 'อื่นๆ',
}

export default function AdminTicketChatPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showUserInfo, setShowUserInfo] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const initialScrollDoneRef = useRef(false)
  const knownMessageIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    fetchTicket()
    const interval = setInterval(fetchTicket, 5000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // CRITICAL: Take over the entire viewport for chat.
  // Hide admin header, footer, strip main padding, lock body scroll.
  useEffect(() => {
    window.scrollTo(0, 0)
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    // Find admin layout elements and hide/adjust them
    const adminHeader = document.querySelector('header') as HTMLElement | null
    const footer = document.querySelector('footer') as HTMLElement | null
    const main = document.querySelector('main') as HTMLElement | null
    const maxWidthContainer = main?.querySelector(':scope > div') as HTMLElement | null
    // The flex column parent that holds header + main + footer
    const flexParent = main?.parentElement as HTMLElement | null

    if (adminHeader) adminHeader.style.display = 'none'
    if (footer) footer.style.display = 'none'
    if (main) {
      main.style.padding = '0'
      main.style.overflow = 'hidden'
      main.style.flex = '1'
      main.style.minHeight = '0' // critical for flex child to not overflow
    }
    if (maxWidthContainer) {
      maxWidthContainer.style.maxWidth = 'none'
      maxWidthContainer.style.height = '100%'
    }
    if (flexParent) {
      flexParent.style.height = '100dvh'
      flexParent.style.minHeight = '100dvh'
      flexParent.style.maxHeight = '100dvh'
      flexParent.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      if (adminHeader) adminHeader.style.display = ''
      if (footer) footer.style.display = ''
      if (main) {
        main.style.padding = ''
        main.style.overflow = ''
        main.style.flex = ''
        main.style.minHeight = ''
      }
      if (maxWidthContainer) {
        maxWidthContainer.style.maxWidth = ''
        maxWidthContainer.style.height = ''
      }
      if (flexParent) {
        flexParent.style.height = ''
        flexParent.style.minHeight = ''
        flexParent.style.maxHeight = ''
        flexParent.style.overflow = ''
      }
    }
  }, [])

  // Scroll: jump to bottom on first load, smooth scroll only on genuinely new messages
  useEffect(() => {
    if (!ticket || ticket.messages.length === 0) return
    const container = messagesContainerRef.current
    if (!container) return

    if (!initialScrollDoneRef.current) {
      // First load: instant scroll to bottom
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
        }
      })
      initialScrollDoneRef.current = true
      ticket.messages.forEach(m => knownMessageIdsRef.current.add(m.id))
    } else {
      // Check for genuinely new messages by ID
      const hasNew = ticket.messages.some(m => !knownMessageIdsRef.current.has(m.id))
      if (hasNew) {
        ticket.messages.forEach(m => knownMessageIdsRef.current.add(m.id))
        requestAnimationFrame(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: 'smooth' })
          }
        })
      }
    }
  }, [ticket])

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/admin/tickets/${id}`)
      if (!res.ok) {
        router.push('/admin/tickets')
        return
      }
      const data = await res.json()
      setTicket(data)
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/admin/tickets/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      })
      if (res.ok) {
        setMessage('')
        await fetchTicket()
        if (textareaRef.current) textareaRef.current.style.height = 'auto'
      }
    } catch {
      // error
    } finally {
      setSending(false)
    }
  }

  const updateStatus = async (status: string) => {
    try {
      await fetch(`/api/admin/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      await fetchTicket()
    } catch {
      // error
    }
  }

  const deleteTicket = async () => {
    if (!confirm('ต้องการลบ Ticket นี้?')) return
    await fetch(`/api/admin/tickets/${id}`, { method: 'DELETE' })
    router.push('/admin/tickets')
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    const time = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    if (isToday) return time
    return `${d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} ${time}`
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e)
    }
  }

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    setMessage(el.value)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    )
  }

  if (!ticket) return null

  const st = statusConfig[ticket.status] || statusConfig.open

  return (
    <div className="flex flex-col h-full overflow-hidden bg-black">
      {/* Chat Header */}
      <div className="flex-shrink-0 bg-zinc-900/80 border-b border-zinc-800/60 px-3 sm:px-4 py-2.5 sm:py-3 safe-area-top">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => router.push('/admin/tickets')}
            className="p-1.5 -ml-1 text-zinc-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-white font-semibold text-sm truncate">{ticket.subject}</h1>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border whitespace-nowrap flex-shrink-0 ${st.bg} ${st.color}`}>
                {st.icon} {st.label}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 mt-0.5">
              <button
                onClick={() => setShowUserInfo(!showUserInfo)}
                className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
              >
                <User className="w-3 h-3 flex-shrink-0" />
                <span className="truncate max-w-[80px] sm:max-w-none">{ticket.user.name}</span>
              </button>
              <span className="text-[10px] text-zinc-600 whitespace-nowrap">
                {categoryLabels[ticket.category]} | #{ticket.id.slice(-6)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {ticket.status !== 'closed' ? (
              <button
                onClick={() => updateStatus('closed')}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer whitespace-nowrap"
              >
                ปิด
              </button>
            ) : (
              <button
                onClick={() => updateStatus('open')}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/10 transition-colors cursor-pointer whitespace-nowrap"
              >
                เปิดใหม่
              </button>
            )}
            <button
              onClick={deleteTicket}
              className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Info Panel */}
        <AnimatePresence>
          {showUserInfo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 sm:gap-4 pt-2.5 mt-2.5 border-t border-zinc-800/50 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Mail className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="truncate max-w-[150px] sm:max-w-none">{ticket.user.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Wallet className="w-3.5 h-3.5 text-zinc-600" />
                  {ticket.user.balance.toFixed(2)} ฿
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                  สมัคร {new Date(ticket.user.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages - the only scrollable area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-2"
      >
        {/* Created notice */}
        <div className="flex justify-center mb-2">
          <span className="text-[10px] text-zinc-600 bg-zinc-900/50 px-2 py-0.5 rounded-full">
            สร้างเมื่อ {new Date(ticket.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {ticket.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${msg.isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                msg.isAdmin ? 'bg-gradient-to-br from-violet-600 to-cyan-600' : 'bg-zinc-700'
              }`}>
                {msg.isAdmin ? <Shield className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-zinc-300" />}
              </div>
              <div className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 ${
                msg.isAdmin
                  ? 'bg-gradient-to-br from-violet-600/80 to-cyan-600/80 rounded-br-md'
                  : 'bg-zinc-800/80 border border-zinc-700/60 rounded-bl-md'
              }`}>
                {!msg.isAdmin && (
                  <p className="text-[10px] text-cyan-400 font-medium mb-1">{ticket.user.name}</p>
                )}
                {msg.isAdmin && (
                  <p className="text-[10px] text-white/70 font-medium mb-1">Admin</p>
                )}
                <p className="text-sm text-white whitespace-pre-wrap break-words leading-relaxed">{msg.message}</p>
                <p className={`text-[10px] mt-1 ${msg.isAdmin ? 'text-white/50' : 'text-zinc-500'}`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {ticket.status === 'closed' && (
          <div className="flex justify-center mt-4">
            <span className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
              <XCircle className="w-3.5 h-3.5" />
              Ticket ปิดแล้ว
            </span>
          </div>
        )}
      </div>

      {/* Reply Input */}
      {ticket.status !== 'closed' && (
        <div className="flex-shrink-0 bg-zinc-900/80 border-t border-zinc-800/60 p-2 sm:p-3 safe-area-bottom">
          <form onSubmit={sendMessage} className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={autoResize}
                onKeyDown={handleKeyDown}
                placeholder="ตอบกลับผู้ใช้..."
                rows={1}
                className="w-full px-3 py-2 bg-zinc-800/60 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 resize-none transition-colors"
              />
              <p className="text-[10px] text-zinc-600 mt-1 hidden sm:block">
                <MessageCircle className="w-3 h-3 inline mr-0.5" />
                Enter ส่ง | Shift+Enter ขึ้นบรรทัดใหม่
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!message.trim() || sending}
              className="p-2.5 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-lg text-white disabled:opacity-30 cursor-pointer flex-shrink-0"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </motion.button>
          </form>
        </div>
      )}
    </div>
  )
}
