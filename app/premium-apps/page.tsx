'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import {
  Package, Star, Crown, Loader2, Search, Filter, ShoppingCart,
  Download, CheckCircle2, XCircle, AlertTriangle, ArrowRight,
  Smartphone, Monitor, Apple, Gamepad2, Globe, Sparkles,
  ChevronDown, X, ExternalLink, Copy, Check, CreditCard,
  Layers, TrendingUp, Shield, Zap, History, Clock
} from 'lucide-react'

interface PremiumApp {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  platform: string
  features: string | null
  stock: number
  sold: number
  isFeatured: boolean
  sortOrder: number
}

interface OrderHistory {
  id: string
  appName: string
  price: number
  status: string
  deliveredCode: string | null
  createdAt: string
  app: { imageUrl: string; category: string } | null
}

const categoryMap: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  general: { label: 'ทั่วไป', color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20', icon: Package },
  streaming: { label: 'สตรีมมิ่ง', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', icon: Globe },
  productivity: { label: 'เพิ่มผลผลิต', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: Zap },
  vpn: { label: 'VPN', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: Shield },
  game: { label: 'เกม', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Gamepad2 },
  social: { label: 'โซเชียล', color: 'text-pink-400 bg-pink-400/10 border-pink-400/20', icon: Sparkles },
  music: { label: 'เพลง', color: 'text-violet-400 bg-violet-400/10 border-violet-400/20', icon: Layers },
  education: { label: 'การศึกษา', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20', icon: TrendingUp },
}

const platformLabels: Record<string, string> = {
  all: 'ทุกแพลตฟอร์ม',
  ios: 'iOS',
  android: 'Android',
  windows: 'Windows',
  mac: 'macOS',
}

const platformIcons: Record<string, React.ElementType> = {
  all: Globe,
  ios: Smartphone,
  android: Smartphone,
  windows: Monitor,
  mac: Monitor,
}

export default function PremiumAppsPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [apps, setApps] = useState<PremiumApp[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [buying, setBuying] = useState<string | null>(null)

  // Tab state: 'shop' | 'history'
  const [activeTab, setActiveTab] = useState<'shop' | 'history'>('shop')
  const [orders, setOrders] = useState<OrderHistory[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersCopied, setOrdersCopied] = useState<string | null>(null)

  // Confirm modal
  const [confirmApp, setConfirmApp] = useState<PremiumApp | null>(null)

  // Success modal
  const [successData, setSuccessData] = useState<{
    app: PremiumApp
    deliveredCode: string | null
    downloadUrl: string | null
    instructions: string | null
  } | null>(null)

  // Error toast
  const [toast, setToast] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  // Copied state
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/user/me')
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setUser(d.user)
          setIsAdmin(d.user.isAdmin || d.user.isSuperAdmin)
        }
      })
      .catch(() => {})
  }, [])

  const fetchApps = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/premium-apps')
      const data = await res.json()
      if (data.success) {
        setApps(data.apps)
      }
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApps()
  }, [fetchApps])

  // Fetch order history when switching to history tab
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const res = await fetch('/api/premium-apps/orders')
      const data = await res.json()
      if (data.success) setOrders(data.orders)
    } catch {
      // error
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'history' && user) {
      fetchOrders()
    }
  }, [activeTab, user, fetchOrders])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  // Filter apps
  const filteredApps = apps.filter(app => {
    const matchSearch = !search || app.name.toLowerCase().includes(search.toLowerCase()) || app.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = selectedCategory === 'all' || app.category === selectedCategory
    return matchSearch && matchCategory
  })

  const featuredApps = filteredApps.filter(a => a.isFeatured)
  const regularApps = filteredApps.filter(a => !a.isFeatured)

  // Get available categories from actual apps
  const availableCategories = ['all', ...Array.from(new Set(apps.map(a => a.category)))]

  // Handle buy
  async function handleBuy(app: PremiumApp) {
    if (!user) {
      setToast({ type: 'error', text: 'กรุณาเข้าสู่ระบบก่อนซื้อ' })
      return
    }
    setBuying(app.id)
    try {
      const res = await fetch('/api/premium-apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId: app.id }),
      })
      const data = await res.json()
      if (data.success) {
        setConfirmApp(null)
        setSuccessData({
          app,
          deliveredCode: data.deliveredCode || null,
          downloadUrl: data.downloadUrl,
          instructions: data.instructions,
        })
        // Refresh apps to update stock/sold
        fetchApps()
        // Refresh orders if on history tab
        if (activeTab === 'history') fetchOrders()
        // Refresh balance
        fetch('/api/user/me').then(r => r.json()).then(d => {
          if (d.user) setUser(d.user)
        }).catch(() => {})
      } else {
        setConfirmApp(null)
        if (data.needTopup) {
          setToast({ type: 'error', text: data.error + ' — กรุณาเติมเงินก่อน' })
        } else {
          setToast({ type: 'error', text: data.error || 'เกิดข้อผิดพลาด' })
        }
      }
    } catch {
      setConfirmApp(null)
      setToast({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
    } finally {
      setBuying(null)
    }
  }

  // Copy to clipboard
  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  function handleOrderCopy(orderId: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setOrdersCopied(orderId)
      setTimeout(() => setOrdersCopied(null), 2000)
    }).catch(() => {})
  }

  // Parse features JSON
  function parseFeatures(features: string | null): string[] {
    if (!features) return []
    try { return JSON.parse(features) } catch { return [] }
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans">
      <Navbar user={user} isAdmin={isAdmin} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-bold uppercase tracking-wider mb-4">
            <Package className="w-3.5 h-3.5" />
            Premium App Store
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-3">
            ซื้อของ
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 max-w-xl mx-auto">
            รวมสินค้าคุณภาพ ซื้อง่าย ใช้ได้ทันที
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-violet-400" />
            <span className="text-xs sm:text-sm text-zinc-400 font-medium">{apps.length} สินค้า</span>
          </div>
          <div className="w-px h-4 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm text-zinc-400 font-medium">{apps.filter(a => a.isFeatured).length} แนะนำ</span>
          </div>
          {user && (
            <>
              <div className="w-px h-4 bg-zinc-800" />
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span className="text-xs sm:text-sm text-zinc-400 font-medium">ยอดเงิน: <span className="text-white font-bold">{user.balance?.toLocaleString('th-TH') || 0} ฿</span></span>
              </div>
            </>
          )}
        </div>

        {/* Tab Toggle */}
        {user && (
          <div className="flex gap-2 mb-6 sm:mb-8">
            <button
              onClick={() => setActiveTab('shop')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                activeTab === 'shop'
                  ? 'bg-violet-500/15 border-violet-500/30 text-violet-400'
                  : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:text-white hover:border-white/10'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              สินค้า
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                activeTab === 'history'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:text-white hover:border-white/10'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              ประวัติการซื้อ
            </button>
          </div>
        )}

        {/* ==================== SHOP TAB ==================== */}
        {activeTab === 'shop' && (
          <>
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาแอพ..."
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500/40 focus:outline-none transition-all font-medium"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {availableCategories.map((cat) => {
            const info = categoryMap[cat] || { label: cat, color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20', icon: Package }
            const isActive = selectedCategory === cat
            const CatIcon = cat === 'all' ? Layers : info.icon
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-violet-500/15 border-violet-500/30 text-violet-400'
                    : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:text-white hover:border-white/10'
                }`}
              >
                <CatIcon className="w-3.5 h-3.5" />
                {cat === 'all' ? 'ทั้งหมด' : info.label}
              </button>
            )
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            <p className="text-xs text-zinc-600 font-medium">กำลังโหลดสินค้า...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredApps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Package className="w-10 h-10 text-zinc-700" />
            </div>
            <p className="text-sm text-zinc-500 font-medium">ไม่พบแอพที่ค้นหา</p>
            {search && (
              <button onClick={() => setSearch('')} className="text-xs text-violet-400 hover:underline">
                ล้างการค้นหา
              </button>
            )}
          </div>
        )}

        {/* Featured Apps */}
        {!loading && featuredApps.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">แอพแนะนำ</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-amber-500/20 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {featuredApps.map((app) => (
                <AppCard key={app.id} app={app} onBuy={() => setConfirmApp(app)} featured />
              ))}
            </div>
          </div>
        )}

        {/* Regular Apps */}
        {!loading && regularApps.length > 0 && (
          <div>
            {featuredApps.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-zinc-500" />
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">แอพทั้งหมด</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-zinc-700/50 to-transparent" />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {regularApps.map((app) => (
                <AppCard key={app.id} app={app} onBuy={() => setConfirmApp(app)} />
              ))}
            </div>
          </div>
        )}
          </>
        )}

        {/* ==================== HISTORY TAB ==================== */}
        {activeTab === 'history' && (
          <div>
            {ordersLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="text-xs text-zinc-600 font-medium">กำลังโหลดประวัติ...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <History className="w-10 h-10 text-zinc-700" />
                </div>
                <p className="text-sm text-zinc-500 font-medium">ยังไม่มีประวัติการซื้อ</p>
                <button onClick={() => setActiveTab('shop')} className="text-xs text-violet-400 hover:underline">
                  ไปซื้อสินค้า
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const catInfo = categoryMap[order.app?.category || 'general'] || categoryMap.general
                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 p-4">
                        {/* Image */}
                        <div className="relative w-full sm:w-20 h-28 sm:h-20 rounded-xl overflow-hidden bg-zinc-900 border border-white/5 shrink-0">
                          {order.app?.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={order.app.imageUrl} alt={order.appName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-zinc-700" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-white truncate">{order.appName}</h3>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className={`flex items-center gap-1 text-[10px] font-bold ${catInfo.color.split(' ')[0]}`}>
                                  {catInfo.label}
                                </span>
                                <span className="text-[10px] text-zinc-600">|</span>
                                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                  <Clock className="w-3 h-3" />
                                  {new Date(order.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-lg font-black text-violet-400">{order.price.toLocaleString()} ฿</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                                order.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                              }`}>{order.status === 'COMPLETED' ? 'สำเร็จ' : order.status}</span>
                            </div>
                          </div>

                          {/* Delivered Code */}
                          {order.deliveredCode && (
                            <div className="mt-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3">
                              <div className="flex items-center gap-2 mb-1.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span className="text-[11px] font-bold text-emerald-400">รหัส/ลิงก์ที่ได้รับ</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-black/20 border border-emerald-500/10 rounded-lg px-3 py-2 text-xs text-emerald-300 font-mono break-all select-all">
                                  {order.deliveredCode}
                                </div>
                                <button
                                  onClick={() => handleOrderCopy(order.id, order.deliveredCode!)}
                                  className="shrink-0 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                >
                                  {ordersCopied === order.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                              {order.deliveredCode.startsWith('http') && (
                                <a
                                  href={order.deliveredCode}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-medium"
                                >
                                  เปิดลิงก์ <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirm Purchase Modal */}
      {confirmApp && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => !buying && setConfirmApp(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-violet-400" />
                </div>
                <h3 className="text-sm font-bold text-white">ยืนยันการซื้อ</h3>
              </div>
              <button onClick={() => !buying && setConfirmApp(null)} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* App Info */}
              <div className="flex gap-4 items-start">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={confirmApp.imageUrl} alt={confirmApp.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{confirmApp.name}</h4>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5">{confirmApp.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${categoryMap[confirmApp.category]?.color || 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20'}`}>
                      {categoryMap[confirmApp.category]?.label || confirmApp.category}
                    </span>
                    <span className="text-[10px] text-zinc-600">{platformLabels[confirmApp.platform] || confirmApp.platform}</span>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">ราคา</span>
                  <span className="text-sm font-bold text-white">{confirmApp.price.toLocaleString('th-TH')} ฿</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">ยอดเงินปัจจุบัน</span>
                  <span className="text-sm font-bold text-emerald-400">{(user?.balance || 0).toLocaleString('th-TH')} ฿</span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">ยอดเงินหลังซื้อ</span>
                  <span className={`text-sm font-bold ${(user?.balance || 0) >= confirmApp.price ? 'text-white' : 'text-red-400'}`}>
                    {((user?.balance || 0) - confirmApp.price).toLocaleString('th-TH')} ฿
                  </span>
                </div>
              </div>

              {/* Warning if not enough balance */}
              {(user?.balance || 0) < confirmApp.price && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-red-400 font-medium">ยอดเงินไม่เพียงพอ</p>
                    <Link href="/topup" className="text-[11px] text-red-400/70 hover:text-red-400 underline">เติมเงินเพิ่ม</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={() => setConfirmApp(null)}
                disabled={!!buying}
                className="flex-1 px-4 py-2.5 bg-zinc-900 border border-white/5 rounded-xl text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleBuy(confirmApp)}
                disabled={!!buying || (user?.balance || 0) < confirmApp.price}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-400 hover:to-pink-400 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-violet-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buying === confirmApp.id ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> กำลังซื้อ...</>
                ) : (
                  <><ShoppingCart className="w-4 h-4" /> ซื้อเลย</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setSuccessData(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-white">ซื้อสำเร็จ!</h3>
              </div>
              <button onClick={() => setSuccessData(null)} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* App Info */}
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={successData.app.imageUrl} alt={successData.app.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{successData.app.name}</h4>
                  <p className="text-[11px] text-emerald-400 font-medium mt-0.5">ชำระเงิน {successData.app.price.toLocaleString('th-TH')} ฿ สำเร็จ</p>
                </div>
              </div>

              {/* Delivered Code */}
              {successData.deliveredCode && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-white">รหัส/ลิงก์ที่ได้รับ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-black/30 border border-emerald-500/10 rounded-lg px-3 py-2.5 text-sm text-emerald-300 font-mono break-all select-all">
                      {successData.deliveredCode}
                    </div>
                    <button
                      onClick={() => handleCopy(successData.deliveredCode!)}
                      className="shrink-0 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {successData.deliveredCode.startsWith('http') && (
                    <a
                      href={successData.deliveredCode}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      เปิดลิงก์ <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <p className="text-[10px] text-zinc-500 mt-2">* กรุณาบันทึก/คัดลอกไว้ สามารถดูได้อีกครั้งในประวัติการซื้อ</p>
                </div>
              )}

              {/* Download URL (fallback) */}
              {successData.downloadUrl && (
                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-xs font-bold text-white">ลิงก์ดาวน์โหลด</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 truncate font-mono">
                      {successData.downloadUrl}
                    </div>
                    <button
                      onClick={() => handleCopy(successData.downloadUrl!)}
                      className="shrink-0 p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 transition-all"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <a
                    href={successData.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-violet-400 hover:text-violet-300 font-medium"
                  >
                    เปิดลิงก์ <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Instructions */}
              {successData.instructions && (
                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-white">วิธีใช้งาน</span>
                  </div>
                  <div className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                    {successData.instructions}
                  </div>
                </div>
              )}

              {!successData.deliveredCode && !successData.downloadUrl && !successData.instructions && (
                <div className="text-center py-4">
                  <p className="text-xs text-zinc-500">สำเร็จ! ขอบคุณที่ซื้อสินค้ากับเรา</p>
                </div>
              )}
            </div>

            {/* Close */}
            <div className="px-5 pb-5">
              <button
                onClick={() => setSuccessData(null)}
                className="w-full px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-20 sm:bottom-8 right-4 sm:right-8 left-4 sm:left-auto z-[300] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all animate-in slide-in-from-right-10 ${
          toast.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          <span className="font-semibold text-xs sm:text-sm">{toast.text}</span>
        </div>
      )}
    </div>
  )
}

// ==========================================
// AppCard Component
// ==========================================
function AppCard({ app, onBuy, featured = false }: { app: PremiumApp; onBuy: () => void; featured?: boolean }) {
  const cat = categoryMap[app.category] || { label: app.category, color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20', icon: Package }
  const CatIcon = cat.icon
  const PlatIcon = platformIcons[app.platform] || Globe
  const features = parseFeatures(app.features)
  const isOutOfStock = app.stock <= 0

  return (
    <div className={`group relative rounded-2xl overflow-hidden border transition-all hover:border-white/[0.12] ${
      featured
        ? 'bg-gradient-to-br from-violet-500/[0.04] to-pink-500/[0.04] border-violet-500/20 hover:border-violet-500/30'
        : 'bg-white/[0.02] border-white/[0.05]'
    }`}>
      {/* Featured Badge */}
      {app.isFeatured && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 bg-amber-400/10 border border-amber-400/20 rounded-lg backdrop-blur-sm">
          <Crown className="w-3 h-3 text-amber-400" />
          <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider">แนะนำ</span>
        </div>
      )}

      {/* Out of stock overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
          <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl">
            <span className="text-sm font-bold text-red-400">สินค้าหมด</span>
          </div>
        </div>
      )}

      {/* Image */}
      <div className={`relative overflow-hidden ${featured ? 'aspect-[2.5/1]' : 'aspect-[2/1]'}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={app.imageUrl}
          alt={app.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg text-white font-black text-sm">
            {app.price.toLocaleString('th-TH')} ฿
          </span>
        </div>

        {/* Platform badge */}
        <div className="absolute bottom-3 right-3">
          <div className="flex items-center gap-1 px-2 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg">
            <PlatIcon className="w-3 h-3 text-zinc-300" />
            <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-wider">{platformLabels[app.platform] || app.platform}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Category */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cat.color}`}>
            <CatIcon className="w-3 h-3" />
            {cat.label}
          </span>
          {app.stock > 0 && (
            <span className="text-[10px] text-zinc-600 font-medium">
              เหลือ {app.stock} ชิ้น
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={`font-bold tracking-tight mb-1.5 line-clamp-1 ${featured ? 'text-base sm:text-lg' : 'text-sm sm:text-base'} text-white group-hover:text-violet-400 transition-colors`}>
          {app.name}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-zinc-500 line-clamp-2 mb-3">{app.description}</p>

        {/* Features (max 3) */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {features.slice(0, 3).map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-900/50 border border-white/5 rounded-lg px-2 py-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                {f}
              </span>
            ))}
            {features.length > 3 && (
              <span className="text-[10px] text-zinc-600 px-2 py-1">+{features.length - 3} อื่นๆ</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-zinc-600">
            <TrendingUp className="w-3 h-3" />
            <span>ขายแล้ว {app.sold} ชิ้น</span>
          </div>
          <button
            onClick={onBuy}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              isOutOfStock
                ? 'bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-400 hover:to-pink-400 text-white shadow-lg shadow-violet-500/20'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {isOutOfStock ? 'หมด' : 'ซื้อ'}
          </button>
        </div>
      </div>
    </div>
  )
}

function parseFeatures(features: string | null): string[] {
  if (!features) return []
  try { return JSON.parse(features) } catch { return [] }
}
