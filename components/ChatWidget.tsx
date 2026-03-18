'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, User, Crown } from 'lucide-react'

interface ChatMessage {
  id: string
  message: string
  isAdmin: boolean
  createdAt: string
  user: {
    id: string
    name: string
    isAdmin: boolean
  }
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Check if user is logged in
  useEffect(() => {
    fetch('/api/user/me')
      .then(res => res.json())
      .then(data => {
        setIsLoggedIn(!!data.user)
      })
      .catch(() => setIsLoggedIn(false))
  }, [isOpen])

  // Fetch messages
  useEffect(() => {
    if (isOpen) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 3000) // Poll every 3 seconds
      return () => clearInterval(interval)
    }
  }, [isOpen])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  async function fetchMessages() {
    try {
      const res = await fetch('/api/chat')
      const data = await res.json()
      if (data.success && data.messages) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Failed to fetch messages')
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || loading) return

    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setNewMessage('')
        setMessages(prev => [...prev, data.message])
      } else {
        alert(data.error || 'ส่งข้อความไม่สำเร็จ')
      }
    } catch (error) {
      console.error('Send message error:', error)
      alert('ส่งข้อความไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  }

  // Don't show chat widget if not logged in
  if (!isLoggedIn && !isOpen) {
    return null
  }

  // Calculate unread messages (simplified - in real app would track last read)
  const unreadCount = 0

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-90' 
            : 'bg-blue-600 hover:bg-blue-500 hover:scale-110'
        }`}
        style={{ boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)' }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-20 right-4 z-50 w-[90vw] max-w-[380px] h-[500px] max-h-[70vh] bg-gray-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-white/10">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-white" />
              <div>
                <h3 className="text-white font-semibold text-sm">แชทสาธารณะ</h3>
                <p className="text-blue-200 text-xs">พูดคุยกับแอดมินและสมาชิก</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/50">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">ยังไม่มีข้อความ</p>
                <p className="text-gray-600 text-xs mt-1">เริ่มต้นการสนทนาเลย!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.user.id === 'me' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.user.isAdmin 
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
                      : 'bg-gradient-to-br from-blue-500 to-purple-500'
                  }`}>
                    {msg.user.isAdmin ? (
                      <Crown className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`max-w-[75%] ${msg.user.isAdmin ? 'order-1' : ''}`}>
                    <div className={`px-3 py-2 rounded-2xl text-sm ${
                      msg.user.isAdmin
                        ? 'bg-amber-500/20 border border-amber-500/30 text-white rounded-tl-none'
                        : 'bg-gray-800 border border-white/10 text-white rounded-tr-none'
                    }`}>
                      {/* Username */}
                      <p className={`text-xs font-semibold mb-1 ${
                        msg.user.isAdmin ? 'text-amber-400' : 'text-blue-400'
                      }`}>
                        {msg.user.name} {msg.user.isAdmin && '(แอดมิน)'}
                      </p>
                      {/* Message Text */}
                      <p className="break-words">{msg.message}</p>
                    </div>
                    {/* Time */}
                    <p className={`text-xs text-gray-500 mt-1 ${msg.user.isAdmin ? 'text-right' : ''}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {isLoggedIn ? (
            <form onSubmit={sendMessage} className="p-3 bg-gray-900 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="พิมพ์ข้อความ..."
                  maxLength={500}
                  className="flex-1 bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center">
                กด Enter เพื่อส่งข้อความ
              </p>
            </form>
          ) : (
            <div className="p-4 bg-gray-900 border-t border-white/10 text-center">
              <p className="text-gray-400 text-sm mb-2">กรุณาเข้าสู่ระบบเพื่อแชท</p>
              <a 
                href="/login" 
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl transition-colors"
              >
                เข้าสู่ระบบ
              </a>
            </div>
          )}
        </div>
      )}
    </>
  )
}
