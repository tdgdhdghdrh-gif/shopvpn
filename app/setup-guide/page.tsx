'use client'

import Link from 'next/link'
import { 
  ArrowLeft, Phone, Smartphone, Shield, Zap, CheckCircle2, 
  Copy, ExternalLink, AlertCircle, Signal, Wifi, Star,
  ChevronDown, Loader2
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface SetupGuideItem {
  id: string
  stepLabel: string
  title: string
  code: string
  price: string
  description: string
  recommended: boolean
}

interface SetupGuideSection {
  id: string
  title: string
  subtitle: string
  color: string
  items: SetupGuideItem[]
  extraCodes: { code: string; label: string }[]
  recommendationText: string
  recommendationSub: string
}

interface SetupGuideConfig {
  heroTitle: string
  heroSubtitle: string
  importantNotice: string
  sections: SetupGuideSection[]
  summaryTitle: string
  summaryItems: { label: string; operator: string; price: string; highlight: boolean; highlightLabel?: string }[]
  ctaText: string
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white transition-all active:scale-95"
    >
      {copied ? (
        <>
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-400">คัดลอกแล้ว</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          <span>คัดลอก</span>
        </>
      )}
    </button>
  )
}

function DialButton({ code, label }: { code: string; label: string }) {
  return (
    <a
      href={`tel:${encodeURIComponent(code)}`}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-[11px] font-bold text-emerald-400 transition-all active:scale-95"
    >
      <Phone className="w-3 h-3" />
      {label}
    </a>
  )
}

const COLOR_MAP: Record<string, { text: string; border: string; bg: string; badge: string }> = {
  emerald: { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  blue: { text: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5', badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  red: { text: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/5', badge: 'bg-red-500/10 border-red-500/20 text-red-400' },
  amber: { text: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5', badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  cyan: { text: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5', badge: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' },
  purple: { text: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/5', badge: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
  rose: { text: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/5', badge: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
}

function getColors(color: string) {
  return COLOR_MAP[color] || COLOR_MAP.emerald
}

export default function SetupGuidePage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('ais')
  const [config, setConfig] = useState<SetupGuideConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConfig()
  }, [])

  async function fetchConfig() {
    try {
      const res = await fetch('/api/setup-guide')
      const data = await res.json()
      if (data.config) {
        setConfig(data.config)
        // Expand first section by default
        if (data.config.sections?.length > 0) {
          setExpandedSection(data.config.sections[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch setup guide:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center">
        <p className="text-zinc-500">ไม่สามารถโหลดข้อมูลได้</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14">
            <Link 
              href="/" 
              className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>
            <div className="ml-3">
              <h1 className="text-sm font-semibold text-white">{config.heroTitle}</h1>
              <p className="text-[10px] text-zinc-500">{config.heroSubtitle}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-5 pb-12 space-y-5">

        {/* Hero */}
        <div className="relative overflow-hidden bg-zinc-900/50 border border-white/5 rounded-2xl p-5 sm:p-7">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25 shrink-0">
              <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white">{config.heroTitle}</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">{config.heroSubtitle}</p>
            </div>
          </div>

          <div className="relative flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-medium text-emerald-400">กันเน็ตรั่ว</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Zap className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] font-medium text-blue-400">เสถียรขึ้น</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <Signal className="w-3 h-3 text-purple-400" />
              <span className="text-[10px] font-medium text-purple-400">เร็วขึ้น</span>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        {config.importantNotice && (
          <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-400">สำคัญ!</p>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                {config.importantNotice}
              </p>
            </div>
          </div>
        )}

        {/* Sections */}
        {config.sections.map((section) => {
          const colors = getColors(section.color)
          const isExpanded = expandedSection === section.id
          return (
            <div key={section.id} className="border border-white/5 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 ${colors.bg} ${colors.border} border rounded-xl flex items-center justify-center`}>
                    <span className={`text-sm font-black ${colors.text}`}>
                      {section.title.split(' ')[0].substring(0, 4).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-bold text-white">{section.title}</h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{section.subtitle}</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                  {/* Recommendation banner */}
                  {section.recommendationText && (
                    <div className={`p-3 ${colors.bg} ${colors.border} border rounded-xl`}>
                      <p className={`text-[11px] ${colors.text} font-bold leading-relaxed`}>
                        {section.recommendationText}
                      </p>
                      {section.recommendationSub && (
                        <p className="text-[10px] text-zinc-500 mt-1">
                          {section.recommendationSub}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Items */}
                  {section.items.map((item, itemIdx) => (
                    <div key={item.id}>
                      {item.stepLabel && (
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">
                          {item.stepLabel}
                        </p>
                      )}
                      <div className={`relative p-4 border rounded-2xl transition-all ${item.recommended ? `${colors.bg} ${colors.border}` : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
                        {item.recommended && (
                          <div className="absolute -top-2.5 right-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 ${colors.bg} ${colors.border} border rounded-full text-[9px] font-black ${colors.text} uppercase tracking-wider`}>
                              <Star className="w-2.5 h-2.5" />
                              แนะนำ
                            </span>
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <div className={`w-7 h-7 ${colors.bg} ${colors.border} border rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <span className={`text-xs font-black ${colors.text}`}>{itemIdx + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white">{item.title}</h4>
                            <div className="flex items-center gap-2 mt-1.5">
                              <code className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{item.code}</code>
                              <CopyButton text={item.code} />
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <span className={`text-xs font-bold ${colors.text}`}>{item.price}</span>
                              <DialButton code={item.code} label="กดโทร" />
                            </div>
                            {item.description && (
                              <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Extra dial codes */}
                  {section.extraCodes.length > 0 && (
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                      <p className="text-[10px] font-bold text-zinc-500 mb-2">รหัสสมัครเพิ่มเติม</p>
                      <div className="space-y-1.5">
                        {section.extraCodes.map((ec, i) => (
                          <div key={i} className="flex items-center gap-2 flex-wrap">
                            <code className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{ec.code}</code>
                            <span className="text-[10px] text-zinc-600">{ec.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Quick Summary Card */}
        {config.summaryItems.length > 0 && (
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-cyan-400" />
              {config.summaryTitle}
            </h3>
            <div className="space-y-2.5">
              {config.summaryItems.map((item, i) => (
                <div key={i} className={`flex items-center justify-between py-2 ${i < config.summaryItems.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 ${item.operator === 'TRUE' ? 'bg-red-500/10 border-red-500/20 text-red-400' : item.operator === 'DTAC' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'} border rounded text-[9px] font-black`}>
                      {item.operator}
                    </span>
                    <span className="text-xs text-zinc-400">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold ${item.highlight ? 'text-cyan-400' : 'text-white'}`}>{item.price}</span>
                    {item.highlightLabel && (
                      <span className="text-[9px] text-zinc-600 ml-1">{item.highlightLabel}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back to home */}
        <Link
          href="/"
          className="block w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-center text-sm font-bold text-white transition-all shadow-lg shadow-cyan-600/20 active:scale-[0.98]"
        >
          {config.ctaText}
        </Link>
      </main>
    </div>
  )
}
