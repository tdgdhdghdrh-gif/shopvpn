'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Palette, Code2, MessageCircle, LayoutTemplate, Loader, Type,
  Plus, Trash2, Save, Loader2, CheckCircle2, XCircle,
  GripVertical, Eye, ToggleLeft, ToggleRight,
  MousePointerClick, Smartphone, Monitor, Info,
  Timer, Bell, ArrowUp, Sparkles, Upload, Image as ImageIcon,
  ChevronUp, Zap, Clock, CalendarDays, Link as LinkIcon
} from 'lucide-react'

interface Settings {
  [key: string]: any
}

/* ═══════════════════════════════════════
   TAB CONFIG
   ═══════════════════════════════════════ */
const TABS = [
  { id: 'code', label: 'CSS / JS', icon: Code2, color: 'from-pink-500 to-rose-500', desc: 'Inject โค้ดเองทั้งเว็บ' },
  { id: 'float', label: 'ปุ่มลอย', icon: MessageCircle, color: 'from-amber-500 to-orange-500', desc: 'ปุ่มติดต่อลอยมุมจอ' },
  { id: 'preloader', label: 'โหลด', icon: Loader, color: 'from-violet-500 to-purple-500', desc: 'หน้าจอโหลดก่อนเข้าเว็บ' },
  { id: 'marquee', label: 'วิ่ง', icon: Type, color: 'from-emerald-500 to-teal-500', desc: 'ข้อความวิ่งด้านบน' },
  { id: 'countdown', label: 'นับถอย', icon: Timer, color: 'from-red-500 to-pink-500', desc: 'ตัวนับถอยหลังโปร' },
  { id: 'topbar', label: 'แถบบน', icon: Bell, color: 'from-yellow-500 to-amber-500', desc: 'แถบประกาศด้านบน' },
  { id: 'backtotop', label: 'ขึ้นบน', icon: ArrowUp, color: 'from-sky-500 to-blue-500', desc: 'ปุ่มเลื่อนขึ้นบน' },
  { id: 'cursor', label: 'เมาส์', icon: MousePointerClick, color: 'from-fuchsia-500 to-pink-500', desc: 'เอฟเฟกต์เมาส์' },
]

/* ═══════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════ */
function Card({ icon, title, subtitle, children, action, noPad }: {
  icon: React.ReactNode; title: string; subtitle?: string;
  children: React.ReactNode; action?: { label: string; onClick: () => void }; noPad?: boolean
}) {
  return (
    <div className="rounded-2xl border border-white/[0.04] bg-zinc-950/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center shrink-0">{icon}</div>
          <div className="min-w-0">
            <span className="text-sm font-semibold text-white block truncate">{title}</span>
            {subtitle && <span className="text-[11px] text-zinc-600 block truncate">{subtitle}</span>}
          </div>
        </div>
        {action && (
          <button onClick={action.onClick} className="shrink-0 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors">
            <Plus className="w-3.5 h-3.5" /> {action.label}
          </button>
        )}
      </div>
      <div className={noPad ? '' : 'p-4 sm:p-5'}>{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className={`relative w-12 h-7 rounded-full p-1 transition-all duration-300 ${value ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-zinc-700'}`}>
      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-6 flex flex-col items-center justify-center gap-2 text-center">
      <div className="w-10 h-10 rounded-xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center"><Plus className="w-4 h-4 text-zinc-600" /></div>
      <p className="text-[11px] text-zinc-600">{text}</p>
    </div>
  )
}

function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <div className="sticky bottom-0 -mx-4 sm:-mx-5 px-4 sm:px-5 pt-3 pb-5 bg-gradient-to-t from-black via-black/90 to-transparent">
      <button onClick={onClick} disabled={saving} className="w-full sm:w-auto px-8 py-3 bg-white text-black text-sm font-bold rounded-2xl hover:bg-zinc-100 hover:shadow-lg hover:shadow-white/10 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2.5">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" />กำลังบันทึก...</> : <><Save className="w-4 h-4" />บันทึกการเปลี่ยนแปลง</>}
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════
   TAB 1 — CSS / JS
   ═══════════════════════════════════════ */
function CodeTab({ settings, onSave, saving }: any) {
  const [css, setCss] = useState('')
  const [js, setJs] = useState('')
  const [copied, setCopied] = useState<'css' | 'js' | null>(null)
  useEffect(() => { setCss(settings?.customCss || ''); setJs(settings?.customJs || '') }, [settings])
  const copy = (which: 'css' | 'js') => { navigator.clipboard.writeText(which === 'css' ? css : js); setCopied(which); setTimeout(() => setCopied(null), 1500) }
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <Card icon={<Palette className="w-4 h-4 text-pink-400" />} title="Custom CSS" subtitle="จะถูกใส่ใน <style> ทุกหน้า">
        <div className="relative">
          <textarea value={css} onChange={e => setCss(e.target.value)} placeholder={`/* ตัวอย่าง */\nbody {\n  /* custom styles */\n}`} rows={8} className="w-full bg-black/40 border-0 p-4 text-[13px] text-zinc-300 font-mono placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-pink-500/20 resize-y min-h-[180px]" spellCheck={false} />
          <button onClick={() => copy('css')} className="absolute top-3 right-3 text-zinc-600 hover:text-white transition-colors">{copied === 'css' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Sparkles className="w-4 h-4" />}</button>
        </div>
      </Card>
      <Card icon={<Code2 className="w-4 h-4 text-amber-400" />} title="Custom JavaScript" subtitle="รันด้วย defer หลังโหลดเสร็จ">
        <div className="relative">
          <textarea value={js} onChange={e => setJs(e.target.value)} placeholder="// ตัวอย่าง: Google Analytics, Chat widget" rows={6} className="w-full bg-black/40 border-0 p-4 text-[13px] text-zinc-300 font-mono placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-amber-500/20 resize-y min-h-[140px]" spellCheck={false} />
          <button onClick={() => copy('js')} className="absolute top-3 right-3 text-zinc-600 hover:text-white transition-colors">{copied === 'js' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Sparkles className="w-4 h-4" />}</button>
        </div>
      </Card>
      <SaveButton onClick={() => onSave({ customCss: css, customJs: js })} saving={saving} />
    </div>
  )
}

