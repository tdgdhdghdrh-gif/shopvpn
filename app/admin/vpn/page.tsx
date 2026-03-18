'use client'

import { useEffect, useState } from 'react'
import { 
  Server, 
  Plus, 
  Trash2, 
  Edit2,
  Wifi,
  Shield,
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Power,
  Zap,
  Sparkles,
  Smartphone,
  LayoutGrid,
  List
} from 'lucide-react'
import DashboardCard from '@/components/admin/DashboardCard'

interface VpnServer {
  id: string
  name: string
  flag: string
  host: string
  port: number
  path: string
  username: string
  password: string
  inboundId: number
  protocol: string
  tlsType: string
  flow: string
  sni: string
  clientPort: number
  isActive: boolean
  ping: number
  load: number
  status: string
  supportsAis: boolean
  supportsTrue: boolean
  supportsDtac: boolean
  category: string
  speed: number
  createdAt: string
}

export default function AdminVpnPage() {
  const [servers, setServers] = useState<VpnServer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [selectedServer, setSelectedServer] = useState<VpnServer | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    flag: '',
    host: '',
    port: 2053,
    path: '',
    username: '',
    password: '',
    inboundId: 3,
    protocol: 'vless',
    tlsType: 'Reality',
    flow: 'xtls-rprx-vision',
    sni: 'google.co.th',
    clientPort: 443,
    supportsAis: true,
    supportsTrue: false,
    supportsDtac: false,
    category: 'general',
    speed: 1000,
    skipConnectionTest: false
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [testingConnection, setTestingConnection] = useState(false)

  useEffect(() => {
    fetchServers()
  }, [])

  async function fetchServers() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/servers')
      const data = await res.json()
      if (data.servers) {
        setServers(data.servers)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'โหลดข้อมูลเซิร์ฟเวอร์ไม่สำเร็จ' })
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setModalMode('add')
    setSelectedServer(null)
    setFormData({
      name: '',
      flag: '',
      host: '',
      port: 2053,
      path: '',
      username: '',
      password: '',
      inboundId: 3,
      protocol: 'vless',
      tlsType: 'Reality',
      flow: 'xtls-rprx-vision',
      sni: 'google.co.th',
      clientPort: 443,
      supportsAis: true,
      supportsTrue: false,
      supportsDtac: false,
      category: 'general',
      speed: 1000,
      skipConnectionTest: false
    })
    setShowModal(true)
  }

  function openEditModal(server: VpnServer) {
    setModalMode('edit')
    setSelectedServer(server)
    setFormData({
      name: server.name,
      flag: server.flag,
      host: server.host,
      port: server.port,
      path: server.path,
      username: '',
      password: '',
      inboundId: server.inboundId,
      protocol: server.protocol,
      tlsType: server.tlsType,
      flow: server.flow,
      sni: server.sni,
      clientPort: server.clientPort ?? 443,
      supportsAis: server.supportsAis ?? true,
      supportsTrue: server.supportsTrue ?? false,
      supportsDtac: server.supportsDtac ?? false,
      category: server.category ?? 'general',
      speed: server.speed ?? 1000,
      skipConnectionTest: false
    })
    setShowModal(true)
  }

  async function testConnection() {
    setTestingConnection(true)
    setMessage({ type: '', text: '' })
    
    try {
      const res = await fetch('/api/admin/servers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: formData.host,
          port: formData.port,
          path: formData.path,
          username: formData.username,
          password: formData.password
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `เชื่อมต่อสำเร็จ! ใช้ ${data.useHttp ? 'HTTP' : 'HTTPS'}` 
        })
      } else {
        setMessage({ 
          type: 'error', 
          text: 'เชื่อมต่อไม่สำเร็จ กรุณาตรวจสอบข้อมูลให้ถูกต้อง' 
        })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการทดสอบ' })
    } finally {
      setTestingConnection(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      const url = modalMode === 'add' 
        ? '/api/admin/servers/add' 
        : `/api/admin/servers/${selectedServer?.id}`
      
      const method = modalMode === 'add' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setMessage({ 
          type: 'success', 
          text: modalMode === 'add' ? 'เพิ่มเซิร์ฟเวอร์สำเร็จ' : 'อัปเดตเซิร์ฟเวอร์สำเร็จ' 
        })
        setShowModal(false)
        fetchServers()
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || data.details || 'การดำเนินการล้มเหลว' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดไม่คาดคิด' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(serverId: string) {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเซิร์ฟเวอร์นี้?')) return
    
    try {
      const res = await fetch(`/api/admin/servers/${serverId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'ลบเซิร์ฟเวอร์สำเร็จ' })
        fetchServers()
      } else {
        setMessage({ type: 'error', text: 'ลบไม่สำเร็จ' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    }
  }

  const filteredServers = servers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.host.toLowerCase().includes(search.toLowerCase())
  )

  const activeServers = servers.filter(s => s.isActive).length

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
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
          <span className="font-semibold text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20 shadow-sm">
               <Server className="w-4 h-4 text-cyan-400" />
             </div>
             <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">คลัสเตอร์ VPN</h2>
          </div>
          <p className="text-gray-500 text-sm font-medium">จัดการโหนดและการเชื่อมต่อโครงสร้างพื้นฐานทั่วโลก</p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
           <button 
             onClick={fetchServers}
             className="p-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-gray-400 hover:text-white transition-all group"
           >
             <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
           </button>
           <button
             onClick={openAddModal}
             className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-cyan-600 border border-cyan-500/20 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-white hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-600/20 active:scale-95"
           >
             <Plus className="w-4 h-4" />
             <span>ติดตั้งโหนด</span>
           </button>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <DashboardCard 
          label="โหนดทั้งหมด" 
          value={servers.length} 
          description="เซิร์ฟเวอร์ VPN"
          icon={Server}
          color="text-cyan-400"
          trend="+5%"
          trendType="positive"
        />
        <DashboardCard 
          label="กำลังออนไลน์" 
          value={activeServers} 
          description="พร้อมใช้งาน"
          icon={Power}
          color="text-emerald-400"
          trend="ใช้งานได้"
          trendType="positive"
        />
        <DashboardCard 
          label="ความหน่วง" 
          value="42ms" 
          description="เฉลี่ยทั้งระบบ"
          icon={Zap}
          color="text-amber-400"
          trend="เสถียร"
          trendType="positive"
        />
      </div>

      {/* Filters & Search - Stack on mobile */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="ค้นหาโหนดด้วยชื่อหรือไอพี..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
           <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-gray-400 active:scale-95">
             <Filter className="w-4 h-4" />
             <span>ตัวกรอง</span>
           </button>
           <div className="flex bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-1">
              <button className="p-2 bg-white/10 text-white rounded-lg sm:rounded-xl"><LayoutGrid className="w-4 h-4" /></button>
              <button className="p-2 text-gray-500 hover:text-gray-300 rounded-lg sm:rounded-xl"><List className="w-4 h-4" /></button>
           </div>
        </div>
      </div>

      {/* Nodes Grid - Responsive Columns */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-4">
           <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
           <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest text-center">กำลังสแกนเครือข่าย...</p>
        </div>
      ) : filteredServers.length === 0 ? (
        <div className="bg-white/5 border border-white/10 border-dashed rounded-3xl p-12 sm:p-20 text-center space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Server className="w-8 h-8 sm:w-10 sm:h-10 text-gray-700" />
          </div>
          <div className="space-y-1">
             <h3 className="text-lg sm:text-xl font-bold text-white">ไม่พบข้อมูลโหนด</h3>
             <p className="text-gray-500 max-w-xs mx-auto text-xs sm:text-sm">ไม่มีโหนดที่ตรงกับการค้นหาหรือยังไม่ได้ติดตั้งระบบ</p>
          </div>
          <button
            onClick={openAddModal}
            className="px-6 sm:px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl sm:rounded-2xl text-white text-sm font-bold transition-all active:scale-95"
          >
            ติดตั้งโหนดแรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredServers.map((server) => (
            <div 
              key={server.id}
              className="group relative bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-6 hover:bg-white/[0.08] hover:border-cyan-500/30 transition-all duration-300 overflow-hidden"
            >
              {/* Status Glow */}
              <div className={`absolute -top-12 -right-12 w-24 h-24 blur-[40px] opacity-20 rounded-full transition-all duration-500 ${
                server.isActive ? 'bg-emerald-500' : 'bg-red-500'
              }`} />

              <div className="relative space-y-5 sm:space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${
                      server.isActive 
                        ? 'bg-emerald-500/10 border border-emerald-500/20' 
                        : 'bg-red-500/10 border border-red-500/20'
                    }`}>
                      <Wifi className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        server.isActive ? 'text-emerald-400' : 'text-red-400'
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white tracking-tight truncate">{server.name} {server.flag}</h3>
                      <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          server.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'
                        }`} />
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 truncate">
                          {server.isActive ? 'ใช้งานอยู่' : 'ออฟไลน์'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 sm:gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(server)}
                      className="p-1.5 sm:p-2 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-gray-400 hover:text-white transition-all active:scale-95"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(server.id)}
                      className="p-1.5 sm:p-2 bg-red-500/10 border border-red-500/20 rounded-lg sm:rounded-xl text-red-400 hover:bg-red-600 hover:text-white transition-all active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2">
                     <div className="flex -space-x-1">
                        {server.supportsAis && <div className="w-6 h-6 rounded-full border-2 border-black bg-emerald-500/10 flex items-center justify-center text-[7px] sm:text-[8px] font-black text-emerald-400">AIS</div>}
                        {server.supportsTrue && <div className="w-6 h-6 rounded-full border-2 border-black bg-blue-500/10 flex items-center justify-center text-[7px] sm:text-[8px] font-black text-blue-400">TRU</div>}
                        {server.supportsDtac && <div className="w-6 h-6 rounded-full border-2 border-black bg-purple-500/10 flex items-center justify-center text-[7px] sm:text-[8px] font-black text-purple-400">DTC</div>}
                     </div>
                     <span className="text-[9px] sm:text-[10px] font-bold text-gray-600 uppercase tracking-widest">รองรับโครงข่าย</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                     <div className="p-2 sm:p-3 bg-black/20 border border-white/5 rounded-xl sm:rounded-2xl space-y-1 min-w-0">
                        <p className="text-[8px] sm:text-[9px] font-black text-gray-600 uppercase tracking-widest">โฮสต์</p>
                        <p className="text-[11px] sm:text-xs font-bold text-gray-400 truncate">{server.host}</p>
                     </div>
                     <div className="p-2 sm:p-3 bg-black/20 border border-white/5 rounded-xl sm:rounded-2xl space-y-1 min-w-0">
                        <p className="text-[8px] sm:text-[9px] font-black text-gray-600 uppercase tracking-widest">โปรโตคอล</p>
                        <p className="text-[11px] sm:text-xs font-bold text-gray-400 truncate">{server.protocol.toUpperCase()}</p>
                     </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                     <Activity className="w-3 h-3 text-cyan-400" />
                     <span className="text-gray-500">Ping: <span className="text-cyan-400">{server.ping}ms</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <Zap className="w-3 h-3 text-amber-400" />
                     <span className="text-gray-500">ภาระ: <span className="text-amber-400">{server.load}%</span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal - Improved Mobile UI */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-[#0d0d0d] border border-white/10 rounded-[2rem] sm:rounded-3xl w-full max-w-xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-white/5">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
                  <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                  </div>
                  {modalMode === 'add' ? 'เพิ่มโหนด' : 'แก้ไขโหนด'}
                </h2>
                <p className="text-[11px] sm:text-sm text-gray-500 font-medium">ระบุรายละเอียดโครงสร้างพื้นฐานด้านล่าง</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors group active:scale-90"
              >
                <XCircle className="w-6 h-6 text-gray-600 group-hover:text-white" />
              </button>
            </div>
            
            <form id="vpn-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">ชื่อโหนด</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 sm:py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                    placeholder="AWS Tokyo 01"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">ธงชาติ (Emoji)</label>
                  <input
                    type="text"
                    value={formData.flag}
                    onChange={(e) => setFormData({...formData, flag: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 sm:py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all text-center"
                    placeholder="🇯🇵"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">โฮสต์ / ไอพี</label>
                  <input
                    type="text"
                    required
                    value={formData.host}
                    onChange={(e) => setFormData({...formData, host: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 sm:py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">พอร์ต</label>
                  <input
                    type="number"
                    required
                    value={formData.port}
                    onChange={(e) => setFormData({...formData, port: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 sm:py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">เส้นทาง (Path)</label>
                    <input
                      type="text"
                      required
                      value={formData.path}
                      onChange={(e) => setFormData({...formData, path: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 sm:py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Inbound ID</label>
                    <input
                      type="number"
                      required
                      value={formData.inboundId}
                      onChange={(e) => setFormData({...formData, inboundId: parseInt(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 sm:py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">ชื่อผู้ใช้ (Username)</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 sm:py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                      placeholder="สำหรับเชื่อมต่อ Panel"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">รหัสผ่าน (Password)</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 sm:py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                      placeholder="สำหรับเชื่อมต่อ Panel"
                    />
                 </div>
              </div>

              {/* Skip Connection Test Checkbox */}
              {modalMode === 'add' && (
                <div className="p-4 sm:p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.skipConnectionTest}
                      onChange={(e) => setFormData({...formData, skipConnectionTest: e.target.checked})}
                      className="mt-0.5 w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500/20 bg-gray-800"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-amber-400">ข้ามการตรวจสอบการเชื่อมต่อ</span>
                      <p className="text-xs text-gray-500 mt-1">
                        เลือกตัวเลือกนี้หากต้องการบันทึกเซิร์ฟเวอร์โดยไม่ทดสอบการเชื่อมต่อกับ Panel 
                        (เหมาะสำหรับกรณีเซิร์ฟเวอร์ปิดชั่วคราวหรือยังไม่พร้อมใช้งาน)
                      </p>
                    </div>
                  </label>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">โปรโตคอล</label>
                  <select
                    value={formData.protocol}
                    onChange={(e) => setFormData({...formData, protocol: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  >
                    <option value="vless">VLESS</option>
                    <option value="vmess">VMess</option>
                    <option value="trojan">Trojan</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">โหมด TLS</label>
                  <select
                    value={formData.tlsType}
                    onChange={(e) => setFormData({...formData, tlsType: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  >
                    <option value="Reality">Reality</option>
                    <option value="XTLS">XTLS</option>
                    <option value="TLS">TLS</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">พอร์ตลูกค้า</label>
                  <input
                    type="number"
                    value={formData.clientPort}
                    onChange={(e) => setFormData({...formData, clientPort: parseInt(e.target.value) || 443})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">ประเภทเซิร์ฟเวอร์</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  >
                    <option value="general">🌐 สายทั่วไป</option>
                    <option value="movie">🎬 สายดูหนังซีรี่ย์</option>
                    <option value="game">🎮 สายเล่นเกม</option>
                    <option value="streaming">📺 สายสตรีมมิ่ง</option>
                    <option value="tiktok">✨ สายดู TikTok</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">ความเร็ว (Mbps)</label>
                  <select
                    value={formData.speed}
                    onChange={(e) => setFormData({...formData, speed: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  >
                    <option value={100}>100 Mbps</option>
                    <option value={500}>500 Mbps</option>
                    <option value={1000}>1 Gbps</option>
                    <option value={2000}>2 Gbps</option>
                    <option value={5000}>5 Gbps</option>
                    <option value={10000}>10 Gbps</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 p-5 sm:p-6 bg-black/40 border border-white/5 rounded-3xl">
                <div className="flex items-center justify-between">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">รองรับเครือข่ายมือถือ</label>
                   <Smartphone className="w-4 h-4 text-gray-600" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'supportsAis', label: 'AIS', color: 'peer-checked:bg-emerald-500/20 peer-checked:text-emerald-400 peer-checked:border-emerald-500/30' },
                    { key: 'supportsTrue', label: 'TRUE', color: 'peer-checked:bg-blue-500/20 peer-checked:text-blue-400 peer-checked:border-blue-500/30' },
                    { key: 'supportsDtac', label: 'DTAC', color: 'peer-checked:bg-purple-500/20 peer-checked:text-purple-400 peer-checked:border-purple-500/30' },
                  ].map((network) => (
                    <label key={network.key} className="relative cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData as any)[network.key]}
                        onChange={(e) => setFormData({...formData, [network.key]: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className={`flex flex-col items-center justify-center p-3 sm:p-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] sm:text-xs font-bold text-gray-500 transition-all duration-300 ${network.color}`}>
                        {network.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </form>

            <div className="p-6 sm:p-8 border-t border-white/5 flex flex-col sm:flex-row gap-3 sm:gap-4">
               <button
                 type="button"
                 onClick={() => setShowModal(false)}
                 className="order-3 sm:order-1 flex-1 py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold text-gray-500 transition-all uppercase tracking-widest active:scale-95"
               >
                 ยกเลิก
               </button>
               <button
                 type="button"
                 onClick={testConnection}
                 disabled={testingConnection || !formData.host}
                 className="order-2 sm:order-2 flex-1 py-3.5 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-800 disabled:text-gray-500 rounded-2xl text-xs font-bold text-white transition-all shadow-lg shadow-amber-600/20 uppercase tracking-widest active:scale-95"
               >
                 {testingConnection ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}
               </button>
               <button
                 type="submit"
                 form="vpn-form"
                 disabled={submitting}
                 className="order-1 sm:order-3 flex-[2] py-3.5 bg-cyan-600 hover:bg-cyan-500 rounded-2xl text-xs font-bold text-white transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-50 uppercase tracking-widest active:scale-95"
               >
                 {submitting ? 'กำลังดำเนินการ...' : formData.skipConnectionTest ? 'บันทึก (ข้ามตรวจสอบ)' : 'บันทึกข้อมูล'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
