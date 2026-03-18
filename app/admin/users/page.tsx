'use client'

import { useEffect, useState } from 'react'
import { 
  Users, 
  Search, 
  Wallet,
  Shield,
  User,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Mail,
  CreditCard,
  Crown,
  RefreshCw,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Lock,
  MoreHorizontal,
  Tag,
  Gift
} from 'lucide-react'
import DashboardCard from '@/components/admin/DashboardCard'

interface User {
  id: string
  name: string
  email: string
  balance: number
  isAdmin: boolean
  discountExpiry: string | null
  createdAt: string
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title: string
  description?: string
}

function Modal({ isOpen, onClose, children, title, description }: ModalProps) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose}
      />
      <div className="relative bg-[#0d0d0d] border border-white/10 rounded-[2rem] sm:rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-white/5">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              {title}
            </h2>
            {description && <p className="text-[11px] sm:text-sm text-gray-500 font-medium">{description}</p>}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors group active:scale-90"
          >
            <X className="w-6 h-6 text-gray-600 group-hover:text-white" />
          </button>
        </div>
        <div className="p-6 sm:p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    balance: 0,
    isAdmin: false,
    password: ''
  })
  const [discountDays, setDiscountDays] = useState(30)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Check if user has active discount
  const hasActiveDiscount = (user: User): boolean => {
    if (!user.discountExpiry) return false
    return new Date(user.discountExpiry) > new Date()
  }

  useEffect(() => {
    fetchUsers()
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
      console.error('Failed to fetch users')
      setMessage({ type: 'error', text: 'ซิงโครไนซ์ข้อมูลผู้ใช้ไม่สำเร็จ' })
    } finally {
      setLoading(false)
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
        setFormData({ name: '', email: '', balance: 0, isAdmin: false, password: '' })
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
      setMessage({ type: 'error', text: 'ระบบขัดข้องระหว่างการอัปเดต' })
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
        setMessage({ type: 'success', text: 'ลบผู้ใช้ออกจากระบบสำเร็จ' })
        setShowDeleteModal(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        setMessage({ type: 'error', text: data.error || 'การลบล้มเหลว' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดระหว่างการลบ' })
    } finally {
      setSubmitting(false)
    }
  }

  function openEditModal(user: User) {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      balance: user.balance,
      isAdmin: user.isAdmin,
      password: ''
    })
    setShowEditModal(true)
  }

  function openDeleteModal(user: User) {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  function openDiscountModal(user: User) {
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
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRemoveDiscount(user: User) {
    if (!confirm(`ยืนยันการยกเลิกส่วนลดของ ${user.name}?`)) return
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
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
    } finally {
      setSubmitting(false)
    }
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Toast Notification */}
      {message.text && (
        <div className={`fixed bottom-4 sm:bottom-8 right-4 sm:right-8 z-50 flex items-center gap-3 px-5 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl transition-all animate-in slide-in-from-right-10 ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
          <span className="font-semibold text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20 shadow-sm">
               <Users className="w-4 h-4 text-blue-400" />
             </div>
             <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">จัดการรายชื่อ</h2>
          </div>
          <p className="text-gray-500 text-sm font-medium">จัดการบัญชีผู้ใช้ สิทธิ์การเข้าถึง และยอดเงินในระบบ</p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
           <button 
             onClick={fetchUsers}
             className="p-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-gray-400 hover:text-white transition-all group active:scale-95"
           >
             <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
           </button>
           <button
             onClick={() => setShowAddModal(true)}
             className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 border border-blue-500/20 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
           >
             <Plus className="w-4 h-4" />
             <span>เพิ่มผู้ใช้</span>
           </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard 
          label="ผู้ใช้ทั้งหมด" 
          value={users.length} 
          description="ลงทะเบียนแล้ว"
          icon={Users}
          color="text-blue-400"
          trend="+10%"
          trendType="positive"
        />
        <DashboardCard 
          label="ยอดเงินรวม" 
          value={`฿${totalBalance.toLocaleString()}`} 
          description="ทรัพย์สินรวม"
          icon={Wallet}
          color="text-emerald-400"
          trend="สะสม"
          trendType="neutral"
        />
        <DashboardCard 
          label="แอดมิน" 
          value={users.filter(u => u.isAdmin).length} 
          description="ผู้มีสิทธิ์ดูแล"
          icon={Shield}
          color="text-purple-400"
          trend="สูงสุด"
          trendType="neutral"
        />
        <DashboardCard 
          label="ออนไลน์" 
          value={users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length} 
          description="รอบ 7 วัน"
          icon={Zap}
          color="text-amber-400"
          trend="+15%"
          trendType="positive"
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="ค้นหาชื่อหรืออีเมล..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
           <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-gray-400 active:scale-95 transition-all">
             <Filter className="w-4 h-4" />
             <span>ตัวกรอง</span>
           </button>
           <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-gray-400 active:scale-95 transition-all">
             <Download className="w-4 h-4" />
             <span>ส่งออก</span>
           </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-4">
             <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
             <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest text-center">กำลังซิงค์รายชื่อ...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 sm:p-20 text-center space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-gray-700" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">ไม่พบข้อมูล</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-xs sm:text-sm">เงื่อนไขที่คุณค้นหาไม่ตรงกับผู้ใช้รายใดในระบบ</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-0">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="py-4 sm:py-5 px-6 sm:px-8 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">ข้อมูลผู้ใช้</th>
                    <th className="py-4 sm:py-5 px-6 sm:px-8 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest hidden md:table-cell">อีเมลติดต่อ</th>
                    <th className="py-4 sm:py-5 px-6 sm:px-8 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">ยอดเงินคงเหลือ</th>
                    <th className="py-4 sm:py-5 px-6 sm:px-8 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest hidden lg:table-cell">สิทธิ์</th>
                    <th className="py-4 sm:py-5 px-6 sm:px-8 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest hidden xl:table-cell">ส่วนลด</th>
                    <th className="py-4 sm:py-5 px-6 sm:px-8 text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="group hover:bg-white/[0.03] transition-colors">
                      <td className="py-4 sm:py-5 px-6 sm:px-8">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg group-hover:scale-110 transition-transform ${
                            user.isAdmin 
                              ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-500/10' 
                              : 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/10'
                          }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm sm:text-base tracking-tight truncate flex items-center gap-1.5">
                              {user.name}
                              {user.isAdmin && <Crown className="w-3 h-3 text-purple-400 flex-shrink-0" />}
                            </p>
                            <p className="text-[9px] sm:text-[10px] font-bold text-gray-600 uppercase tracking-widest md:hidden truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 sm:py-5 px-6 sm:px-8 hidden md:table-cell">
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-400 truncate">
                          <Mail className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                          {user.email}
                        </div>
                      </td>
                      <td className="py-4 sm:py-5 px-6 sm:px-8">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs">
                          <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          ฿{user.balance.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-4 sm:py-5 px-6 sm:px-8 hidden lg:table-cell">
                        {user.isAdmin ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-[9px] font-black uppercase tracking-widest">
                            <Shield className="w-3 h-3" />
                            ผู้ดูแลระบบ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-gray-500 rounded-xl text-[9px] font-black uppercase tracking-widest">
                            <User className="w-3 h-3" />
                            ผู้ใช้
                          </span>
                        )}
                      </td>
                      <td className="py-4 sm:py-5 px-6 sm:px-8 hidden xl:table-cell">
                        {hasActiveDiscount(user) ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-xl text-[9px] font-black uppercase tracking-widest">
                            <Tag className="w-3 h-3" />
                            ถึง {new Date(user.discountExpiry!).toLocaleDateString('th-TH')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-gray-600 rounded-xl text-[9px] font-black uppercase tracking-widest">
                            -
                          </span>
                        )}
                      </td>
                      <td className="py-4 sm:py-5 px-6 sm:px-8 text-right">
                        <div className="flex items-center justify-end gap-1.5 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          {!user.isAdmin && (
                            hasActiveDiscount(user) ? (
                              <button 
                                onClick={() => handleRemoveDiscount(user)}
                                className="p-1.5 sm:p-2 bg-pink-500/10 border border-pink-500/30 rounded-lg sm:rounded-xl text-pink-400 hover:bg-pink-500 hover:text-white transition-all active:scale-95"
                                title="ยกเลิกส่วนลด"
                              >
                                <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => openDiscountModal(user)}
                                className="p-1.5 sm:p-2 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-gray-400 hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all active:scale-95"
                                title="ให้ส่วนลด"
                              >
                                <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            )
                          )}
                          <button 
                            onClick={() => openEditModal(user)}
                            className="p-1.5 sm:p-2 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-blue-400 hover:bg-blue-500 hover:text-white transition-all active:scale-95"
                          >
                            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button 
                            onClick={() => openDeleteModal(user)}
                            className="p-1.5 sm:p-2 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-red-400 hover:bg-red-600 hover:text-white transition-all active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 sm:px-8 py-4 sm:py-6 border-t border-white/5 gap-4">
                <p className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest order-2 sm:order-1">
                  แสดง {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} จาก {filteredUsers.length}
                </p>
                <div className="flex items-center gap-3 order-1 sm:order-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-white/5 border border-white/10 rounded-xl disabled:opacity-30 transition-all active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </button>
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] sm:text-xs font-bold text-gray-400">
                    {currentPage} / {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-white/5 border border-white/10 rounded-xl disabled:opacity-30 transition-all active:scale-95"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add User Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        title="เพิ่มบัญชีผู้ใช้"
        description="สร้างตัวตนใหม่ในระบบพร้อมกำหนดระดับการเข้าถึง"
      >
        <form onSubmit={handleAddUser} className="space-y-5 sm:space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">ชื่อ-นามสกุล</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 sm:py-3.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
              placeholder="เช่น สมชาย ใจดี"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">อีเมล</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 sm:py-3.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
              placeholder="user@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">รหัสลับเริ่มต้น</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-3 sm:py-3.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">กำหนดเครดิต (฿)</label>
            <input
              type="number"
              min="0"
              value={formData.balance}
              onChange={(e) => setFormData({...formData, balance: parseInt(e.target.value) || 0})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 sm:py-3.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          
          <label className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all group active:scale-95">
            <input
              type="checkbox"
              checked={formData.isAdmin}
              onChange={(e) => setFormData({...formData, isAdmin: e.target.checked})}
              className="w-5 h-5 rounded-lg border-white/20 bg-black/50 text-blue-500 focus:ring-blue-500/20"
            />
            <div className="flex-1">
               <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">สิทธิ์ระดับแอดมิน</p>
               <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest">มอบอำนาจควบคุมระบบสูงสุด</p>
            </div>
            <Shield className={`w-5 h-5 transition-colors ${formData.isAdmin ? 'text-purple-400' : 'text-gray-700'}`} />
          </label>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="order-2 sm:order-1 flex-1 py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest transition-all active:scale-95"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="order-1 sm:order-2 flex-[2] py-3.5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              ยืนยันการสร้าง
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal - ส่วนที่เพิ่มกลับเข้ามา */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        title="แก้ไขข้อมูลผู้ใช้"
        description="แก้ไขรายละเอียดบัญชีและสิทธิ์การเข้าถึงสำหรับผู้ใช้ที่เลือก"
      >
        <form onSubmit={handleEditUser} className="space-y-5 sm:space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">ชื่อ-นามสกุล</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 sm:py-3.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">อีเมล</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 sm:py-3.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">เปลี่ยนรหัสลับ (เว้นว่างไว้หากไม่เปลี่ยน)</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-3 sm:py-3.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">เครดิต (฿)</label>
            <input
              type="number"
              min="0"
              value={formData.balance}
              onChange={(e) => setFormData({...formData, balance: parseInt(e.target.value) || 0})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 sm:py-3.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          
          <label className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all group active:scale-95">
            <input
              type="checkbox"
              checked={formData.isAdmin}
              onChange={(e) => setFormData({...formData, isAdmin: e.target.checked})}
              className="w-5 h-5 rounded-lg border-white/20 bg-black/50 text-blue-500 focus:ring-blue-500/20"
            />
            <div className="flex-1">
               <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">สิทธิ์ระดับแอดมิน</p>
               <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest">มอบอำนาจควบคุมระบบสูงสุด</p>
            </div>
            <Shield className={`w-5 h-5 transition-colors ${formData.isAdmin ? 'text-purple-400' : 'text-gray-700'}`} />
          </label>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="order-2 sm:order-1 flex-1 py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest transition-all active:scale-95"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="order-1 sm:order-2 flex-[2] py-3.5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              บันทึกการแก้ไข
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete User Modal - ส่วนที่เพิ่มกลับเข้ามา */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        title="ยืนยันการลบผู้ใช้"
        description="การดำเนินการนี้จะลบข้อมูลผู้ใช้ออกจากระบบอย่างถาวรและไม่สามารถเรียกคืนได้"
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
            <Trash2 className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
             <h3 className="text-xl font-bold text-white tracking-tight">คุณแน่ใจหรือไม่?</h3>
             <p className="text-sm text-gray-500 px-4 leading-relaxed">
               คุณกำลังจะลบผู้ใช้ <span className="text-white font-bold">{selectedUser?.name}</span> ({selectedUser?.email}) ออกจากฐานข้อมูลระบบอย่างถาวร
             </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-2">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="order-2 sm:order-1 flex-1 py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest transition-all active:scale-95"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleDeleteUser}
              disabled={submitting}
              className="order-1 sm:order-2 flex-[2] py-3.5 bg-red-600 hover:bg-red-500 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              ลบข้อมูลถาวร
            </button>
          </div>
        </div>
      </Modal>

      {/* Discount Modal */}
      <Modal 
        isOpen={showDiscountModal} 
        onClose={() => setShowDiscountModal(false)} 
        title="ให้ส่วนลดพิเศษ"
        description={`มอบสิทธิ์ซื้อ VPN ราคา 1 บาท/วัน ให้กับ ${selectedUser?.name}`}
      >
        <form onSubmit={handleGiveDiscount} className="space-y-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-pink-500/10 border border-pink-500/20 rounded-3xl flex items-center justify-center mx-auto">
              <Gift className="w-10 h-10 text-pink-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">ส่วนลด 1 บาท/วัน</h3>
              <p className="text-sm text-gray-500">ผู้ใช้จะสามารถซื้อ VPN ได้ในราคาพิเศษ</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">เลือกจำนวนวัน (1-30)</label>
            <div className="grid grid-cols-6 gap-2">
              {[1, 7, 14, 21, 30].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setDiscountDays(day)}
                  className={`py-3 rounded-xl text-sm font-bold transition-all ${
                    discountDays === day 
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={discountDays}
              onChange={(e) => setDiscountDays(parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 วัน</span>
              <span className="text-pink-400 font-bold text-lg">{discountDays} วัน</span>
              <span>30 วัน</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">ราคาปกติ</span>
              <span className="text-gray-500 line-through">4 บาท/วัน</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">ราคาส่วนลด</span>
              <span className="text-pink-400 font-bold">1 บาท/วัน</span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between">
              <span className="text-white font-medium">ประหยัดได้</span>
              <span className="text-emerald-400 font-bold">{discountDays * 3} บาท</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowDiscountModal(false)}
              className="order-2 sm:order-1 flex-1 py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest transition-all active:scale-95"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="order-1 sm:order-2 flex-[2] py-3.5 bg-pink-600 hover:bg-pink-500 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-pink-600/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Gift className="w-3.5 h-3.5" />
              )}
              ให้ส่วนลด {discountDays} วัน
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
