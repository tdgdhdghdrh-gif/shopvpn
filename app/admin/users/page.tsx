'use client'

import { useEffect, useState, useMemo } from 'react'
import { 
  Users, Search, Wallet, Shield, User, Plus, Edit, Trash2, X, Save,
  Mail, CreditCard, Crown, RefreshCw, ChevronLeft, ChevronRight,
  Zap, CheckCircle2, AlertCircle, Lock, Tag, Gift, Clock, Server,
  Wifi, AlertTriangle, UserPlus, Eye, Copy, UserCheck, Ban, ShieldOff, LogIn
} from 'lucide-react'

interface UserData {
  id: string
  name: string
  email: string
  balance: number
  isAdmin: boolean
  isSuperAdmin: boolean
  isRevenueAdmin: boolean
  isAgent: boolean
  isBanned: boolean
  bannedAt: string | null
  banReason: string | null
  discountExpiry: string | null
  createdAt: string
  avatar?: string | null
}

interface VpnOrder {
  id: string
  clientUUID: string
  remark: string
  subId: string
  vlessLink: string
  packageType: string
  price: number
  duration: number
  expiryTime: string
  isActive: boolean
  createdAt: string
  server: {
    id: string
    name: string
    flag: string
    isActive: boolean
  }
}

interface RenewUserInfo {
  id: string
  name: string
  balance: number
  hasDiscount: boolean
  pricePerDay: number
}

type RoleFilter = 'all' | 'user' | 'admin' | 'superAdmin' | 'revenueAdmin' | 'agent' | 'discount' | 'banned'

