'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Globe, 
  ArrowLeft, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Gift,
  ExternalLink,
  RefreshCw
} from 'lucide-react'

interface VlessConfig {
  id: string
  link: string
  country: string
  flag: string
  hostname: string
  port: string
  uuid: string
}

interface GroupedConfigs {
  [country: string]: VlessConfig[]
}

export default function PublicVlessPage() {
  const [grouped, setGrouped] = useState<GroupedConfigs>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    // Initial fetch
    fetchConfigs()
    
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchConfigs()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  async function fetchConfigs() {
    try {
      setLoading(false) // Don't show loading on auto-refresh
      const res = await fetch('/api/public-vless')
      const data = await res.json()
      
      if (data.success) {
        setGrouped(data.grouped || {})
        setLastUpdate(new Date())
        setError('')
      } else {
        setError('โหลดข้อมูลไม่สำเร็จ')
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Count total configs
  const totalConfigs = Object.values(grouped).reduce((sum, configs) => sum + configs.length, 0)
  const countries = Object.keys(grouped)

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg">Free VLESS</span>
              <span className="text-xs text-emerald-400 block">แจกฟรีไม่ต้องเติมเงิน</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
            {/* Last update time */}
            <span className="text-xs text-gray-500 hidden sm:block">
              อัพเดท: {lastUpdate.toLocaleTimeString('th-TH')}
            </span>
            
            {/* Refresh button */}
            <button 
              onClick={fetchConfigs}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <Link href="/" className="p-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              VLESS ฟรี
            </h1>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-bold">
              FREE
            </span>
          </div>
          <p className="text-gray-400">
            ดึงจาก GitHub Public List • กรอง speedtest.net • {totalConfigs} รายการ • {countries.length} ประเทศ
          </p>
          <p className="text-xs text-gray-500 mt-1">
            อัพเดทอัตโนมัติทุก 30 วินาที
          </p>
        </div>

        {/* Loading */}
        {loading && Object.keys(grouped).length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-400">{error}</p>
            <button 
              onClick={fetchConfigs}
              className="mt-4 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-red-400 transition-colors"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {/* Countries Grid */}
        {countries.map(country => (
          <div key={country} className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">{grouped[country][0]?.flag || '🌐'}</span>
              {country}
              <span className="text-sm font-normal text-gray-500">
                ({grouped[country].length} รายการ)
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped[country].map((config) => (
                <div 
                  key={config.id}
                  className="bg-gray-900/50 border border-white/10 rounded-xl p-4 hover:border-green-500/50 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{config.flag || '🌐'}</span>
                      <span className="font-mono text-sm text-gray-400">{config.id}</span>
                    </div>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-bold">
                      FREE
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hostname</span>
                      <span className="text-gray-300 font-mono text-xs truncate max-w-32">
                        {config.hostname}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Port</span>
                      <span className="text-gray-300 font-mono">{config.port}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">UUID</span>
                      <span className="text-gray-300 font-mono text-xs">{config.uuid}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => copyToClipboard(config.link, config.id)}
                      className="flex items-center justify-center gap-1.5 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                    >
                      {copiedId === config.id ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>คัดลอก</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => window.open(config.link, '_blank')}
                      className="flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Gift className="w-4 h-4" />
                      <span>ใช้งาน</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {!loading && !error && countries.length === 0 && (
          <div className="text-center py-20">
            <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">ไม่พบข้อมูล VLESS</p>
            <p className="text-gray-500 text-sm mt-2">ลองรีเฟรชหน้าใหม่</p>
          </div>
        )}
      </main>
    </div>
  )
}
