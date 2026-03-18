'use client'

import { useEffect, useState, useRef } from 'react'
import { 
  Save, Key, Phone, Building2, User, 
  AlertCircle, CheckCircle2, Loader2, Shield, Wallet, ScanLine,
  Upload, X, QrCode, Settings as SettingsIcon, Info, ExternalLink,
  Globe, Image as ImageIcon, Type, DollarSign, Layout
} from 'lucide-react'

interface Settings {
  truemoneyPhone: string
  truemoneyApiKey: string
  slipApiKey: string
  bankReceiverName: string
  bankAccountNumber: string
  qrCodeImage: string
  // Site Configuration
  siteName: string
  siteLogo: string
  backgroundImage: string
  // Google API
  googleApiKey: string
  // VPN Pricing
  vpnDailyPrice: number
  vpnWeeklyPrice: number
  vpnMonthlyPrice: number
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    truemoneyPhone: '',
    truemoneyApiKey: '',
    slipApiKey: '',
    bankReceiverName: '',
    bankAccountNumber: '',
    qrCodeImage: '',
    siteName: 'SimonVPNShop',
    siteLogo: '',
    backgroundImage: '',
    googleApiKey: '',
    vpnDailyPrice: 4,
    vpnWeeklyPrice: 25,
    vpnMonthlyPrice: 100
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bgInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  // เคลียร์ข้อความแจ้งเตือนอัตโนมัติใน 3 วินาที
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data.settings) {
        setSettings({
          truemoneyPhone: data.settings.truemoneyPhone || '',
          truemoneyApiKey: data.settings.truemoneyApiKey || '',
          slipApiKey: data.settings.slipApiKey || '',
          bankReceiverName: data.settings.bankReceiverName || '',
          bankAccountNumber: data.settings.bankAccountNumber || '',
          qrCodeImage: data.settings.qrCodeImage || '',
          siteName: data.settings.siteName || 'SimonVPNShop',
          siteLogo: data.settings.siteLogo || '',
          backgroundImage: data.settings.backgroundImage || '',
          googleApiKey: data.settings.googleApiKey || '',
          vpnDailyPrice: data.settings.vpnDailyPrice || 4,
          vpnWeeklyPrice: data.settings.vpnWeeklyPrice || 25,
          vpnMonthlyPrice: data.settings.vpnMonthlyPrice || 100
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings')
      setMessage({ type: 'error', text: 'วิกฤต: ซิงโครไนซ์การตั้งค่าระบบไม่สำเร็จ' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'บันทึกการตั้งค่าระบบเรียบร้อยแล้ว' })
      } else {
        setMessage({ type: 'error', text: data.error || 'การบันทึกล้มเหลว' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'การเชื่อมต่อล้มเหลว' })
    } finally {
      setSaving(false)
    }
  }

  function updateField(field: keyof Settings, value: string | number) {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'qr' | 'logo' | 'background') {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'ขนาดเกินกำหนด: ต้องไม่เกิน 2MB' })
      return
    }

    setUploading(type)
    setMessage({ type: '', text: '' })

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target?.result as string
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, type })
        })
        const data = await res.json()
        if (data.success) {
          if (type === 'qr') {
            updateField('qrCodeImage', data.url)
          } else if (type === 'logo') {
            updateField('siteLogo', data.url)
          } else if (type === 'background') {
            updateField('backgroundImage', data.url)
          }
          setMessage({ type: 'success', text: `อัปโหลด${type === 'qr' ? 'QR Code' : type === 'logo' ? 'โลโก้' : 'พื้นหลัง'}สำเร็จ` })
        } else {
          setMessage({ type: 'error', text: data.error || 'อัปโหลดล้มเหลว' })
        }
        setUploading(null)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการอัปโหลด' })
      setUploading(null)
    }
  }

  function removeImage(type: 'qr' | 'logo' | 'background') {
    if (type === 'qr') {
      updateField('qrCodeImage', '')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } else if (type === 'logo') {
      updateField('siteLogo', '')
      if (logoInputRef.current) logoInputRef.current.value = ''
    } else if (type === 'background') {
      updateField('backgroundImage', '')
      if (bgInputRef.current) bgInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest text-center">กำลังดึงข้อมูลระบบ...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-10 pb-12">
      {/* Toast Notification */}
      {message.text && (
        <div className={`fixed bottom-4 sm:bottom-8 right-4 sm:right-8 z-[100] flex items-center gap-3 px-5 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl transition-all animate-in slide-in-from-right-10 ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
          <span className="font-semibold text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
               <SettingsIcon className="w-4 h-4 text-purple-400" />
             </div>
             <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">ตั้งค่าระบบ</h2>
          </div>
          <p className="text-gray-500 text-sm font-medium">จัดการ API การชำระเงิน พารามิเตอร์เครือข่าย และตั้งค่าเว็บไซต์</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 border border-purple-500/20 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-white hover:bg-purple-500 transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        <div className="xl:col-span-2 space-y-6 sm:space-y-8">
           {/* Site Configuration Section */}
           <div className="bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-3xl overflow-hidden group">
              <div className="p-6 sm:p-8 border-b border-white/5 bg-gradient-to-r from-indigo-500/5 to-transparent">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-14 bg-indigo-500/10 border-indigo-500/20 text-indigo-400 border rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                       <Layout className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div>
                       <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">ตั้งค่าเว็บไซต์</h3>
                       <p className="text-[11px] sm:text-sm text-gray-500 font-medium">ชื่อเว็บ โลโก้ และพื้นหลัง</p>
                    </div>
                 </div>
              </div>
              <div className="p-6 sm:p-8 space-y-6">
                 {/* Site Name */}
                 <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">ชื่อเว็บไซต์</label>
                    <div className="relative group">
                       <Type className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                       <input
                         type="text"
                         value={settings.siteName}
                         onChange={(e) => updateField('siteName', e.target.value)}
                         placeholder="ชื่อเว็บไซต์ของคุณ"
                         className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl pl-11 sm:pl-12 pr-5 py-3 sm:py-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                       />
                    </div>
                 </div>

                 {/* Logo Upload */}
                 <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">โลโก้เว็บไซต์</label>
                    <div className="relative">
                       {settings.siteLogo ? (
                         <div className="relative group inline-block">
                            <div className="bg-white rounded-xl p-4 flex items-center justify-center shadow-lg overflow-hidden border-2 border-transparent group-hover:border-indigo-500/20 transition-all">
                               <img src={settings.siteLogo} alt="Site Logo" className="max-w-[200px] max-h-[100px] object-contain" />
                            </div>
                            <button
                              onClick={() => removeImage('logo')}
                              className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 hover:bg-red-500 rounded-lg flex items-center justify-center text-white shadow-lg active:scale-90 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                         </div>
                       ) : (
                         <div 
                           onClick={() => logoInputRef.current?.click()}
                           className="group border-2 border-dashed border-white/10 hover:border-indigo-500/40 rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-indigo-500/5 space-y-2 inline-flex flex-col items-center justify-center w-[200px] h-[100px]"
                         >
                           {uploading === 'logo' ? (
                             <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                           ) : (
                             <>
                               <ImageIcon className="w-6 h-6 text-gray-500 group-hover:text-indigo-400" />
                               <p className="text-[10px] font-bold text-gray-500 uppercase">อัปโหลดโลโก้</p>
                             </>
                           )}
                         </div>
                       )}
                       <input ref={logoInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} className="hidden" />
                    </div>
                 </div>

                 {/* Background Upload */}
                 <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">พื้นหลังเว็บไซต์</label>
                    <div className="relative">
                       {settings.backgroundImage ? (
                         <div className="relative group inline-block">
                            <div className="rounded-xl overflow-hidden border-2 border-transparent group-hover:border-indigo-500/20 transition-all">
                               <img src={settings.backgroundImage} alt="Background" className="max-w-[300px] max-h-[150px] object-cover" />
                            </div>
                            <button
                              onClick={() => removeImage('background')}
                              className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 hover:bg-red-500 rounded-lg flex items-center justify-center text-white shadow-lg active:scale-90 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                         </div>
                       ) : (
                         <div 
                           onClick={() => bgInputRef.current?.click()}
                           className="group border-2 border-dashed border-white/10 hover:border-indigo-500/40 rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-indigo-500/5 space-y-2 inline-flex flex-col items-center justify-center w-[300px] h-[100px]"
                         >
                           {uploading === 'background' ? (
                             <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                           ) : (
                             <>
                               <ImageIcon className="w-6 h-6 text-gray-500 group-hover:text-indigo-400" />
                               <p className="text-[10px] font-bold text-gray-500 uppercase">อัปโหลดพื้นหลัง</p>
                             </>
                           )}
                         </div>
                       )}
                       <input ref={bgInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'background')} className="hidden" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Google API Section */}
           <div className="bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-3xl overflow-hidden group">
              <div className="p-6 sm:p-8 border-b border-white/5 bg-gradient-to-r from-blue-500/5 to-transparent">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-14 bg-blue-500/10 border-blue-500/20 text-blue-400 border rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                       <Globe className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div>
                       <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">Google API</h3>
                       <p className="text-[11px] sm:text-sm text-gray-500 font-medium">reCAPTCHA และบริการ Google อื่นๆ</p>
                    </div>
                 </div>
              </div>
              <div className="p-6 sm:p-8">
                 <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Google API Key</label>
                    <div className="relative group">
                       <Key className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-blue-400 transition-colors" />
                       <input
                         type="password"
                         value={settings.googleApiKey}
                         onChange={(e) => updateField('googleApiKey', e.target.value)}
                         placeholder="ใส่ Google API Key (reCAPTCHA Site Key)"
                         className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl pl-11 sm:pl-12 pr-5 py-3 sm:py-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                       />
                    </div>
                    <p className="text-[10px] text-gray-600 ml-1">ใช้สำหรับ reCAPTCHA v2 หรือ Google Services</p>
                 </div>
              </div>
           </div>

           {/* VPN Pricing Section */}
           <div className="bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-3xl overflow-hidden group">
              <div className="p-6 sm:p-8 border-b border-white/5 bg-gradient-to-r from-emerald-500/5 to-transparent">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-14 bg-emerald-500/10 border-emerald-500/20 text-emerald-400 border rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                       <DollarSign className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div>
                       <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">ตั้งค่าราคา VPN</h3>
                       <p className="text-[11px] sm:text-sm text-gray-500 font-medium">กำหนดราคาแพ็คเกจ VPN ได้เอง</p>
                    </div>
                 </div>
              </div>
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                 {/* Daily Price */}
                 <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">รายวัน (บาท)</label>
                    <div className="relative group">
                       <DollarSign className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-emerald-400 transition-colors" />
                       <input
                         type="number"
                         min="0"
                         step="0.5"
                         value={settings.vpnDailyPrice}
                         onChange={(e) => updateField('vpnDailyPrice', parseFloat(e.target.value) || 0)}
                         placeholder="4"
                         className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl pl-11 sm:pl-12 pr-5 py-3 sm:py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                       />
                    </div>
                 </div>
                 {/* Weekly Price */}
                 <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">รายสัปดาห์ (บาท)</label>
                    <div className="relative group">
                       <DollarSign className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-emerald-400 transition-colors" />
                       <input
                         type="number"
                         min="0"
                         step="0.5"
                         value={settings.vpnWeeklyPrice}
                         onChange={(e) => updateField('vpnWeeklyPrice', parseFloat(e.target.value) || 0)}
                         placeholder="25"
                         className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl pl-11 sm:pl-12 pr-5 py-3 sm:py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                       />
                    </div>
                 </div>
                 {/* Monthly Price */}
                 <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">รายเดือน (บาท)</label>
                    <div className="relative group">
                       <DollarSign className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-emerald-400 transition-colors" />
                       <input
                         type="number"
                         min="0"
                         step="0.5"
                         value={settings.vpnMonthlyPrice}
                         onChange={(e) => updateField('vpnMonthlyPrice', parseFloat(e.target.value) || 0)}
                         placeholder="100"
                         className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl pl-11 sm:pl-12 pr-5 py-3 sm:py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                       />
                    </div>
                 </div>
              </div>
           </div>

           {/* Payment Settings Sections */}
           {[
             {
               title: 'TrueMoney Wallet Protocol',
               desc: 'การประมวลผลวอชเชอร์และยอดเงินอัตโนมัติ',
               icon: Wallet,
               color: 'red',
               fields: [
                 { label: 'เบอร์รับเงิน', field: 'truemoneyPhone', placeholder: '08X-XXX-XXXX', icon: Phone },
                 { label: 'วอชเชอร์ API Token', field: 'truemoneyApiKey', placeholder: 'dx_xxxxxxxx', icon: Key, type: 'password' }
               ]
             },
             {
               title: 'ระบบตรวจสอบสลิปธนาคาร',
               desc: 'การตรวจสอบ OCR และธุรกรรมแบบเรียลไทม์',
               icon: ScanLine,
               color: 'blue',
               fields: [
                 { label: 'Slip API Key', field: 'slipApiKey', placeholder: 'dx_xxxxxxxx', icon: Key, type: 'password' },
                 { label: 'ชื่อโปรไฟล์ผู้รับเงิน', field: 'bankReceiverName', placeholder: 'ระบุให้ตรงตามสลิป', icon: User },
                 { label: 'หมายเลขบัญชีปลายทาง', field: 'bankAccountNumber', placeholder: 'XXX-X-XXXXX-X', icon: Building2, full: true }
               ]
             }
           ].map((section, idx) => (
             <div key={idx} className="bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-3xl overflow-hidden group">
                <div className={`p-6 sm:p-8 border-b border-white/5 bg-gradient-to-r from-${section.color === 'red' ? 'red' : 'blue'}-500/5 to-transparent`}>
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 ${section.color === 'red' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'} border rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg`}>
                         <section.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      <div>
                         <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">{section.title}</h3>
                         <p className="text-[11px] sm:text-sm text-gray-500 font-medium">{section.desc}</p>
                      </div>
                   </div>
                </div>
                <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                   {section.fields.map((f: any, fIdx: number) => (
                     <div key={fIdx} className={`space-y-2 ${f.full ? 'md:col-span-2' : ''}`}>
                        <label className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{f.label}</label>
                        <div className="relative group">
                           <f.icon className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-blue-400 transition-colors" />
                           <input
                             type={f.type || 'text'}
                             value={(settings as any)[f.field]}
                             onChange={(e) => updateField(f.field as keyof Settings, e.target.value)}
                             placeholder={f.placeholder}
                             className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl pl-11 sm:pl-12 pr-5 py-3 sm:py-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                           />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           ))}
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6 sm:space-y-8">
           <div className="bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-3xl overflow-hidden shadow-sm">
              <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                 <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 tracking-tight">
                    <QrCode className="w-4 h-4 text-emerald-400" /> ไฟล์สื่อรับชำระเงิน
                 </h3>
                 <Shield className="w-3.5 h-3.5 text-emerald-500/30" />
              </div>
              <div className="p-6">
                 {settings.qrCodeImage ? (
                   <div className="relative group">
                      <div className="bg-white rounded-2xl p-4 sm:p-6 flex items-center justify-center shadow-xl overflow-hidden border-2 border-transparent group-hover:border-blue-500/20 transition-all">
                         <img src={settings.qrCodeImage} alt="Payment QR" className="max-w-full h-auto object-contain max-h-[250px]" />
                      </div>
                      <button
                        onClick={() => removeImage('qr')}
                        className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-9 h-9 sm:w-10 sm:h-10 bg-red-600 hover:bg-red-500 rounded-xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                   </div>
                 ) : (
                   <div 
                     onClick={() => fileInputRef.current?.click()}
                     className="group border-2 border-dashed border-white/10 hover:border-emerald-500/40 rounded-2xl p-10 sm:p-12 text-center cursor-pointer transition-all hover:bg-emerald-500/5 space-y-4"
                   >
                     {uploading === 'qr' ? (
                       <div className="flex flex-col items-center gap-3">
                         <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 animate-spin" />
                         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">กำลังอัปโหลด...</p>
                       </div>
                     ) : (
                       <>
                         <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                           <Upload className="w-6 h-6 text-gray-500 group-hover:text-emerald-400" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-xs sm:text-sm font-bold text-gray-300">อัปโหลดไฟล์ QR</p>
                            <p className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest">PNG, JPG (MAX 2MB)</p>
                         </div>
                       </>
                     )}
                   </div>
                 )}
                 <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'qr')} className="hidden" />
              </div>
           </div>

           <div className="bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/10 rounded-[1.5rem] sm:rounded-3xl p-6 sm:p-8 space-y-5 sm:space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                    <Info className="w-5 h-5 text-blue-400" />
                 </div>
                 <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">ข้อมูลผู้ให้บริการ API</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed">
                ระบบจัดการชำระเงินต้องเชื่อมต่อกับ <span className="text-blue-400 font-bold">DarkX Payment Gateway</span> เพื่อใช้งานโมดูลรับยอดเงินอัตโนมัติ
              </p>
              <a href="https://api.darkx.shop" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full p-3.5 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black text-gray-400 hover:text-white transition-all uppercase tracking-widest">
                <ExternalLink className="w-3.5 h-3.5" /> เว็บไซต์ผู้ให้บริการ
              </a>
           </div>
        </div>
      </div>
    </div>
  )
}
