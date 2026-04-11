'use client'

import { useEffect, useState } from 'react'
import {
  Users, Plus, Trash2, Edit2, CheckCircle2, XCircle,
  RefreshCw, Image, ExternalLink, Clock, AlertTriangle,
  Eye, EyeOff, Headphones, Shield, MessageCircle,
  Search, UserPlus
} from 'lucide-react'

interface AdminContact {
  id: string
  nickname: string
  role: string
  avatar: string | null
  facebookUrl: string
  availableFrom: string
  availableTo: string
  description: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<AdminContact[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [selectedContact, setSelectedContact] = useState<AdminContact | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [deleteTarget, setDeleteTarget] = useState<AdminContact | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [formData, setFormData] = useState({
    nickname: '',
    role: 'แอดมิน',
    avatar: '',
    facebookUrl: '',
    availableFrom: '09:00',
    availableTo: '22:00',
    description: '',
  })

  useEffect(() => {
    fetchContacts()
  }, [])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  async function fetchContacts() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/contacts')
      const data = await res.json()
      if (data.contacts) setContacts(data.contacts)
    } catch {
      setMessage({ type: 'error', text: 'โหลดข้อมูลไม่สำเร็จ' })
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setModalMode('add')
    setSelectedContact(null)
    setFormData({
      nickname: '',
      role: 'แอดมิน',
      avatar: '',
      facebookUrl: '',
      availableFrom: '09:00',
      availableTo: '22:00',
      description: '',
    })
    setShowModal(true)
  }

