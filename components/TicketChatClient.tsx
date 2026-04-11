'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Send,
  Shield,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MessageCircle,
  Loader2,
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
  user: { name: string; email: string }
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

export default function TicketChatClient() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [closing, setClosing] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prevMsgCountRef = useRef(0)

  const scrollToBottom = useCallback((smooth = true) => {
    const container = chatContainerRef.current
    if (!container) return
    if (smooth) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    } else {
      container.scrollTop = container.scrollHeight
    }
  }, [])

  useEffect(() => {
    fetchTicket()
    const interval = setInterval(fetchTicket, 5000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Prevent window scroll on chat page
  useEffect(() => {
    window.scrollTo(0, 0)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Auto-scroll: on initial load scroll to bottom instantly, on new messages scroll smoothly
  useEffect(() => {
    if (!ticket) return
    const newCount = ticket.messages.length
    if (prevMsgCountRef.current === 0 && newCount > 0) {
      // Initial load - scroll to bottom instantly
      scrollToBottom(false)
    } else if (newCount > prevMsgCountRef.current) {
      // New message added - smooth scroll
      scrollToBottom(true)
    }
    prevMsgCountRef.current = newCount
  }, [ticket?.messages.length, scrollToBottom, ticket])

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`)
      if (res.status === 401) {
        router.push('/login')
        return
      }
      if (res.status === 404) {
        router.push('/tickets')
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
      const res = await fetch(`/api/tickets/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      })
      if (res.ok) {
        setMessage('')
        await fetchTicket()
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
      }
    } catch {
      // error
    } finally {
      setSending(false)
    }
  }

  const closeTicket = async () => {
    if (!confirm('ต้องการปิด Ticket นี้ใช่หรือไม่?')) return
    setClosing(true)
    try {
      await fetch(`/api/tickets/${id}`, { method: 'PATCH' })
      await fetchTicket()
    } catch {
      // error
    } finally {
      setClosing(false)
    }
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
      <div className="flex items-center justify-center bg-black" style={{ height: 'calc(100vh - 60px)' }}>
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    )
  }

  if (!ticket) return null

  const st = statusConfig[ticket.status] || statusConfig.open
  const isClosed = ticket.status === 'closed'

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 60px)' }}>
      {/* Sub-header - sticky ticket info bar */}
      <div className="flex-shrink-0 bg-zinc-950 border-b border-zinc-800/60 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push('/tickets')}
            className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-white font-semibold text-sm truncate">{ticket.subject}</h1>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${st.bg} ${st.color}`}>
                {st.icon}
                {st.label}
              </span>
            </div>
            <p className="text-zinc-500 text-xs mt-0.5">
              #{ticket.id.slice(-6)} - {categoryLabels[ticket.category] || ticket.category}
            </p>
          </div>
          {!isClosed && (
            <button
              onClick={closeTicket}
              disabled={closing}
              className="px-3 py-1.5 text-xs text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              {closing ? '...' : 'ปิด Ticket'}
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages - scrollable area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto overscroll-contain">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Ticket created notice */}
          <div className="flex justify-center mb-6">
            <span className="text-[10px] text-zinc-600 bg-zinc-900/50 px-3 py-1 rounded-full">
              Ticket สร้างเมื่อ {new Date(ticket.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {ticket.messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${msg.isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${msg.isAdmin ? 'bg-gradient-to-br from-violet-600 to-cyan-600' : 'bg-zinc-700'}`}>
                      {msg.isAdmin ? <Shield className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-zinc-300" />}
                    </div>
                    {/* Bubble */}
                    <div className={`rounded-2xl px-4 py-2.5 ${
                      msg.isAdmin
                        ? 'bg-zinc-800/80 border border-zinc-700/60 rounded-bl-md'
                        : 'bg-gradient-to-br from-violet-600/80 to-cyan-600/80 rounded-br-md'
                    }`}>
                      {msg.isAdmin && (
                        <p className="text-[10px] text-violet-400 font-medium mb-1">Admin</p>
                      )}
                      <p className="text-sm text-white whitespace-pre-wrap break-words leading-relaxed">{msg.message}</p>
                      <p className={`text-[10px] mt-1 ${msg.isAdmin ? 'text-zinc-500' : 'text-white/50'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {isClosed && (
            <div className="flex justify-center mt-6">
              <span className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
                <AlertCircle className="w-3.5 h-3.5" />
                Ticket นี้ถูกปิดแล้ว
              </span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Message Input - fixed at bottom within this flex container */}
      {!isClosed && (
        <div className="flex-shrink-0 bg-zinc-950 border-t border-zinc-800/60">
          <form onSubmit={sendMessage} className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={autoResize}
                  onKeyDown={handleKeyDown}
                  placeholder="พิมพ์ข้อความ..."
                  rows={1}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 resize-none transition-colors"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!message.trim() || sending}
                className="p-2.5 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl text-white disabled:opacity-30 cursor-pointer flex-shrink-0"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </motion.button>
            </div>
            <p className="text-[10px] text-zinc-600 mt-1.5 text-center">
              <MessageCircle className="w-3 h-3 inline mr-1" />
              กด Enter เพื่อส่ง, Shift+Enter เพื่อขึ้นบรรทัดใหม่
            </p>
          </form>
        </div>
      )}
    </div>
  )
}
