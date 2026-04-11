'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquarePlus,
  Ticket,
  Clock,
  CheckCircle2,
  MessageCircle,
  ChevronRight,
  AlertCircle,
  Search,
  Filter,
  X,
} from 'lucide-react'

interface TicketItem {
  id: string
  subject: string
  category: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  messages: { message: string; isAdmin: boolean; createdAt: string }[]
  _count: { messages: number }
}

const categoryLabels: Record<string, string> = {
  general: 'ทั่วไป',
  payment: 'การชำระเงิน',
  vpn: 'VPN / การเชื่อมต่อ',
  account: 'บัญชีผู้ใช้',
  bug: 'แจ้งปัญหา',
  other: 'อื่นๆ',
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  open: { label: 'รอตอบ', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', icon: <Clock className="w-3.5 h-3.5" /> },
  answered: { label: 'ตอบแล้ว', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  closed: { label: 'ปิดแล้ว', color: 'text-zinc-500', bg: 'bg-zinc-500/10 border-zinc-500/30', icon: <AlertCircle className="w-3.5 h-3.5" /> },
}

const categoryColors: Record<string, string> = {
  general: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  payment: 'bg-green-500/10 text-green-400 border-green-500/30',
  vpn: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  account: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  bug: 'bg-red-500/10 text-red-400 border-red-500/30',
  other: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
}

export default function TicketListClient() {
  const router = useRouter()
  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ subject: '', category: 'general', message: '', priority: 'normal' })

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets')
      if (res.status === 401) {
        router.push('/login')
        return
      }
      const data = await res.json()
      setTickets(data)
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject.trim() || !form.message.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const ticket = await res.json()
        setShowCreate(false)
        setForm({ subject: '', category: 'general', message: '', priority: 'normal' })
        router.push(`/tickets/${ticket.id}`)
      }
    } catch {
      // error
    } finally {
      setCreating(false)
    }
  }

  const filteredTickets = tickets.filter((t) => {
    if (filter !== 'all' && t.status !== filter) return false
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'เมื่อสักครู่'
    if (mins < 60) return `${mins} นาทีที่แล้ว`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`
    const days = Math.floor(hrs / 24)
    return `${days} วันที่แล้ว`
  }

  return (
    <>
      <div className="min-h-screen bg-zinc-950 pt-6 pb-10">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-xl border border-violet-500/30">
                  <Ticket className="w-6 h-6 text-violet-400" />
                </div>
                Ticket ติดต่อแอดมิน
              </h1>
              <p className="text-zinc-500 mt-1 text-sm">ส่งข้อความถึงแอดมินได้ตลอด 24 ชั่วโมง</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl text-white font-medium text-sm shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-shadow cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              สร้าง Ticket ใหม่
            </motion.button>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="ค้นหา ticket..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Filter className="w-4 h-4 text-zinc-500 flex-shrink-0" />
              {[
                { key: 'all', label: 'ทั้งหมด' },
                { key: 'open', label: 'รอตอบ' },
                { key: 'answered', label: 'ตอบแล้ว' },
                { key: 'closed', label: 'ปิดแล้ว' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    filter === f.key
                      ? 'bg-violet-600 text-white'
                      : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-zinc-900/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800/50 rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="text-zinc-500 text-sm">
                {tickets.length === 0 ? 'ยังไม่มี Ticket — สร้างใหม่ได้เลย!' : 'ไม่พบ Ticket ที่ตรงกับตัวกรอง'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredTickets.map((ticket, i) => {
                  const st = statusConfig[ticket.status] || statusConfig.open
                  const lastMsg = ticket.messages[0]
                  return (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => router.push(`/tickets/${ticket.id}`)}
                      className="group bg-zinc-900/60 border border-zinc-800/60 hover:border-violet-500/30 rounded-xl p-4 cursor-pointer transition-all hover:bg-zinc-900/90"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${st.bg} ${st.color}`}>
                              {st.icon}
                              {st.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${categoryColors[ticket.category] || categoryColors.other}`}>
                              {categoryLabels[ticket.category] || ticket.category}
                            </span>
                            <span className="text-[10px] text-zinc-600">#{ticket.id.slice(-6)}</span>
                          </div>
                          <h3 className="text-white font-medium text-sm group-hover:text-violet-300 transition-colors truncate">
                            {ticket.subject}
                          </h3>
                          {lastMsg && (
                            <p className="text-zinc-500 text-xs mt-1 truncate">
                              {lastMsg.isAdmin ? '🛡️ แอดมิน: ' : 'คุณ: '}
                              {lastMsg.message}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[10px] text-zinc-600">{timeAgo(ticket.updatedAt)}</span>
                          <div className="flex items-center gap-1 text-zinc-600">
                            <MessageCircle className="w-3 h-3" />
                            <span className="text-[10px]">{ticket._count.messages}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-violet-400 transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquarePlus className="w-5 h-5 text-violet-400" />
                  สร้าง Ticket ใหม่
                </h2>
                <button onClick={() => setShowCreate(false)} className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={createTicket} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">หัวข้อ</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="เช่น VPN เชื่อมต่อไม่ได้, เติมเงินไม่เข้า..."
                    className="w-full px-4 py-2.5 bg-zinc-800/60 border border-zinc-700 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">หมวดหมู่</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-800/60 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500/50 cursor-pointer"
                    >
                      {Object.entries(categoryLabels).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">ความสำคัญ</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-800/60 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500/50 cursor-pointer"
                    >
                      <option value="low">ต่ำ</option>
                      <option value="normal">ปกติ</option>
                      <option value="high">ด่วน</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">รายละเอียด</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="อธิบายปัญหาหรือสิ่งที่ต้องการความช่วยเหลือ..."
                    rows={4}
                    className="w-full px-4 py-2.5 bg-zinc-800/60 border border-zinc-700 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 resize-none"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-400 text-sm font-medium hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl text-white text-sm font-medium disabled:opacity-50 cursor-pointer hover:shadow-lg hover:shadow-violet-500/20 transition-shadow"
                  >
                    {creating ? 'กำลังสร้าง...' : 'ส่ง Ticket'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