/* ═══════════════════════════════════════
   TAB 3 — FLOATING BUTTON
   ═══════════════════════════════════════ */
function FloatTab({ settings, onSave, saving }: any) {
  const [enabled, setEnabled] = useState(false)
  const [icon, setIcon] = useState('MessageCircle')
  const [url, setUrl] = useState('')
  const [color, setColor] = useState('#06b6e4')
  const [position, setPosition] = useState('bottom-right')
  const [text, setText] = useState('')
  useEffect(() => { setEnabled(settings?.floatingButtonEnabled ?? false); setIcon(settings?.floatingButtonIcon || 'MessageCircle'); setUrl(settings?.floatingButtonUrl || ''); setColor(settings?.floatingButtonColor || '#06b6e4'); setPosition(settings?.floatingButtonPosition || 'bottom-right'); setText(settings?.floatingButtonText || '') }, [settings])
  const ICONS = [
    { value: 'MessageCircle', label: 'แชท', emoji: '💬' },
    { value: 'Phone', label: 'โทร', emoji: '📞' },
    { value: 'Headphones', label: 'ซัพพอร์ต', emoji: '🎧' },
    { value: 'ShoppingCart', label: 'ตะกร้า', emoji: '🛒' },
    { value: 'HelpCircle', label: 'ช่วยเหลือ', emoji: '❓' },
  ]
  const isLeft = position === 'bottom-left'
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-4 rounded-2xl border border-white/[0.04] bg-zinc-950/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/10 flex items-center justify-center"><MousePointerClick className="w-4 h-4 text-amber-400" /></div>
          <div><span className="text-sm font-medium text-white">เปิดใช้งานปุ่มลอย</span><p className="text-[11px] text-zinc-600">แสดงปุ่มติดต่อลอยมุมจอ</p></div>
        </div>
        <Toggle value={enabled} onChange={setEnabled} />
      </div>
      {enabled && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <Card icon={<LinkIcon className="w-4 h-4 text-amber-400" />} title="ลิงก์ปลายทาง" subtitle="Line, Messenger, เบอร์โทร">
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://line.me/ti/p/@yourid หรือ tel:0820000000" className="w-full bg-black/40 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 transition-all" />
          </Card>
          <Card icon={<Sparkles className="w-4 h-4 text-amber-400" />} title="ไอคอน" subtitle="เลือกไอคอนที่เหมาะกับจุดประสงค์">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {ICONS.map(ic => (
                <button key={ic.value} onClick={() => setIcon(ic.value)} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all active:scale-95 ${icon === ic.value ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}>
                  <span className="text-lg">{ic.emoji}</span><span className="text-[10px] font-medium">{ic.label}</span>
                </button>
              ))}
            </div>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card icon={<Palette className="w-4 h-4 text-amber-400" />} title="สีปุ่ม" noPad>
              <div className="flex items-center gap-3 px-4 pb-3">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0">
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer border-0 p-0" />
                </div>
                <input type="text" value={color} onChange={e => setColor(e.target.value)} className="flex-1 bg-black/40 border border-zinc-800/80 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-zinc-700 focus:outline-none focus:border-amber-500/30 transition-all" />
              </div>
            </Card>
            <Card icon={<Smartphone className="w-4 h-4 text-amber-400" />} title="ตำแหน่ง" noPad>
              <div className="flex gap-2 px-4 pb-3">
                {[{ value: 'bottom-right', label: 'ขวาล่าง' }, { value: 'bottom-left', label: 'ซ้ายล่าง' }].map(p => (
                  <button key={p.value} onClick={() => setPosition(p.value)} className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all active:scale-95 ${position === p.value ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-500 hover:border-zinc-700'}`}>{p.label}</button>
                ))}
              </div>
            </Card>
          </div>
          <Card icon={<Type className="w-4 h-4 text-amber-400" />} title="ข้อความแสดงตอน hover" subtitle="ไม่บังคับ — แสดงเมื่อชี้เมาส์">
            <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="ติดต่อเรา" className="w-full bg-black/40 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 transition-all" />
          </Card>
        </div>
      )}
      {enabled && (
        <div className="rounded-2xl border border-white/[0.04] bg-zinc-950/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-zinc-500" /><span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">ตัวอย่างปุ่มลอย</span></div>
          <div className="relative h-48 bg-zinc-950/60 overflow-hidden flex items-center justify-center">
            <div className="w-[200px] h-[160px] rounded-2xl border border-zinc-800/50 bg-zinc-900/30 relative overflow-hidden">
              <div className="p-3 space-y-2"><div className="h-2 w-3/4 bg-zinc-800/50 rounded" /><div className="h-2 w-1/2 bg-zinc-800/50 rounded" /><div className="h-2 w-2/3 bg-zinc-800/50 rounded" /></div>
              <div className={`absolute bottom-3 ${isLeft ? 'left-3' : 'right-3'}`}>
                <div className="group flex items-center gap-2">
                  {text && <span className="bg-zinc-800 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{text}</span>}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: color }}><span className="text-white text-sm">{ICONS.find(ic => ic.value === icon)?.emoji || '💬'}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <SaveButton onClick={() => onSave({ floatingButtonEnabled: enabled, floatingButtonIcon: icon, floatingButtonUrl: url, floatingButtonColor: color, floatingButtonPosition: position, floatingButtonText: text })} saving={saving} />
    </div>
  )
}

/* ═══════════════════════════════════════
   TAB 4 — PRELOADER
   ═══════════════════════════════════════ */
function PreloaderTab({ settings, onSave, saving }: any) {
  const [enabled, setEnabled] = useState(false)
  const [logo, setLogo] = useState('')
  const [bgColor, setBgColor] = useState('#000000')
  const [text, setText] = useState('')
  const [animation, setAnimation] = useState('spin')
  const [duration, setDuration] = useState(2000)
  const [skippable, setSkippable] = useState(true)

  useEffect(() => {
    setEnabled(settings?.preloaderEnabled ?? false)
    setLogo(settings?.preloaderLogo || '')
    setBgColor(settings?.preloaderBgColor || '#000000')
    setText(settings?.preloaderText || '')
    setAnimation(settings?.preloaderAnimation || 'spin')
    setDuration(settings?.preloaderDuration ?? 2000)
    setSkippable(settings?.preloaderSkippable ?? true)
  }, [settings])

  const anims = [
    { value: 'spin', label: 'หมุน', emoji: '🔄' },
    { value: 'pulse', label: 'เต้น', emoji: '💓' },
    { value: 'bounce', label: 'กระโดด', emoji: '⬆️' },
    { value: 'none', label: 'นิ่ง', emoji: '⏸️' },
  ]

  const animClass = animation === 'pulse' ? 'animate-pulse' : animation === 'bounce' ? 'animate-bounce' : animation === 'none' ? '' : 'animate-spin'

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-4 rounded-2xl border border-white/[0.04] bg-zinc-950/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/10 flex items-center justify-center"><Loader className="w-4 h-4 text-violet-400" /></div>
          <div><span className="text-sm font-medium text-white">เปิดใช้งานหน้าโหลด</span><p className="text-[11px] text-zinc-600">แสดงก่อนเข้าเว็บ (1 ครั้งต่อเซสชั่น)</p></div>
        </div>
        <Toggle value={enabled} onChange={setEnabled} />
      </div>

      {enabled && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <Card icon={<ImageIcon className="w-4 h-4 text-violet-400" />} title="โลโก้" subtitle="URL รูปโลโก้ (ไม่ใส่จะใช้ตัวอักษร V)">
            <input type="text" value={logo} onChange={e => setLogo(e.target.value)} placeholder="https://your-site.com/logo.png" className="w-full bg-black/40 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/40 transition-all" />
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card icon={<Palette className="w-4 h-4 text-violet-400" />} title="สีพื้นหลัง" noPad>
              <div className="flex items-center gap-3 px-4 pb-3">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0">
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer border-0 p-0" />
                </div>
                <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} className="flex-1 bg-black/40 border border-zinc-800/80 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-zinc-700 focus:outline-none focus:border-violet-500/30 transition-all" />
              </div>
            </Card>
            <Card icon={<Type className="w-4 h-4 text-violet-400" />} title="ข้อความ" subtitle="แสดงใต้โลโก้">
              <div className="px-4 pb-3">
                <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="กำลังโหลด..." className="w-full bg-black/40 border border-zinc-800/80 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-violet-500/30 transition-all" />
              </div>
            </Card>
          </div>
          <Card icon={<Sparkles className="w-4 h-4 text-violet-400" />} title="แอนิเมชั่น" subtitle="ลักษณะการเคลื่อนไหวของโลโก้">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {anims.map(a => (
                <button key={a.value} onClick={() => setAnimation(a.value)} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all active:scale-95 ${animation === a.value ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}>
                  <span className="text-lg">{a.emoji}</span><span className="text-[10px] font-medium">{a.label}</span>
                </button>
              ))}
            </div>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card icon={<Clock className="w-4 h-4 text-violet-400" />} title="ระยะเวลาแสดง" subtitle="มิลลิวินาที (1 วิ = 1000)" noPad>
              <div className="px-4 pb-3">
                <input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 2000)} min={500} max={10000} step={500} className="w-full bg-black/40 border border-zinc-800/80 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-violet-500/30 transition-all" />
              </div>
            </Card>
            <div className="flex items-center justify-between p-4 rounded-2xl border border-white/[0.04] bg-zinc-950/30">
              <div><span className="text-sm font-medium text-white">กดข้ามได้</span><p className="text-[11px] text-zinc-600">แตะที่หน้าจอเพื่อข้าม</p></div>
              <Toggle value={skippable} onChange={setSkippable} />
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {enabled && (
        <div className="rounded-2xl border border-white/[0.04] bg-zinc-950/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-zinc-500" /><span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">ตัวอย่างหน้าโหลด</span></div>
          <div className="relative h-56 flex flex-col items-center justify-center" style={{ backgroundColor: bgColor }}>
            {logo ? (
              <img src={logo} alt="logo" className={`w-16 h-16 object-contain mb-4 ${animClass}`} style={{ animationDuration: '1.5s' }} />
            ) : (
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 ${animClass}`} style={{ animationDuration: '1.5s' }}>
                <span className="text-2xl font-black text-white">V</span>
              </div>
            )}
            {text && <p className="text-white/70 text-sm font-medium">{text}</p>}
            {skippable && <p className="absolute bottom-4 text-white/20 text-[10px] uppercase tracking-widest">แตะเพื่อข้าม</p>}
          </div>
        </div>
      )}

      <SaveButton onClick={() => onSave({ preloaderEnabled: enabled, preloaderLogo: logo || null, preloaderBgColor: bgColor, preloaderText: text || null, preloaderAnimation: animation, preloaderDuration: duration, preloaderSkippable: skippable })} saving={saving} />
    </div>
  )
}

/* ═══════════════════════════════════════
   TAB 5 — MARQUEE BAR
   ═══════════════════════════════════════ */
function MarqueeTab({ settings, onSave, saving }: any) {
  const [enabled, setEnabled] = useState(false)
  const [text, setText] = useState('')
  const [bgColor, setBgColor] = useState('#06b6e4')
  const [textColor, setTextColor] = useState('#ffffff')
  const [speed, setSpeed] = useState(20)
  const [link, setLink] = useState('')

  useEffect(() => {
    setEnabled(settings?.marqueeEnabled ?? false)
    setText(settings?.marqueeText || '')
    setBgColor(settings?.marqueeBgColor || '#06b6e4')
    setTextColor(settings?.marqueeTextColor || '#ffffff')
    setSpeed(settings?.marqueeSpeed ?? 20)
    setLink(settings?.marqueeLink || '')
  }, [settings])

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-4 rounded-2xl border border-white/[0.04] bg-zinc-950/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center"><Zap className="w-4 h-4 text-emerald-400" /></div>
          <div><span className="text-sm font-medium text-white">เปิดใช้งานข้อความวิ่ง</span><p className="text-[11px] text-zinc-600">แถบข้อความวิ่งด้านบนสุดทุกหน้า</p></div>
        </div>
        <Toggle value={enabled} onChange={setEnabled} />
      </div>

      {enabled && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <Card icon={<Type className="w-4 h-4 text-emerald-400" />} title="ข้อความ" subtitle="จะวน loop ไปเรื่อยๆ">
            <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="🔥 โปรแรง! ลด 50% ถึงเที่ยงคืนนี้เท่านั้น" className="w-full bg-black/40 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-all" />
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card icon={<Palette className="w-4 h-4 text-emerald-400" />} title="สีพื้นหลัง" noPad>
              <div className="flex items-center gap-3 px-4 pb-3">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0"><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer border-0 p-0" /></div>
                <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} className="flex-1 bg-black/40 border border-zinc-800/80 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-zinc-700 focus:outline-none focus:border-emerald-500/30 transition-all" />
              </div>
            </Card>
            <Card icon={<Type className="w-4 h-4 text-emerald-400" />} title="สีตัวอักษร" noPad>
              <div className="flex items-center gap-3 px-4 pb-3">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0"><input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer border-0 p-0" /></div>
                <input type="text" value={textColor} onChange={e => setTextColor(e.target.value)} className="flex-1 bg-black/40 border border-zinc-800/80 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-zinc-700 focus:outline-none focus:border-emerald-500/30 transition-all" />
              </div>
            </Card>
          </div>
          <Card icon={<Clock className="w-4 h-4 text-emerald-400" />} title="ความเร็ว" subtitle="วินาทีต่อ 1 รอบ (ยิ่งน้อยยิ่งเร็ว)">
            <div className="flex items-center gap-4">
              <input type="range" value={speed} onChange={e => setSpeed(parseInt(e.target.value))} min={5} max={60} className="flex-1 accent-emerald-500" />
              <span className="text-sm font-mono text-white w-12 text-right">{speed}s</span>
            </div>
          </Card>
          <Card icon={<LinkIcon className="w-4 h-4 text-emerald-400" />} title="ลิงก์ (ไม่บังคับ)" subtitle="คลิกข้อความแล้วไปหน้าอื่น">
            <input type="text" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." className="w-full bg-black/40 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-all" />
          </Card>
        </div>
      )}

      {enabled && text && (
        <div className="rounded-2xl border border-white/[0.04] bg-zinc-950/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-zinc-500" /><span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">ตัวอย่างข้อความวิ่ง</span></div>
          <div className="overflow-hidden py-2" style={{ backgroundColor: bgColor }}>
            <div className="whitespace-nowrap flex items-center gap-6 px-4 animate-marquee-preview">
              <span className="text-xs sm:text-sm font-semibold" style={{ color: textColor }}>{text}</span><span style={{ color: textColor, opacity: 0.5 }}>•</span>
              <span className="text-xs sm:text-sm font-semibold" style={{ color: textColor }}>{text}</span><span style={{ color: textColor, opacity: 0.5 }}>•</span>
              <span className="text-xs sm:text-sm font-semibold" style={{ color: textColor }}>{text}</span><span style={{ color: textColor, opacity: 0.5 }}>•</span>
            </div>
            <style jsx>{`
              @keyframes marqueePreview { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
              .animate-marquee-preview { display: inline-flex; animation: marqueePreview linear infinite; width: max-content; animation-duration: ${speed}s; }
            `}</style>
          </div>
        </div>
      )}

      <SaveButton onClick={() => onSave({ marqueeEnabled: enabled, marqueeText: text || null, marqueeBgColor: bgColor, marqueeTextColor: textColor, marqueeSpeed: speed, marqueeLink: link || null })} saving={saving} />
    </div>
  )
}

/* ═══════════════════════════════════════
   TAB 6 — COUNTDOWN TIMER
   ═══════════════════════════════════════ */
function CountdownTab({ settings, onSave, saving }: any) {
  const [enabled, setEnabled] = useState(false)
  const [title, setTitle] = useState('')
  const [endDate, setEndDate] = useState('')
  const [style, setStyle] = useState('boxed')
  const [bgColor, setBgColor] = useState('')
  const [textColor, setTextColor] = useState('')
  const [expiredText, setExpiredText] = useState('หมดเวลาแล้ว')

  useEffect(() => {
    setEnabled(settings?.countdownEnabled ?? false)
    setTitle(settings?.countdownTitle || '')
    setEndDate(settings?.countdownEndDate ? new Date(settings.countdownEndDate).toISOString().slice(0, 16) : '')
    setStyle(settings?.countdownStyle || 'boxed')
    setBgColor(settings?.countdownBgColor || '')
    setTextColor(settings?.countdownTextColor || '')
    setExpiredText(settings?.countdownExpiredText || 'หมดเวลาแล้ว')
  }, [settings])

  const styles = [
    { value: 'boxed', label: 'กรอบ', desc: 'แสดงเป็นบรรทัดเดียว' },
    { value: 'minimal', label: 'มินิมอล', desc: 'เรียบง่ายที่สุด' },
    { value: 'large', label: 'ใหญ่', desc: 'ตัวเลขใหญ่โดดเด่น' },
  ]

  // Calculate preview time
  const now = new Date()
  const target = endDate ? new Date(endDate) : new Date(now.getTime() + 86400000)
  const diff = Math.max(0, target.getTime() - now.getTime())
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff / 3600000) % 24)
  const m = Math.floor((diff / 60000) % 60)
  const s = Math.floor((diff / 1000) % 60)
  const pad = (n: number) => n < 10 ? `0${n}` : `${n}`

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-4 rounded-2xl border border-white/[0.04] bg-zinc-950/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/10 flex items-center justify-center"><Timer className="w-4 h-4 text-red-400" /></div>
          <div><span className="text-sm font-medium text-white">เปิดใช้งานตัวนับถอยหลัง</span><p className="text-[11px] text-zinc-600">กระตุ้นให้ลูกค้ารีบซื้อ (FOMO)</p></div>
        </div>
        <Toggle value={enabled} onChange={setEnabled} />
      </div>

      {enabled && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <Card icon={<Type className="w-4 h-4 text-red-400" />} title="หัวข้อ" subtitle="เช่น “⏳ โปรนี้เหลืออีก”">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="⏳ โปรนี้เหลืออีก" className="w-full bg-black/40 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/40 transition-all" />
          </Card>
          <Card icon={<CalendarDays className="w-4 h-4 text-red-400" />} title="วันหมดเวลา" subtitle="เลือกวันและเวลาสิ้นสุด">
            <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-black/40 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/40 transition-all [color-scheme:dark]" />
          </Card>
          <Card icon={<LayoutTemplate className="w-4 h-4 text-red-400" />} title="สไตล์" subtitle="รูปแบบการแสดงผล">
            <div className="grid grid-cols-3 gap-2">
              {styles.map(s => (
                <button key={s.value} onClick={() => setStyle(s.value)} className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all active:scale-95 ${style === s.value ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}>
                  <span className="text-xs font-semibold">{s.label}</span><span className="text-[10px] opacity-60">{s.desc}</span>
                </button>
              ))}
            </div>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card icon={<Palette className="w-4 h-4 text-red-400" />} title="สีพื้นหลัง" subtitle="เว้นว่าง = โปร่งใส" noPad>
              <div className="flex items-center gap-3 px-4 pb-3">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0"><input type="color" value={bgColor || '#000000'} onChange={e => setBgColor(e.target.value)} className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer border-0 p-0" /></div>
                <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} placeholder="เว้นว่าง = โปร่งใส" className="flex-1 bg-black/40 border border-zinc-800/80 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-zinc-700 focus:outline-none focus:border-red-500/30 transition-all" />
              </div>
            </Card>
            <Card icon={<Type className="w-4 h-4 text-red-400" />} title="สีตัวอักษร" subtitle="เว้นว่าง = ขาว" noPad>
              <div className="flex items-center gap-3 px-4 pb-3">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0"><input type="color" value={textColor || '#ffffff'} onChange={e => setTextColor(e.target.value)} className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer border-0 p-0" /></div>
                <input type="text" value={textColor} onChange={e => setTextColor(e.target.value)} placeholder="เว้นว่าง = ขาว" className="flex-1 bg-black/40 border border-zinc-800/80 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-zinc-700 focus:outline-none focus:border-red-500/30 transition-all" />
              </div>
            </Card>
          </div>
          <Card icon={<Type className="w-4 h-4 text-red-400" />} title="ข้อความตอนหมดเวลา" subtitle="แสดงเมื่อถึงเวลาที่กำหนด">
            <input type="text" value={expiredText} onChange={e => setExpiredText(e.target.value)} placeholder="หมดเวลาแล้ว" className="w-full bg-black/40 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/40 transition-all" />
          </Card>
        </div>
      )}

      {enabled && (
        <div className="rounded-2xl border border-white/[0.04] bg-zinc-950/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-zinc-500" /><span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">ตัวอย่างตัวนับถอยหลัง</span></div>
          <div className="py-4" style={{ backgroundColor: bgColor || 'transparent' }}>
            {style === 'large' ? (
              <div className="text-center">
                {title && <p className="text-lg font-bold mb-4" style={{ color: textColor || '#fff' }}>{title}</p>}
                <div className="flex items-center justify-center gap-3 sm:gap-6">
                  {[['วัน', d], ['ชม.', h], ['นาที', m], ['วิ', s]].map(([label, val]) => (
                    <div key={label as string} className="text-center">
                      <div className="text-3xl sm:text-4xl font-black tabular-nums" style={{ color: textColor || '#fff' }}>{pad(val as number)}</div>
                      <div className="text-[10px] sm:text-xs uppercase tracking-wider mt-1 opacity-50" style={{ color: textColor || '#fff' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : style === 'minimal' ? (
              <div className="text-center">
                {title && <p className="text-[11px] uppercase tracking-wider mb-1 opacity-60" style={{ color: textColor || '#fff' }}>{title}</p>}
                <div className="flex items-center justify-center gap-1 text-sm font-bold" style={{ color: textColor || '#fff' }}>
                  <span>{pad(d)}วัน:</span><span>{pad(h)}ชม.:</span><span>{pad(m)}นาที:</span><span>{pad(s)}วิ</span>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                {title && <span className="text-xs sm:text-sm font-semibold shrink-0" style={{ color: textColor || '#fff' }}>{title}</span>}
                <div className="flex items-center gap-2">
                  {[['วัน', d], ['ชม.', h], ['นาที', m], ['วิ', s]].map(([label, val], i) => (
                    <div key={label as string} className="flex items-baseline gap-0.5">
                      <span className="text-sm sm:text-base font-bold tabular-nums min-w-[1.5ch] text-center" style={{ color: textColor || '#fff' }}>{pad(val as number)}</span>
                      <span className="text-[10px] opacity-60" style={{ color: textColor || '#fff' }}>{label}</span>
                      {i < 3 && <span className="mx-0.5" style={{ color: textColor || '#fff' }}>:</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <SaveButton onClick={() => onSave({ countdownEnabled: enabled, countdownTitle: title || null, countdownEndDate: endDate ? new Date(endDate).toISOString() : null, countdownStyle: style, countdownBgColor: bgColor || null, countdownTextColor: textColor || null, countdownExpiredText: expiredText })} saving={saving} />
    </div>
  )
}

/* ═══════════════════════════════════════
   TAB 7 — TOP NOTIFICATION BAR
   ═══════════════════════════════════════ */
function TopbarTab({ settings, onSave, saving }: any) {
  const [enabled, setEnabled] = useState(false)
  const [text, setText] = useState('')
  const [bgColor, setBgColor] = useState('#ef4444')
  const [textColor, setTextColor] = useState('#ffffff')
  const [link, setLink] = useState('')
  const [dismissible, setDismissible] = useState(true)

  useEffect(() => {
    setEnabled(settings?.topBarEnabled ?? false)
    setText(settings?.topBarText || '')
    setBgColor(settings?.topBarBgColor || '#ef4444')
    setTextColor(settings?.topBarTextColor || '#ffffff')
    setLink(settings?.topBarLink || '')
    setDismissible(settings?.topBarDismissible ?? true)
  }, [settings])

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-4 rounded-2xl border border-white/[0.04] bg-zinc-950/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/10 flex items-center justify-center"><Bell className="w-4 h-4 text-yellow-400" /></div>
          <div><span className="text-sm font-medium text-white">เปิดใช้งานแถบประกาศ</span><p className="text-[11px] text-zinc-600">แถบด้านบนสุด ผู้ใช้กดปิดได้</p></div>
        </div>
        <Toggle value={enabled} onChange={setEnabled} />
      </div>

      {enabled && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <Card icon={<Type className="w-4 h-4 text-yellow-400" />} title="ข้อความ" subtitle="ข้อความสั้นๆ ประกาศด่วน">
            <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="🔧 ระบบกำลังปรับปรุง อาจมีความล่าช้าเล็กน้อย" className="w-full bg-black/40 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500/40 transition-all" />
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card icon={<Palette className="w-4 h-4 text-yellow-400" />} title="สีพื้นหลัง" noPad>
              <div className="flex items-center gap-3 px-4 pb-3">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0"><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer border-0 p-0" /></div>
                <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} className="flex-1 bg-black/40 border border-zinc-800/80 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-zinc-700 focus:outline-none focus:border-yellow-500/30 transition-all" />
              </div>
            </Card>
            <Card icon={<Type className="w-4 h-4 text-yellow-400" />} title="สีตัวอักษร" noPad>
              <div className="flex items-center gap-3 px-4 pb-3">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0"><input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer border-0 p-0" /></div>
                <input type="text" value={textColor} onChange={e => setTextColor(e.target.value)} className="flex-1 bg-black/40 border border-zinc-800/80 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-zinc-700 focus:outline-none focus:border-yellow-500/30 transition-all" />
              </div>
            </Card>
          </div>
          <Card icon={<LinkIcon className="w-4 h-4 text-yellow-400" />} title="ลิงก์ (ไม่บังคับ)" subtitle="คลิกแถบแล้วไปหน้าอื่น">
            <input type="text" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." className="w-full bg-black/40 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500/40 transition-all" />
          </Card>
          <div className="flex items-center justify-between p-4 rounded-2xl border border-white/[0.04] bg-zinc-950/30">
            <div><span className="text-sm font-medium text-white">กดปิดได้</span><p className="text-[11px] text-zinc-600">ผู้ใช้กด ❌ ปิดแล้วจะไม่โผล่อีกในเบราว์เซอร์นั้น</p></div>
            <Toggle value={dismissible} onChange={setDismissible} />
          </div>
        </div>
      )}

      {enabled && text && (
        <div className="rounded-2xl border border-white/[0.04] bg-zinc-950/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-zinc-500" /><span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">ตัวอย่างแถบประกาศ</span></div>
          <div className="py-2 px-4 flex items-center justify-center gap-2 relative" style={{ backgroundColor: bgColor }}>
            <Bell className="w-3.5 h-3.5 shrink-0" style={{ color: textColor, opacity: 0.8 }} />
            <span className="text-xs sm:text-sm font-medium" style={{ color: textColor }}>{text}</span>
            {dismissible && <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-70 hover:opacity-100"><XCircle className="w-3.5 h-3.5" style={{ color: textColor }} /></button>}
          </div>
        </div>
      )}

      <SaveButton onClick={() => onSave({ topBarEnabled: enabled, topBarText: text || null, topBarBgColor: bgColor, topBarTextColor: textColor, topBarLink: link || null, topBarDismissible: dismissible })} saving={saving} />
    </div>
  )
}

/* ═══════════════════════════════════════
   TAB 8 — BACK TO TOP
   ═══════════════════════════════════════ */
function BackToTopTab({ settings, onSave, saving }: any) {
  const [enabled, setEnabled] = useState(false)
  const [style, setStyle] = useState('circle')
  const [color, setColor] = useState('#06b6e4')
  const [position, setPosition] = useState('bottom-right')

  useEffect(() => {
    setEnabled(settings?.backToTopEnabled ?? false)
    setStyle(settings?.backToTopStyle || 'circle')
    setColor(settings?.backToTopColor || '#06b6e4')
    setPosition(settings?.backToTopPosition || 'bottom-right')
  }, [settings])

  const styles = [
    { value: 'circle', label: 'วงกลม', emoji: '🔵' },
    { value: 'pill', label: 'ยาว', emoji: '💊' },
    { value: 'arrow', label: 'ลูกศร', emoji: '⬆️' },
  ]

  const isLeft = position === 'bottom-left'

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-4 rounded-2xl border border-white/[0.04] bg-zinc-950/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/10 flex items-center justify-center"><ArrowUp className="w-4 h-4 text-sky-400" /></div>
          <div><span className="text-sm font-medium text-white">เปิดใช้งานปุ่มขึ้นบน</span><p className="text-[11px] text-zinc-600">แสดงเมื่อเลื่อนลงมาพอสมควร</p></div>
        </div>
        <Toggle value={enabled} onChange={setEnabled} />
      </div>

      {enabled && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <Card icon={<Sparkles className="w-4 h-4 text-sky-400" />} title="สไตล์" subtitle="รูปทรงของปุ่ม">
            <div className="grid grid-cols-3 gap-2">
              {styles.map(s => (
                <button key={s.value} onClick={() => setStyle(s.value)} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all active:scale-95 ${style === s.value ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}>
                  <span className="text-lg">{s.emoji}</span><span className="text-[10px] font-medium">{s.label}</span>
                </button>
              ))}
            </div>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card icon={<Palette className="w-4 h-4 text-sky-400" />} title="สีปุ่ม" noPad>
              <div className="flex items-center gap-3 px-4 pb-3">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0"><input type="color" value={color} onChange={e => setColor(e.target.value)} className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer border-0 p-0" /></div>
                <input type="text" value={color} onChange={e => setColor(e.target.value)} className="flex-1 bg-black/40 border border-zinc-800/80 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-zinc-700 focus:outline-none focus:border-sky-500/30 transition-all" />
              </div>
            </Card>
            <Card icon={<Smartphone className="w-4 h-4 text-sky-400" />} title="ตำแหน่ง" noPad>
              <div className="flex gap-2 px-4 pb-3">
                {[{ value: 'bottom-right', label: 'ขวาล่าง' }, { value: 'bottom-left', label: 'ซ้ายล่าง' }].map(p => (
                  <button key={p.value} onClick={() => setPosition(p.value)} className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all active:scale-95 ${position === p.value ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-500 hover:border-zinc-700'}`}>{p.label}</button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {enabled && (
        <div className="rounded-2xl border border-white/[0.04] bg-zinc-950/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-zinc-500" /><span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">ตัวอย่างปุ่มขึ้นบน</span></div>
          <div className="relative h-48 bg-zinc-950/60 flex items-center justify-center">
            <div className="w-[200px] h-[160px] rounded-2xl border border-zinc-800/50 bg-zinc-900/30 relative overflow-hidden">
              <div className="p-3 space-y-2"><div className="h-2 w-3/4 bg-zinc-800/50 rounded" /><div className="h-2 w-1/2 bg-zinc-800/50 rounded" /><div className="h-2 w-2/3 bg-zinc-800/50 rounded" /></div>
              <div className={`absolute bottom-3 ${isLeft ? 'left-3' : 'right-3'}`}>
                {style === 'pill' ? (
                  <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-white text-xs font-bold" style={{ backgroundColor: color }}><ArrowUp className="w-3.5 h-3.5" />ขึ้นบน</div>
                ) : style === 'arrow' ? (
                  <div className="w-10 h-10 rounded-xl bg-zinc-900/80 backdrop-blur-sm border border-white/10 flex items-center justify-center" style={{ color }}><ChevronUp className="w-5 h-5" /></div>
                ) : (
                  <div className="w-12 h-12 rounded-full text-white flex items-center justify-center" style={{ backgroundColor: color }}><ArrowUp className="w-5 h-5" /></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <SaveButton onClick={() => onSave({ backToTopEnabled: enabled, backToTopStyle: style, backToTopColor: color, backToTopPosition: position })} saving={saving} />
    </div>
  )
}

/* ═══════════════════════════════════════
   TAB 9 — CUSTOM CURSOR
   ═══════════════════════════════════════ */
function CursorTab({ settings, onSave, saving }: any) {
  const [enabled, setEnabled] = useState(false)
  const [style, setStyle] = useState('glow')
  const [color, setColor] = useState('#06b6e4')

  useEffect(() => {
    setEnabled(settings?.customCursorEnabled ?? false)
    setStyle(settings?.customCursorStyle || 'glow')
    setColor(settings?.customCursorColor || '#06b6e4')
  }, [settings])

  const styles = [
    { value: 'glow', label: 'เรืองแสง', emoji: '✨', desc: 'วงกลมเรืองแสงตามเมาส์' },
    { value: 'trail', label: 'หาง', emoji: '💫', desc: 'มีหางตามหลังหลายจุด' },
    { value: 'dot', label: 'จุด', emoji: '🔵', desc: 'จุดเล็กๆ เรียบง่าย' },
  ]

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-4 rounded-2xl border border-white/[0.04] bg-zinc-950/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/10 flex items-center justify-center"><MousePointerClick className="w-4 h-4 text-fuchsia-400" /></div>
          <div><span className="text-sm font-medium text-white">เปิดใช้งานเอฟเฟกต์เมาส์</span><p className="text-[11px] text-zinc-600">ซ่อนเมาส์ปกติ ใช้ custom cursor</p></div>
        </div>
        <Toggle value={enabled} onChange={setEnabled} />
      </div>

      {enabled && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <Card icon={<Sparkles className="w-4 h-4 text-fuchsia-400" />} title="สไตล์" subtitle="ลักษณะของ cursor">
            <div className="space-y-2">
              {styles.map(s => (
                <button key={s.value} onClick={() => setStyle(s.value)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-[0.98] text-left ${style === s.value ? 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400' : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}>
                  <span className="text-xl">{s.emoji}</span>
                  <div><span className="text-sm font-semibold block">{s.label}</span><span className="text-[11px] opacity-60">{s.desc}</span></div>
                </button>
              ))}
            </div>
          </Card>
          <Card icon={<Palette className="w-4 h-4 text-fuchsia-400" />} title="สี" subtitle="สีของ cursor">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0"><input type="color" value={color} onChange={e => setColor(e.target.value)} className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer border-0 p-0" /></div>
              <input type="text" value={color} onChange={e => setColor(e.target.value)} className="flex-1 bg-black/40 border border-zinc-800/80 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-zinc-700 focus:outline-none focus:border-fuchsia-500/30 transition-all" />
            </div>
          </Card>
        </div>
      )}

      {enabled && (
        <div className="rounded-2xl border border-white/[0.04] bg-zinc-950/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-zinc-500" /><span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">ตัวอย่างเอฟเฟกต์เมาส์</span></div>
          <div className="relative h-48 bg-zinc-950/60 flex items-center justify-center overflow-hidden">
            <div className="relative">
              {style === 'trail' && (
                <>
                  {[0.15, 0.3, 0.45, 0.6].map((op, i) => (
                    <div key={i} className="absolute w-2 h-2 rounded-full" style={{ backgroundColor: color, opacity: op, top: `${(i + 1) * 8}px`, left: `${(i + 1) * 6}px` }} />
                  ))}
                  <div className="relative w-3 h-3 rounded-full border-2" style={{ borderColor: color, top: '0px', left: '0px' }} />
                </>
              )}
              {style === 'glow' && (
                <>
                  <div className="w-8 h-8 rounded-full blur-md opacity-40" style={{ backgroundColor: color }} />
                  <div className="absolute inset-0 w-3 h-3 rounded-full border-2 m-auto" style={{ borderColor: color, backgroundColor: `${color}40` }} />
                </>
              )}
              {style === 'dot' && (
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              )}
            </div>
            <p className="absolute bottom-4 text-[10px] text-zinc-600">เมาส์จริงจะเคลื่อนที่ตามตำแหน่งจริง</p>
          </div>
        </div>
      )}

      <SaveButton onClick={() => onSave({ customCursorEnabled: enabled, customCursorStyle: style, customCursorColor: color })} saving={saving} />
    </div>
  )
}

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
export default function TuneSitePage() {
  const [activeTab, setActiveTab] = useState<string>('code')
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data.settings) setSettings(data.settings)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])
  useEffect(() => { if (flash) { const t = setTimeout(() => setFlash(null), 3500); return () => clearTimeout(t) } }, [flash])

  const handleSave = async (fields: Record<string, any>) => {
    setSaving(true); setFlash(null)
    try {
      const res = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields) })
      const data = await res.json()
      if (data.success) { setSettings(data.settings); setFlash({ type: 'success', msg: 'บันทึกสำเร็จ! เปลี่ยนแปลงมีผลทันที' }) }
      else { setFlash({ type: 'error', msg: data.error || 'บันทึกไม่สำเร็จ' }) }
    } catch { setFlash({ type: 'error', msg: 'เกิดข้อผิดพลาด' }) }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center animate-pulse"><Palette className="w-5 h-5 text-white" /></div>
        <p className="text-sm text-zinc-500">กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <div className="px-3 sm:px-0 max-w-3xl mx-auto pb-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20"><Palette className="w-5 h-5 sm:w-6 sm:h-6 text-white" /></div>
          <div><h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">ตกแต่งเว็บ</h1><p className="text-xs sm:text-sm text-zinc-500">ปรับแต่งหน้าเว็บให้เป็นเอกลักษณ์</p></div>
        </div>
      </div>

      {/* Flash */}
      {flash && (
        <div className={`mb-4 p-3.5 rounded-2xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${flash.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {flash.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          <span className="flex-1">{flash.msg}</span>
          <button onClick={() => setFlash(null)} className="text-zinc-500 hover:text-white transition-colors"><XCircle className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2 mb-5">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 py-3 sm:py-3.5 px-2 sm:px-4 rounded-2xl text-xs sm:text-sm font-semibold transition-all border ${isActive ? 'bg-white text-black border-white shadow-lg shadow-white/5' : 'bg-zinc-900/40 text-zinc-500 border-white/[0.03] hover:border-white/[0.08] hover:text-zinc-300'}`}>
              <Icon className={`w-4 h-4 sm:w-[18px] sm:h-[18px] ${isActive ? 'text-black' : ''}`} />
              <span className="sm:hidden text-[10px]">{tab.label}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {isActive && <div className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r ${tab.color}`} />}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="bg-zinc-950/40 backdrop-blur-sm border border-white/[0.04] rounded-2xl sm:rounded-3xl overflow-hidden">
        <div className="p-4 sm:p-6">
          {activeTab === 'code' && <CodeTab settings={settings!} onSave={handleSave} saving={saving} />}
          {activeTab === 'float' && <FloatTab settings={settings!} onSave={handleSave} saving={saving} />}
          {activeTab === 'preloader' && <PreloaderTab settings={settings!} onSave={handleSave} saving={saving} />}
          {activeTab === 'marquee' && <MarqueeTab settings={settings!} onSave={handleSave} saving={saving} />}
          {activeTab === 'countdown' && <CountdownTab settings={settings!} onSave={handleSave} saving={saving} />}
          {activeTab === 'topbar' && <TopbarTab settings={settings!} onSave={handleSave} saving={saving} />}
          {activeTab === 'backtotop' && <BackToTopTab settings={settings!} onSave={handleSave} saving={saving} />}
          {activeTab === 'cursor' && <CursorTab settings={settings!} onSave={handleSave} saving={saving} />}
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 flex items-start gap-3 p-4 rounded-2xl bg-zinc-900/20 border border-white/[0.03]">
        <Info className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
        <p className="text-[11px] sm:text-xs text-zinc-600 leading-relaxed">การเปลี่ยนแปลงจะมีผลทันทีกับผู้ใช้ทุกคน แนะนำให้เปิดหน้าเว็บหลักในแท็บใหม่เพื่อตรวจสอบผลลัพธ์หลังบันทึก</p>
      </div>
    </div>
  )
}