  function openEditModal(contact: AdminContact) {
    setModalMode('edit')
    setSelectedContact(contact)
    setFormData({
      nickname: contact.nickname,
      role: contact.role,
      avatar: contact.avatar || '',
      facebookUrl: contact.facebookUrl,
      availableFrom: contact.availableFrom,
      availableTo: contact.availableTo,
      description: contact.description || '',
    })
    setShowModal(true)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, type: 'avatar' })
        })
        const data = await res.json()
        if (data.success && data.url) {
          setFormData(prev => ({ ...prev, avatar: data.url }))
          setMessage({ type: 'success', text: 'อัพโหลดรูปสำเร็จ' })
        } else {
          setMessage({ type: 'error', text: 'อัพโหลดรูปไม่สำเร็จ' })
        }
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการอัพโหลด' })
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      const method = modalMode === 'add' ? 'POST' : 'PUT'
      const body = modalMode === 'edit'
        ? { id: selectedContact?.id, ...formData }
        : formData

      const res = await fetch('/api/admin/contacts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        setMessage({
          type: 'success',
          text: modalMode === 'add' ? 'เพิ่มรายชื่อสำเร็จ' : 'แก้ไขรายชื่อสำเร็จ'
        })
        setShowModal(false)
        fetchContacts()
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'เกิดข้อผิดพลาด' })
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/contacts?id=${deleteTarget.id}`, { method: 'DELETE' })
      if (res.ok) {
        setMessage({ type: 'success', text: 'ลบรายชื่อสำเร็จ' })
        fetchContacts()
      } else {
        setMessage({ type: 'error', text: 'ลบไม่สำเร็จ' })
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  async function toggleActive(contact: AdminContact) {
    try {
      const res = await fetch('/api/admin/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contact.id, isActive: !contact.isActive })
      })
      if (res.ok) fetchContacts()
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    }
  }

  const activeCount = contacts.filter(c => c.isActive).length
  const filteredContacts = searchQuery
    ? contacts.filter(c => c.nickname.toLowerCase().includes(searchQuery.toLowerCase()) || c.role.toLowerCase().includes(searchQuery.toLowerCase()))
    : contacts

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-4 sm:bottom-8 right-4 sm:right-8 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all animate-in slide-in-from-right-10 duration-300 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
          <span className="font-bold text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      {/* ─── Header ─── */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                รายชื่อแอดมิน
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">จัดการรายชื่อแอดมินที่จะแสดงให้ผู้ใช้ติดต่อ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchContacts}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:border-white/[0.12] hover:bg-white/[0.06] transition-all active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">รีเฟรช</span>
            </button>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-violet-600/25 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>เพิ่มแอดมิน</span>
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-black text-white leading-none">{contacts.length}</p>
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider mt-0.5">ทั้งหมด</p>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Eye className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-black text-emerald-400 leading-none">{activeCount}</p>
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider mt-0.5">แสดงอยู่</p>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-zinc-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <EyeOff className="w-4 h-4 text-zinc-500" />
            </div>
            <div>
              <p className="text-lg font-black text-zinc-400 leading-none">{contacts.length - activeCount}</p>
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider mt-0.5">ซ่อนอยู่</p>
            </div>
          </div>
        </div>

        {/* Search */}
        {contacts.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อหรือตำแหน่ง..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/30 transition-all"
            />
          </div>
        )}
      </div>

      {/* ─── Contact List ─── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-[3px] border-violet-500/10 rounded-full" />
            <div className="absolute inset-0 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-2.5 border-[3px] border-purple-400/10 rounded-full" />
            <div className="absolute inset-2.5 border-[3px] border-purple-400 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-violet-500/40" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase animate-pulse">กำลังโหลด...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-white/[0.015] border border-dashed border-white/[0.08] rounded-2xl sm:rounded-3xl p-10 sm:p-16 text-center space-y-5">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/15 rounded-3xl flex items-center justify-center mx-auto">
            <Headphones className="w-10 h-10 text-violet-400/40" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">ยังไม่มีรายชื่อแอดมิน</h3>
            <p className="text-xs text-zinc-500 mt-1.5">เพิ่มรายชื่อแอดมินเพื่อให้ผู้ใช้ติดต่อ</p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-violet-600/25 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            เพิ่มแอดมินคนแรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`group relative overflow-hidden bg-white/[0.02] border rounded-2xl transition-all duration-300 hover:shadow-xl ${
                contact.isActive
                  ? 'border-white/[0.06] hover:border-violet-500/25'
                  : 'border-red-500/10 opacity-60 hover:opacity-100'
              }`}
            >
              {/* Top accent */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] ${contact.isActive ? 'bg-gradient-to-r from-violet-500/50 via-purple-500/50 to-violet-500/50' : 'bg-gradient-to-r from-red-500/30 via-red-500/20 to-red-500/30'}`} />

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {contact.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={contact.avatar} alt={contact.nickname} className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl object-cover ring-2 ring-white/10" />
                      ) : (
                        <div className="w-13 h-13 sm:w-14 sm:h-14 bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 rounded-xl flex items-center justify-center">
                          <span className="text-lg font-black text-violet-400">{contact.nickname[0]}</span>
                        </div>
                      )}
                      {/* Active dot */}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-[2.5px] border-zinc-950 ${contact.isActive ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-sm sm:text-base truncate">{contact.nickname}</h3>
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-violet-500/10 border border-violet-500/15 rounded-md text-[9px] font-bold text-violet-400">
                        <Shield className="w-2.5 h-2.5" />
                        {contact.role}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => toggleActive(contact)}
                      title={contact.isActive ? 'ซ่อน' : 'แสดง'}
                      className="p-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-all active:scale-95"
                    >
                      {contact.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => openEditModal(contact)}
                      title="แก้ไข"
                      className="p-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-all active:scale-95"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(contact)}
                      title="ลบ"
                      className="p-2 bg-red-500/[0.06] border border-red-500/10 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/[0.12] transition-all active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="text-[11px] text-zinc-400">
                      <span className="text-zinc-600">เวลาว่าง:</span> <span className="font-bold text-white">{contact.availableFrom} - {contact.availableTo}</span>
                    </span>
                  </div>
                  {contact.description && (
                    <p className="text-[11px] text-zinc-500 leading-relaxed px-1 line-clamp-2">{contact.description}</p>
                  )}
                </div>

                {/* Facebook Link */}
                <a
                  href={contact.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 bg-blue-600/10 border border-blue-500/15 rounded-xl text-xs font-bold text-blue-400 hover:bg-blue-600/20 hover:border-blue-500/25 transition-all active:scale-[0.97]"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Facebook
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>

                {/* Status pill */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${contact.isActive ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-red-500/60'}`} />
                    <span className="text-[10px] font-bold text-zinc-500">{contact.isActive ? 'แสดงผลอยู่' : 'ซ่อนจากผู้ใช้'}</span>
                  </div>
                  <span className="text-[9px] text-zinc-700 font-medium">
                    #{contact.sortOrder}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search result empty */}
      {!loading && contacts.length > 0 && filteredContacts.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <Search className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm font-bold text-zinc-500">ไม่พบผลลัพธ์สำหรับ &quot;{searchQuery}&quot;</p>
        </div>
      )}

      {/* ─── Delete Modal ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)} />
          <div className="relative bg-zinc-950 border border-white/10 rounded-2xl sm:rounded-3xl w-full max-w-sm p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-red-500/5 animate-ping opacity-30" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">ลบรายชื่อ?</h3>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                  ต้องการลบ <span className="text-white font-bold">{deleteTarget.nickname}</span> ออกจากระบบ?<br />
                  <span className="text-zinc-600">การดำเนินการนี้ไม่สามารถย้อนกลับได้</span>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-3 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-xs font-bold text-zinc-400 transition-all active:scale-95"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-red-600/25 disabled:opacity-50 active:scale-95"
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-2"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> กำลังลบ...</span>
                ) : 'ลบเลย'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add/Edit Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-zinc-950 border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                  {modalMode === 'add' ? <UserPlus className="w-5 h-5 text-white" /> : <Edit2 className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">{modalMode === 'add' ? 'เพิ่มแอดมิน' : 'แก้ไขแอดมิน'}</h2>
                  <p className="text-[10px] text-zinc-500 mt-0.5">กรอกข้อมูลรายชื่อแอดมิน</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2.5 hover:bg-white/5 rounded-xl transition-colors active:scale-95">
                <XCircle className="w-5 h-5 text-zinc-600 hover:text-white transition-colors" />
              </button>
            </div>

            {/* Modal Body */}
            <form id="contact-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {formData.avatar ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formData.avatar} alt="avatar" className="w-24 h-24 rounded-2xl object-cover ring-2 ring-violet-500/20 shadow-xl shadow-violet-500/10" />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-400 transition-colors active:scale-90 shadow-lg"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="w-24 h-24 bg-violet-500/[0.06] border-2 border-dashed border-violet-500/20 rounded-2xl flex items-center justify-center">
                      <Image className="w-8 h-8 text-violet-400/30" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer px-5 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all active:scale-95 flex items-center gap-2">
                  {uploading ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> กำลังอัพโหลด...</>
                  ) : (
                    <><Image className="w-3.5 h-3.5" /> {formData.avatar ? 'เปลี่ยนรูป' : 'เลือกรูปภาพ'}</>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
              </div>

              {/* Nickname */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider ml-1">ชื่อเล่น <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/30 focus:bg-white/[0.05] transition-all"
                  placeholder="เช่น แอดมินบอย"
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider ml-1">ตำแหน่ง</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/30 focus:bg-white/[0.05] transition-all"
                  placeholder="แอดมิน"
                />
              </div>

              {/* Facebook URL */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider ml-1">ลิงก์ Facebook <span className="text-red-400">*</span></label>
                <input
                  type="url"
                  required
                  value={formData.facebookUrl}
                  onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/30 focus:bg-white/[0.05] transition-all"
                  placeholder="https://www.facebook.com/..."
                />
              </div>

              {/* Available Time */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider ml-1">เวลาให้บริการ</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-600">เริ่ม</span>
                    <input
                      type="time"
                      value={formData.availableFrom}
                      onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-12 pr-3 py-3 text-sm text-white focus:outline-none focus:border-violet-500/30 focus:bg-white/[0.05] transition-all"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-600">ถึง</span>
                    <input
                      type="time"
                      value={formData.availableTo}
                      onChange={(e) => setFormData({ ...formData, availableTo: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-3 py-3 text-sm text-white focus:outline-none focus:border-violet-500/30 focus:bg-white/[0.05] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider ml-1">รายละเอียด</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-violet-500/30 focus:bg-white/[0.05] transition-all resize-none"
                  placeholder="รายละเอียดเพิ่มเติม เช่น ดูแลเรื่องอะไร"
                />
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-5 sm:p-6 border-t border-white/[0.06] flex-shrink-0">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-3.5 px-5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-xs font-bold text-zinc-500 transition-all active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  form="contact-form"
                  disabled={submitting}
                  className="flex-1 py-3.5 px-5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-violet-600/25 disabled:opacity-50 active:scale-95"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      กำลังดำเนินการ...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      บันทึก
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