function getRoleBadge(user: UserData) {
  if (user.isBanned) return { label: 'ถูกแบน', icon: Ban, color: 'bg-red-500/10 border-red-500/20 text-red-400' }
  if (user.isSuperAdmin) return { label: 'Super Admin', icon: Crown, color: 'bg-amber-500/10 border-amber-500/20 text-amber-400' }
  if (user.isAdmin) return { label: 'Admin', icon: Shield, color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' }
  if (user.isAgent) return { label: 'ตัวแทน', icon: UserCheck, color: 'bg-orange-500/10 border-orange-500/20 text-orange-400' }
  if (user.isRevenueAdmin) return { label: 'Revenue', icon: Wallet, color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' }
  return { label: 'ผู้ใช้', icon: User, color: 'bg-white/5 border-white/5 text-zinc-500' }
}

function getAvatarColor(user: UserData) {
  if (user.isBanned) return 'from-red-500 to-red-700'
  if (user.isSuperAdmin) return 'from-amber-500 to-orange-500'
  if (user.isAdmin) return 'from-purple-500 to-pink-500'
  if (user.isAgent) return 'from-orange-500 to-yellow-500'
  if (user.isRevenueAdmin) return 'from-emerald-500 to-teal-500'
  return 'from-blue-500 to-cyan-500'
}

function hasActiveDiscount(user: UserData): boolean {
  if (!user.discountExpiry) return false
  return new Date(user.discountExpiry) > new Date()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}

function formatExpiry(expiryTime: string): string {
  const d = new Date(expiryTime)
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

function timeLeft(expiryTime: string): string {
  const now = new Date()
  const expiry = new Date(expiryTime)
  const diff = expiry.getTime() - now.getTime()
  if (diff <= 0) return 'หมดอายุแล้ว'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `เหลือ ${days} วัน ${hours} ชม.`
  return `เหลือ ${hours} ชม.`
}

function isExpired(expiryTime: string): boolean {
  return new Date(expiryTime) < new Date()
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    balance: 0,
    role: 'user' as 'user' | 'revenueAdmin' | 'admin' | 'superAdmin' | 'agent',
    password: ''
  })
  const [discountDays, setDiscountDays] = useState(30)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Renew VPN state
  const [showRenewModal, setShowRenewModal] = useState(false)
  const [renewOrders, setRenewOrders] = useState<VpnOrder[]>([])
  const [renewUserInfo, setRenewUserInfo] = useState<RenewUserInfo | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<VpnOrder | null>(null)
  const [renewDays, setRenewDays] = useState(7)
  const [renewLoading, setRenewLoading] = useState(false)

  // Expand user on mobile
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  // Current user's superAdmin status
  const [currentUserIsSuperAdmin, setCurrentUserIsSuperAdmin] = useState(false)

  useEffect(() => {
    fetchUsers()
    fetchCurrentAdmin()
  }, [])

  async function fetchUsers() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (data.users) {
        setUsers(data.users)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'โหลดข้อมูลผู้ใช้ไม่สำเร็จ' })
    } finally {
      setLoading(false)
    }
  }

  async function fetchCurrentAdmin() {
    try {
      const res = await fetch('/api/admin/check')
      const data = await res.json()
      if (data.isAdmin && data.user?.isSuperAdmin) {
        setCurrentUserIsSuperAdmin(true)
      }
    } catch (error) {
      // ignore
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'สร้างผู้ใช้ใหม่สำเร็จ' })
        setShowAddModal(false)
        setFormData({ name: '', email: '', balance: 0, role: 'user', password: '' })
        fetchUsers()
      } else {
        setMessage({ type: 'error', text: data.error || 'การสร้างล้มเหลว' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEditUser(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUser) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: selectedUser.id })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'อัปเดตผู้ใช้สำเร็จ' })
        setShowEditModal(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        setMessage({ type: 'error', text: data.error || 'การอัปเดตล้มเหลว' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'ระบบขัดข้อง' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteUser() {
    if (!selectedUser) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/users?id=${selectedUser.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'ลบผู้ใช้สำเร็จ' })
        setShowDeleteModal(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        setMessage({ type: 'error', text: data.error || 'การลบล้มเหลว' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally {
      setSubmitting(false)
    }
  }

  function openEditModal(user: UserData) {
    setSelectedUser(user)
    const role = user.isSuperAdmin ? 'superAdmin' 
               : user.isAdmin ? 'admin' 
               : user.isAgent ? 'agent'
               : user.isRevenueAdmin ? 'revenueAdmin' 
               : 'user'
    setFormData({
      name: user.name,
      email: user.email,
      balance: user.balance,
      role: role as any,
      password: ''
    })
    setShowEditModal(true)
  }

  function openDeleteModal(user: UserData) {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  function openDiscountModal(user: UserData) {
    setSelectedUser(user)
    setDiscountDays(30)
    setShowDiscountModal(true)
  }

  async function handleGiveDiscount(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUser) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/users/discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, days: discountDays })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setShowDiscountModal(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        setMessage({ type: 'error', text: data.error || 'ให้ส่วนลดไม่สำเร็จ' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRemoveDiscount(user: UserData) {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/users/discount?userId=${user.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        fetchUsers()
      } else {
        setMessage({ type: 'error', text: data.error || 'ยกเลิกส่วนลดไม่สำเร็จ' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally {
      setSubmitting(false)
    }
  }

  function openBanModal(user: UserData) {
    setSelectedUser(user)
    setBanReason('')
    setShowBanModal(true)
  }

  async function handleBanUser(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUser) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/users/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, reason: banReason || undefined })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setShowBanModal(false)
        setSelectedUser(null)
        setBanReason('')
        fetchUsers()
      } else {
        setMessage({ type: 'error', text: data.error || 'แบนผู้ใช้ไม่สำเร็จ' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUnbanUser(user: UserData) {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/users/ban?userId=${user.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        fetchUsers()
      } else {
        setMessage({ type: 'error', text: data.error || 'ปลดแบนไม่สำเร็จ' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally {
      setSubmitting(false)
    }
  }

  // Renew VPN
  async function openRenewModal(user: UserData) {
    setSelectedUser(user)
    setRenewLoading(true)
    setShowRenewModal(true)
    setSelectedOrder(null)
    setRenewDays(7)
    setRenewOrders([])
    setRenewUserInfo(null)

    try {
      const res = await fetch(`/api/admin/users/renew?userId=${user.id}`)
      const data = await res.json()
      if (data.vpnOrders) {
        setRenewOrders(data.vpnOrders)
        setRenewUserInfo(data.user)
      } else {
        setMessage({ type: 'error', text: data.error || 'ไม่สามารถโหลดข้อมูล VPN ได้' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally {
      setRenewLoading(false)
    }
  }

  async function handleRenew() {
    if (!selectedOrder) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/users/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrder.id, days: renewDays })
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        if (selectedUser) {
          const refreshRes = await fetch(`/api/admin/users/renew?userId=${selectedUser.id}`)
          const refreshData = await refreshRes.json()
          if (refreshData.vpnOrders) {
            setRenewOrders(refreshData.vpnOrders)
            setRenewUserInfo(refreshData.user)
          }
        }
        setSelectedOrder(null)
        fetchUsers()
      } else {
        setMessage({ type: 'error', text: data.error || 'ต่ออายุไม่สำเร็จ' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally {
      setSubmitting(false)
    }
  }

  // Impersonate — login as user (Super Admin only)
  async function handleImpersonate(user: UserData) {
    if (!currentUserIsSuperAdmin) {
      setMessage({ type: 'error', text: 'เฉพาะ Super Admin เท่านั้น' })
      return
    }
    if (user.isSuperAdmin) {
      setMessage({ type: 'error', text: 'ไม่สามารถเข้าดูบัญชี Super Admin ได้' })
      return
    }
    if (!confirm(`เข้าสู่ระบบในฐานะ "${user.name}"?\n\nจะเปลี่ยนไปดูหน้าบ้านในมุมมองของผู้ใช้คนนี้ (โหมดดูเท่านั้น ไม่สามารถใช้เครดิตได้)`)) {
      return
    }
    try {
      setSubmitting(true)
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      const data = await res.json()
      if (data.success) {
        window.location.href = '/'
      } else {
        setMessage({ type: 'error', text: data.error || 'ไม่สามารถเข้าสู่ระบบได้' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    } finally {
      setSubmitting(false)
    }
  }

  // Computed stats
  const stats = useMemo(() => {
    const admins = users.filter(u => u.isAdmin || u.isSuperAdmin || u.isRevenueAdmin || u.isAgent).length
    const totalBalance = users.reduce((sum, u) => sum + u.balance, 0)
    const withDiscount = users.filter(u => hasActiveDiscount(u)).length
    const banned = users.filter(u => u.isBanned).length
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const newToday = users.filter(u => new Date(u.createdAt) >= today).length
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const newThisWeek = users.filter(u => new Date(u.createdAt) >= weekAgo).length
    return { total: users.length, admins, totalBalance, withDiscount, banned, newToday, newThisWeek }
  }, [users])

  // Filtered + paginated
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = search === '' ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === 'all' ||
        (roleFilter === 'user' && !u.isAdmin && !u.isSuperAdmin && !u.isRevenueAdmin && !u.isAgent) ||
        (roleFilter === 'admin' && u.isAdmin && !u.isSuperAdmin) ||
        (roleFilter === 'superAdmin' && u.isSuperAdmin) ||
        (roleFilter === 'revenueAdmin' && u.isRevenueAdmin) ||
        (roleFilter === 'agent' && u.isAgent) ||
        (roleFilter === 'discount' && hasActiveDiscount(u)) ||
        (roleFilter === 'banned' && u.isBanned)
      return matchSearch && matchRole
    })
  }, [users, search, roleFilter])

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset page when filter changes
  useEffect(() => { setCurrentPage(1) }, [search, roleFilter])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Role selector component (reused in add/edit modals)
  function RoleSelector() {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[
          { value: 'user', label: 'ผู้ใช้ทั่วไป', desc: 'ไม่มีสิทธิ์แอดมิน', icon: User, activeClass: 'border-blue-500/30 bg-blue-500/10', iconActive: 'text-blue-400' },
          { value: 'revenueAdmin', label: 'Revenue', desc: 'ดูรายได้/ธุรกรรม', icon: Wallet, activeClass: 'border-emerald-500/30 bg-emerald-500/10', iconActive: 'text-emerald-400' },
          { value: 'agent', label: 'ตัวแทน', desc: 'ภาพรวม/โหนด/รายได้', icon: UserCheck, activeClass: 'border-orange-500/30 bg-orange-500/10', iconActive: 'text-orange-400' },
          { value: 'admin', label: 'Admin', desc: 'จัดการระบบ', icon: Shield, activeClass: 'border-purple-500/30 bg-purple-500/10', iconActive: 'text-purple-400' },
          { value: 'superAdmin', label: 'Super Admin', desc: 'ควบคุมทุกอย่าง', icon: Crown, activeClass: 'border-amber-500/30 bg-amber-500/10', iconActive: 'text-amber-400' },
        ].map((opt) => {
          const isSelected = formData.role === opt.value
          const Icon = opt.icon
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFormData({...formData, role: opt.value as any})}
              className={`flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer transition-all active:scale-95 text-left ${
                isSelected ? opt.activeClass : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? opt.iconActive : 'text-zinc-600'}`} />
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{opt.label}</p>
                <p className="text-[9px] text-zinc-600 truncate">{opt.desc}</p>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {message.text && (
        <div className={`fixed bottom-4 sm:bottom-8 right-4 sm:right-8 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all animate-in slide-in-from-right-10 ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span className="font-bold text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            จัดการผู้ใช้
          </h2>
          <p className="text-xs text-zinc-500 mt-1">จัดการบัญชี สิทธิ์ และยอดเงินในระบบ</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchUsers}
            className="flex items-center gap-2 px-3 py-2.5 bg-zinc-900 border border-white/5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:border-white/10 transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">รีเฟรช</span>
          </button>
          <button
            onClick={() => {
              setFormData({ name: '', email: '', balance: 0, role: 'user', password: '' })
              setShowAddModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 border border-blue-500/20 rounded-xl text-xs font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>เพิ่มผู้ใช้</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/10 rounded-2xl p-4 sm:p-5 hover:border-blue-500/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            {stats.newToday > 0 && (
              <span className="text-[10px] font-bold text-blue-400">+{stats.newToday} วันนี้</span>
            )}
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">ผู้ใช้ทั้งหมด</p>
          <p className="text-2xl sm:text-3xl font-black text-blue-400 tracking-tight">{stats.total.toLocaleString()}</p>
          <p className="text-[10px] text-zinc-600 mt-1">สัปดาห์นี้ +{stats.newThisWeek}</p>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/10 rounded-2xl p-4 sm:p-5 hover:border-emerald-500/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">ยอดเงินรวม</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">{stats.totalBalance.toLocaleString()}<span className="text-sm ml-1">฿</span></p>
          <p className="text-[10px] text-zinc-600 mt-1">เงินในบัญชีทั้งหมด</p>
        </div>

        <div className="relative overflow-hidden bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">แอดมิน</p>
          <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">{stats.admins}</p>
          <p className="text-[10px] text-zinc-600 mt-1">ผู้ดูแลระบบ</p>
        </div>

        <div className="relative overflow-hidden bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-white/10 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center">
              <Tag className="w-4 h-4 text-pink-400" />
            </div>
            {stats.withDiscount > 0 && (
              <span className="text-[10px] font-bold text-pink-400">{stats.withDiscount} คน</span>
            )}
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">มีส่วนลด</p>
          <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">{stats.withDiscount}</p>
          <p className="text-[10px] text-zinc-600 mt-1">ราคาพิเศษ 1฿/วัน</p>
        </div>

        <div className="relative overflow-hidden bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-red-500/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
              <Ban className="w-4 h-4 text-red-400" />
            </div>
            {stats.banned > 0 && (
              <span className="text-[10px] font-bold text-red-400">{stats.banned} คน</span>
            )}
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">ถูกแบน</p>
          <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">{stats.banned}</p>
          <p className="text-[10px] text-zinc-600 mt-1">บัญชีที่ถูกระงับ</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="ค้นหาชื่อหรืออีเมล..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/10 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          <div className="flex bg-zinc-900/50 border border-white/5 rounded-xl p-1">
            {([
              { key: 'all', label: `ทั้งหมด (${stats.total})` },
              { key: 'user', label: 'ผู้ใช้' },
              { key: 'admin', label: 'Admin' },
              { key: 'superAdmin', label: 'Super' },
              { key: 'revenueAdmin', label: 'Revenue' },
              { key: 'agent', label: 'ตัวแทน' },
              { key: 'discount', label: 'ส่วนลด' },
              { key: 'banned', label: 'ถูกแบน' },
            ] as { key: RoleFilter; label: string }[]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setRoleFilter(tab.key)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap ${
                  roleFilter === tab.key 
                    ? 'bg-zinc-800 text-white shadow-lg' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-[10px] font-bold text-zinc-600 whitespace-nowrap ml-auto">
            {filteredUsers.length} รายการ
          </span>
        </div>
      </div>

      {/* User List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase animate-pulse">กำลังซิงค์รายชื่อ...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-zinc-900/30 border border-white/5 border-dashed rounded-2xl p-12 sm:p-16 text-center space-y-4">
          <div className="w-16 h-16 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 text-zinc-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">ไม่พบผู้ใช้</h3>
            <p className="text-xs text-zinc-500 mt-1">ลองเปลี่ยนตัวกรองหรือคำค้นหา</p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-4 px-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">ผู้ใช้</th>
                  <th className="py-4 px-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">อีเมล</th>
                  <th className="py-4 px-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">ยอดเงิน</th>
                  <th className="py-4 px-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">สิทธิ์</th>
                  <th className="py-4 px-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest hidden xl:table-cell">ส่วนลด</th>
                  <th className="py-4 px-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest hidden xl:table-cell">สมัครเมื่อ</th>
                  <th className="py-4 px-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {paginatedUsers.map((user) => {
                  const role = getRoleBadge(user)
                  const RoleIcon = role.icon
                  return (
                    <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-white/10 flex-shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br ${getAvatarColor(user)} flex-shrink-0`}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm truncate flex items-center gap-1.5">
                              {user.name}
                              {user.isSuperAdmin && <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                              {user.isBanned && <Ban className="w-3 h-3 text-red-400 flex-shrink-0" />}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="text-xs text-zinc-400 truncate block max-w-[200px]">{user.email}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-bold text-[11px]">
                          ฿{user.balance.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 border rounded-lg text-[10px] font-bold ${role.color}`}>
                          <RoleIcon className="w-3 h-3" />
                          {role.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 hidden xl:table-cell">
                        {hasActiveDiscount(user) ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-lg text-[10px] font-bold">
                            <Tag className="w-3 h-3" />
                            ถึง {formatDate(user.discountExpiry!)}
                          </span>
                        ) : (
                          <span className="text-zinc-700 text-[10px]">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 hidden xl:table-cell">
                        <span className="text-[11px] text-zinc-500">{formatDate(user.createdAt)}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!user.isSuperAdmin && (
                            user.isBanned ? (
                              <button 
                                onClick={() => handleUnbanUser(user)}
                                className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                                title="ปลดแบน"
                              >
                                <ShieldOff className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => openBanModal(user)}
                                className="p-1.5 bg-red-500/5 border border-red-500/10 rounded-lg text-red-400/60 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                title="แบนผู้ใช้"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                          {!user.isAdmin && !user.isSuperAdmin && !user.isRevenueAdmin && !user.isAgent && !user.isBanned && (
                            <>
                              {hasActiveDiscount(user) ? (
                                <button 
                                  onClick={() => handleRemoveDiscount(user)}
                                  className="p-1.5 bg-pink-500/10 border border-pink-500/20 rounded-lg text-pink-400 hover:bg-pink-500 hover:text-white transition-all active:scale-95"
                                  title="ยกเลิกส่วนลด"
                                >
                                  <Tag className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => openDiscountModal(user)}
                                  className="p-1.5 bg-white/5 border border-white/5 rounded-lg text-zinc-500 hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all active:scale-95"
                                  title="ให้ส่วนลด"
                                >
                                  <Gift className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button 
                                onClick={() => openRenewModal(user)}
                                className="p-1.5 bg-white/5 border border-white/5 rounded-lg text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all active:scale-95"
                                title="ต่ออายุ VPN"
                              >
                                <Clock className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {currentUserIsSuperAdmin && !user.isSuperAdmin && !user.isBanned && (
                            <button 
                              onClick={() => handleImpersonate(user)}
                              className="p-1.5 bg-white/5 border border-white/5 rounded-lg text-amber-400 hover:bg-amber-500 hover:text-white transition-all active:scale-95"
                              title="เข้าสู่ระบบในฐานะผู้ใช้"
                            >
                              <LogIn className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button 
                            onClick={() => openEditModal(user)}
                            className="p-1.5 bg-white/5 border border-white/5 rounded-lg text-blue-400 hover:bg-blue-500 hover:text-white transition-all active:scale-95"
                            title="แก้ไข"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => openDeleteModal(user)}
                            className="p-1.5 bg-red-500/5 border border-red-500/10 rounded-lg text-red-400/60 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2">
            {paginatedUsers.map((user) => {
              const role = getRoleBadge(user)
              const RoleIcon = role.icon
              const isExpanded = expandedUser === user.id
              return (
                <div 
                  key={user.id}
                  className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden transition-all"
                >
                  {/* Card Header - always visible */}
                  <button
                    onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                    className="w-full flex items-center gap-3 p-4 text-left active:bg-white/[0.02]"
                  >
                    {user.avatar ? (
                      <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/10 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br ${getAvatarColor(user)} flex-shrink-0`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-white text-sm truncate">{user.name}</p>
                        {user.isSuperAdmin && <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                        {user.isBanned && <Ban className="w-3 h-3 text-red-400 flex-shrink-0" />}
                      </div>
                      <p className="text-[10px] text-zinc-600 truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold text-emerald-400">฿{user.balance.toLocaleString()}</span>
                      <ChevronRight className={`w-4 h-4 text-zinc-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                      {/* Info Row */}
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 border rounded-lg text-[10px] font-bold ${role.color}`}>
                          <RoleIcon className="w-3 h-3" />
                          {role.label}
                        </span>
                        {hasActiveDiscount(user) && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-lg text-[10px] font-bold">
                            <Tag className="w-3 h-3" />
                            ส่วนลดถึง {formatDate(user.discountExpiry!)}
                          </span>
                        )}
                        {user.isBanned && user.banReason && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-bold">
                            เหตุผล: {user.banReason}
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                          สมัคร {formatDate(user.createdAt)}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {!user.isSuperAdmin && (
                          user.isBanned ? (
                            <button 
                              onClick={() => handleUnbanUser(user)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-bold text-emerald-400 active:scale-95"
                            >
                              <ShieldOff className="w-3 h-3" />
                              ปลดแบน
                            </button>
                          ) : (
                            <button 
                              onClick={() => openBanModal(user)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-bold text-red-400 active:scale-95"
                            >
                              <Ban className="w-3 h-3" />
                              แบน
                            </button>
                          )
                        )}
                        {!user.isAdmin && !user.isSuperAdmin && !user.isRevenueAdmin && !user.isAgent && !user.isBanned && (
                          <>
                            {hasActiveDiscount(user) ? (
                              <button 
                                onClick={() => handleRemoveDiscount(user)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-pink-500/10 border border-pink-500/20 rounded-xl text-[10px] font-bold text-pink-400 active:scale-95"
                              >
                                <Tag className="w-3 h-3" />
                                ยกเลิกส่วนลด
                              </button>
                            ) : (
                              <button 
                                onClick={() => openDiscountModal(user)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-zinc-400 active:scale-95"
                              >
                                <Gift className="w-3 h-3" />
                                ส่วนลด
                              </button>
                            )}
                            <button 
                              onClick={() => openRenewModal(user)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[10px] font-bold text-cyan-400 active:scale-95"
                            >
                              <Clock className="w-3 h-3" />
                              ต่อ VPN
                            </button>
                          </>
                        )}
                        {currentUserIsSuperAdmin && !user.isSuperAdmin && !user.isBanned && (
                          <button 
                            onClick={() => handleImpersonate(user)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] font-bold text-amber-400 active:scale-95"
                          >
                            <LogIn className="w-3 h-3" />
                            เข้าระบบ
                          </button>
                        )}
                        <button 
                          onClick={() => openEditModal(user)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] font-bold text-blue-400 active:scale-95"
                        >
                          <Edit className="w-3 h-3" />
                          แก้ไข
                        </button>
                        <button 
                          onClick={() => openDeleteModal(user)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-500/5 border border-red-500/10 rounded-xl text-[10px] font-bold text-red-400 active:scale-95 ml-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-[10px] font-bold text-zinc-600">
                {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredUsers.length)} จาก {filteredUsers.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-zinc-900 border border-white/5 rounded-xl disabled:opacity-30 transition-all active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4 text-zinc-400" />
                </button>
                <span className="px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-xl text-[10px] font-bold text-zinc-400 min-w-[60px] text-center">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-zinc-900 border border-white/5 rounded-xl disabled:opacity-30 transition-all active:scale-95"
                >
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ============ MODALS ============ */}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-zinc-950 border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">เพิ่มผู้ใช้ใหม่</h2>
                  <p className="text-[11px] text-zinc-500">สร้างบัญชีพร้อมกำหนดสิทธิ์</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors active:scale-90">
                <X className="w-5 h-5 text-zinc-600" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600 ml-1">ชื่อ</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/30 transition-all"
                    placeholder="สมชาย ใจดี" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600 ml-1">อีเมล</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/30 transition-all"
                    placeholder="user@example.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600 ml-1">รหัสผ่าน</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                    <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/30 transition-all"
                      placeholder="••••••••" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600 ml-1">เครดิตเริ่มต้น (฿)</label>
                  <input type="number" min="0" value={formData.balance} onChange={(e) => setFormData({...formData, balance: parseInt(e.target.value) || 0})}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/30 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 ml-1">ระดับสิทธิ์</label>
                {currentUserIsSuperAdmin ? (
                  <RoleSelector />
                ) : (
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <p className="text-xs text-zinc-500">เฉพาะแอดมินสูงสุดเท่านั้นที่สามารถกำหนดยศได้</p>
                  </div>
                )}
              </div>
              {/* Footer */}
              <div className="flex gap-3 pt-3 border-t border-white/5">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="py-3 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-zinc-500 transition-all active:scale-95">
                  ยกเลิก
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2">
                  {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  สร้างบัญชี
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-zinc-950 border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                  <Edit className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">แก้ไขผู้ใช้</h2>
                  <p className="text-[11px] text-zinc-500">{selectedUser?.name}</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors active:scale-90">
                <X className="w-5 h-5 text-zinc-600" />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600 ml-1">ชื่อ</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/30 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600 ml-1">อีเมล</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/30 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600 ml-1">รหัสผ่านใหม่ (เว้นว่างหากไม่เปลี่ยน)</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                    <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/30 transition-all"
                      placeholder="••••••••" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600 ml-1">เครดิต (฿)</label>
                  <input type="number" min="0" value={formData.balance} onChange={(e) => setFormData({...formData, balance: parseInt(e.target.value) || 0})}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/30 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 ml-1">ระดับสิทธิ์</label>
                {currentUserIsSuperAdmin ? (
                  <RoleSelector />
                ) : (
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <p className="text-xs text-zinc-500">เฉพาะแอดมินสูงสุดเท่านั้นที่สามารถเปลี่ยนยศได้</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-3 border-t border-white/5">
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="py-3 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-zinc-500 transition-all active:scale-95">
                  ยกเลิก
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2">
                  {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !submitting && setShowDeleteModal(false)} />
          <div className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-sm p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">ลบผู้ใช้?</h3>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  ต้องการลบ <span className="text-white font-bold">{selectedUser?.name}</span> ({selectedUser?.email}) หรือไม่?
                  <br />การลบนี้จะไม่สามารถย้อนกลับได้
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} disabled={submitting}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-zinc-400 transition-all active:scale-95">
                ยกเลิก
              </button>
              <button onClick={handleDeleteUser} disabled={submitting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2">
                {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                ลบถาวร
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDiscountModal(false)} />
          <div className="relative bg-zinc-950 border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center">
                  <Gift className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">ให้ส่วนลด</h2>
                  <p className="text-[11px] text-zinc-500">{selectedUser?.name} - ราคา 1 ฿/วัน</p>
                </div>
              </div>
              <button onClick={() => setShowDiscountModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors active:scale-90">
                <X className="w-5 h-5 text-zinc-600" />
              </button>
            </div>
            <form onSubmit={handleGiveDiscount} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-600 ml-1">จำนวนวัน</label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 7, 14, 21, 30].map((day) => (
                    <button key={day} type="button" onClick={() => setDiscountDays(day)}
                      className={`py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                        discountDays === day ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                      }`}>
                      {day}
                    </button>
                  ))}
                </div>
                <input type="range" min="1" max="30" value={discountDays} onChange={(e) => setDiscountDays(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>1 วัน</span>
                  <span className="text-pink-400 font-bold text-base">{discountDays} วัน</span>
                  <span>30 วัน</span>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">ราคาปกติ</span>
                  <span className="text-zinc-600 line-through">4 ฿/วัน</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">ราคาส่วนลด</span>
                  <span className="text-pink-400 font-bold">1 ฿/วัน</span>
                </div>
                <div className="border-t border-white/5 pt-2 flex justify-between">
                  <span className="text-white font-bold">ประหยัดได้</span>
                  <span className="text-emerald-400 font-bold">{discountDays * 3} ฿</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowDiscountModal(false)}
                  className="py-3 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-zinc-500 transition-all active:scale-95">
                  ยกเลิก
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 px-4 bg-pink-600 hover:bg-pink-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-pink-600/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2">
                  {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Gift className="w-3.5 h-3.5" />}
                  ให้ส่วนลด {discountDays} วัน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ban User Modal */}
      {showBanModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !submitting && setShowBanModal(false)} />
          <div className="relative bg-zinc-950 border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
                  <Ban className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">แบนผู้ใช้</h2>
                  <p className="text-[11px] text-zinc-500">{selectedUser?.name} — {selectedUser?.email}</p>
                </div>
              </div>
              <button onClick={() => setShowBanModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors active:scale-90">
                <X className="w-5 h-5 text-zinc-600" />
              </button>
            </div>
            <form onSubmit={handleBanUser} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-bold">คำเตือน</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  ผู้ใช้ที่ถูกแบนจะไม่สามารถเข้าสู่ระบบได้ และหากกำลังออนไลน์อยู่ จะถูกเตะออกจากระบบทันที
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 ml-1">เหตุผลในการแบน (ไม่บังคับ)</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="ระบุเหตุผล เช่น สแปม, ฉ้อโกง, ละเมิดกฎ..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-500/30 focus:ring-1 focus:ring-red-500/10 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowBanModal(false)} disabled={submitting}
                  className="py-3 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-zinc-500 transition-all active:scale-95">
                  ยกเลิก
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2">
                  {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                  ยืนยันแบน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renew VPN Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { setShowRenewModal(false); setSelectedOrder(null) }} />
          <div className="relative bg-zinc-950 border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">ต่ออายุ VPN</h2>
                  <p className="text-[11px] text-zinc-500">
                    {selectedUser?.name} — ยอดเงิน: ฿{renewUserInfo?.balance?.toLocaleString() || selectedUser?.balance?.toLocaleString() || 0}
                    {renewUserInfo?.hasDiscount && <span className="text-pink-400 ml-1">({renewUserInfo.pricePerDay} ฿/วัน)</span>}
                    {renewUserInfo && !renewUserInfo.hasDiscount && <span className="text-zinc-600 ml-1">({renewUserInfo.pricePerDay} ฿/วัน)</span>}
                  </p>
                </div>
              </div>
              <button onClick={() => { setShowRenewModal(false); setSelectedOrder(null) }}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors active:scale-90">
                <X className="w-5 h-5 text-zinc-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {renewLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 border-3 border-cyan-500/10 rounded-full" />
                    <div className="absolute inset-0 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-xs text-zinc-500">กำลังโหลดรายการ VPN...</p>
                </div>
              ) : renewOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-14 h-14 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center">
                    <Wifi className="w-7 h-7 text-zinc-700" />
                  </div>
                  <p className="text-xs text-zinc-500">ผู้ใช้นี้ยังไม่มีโค้ด VPN</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-600 ml-1">
                      เลือกโค้ดที่ต้องการต่ออายุ ({renewOrders.length} รายการ)
                    </label>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {renewOrders.map((order) => {
                        const expired = isExpired(order.expiryTime)
                        const isSelected = selectedOrder?.id === order.id
                        return (
                          <button
                            key={order.id}
                            type="button"
                            onClick={() => setSelectedOrder(isSelected ? null : order)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${
                              isSelected
                                ? 'bg-cyan-500/10 border-cyan-500/30'
                                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-base">{order.server.flag}</span>
                                  <span className="font-bold text-white text-sm truncate">{order.remark}</span>
                                  {expired ? (
                                    <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-[9px] font-bold">หมดอายุ</span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[9px] font-bold">ใช้งานได้</span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-zinc-500">
                                  <span className="flex items-center gap-1"><Server className="w-3 h-3" />{order.server.name}</span>
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{expired ? 'หมดอายุ ' + formatExpiry(order.expiryTime) : timeLeft(order.expiryTime)}</span>
                                  <span>{order.packageType} · {order.duration} วัน</span>
                                </div>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
                                isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-white/20'
                              }`}>
                                {isSelected && <CheckCircle2 className="w-3 h-3 text-black" />}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {selectedOrder && (
                    <div className="space-y-4 border-t border-white/5 pt-4 animate-in slide-in-from-bottom-3 duration-200">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-600 ml-1">จำนวนวัน</label>
                        <div className="grid grid-cols-6 gap-2">
                          {[1, 3, 7, 14, 21, 30].map((day) => (
                            <button key={day} type="button" onClick={() => setRenewDays(day)}
                              className={`py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                                renewDays === day ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                              }`}>
                              {day}
                            </button>
                          ))}
                        </div>
                        <input type="range" min="1" max="30" value={renewDays} onChange={(e) => setRenewDays(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                        <div className="flex justify-between text-[10px] text-zinc-600">
                          <span>1 วัน</span>
                          <span className="text-cyan-400 font-bold text-base">{renewDays} วัน</span>
                          <span>30 วัน</span>
                        </div>
                      </div>

                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">โค้ด</span>
                          <span className="text-white font-medium truncate ml-4">{selectedOrder.remark}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">ราคาต่อวัน</span>
                          <span className={`font-bold ${renewUserInfo?.hasDiscount ? 'text-pink-400' : 'text-white'}`}>
                            {renewUserInfo?.pricePerDay || 2} ฿/วัน
                            {renewUserInfo?.hasDiscount && <span className="text-zinc-600 line-through ml-2">2 ฿</span>}
                          </span>
                        </div>
                        <div className="border-t border-white/5 pt-2 flex justify-between">
                          <span className="text-white font-bold">รวมหักเงิน</span>
                          <span className="text-cyan-400 font-black text-lg">{renewDays * (renewUserInfo?.pricePerDay || 2)} ฿</span>
                        </div>
                        {renewUserInfo && renewUserInfo.balance < renewDays * renewUserInfo.pricePerDay && (
                          <div className="mt-2 flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            เครดิตไม่เพียงพอ (มี {renewUserInfo.balance} ฿)
                          </div>
                        )}
                        <p className="text-[10px] text-zinc-600 mt-1">
                          {isExpired(selectedOrder.expiryTime) 
                            ? 'หมดอายุแล้ว — จะต่อจากตอนนี้'
                            : `ยังไม่หมดอายุ — จะต่อจากวันหมดอายุเดิม (${formatExpiry(selectedOrder.expiryTime)})`
                          }
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button type="button" onClick={() => setSelectedOrder(null)}
                          className="py-3 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-zinc-500 transition-all active:scale-95">
                          ยกเลิก
                        </button>
                        <button type="button" onClick={handleRenew}
                          disabled={submitting || (renewUserInfo ? renewUserInfo.balance < renewDays * renewUserInfo.pricePerDay : false)}
                          className="flex-1 py-3 px-4 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2">
                          {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                          ต่ออายุ {renewDays} วัน ({renewDays * (renewUserInfo?.pricePerDay || 2)} ฿)
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
