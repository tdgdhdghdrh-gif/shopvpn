'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, User, Mail, Lock, Save, AlertCircle, 
  CheckCircle2, Eye, EyeOff, Loader2, Shield, Camera
} from 'lucide-react'
import { logoutAction } from '@/lib/actions'
import { NotificationToggle } from '@/components/PushNotificationPrompt'

interface UserData {
  id: string
  name: string
  email: string
  balance: number
  avatar?: string | null
}

export default function ProfileClient({ userId }: { userId: string }) {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [])

  async function fetchUser() {
    try {
      const res = await fetch('/api/user/me')
      const data = await res.json()
      
      if (data.user) {
        setUser(data.user)
        setName(data.user.name)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Failed to fetch user')
      setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้')
    } finally {
      setLoading(false)
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('ขนาดไฟล์ต้องไม่เกิน 5MB')
      return
    }

    setAvatarUploading(true)
    setError('')

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string

        // Upload image
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, type: 'avatar' })
        })
        const uploadData = await uploadRes.json()

        if (!uploadData.success) {
          setError('อัพโหลดรูปไม่สำเร็จ กรุณาลองใหม่')
          setAvatarUploading(false)
          return
        }

        // Save avatar URL to profile
        const profileRes = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: user?.name || name, avatar: uploadData.url })
        })
        const profileData = await profileRes.json()

        if (profileData.success) {
          setUser(prev => prev ? { ...prev, avatar: uploadData.url } : prev)
          setSuccess('เปลี่ยนรูปโปรไฟล์สำเร็จ')
          router.refresh()
        } else {
          setError('บันทึกรูปโปรไฟล์ไม่สำเร็จ')
        }
        setAvatarUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการอัพโหลด')
      setAvatarUploading(false)
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        })
      })

      const data = await res.json()

      if (data.success) {
        setSuccess('บันทึกการเปลี่ยนแปลงสำเร็จ')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        
        if (user) {
          setUser({ ...user, name: name.trim() })
        }
        
        router.refresh()
      } else {
        setError(data.error || 'ไม่สามารถบันทึกการเปลี่ยนแปลงได้')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setSaving(false)
    }
  }

  function validatePasswordForm() {
    if (newPassword && newPassword.length < 6) {
      setError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร')
      return false
    }
    if (newPassword && newPassword !== confirmPassword) {
      setError('รหัสผ่านใหม่ไม่ตรงกัน')
      return false
    }
    if (newPassword && !currentPassword) {
      setError('กรุณากรอกรหัสผ่านปัจจุบัน')
      return false
    }
    return true
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validatePasswordForm()) return
    handleUpdateProfile(e)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-lg font-semibold">ตั้งค่าโปรไฟล์</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden mb-6">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={avatarUploading}
                  />
                  {user?.avatar ? (
                    <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-blue-500/30 group-hover:ring-blue-500/60 transition-all">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-semibold ring-2 ring-blue-500/30 group-hover:ring-blue-500/60 transition-all">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {avatarUploading ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5 text-white" />
                    )}
                  </div>
                </label>
              </div>
              <div>
                <h2 className="text-lg font-semibold">{user?.name}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ออนไลน์
                  </span>
                  <span className="text-[10px] text-gray-600">|</span>
                  <span className="text-[10px] text-gray-500">คลิกรูปเพื่อเปลี่ยน</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              ข้อมูลพื้นฐาน
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">ชื่อผู้ใช้</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="ชื่อของคุณ"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">อีเมล</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-black/30 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">อีเมลไม่สามารถแก้ไขได้</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              เปลี่ยนรหัสผ่าน
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              หากไม่ต้องการเปลี่ยนรหัสผ่าน ให้เว้นช่องนี้ว่างไว้
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">รหัสผ่านปัจจุบัน</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">รหัสผ่านใหม่</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1">ต้องมีอย่างน้อย 6 ตัวอักษร</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">ยืนยันรหัสผ่านใหม่</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  บันทึกการเปลี่ยนแปลง
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <NotificationToggle />
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all font-medium"
            >
              <Lock className="w-4 h-4" />
              ออกจากระบบ
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
