'use client'

import { useCallback, useRef } from 'react'
import { useSettings } from './SettingsProvider'

// ========== Effect Types ==========
export const MENU_CLICK_EFFECTS = [
  { id: 'none', name: 'ไม่มี', description: 'ปิดเอฟเฟกต์ทั้งหมด', emoji: '🚫' },
  { id: 'ripple', name: 'Ripple', description: 'คลื่นวงกลมกระจายออกจากจุดกด', emoji: '🌊' },
  { id: 'glow', name: 'Glow Pulse', description: 'เรืองแสงนุ่มๆ กระพริบตรงจุดกด', emoji: '✨' },
  { id: 'particle', name: 'Particle Burst', description: 'อนุภาคกระจายแบบพลุตรงจุดกด', emoji: '🎆' },
  { id: 'shockwave', name: 'Shockwave', description: 'คลื่นกระแทกวงแหวนจากจุดกด', emoji: '💥' },
  { id: 'neon', name: 'Neon Flash', description: 'แฟลชนีออนสว่างวาบ', emoji: '💡' },
  { id: 'slide', name: 'Slide Shine', description: 'แถบแสงวิ่งผ่านเมนู', emoji: '🔦' },
  { id: 'morphGlow', name: 'Morph Glow', description: 'เรืองแสงเปลี่ยนสีแบบ gradient', emoji: '🌈' },
  { id: 'electricArc', name: 'Electric Arc', description: 'สายฟ้าวิ่งรอบเมนู', emoji: '⚡' },
  { id: 'hologram', name: 'Hologram', description: 'เอฟเฟกต์โฮโลแกรมกระพริบ', emoji: '🔮' },
  { id: 'confettiBurst', name: 'Confetti', description: 'กระดาษโปรยจากจุดกด', emoji: '🎊' },
  { id: 'songkran', name: 'Songkran', description: 'สาดน้ำสงกรานต์ หยดน้ำ ดอกไม้ กระจายจากจุดกด', emoji: '💦' },
] as const

export type MenuClickEffectId = typeof MENU_CLICK_EFFECTS[number]['id']

// ========== Helper: create fixed overlay container on body ==========
function createOverlay(rect: DOMRect, duration: number): HTMLDivElement {
  const overlay = document.createElement('div')
  Object.assign(overlay.style, {
    position: 'fixed',
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    pointerEvents: 'none',
    zIndex: '99999',
    overflow: 'visible',
    borderRadius: '8px',
  })
  document.body.appendChild(overlay)
  setTimeout(() => overlay.remove(), duration + 100)
  return overlay
}

// ========== Helper: create element with styles ==========
function createEl(tag: string, styles: Partial<CSSStyleDeclaration>): HTMLElement {
  const el = document.createElement(tag)
  Object.assign(el.style, styles)
  return el
}

// ========== Individual effect renderers ==========
// All renderers now take viewport-relative click coords (clientX/Y) and the target rect

function renderRipple(clientX: number, clientY: number, rect: DOMRect) {
  const overlay = createOverlay(rect, 700)
  const lx = clientX - rect.left
  const ly = clientY - rect.top
  const ripple = createEl('div', {
    position: 'absolute',
    left: `${lx}px`,
    top: `${ly}px`,
    width: '0',
    height: '0',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  })
  overlay.appendChild(ripple)
  requestAnimationFrame(() => {
    ripple.animate([
      { width: '0px', height: '0px', opacity: '1' },
      { width: '250px', height: '250px', opacity: '0' },
    ], { duration: 600, easing: 'ease-out', fill: 'forwards' })
  })
}

function renderGlow(clientX: number, clientY: number, rect: DOMRect) {
  const overlay = createOverlay(rect, 550)
  const lx = clientX - rect.left
  const ly = clientY - rect.top
  const glow = createEl('div', {
    position: 'absolute',
    left: `${lx}px`,
    top: `${ly}px`,
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.7) 0%, rgba(139,92,246,0.3) 40%, transparent 70%)',
    transform: 'translate(-50%, -50%) scale(0.2)',
    pointerEvents: 'none',
  })
  overlay.appendChild(glow)
  glow.animate([
    { transform: 'translate(-50%, -50%) scale(0.2)', opacity: '0' },
    { transform: 'translate(-50%, -50%) scale(1.2)', opacity: '1' },
    { transform: 'translate(-50%, -50%) scale(1.8)', opacity: '0.4' },
    { transform: 'translate(-50%, -50%) scale(2.5)', opacity: '0' },
  ], { duration: 500, easing: 'ease-out', fill: 'forwards' })
}

function renderParticle(clientX: number, clientY: number, rect: DOMRect) {
  const overlay = createOverlay(rect, 800)
  const lx = clientX - rect.left
  const ly = clientY - rect.top
  const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#a855f7', '#f97316', '#06b6d4', '#ec4899']
  
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.5
    const dist = 40 + Math.random() * 60
    const size = 4 + Math.random() * 5
    const p = createEl('div', {
      position: 'absolute',
      left: `${lx}px`,
      top: `${ly}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: colors[i % colors.length],
      boxShadow: `0 0 6px ${colors[i % colors.length]}`,
      pointerEvents: 'none',
    })
    overlay.appendChild(p)
    const tx = Math.cos(angle) * dist
    const ty = Math.sin(angle) * dist
    p.animate([
      { transform: 'translate(-50%, -50%) scale(1)', opacity: '1' },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: '0' },
    ], { duration: 500 + Math.random() * 250, easing: 'cubic-bezier(0,.9,.3,1)', fill: 'forwards' })
  }
}

function renderShockwave(clientX: number, clientY: number, rect: DOMRect) {
  const overlay = createOverlay(rect, 600)
  const lx = clientX - rect.left
  const ly = clientY - rect.top
  
  for (let i = 0; i < 3; i++) {
    const ring = createEl('div', {
      position: 'absolute',
      left: `${lx}px`,
      top: `${ly}px`,
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.8)',
      boxShadow: '0 0 12px rgba(255,255,255,0.4)',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
    })
    overlay.appendChild(ring)
    setTimeout(() => {
      ring.animate([
        { width: '10px', height: '10px', opacity: '1', borderWidth: '2.5px' },
        { width: '180px', height: '180px', opacity: '0', borderWidth: '0.5px' },
      ], { duration: 450, easing: 'ease-out', fill: 'forwards' })
    }, i * 100)
  }
}

function renderNeon(_clientX: number, _clientY: number, rect: DOMRect) {
  const overlay = createOverlay(rect, 500)
  const flash = createEl('div', {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    borderRadius: '8px',
    pointerEvents: 'none',
    boxShadow: 'inset 0 0 25px rgba(0,255,170,0.6), 0 0 20px rgba(0,255,170,0.4), 0 0 40px rgba(0,255,170,0.2)',
    border: '1.5px solid rgba(0,255,170,0.7)',
  })
  overlay.appendChild(flash)
  flash.animate([
    { opacity: '0' },
    { opacity: '1' },
    { opacity: '0.2' },
    { opacity: '1' },
    { opacity: '0' },
  ], { duration: 450, easing: 'ease-in-out', fill: 'forwards' })
}

function renderSlide(_clientX: number, _clientY: number, rect: DOMRect) {
  const overlay = createOverlay(rect, 550)
  overlay.style.overflow = 'hidden'
  const shine = createEl('div', {
    position: 'absolute',
    top: '0',
    width: '40%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
    pointerEvents: 'none',
    transform: 'skewX(-20deg)',
  })
  overlay.appendChild(shine)
  shine.animate([
    { left: '-60%' },
    { left: '160%' },
  ], { duration: 500, easing: 'ease-in-out', fill: 'forwards' })
}

function renderMorphGlow(_clientX: number, _clientY: number, rect: DOMRect) {
  const overlay = createOverlay(rect, 700)
  
  // Multiple color blobs
  const colors = [
    { color: 'rgba(59,130,246,0.5)', delay: 0 },
    { color: 'rgba(168,85,247,0.5)', delay: 100 },
    { color: 'rgba(236,72,153,0.5)', delay: 200 },
  ]
  
  colors.forEach(({ color, delay }, i) => {
    const blob = createEl('div', {
      position: 'absolute',
      width: '80%',
      height: '100%',
      borderRadius: '50%',
      background: `radial-gradient(ellipse, ${color} 0%, transparent 70%)`,
      pointerEvents: 'none',
      opacity: '0',
    })
    overlay.appendChild(blob)
    setTimeout(() => {
      blob.animate([
        { left: '0%', opacity: '0' },
        { left: `${20 + i * 20}%`, opacity: '1' },
        { left: `${60 + i * 10}%`, opacity: '0' },
      ], { duration: 550, easing: 'ease-in-out', fill: 'forwards' })
    }, delay)
  })
}

function renderElectricArc(_clientX: number, _clientY: number, rect: DOMRect) {
  const overlay = createOverlay(rect, 500)
  const canvas = document.createElement('canvas')
  const w = Math.ceil(rect.width * 2) // 2x for retina
  const h = Math.ceil(rect.height * 2)
  canvas.width = w
  canvas.height = h
  Object.assign(canvas.style, {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    borderRadius: '8px',
  })
  overlay.appendChild(canvas)
  const ctx = canvas.getContext('2d')!
  
  let frame = 0
  const maxFrames = 10
  const interval = setInterval(() => {
    ctx.clearRect(0, 0, w, h)
    ctx.strokeStyle = `rgba(100,200,255,${0.6 + Math.random() * 0.4})`
    ctx.lineWidth = 2 + Math.random() * 2
    ctx.shadowBlur = 12
    ctx.shadowColor = '#38bdf8'
    
    for (let a = 0; a < 4; a++) {
      ctx.beginPath()
      const side = Math.floor(Math.random() * 4)
      let sx: number, sy: number
      switch (side) {
        case 0: sx = Math.random() * w; sy = 0; break
        case 1: sx = w; sy = Math.random() * h; break
        case 2: sx = Math.random() * w; sy = h; break
        default: sx = 0; sy = Math.random() * h; break
      }
      ctx.moveTo(sx, sy)
      let cx = sx, cy = sy
      const steps = 5 + Math.floor(Math.random() * 6)
      for (let i = 0; i < steps; i++) {
        cx += (Math.random() - 0.5) * 50
        cy += (Math.random() - 0.5) * 30
        cx = Math.max(0, Math.min(w, cx))
        cy = Math.max(0, Math.min(h, cy))
        ctx.lineTo(cx, cy)
      }
      ctx.stroke()
    }
    frame++
    if (frame >= maxFrames) {
      clearInterval(interval)
    }
  }, 45)
}

function renderHologram(_clientX: number, _clientY: number, rect: DOMRect) {
  const overlay = createOverlay(rect, 600)
  overlay.style.overflow = 'hidden'
  
  // Scanlines
  const scanlines = createEl('div', {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '100%',
    height: '200%',
    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.08) 2px, rgba(0,255,255,0.08) 4px)',
    pointerEvents: 'none',
  })
  overlay.appendChild(scanlines)
  scanlines.animate([
    { transform: 'translateY(0)' },
    { transform: 'translateY(-50%)' },
  ], { duration: 500, easing: 'linear', fill: 'forwards' })
  
  // Color overlay
  const colorShift = createEl('div', {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(0,255,255,0.2), rgba(255,0,255,0.15), rgba(0,255,0,0.15))',
    pointerEvents: 'none',
    borderRadius: '8px',
  })
  overlay.appendChild(colorShift)
  
  // Glitch flicker
  overlay.animate([
    { opacity: '0' },
    { opacity: '1' },
    { opacity: '0.3' },
    { opacity: '1' },
    { opacity: '0.5' },
    { opacity: '1' },
    { opacity: '0' },
  ], { duration: 550, easing: 'steps(7)', fill: 'forwards' })
}

function renderConfettiBurst(clientX: number, clientY: number, rect: DOMRect) {
  const overlay = createOverlay(rect, 900)
  const lx = clientX - rect.left
  const ly = clientY - rect.top
  const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#06b6d4', '#f97316']
  
  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 * i) / 20 + (Math.random() - 0.5) * 0.4
    const dist = 30 + Math.random() * 70
    const w = 5 + Math.random() * 6
    const h = 2 + Math.random() * 4
    const rot = Math.random() * 360
    const color = colors[i % colors.length]
    const p = createEl('div', {
      position: 'absolute',
      left: `${lx}px`,
      top: `${ly}px`,
      width: `${w}px`,
      height: `${h}px`,
      borderRadius: '1px',
      background: color,
      boxShadow: `0 0 4px ${color}`,
      pointerEvents: 'none',
    })
    overlay.appendChild(p)
    const tx = Math.cos(angle) * dist
    const ty = Math.sin(angle) * dist - 20
    const endRot = rot + (Math.random() - 0.5) * 720
    p.animate([
      { transform: `translate(-50%, -50%) rotate(${rot}deg) scale(1)`, opacity: '1' },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${endRot}deg) scale(0.2)`, opacity: '0' },
    ], { duration: 550 + Math.random() * 300, easing: 'cubic-bezier(0,.8,.3,1)', fill: 'forwards' })
  }
}

function renderSongkran(clientX: number, clientY: number, rect: DOMRect) {
  const overlay = createOverlay(rect, 1200)
  const lx = clientX - rect.left
  const ly = clientY - rect.top
  const emojis = ['💧', '💦', '🌸', '☀️', '🌊', '🪷', '🎉', '🐘']
  
  // Water splash ring — expanding blue ring
  const ring = createEl('div', {
    position: 'absolute',
    left: `${lx}px`,
    top: `${ly}px`,
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: '3px solid rgba(56,189,248,0.8)',
    boxShadow: '0 0 15px rgba(56,189,248,0.5), inset 0 0 8px rgba(56,189,248,0.3)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  })
  overlay.appendChild(ring)
  ring.animate([
    { width: '10px', height: '10px', opacity: '1', borderWidth: '3px' },
    { width: '200px', height: '200px', opacity: '0', borderWidth: '0.5px' },
  ], { duration: 600, easing: 'ease-out', fill: 'forwards' })

  // Water droplets — small blue circles bursting outward
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.6
    const dist = 35 + Math.random() * 55
    const size = 4 + Math.random() * 6
    const blueShade = Math.random() > 0.5 ? 'rgba(56,189,248,0.9)' : 'rgba(14,165,233,0.9)'
    const drop = createEl('div', {
      position: 'absolute',
      left: `${lx}px`,
      top: `${ly}px`,
      width: `${size}px`,
      height: `${size * 1.3}px`,
      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
      background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), ${blueShade})`,
      boxShadow: `0 0 6px ${blueShade}`,
      pointerEvents: 'none',
    })
    overlay.appendChild(drop)
    const tx = Math.cos(angle) * dist
    const ty = Math.sin(angle) * dist + 10 // slight gravity
    drop.animate([
      { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', opacity: '1' },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.3) rotate(${Math.random() * 180}deg)`, opacity: '0' },
    ], { duration: 500 + Math.random() * 300, easing: 'cubic-bezier(0,.8,.3,1)', fill: 'forwards' })
  }

  // Emoji burst — floating emojis
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.5
    const dist = 40 + Math.random() * 50
    const emoji = emojis[i % emojis.length]
    const fontSize = 12 + Math.random() * 10
    const span = createEl('span', {
      position: 'absolute',
      left: `${lx}px`,
      top: `${ly}px`,
      fontSize: `${fontSize}px`,
      lineHeight: '1',
      pointerEvents: 'none',
      filter: 'drop-shadow(0 0 4px rgba(56,189,248,0.5))',
    })
    span.textContent = emoji
    overlay.appendChild(span)
    const tx = Math.cos(angle) * dist
    const ty = Math.sin(angle) * dist - 15 // float up
    const rot = (Math.random() - 0.5) * 60
    span.animate([
      { transform: 'translate(-50%, -50%) scale(0) rotate(0deg)', opacity: '1' },
      { transform: `translate(calc(-50% + ${tx * 0.5}px), calc(-50% + ${ty * 0.5}px)) scale(1.2) rotate(${rot / 2}deg)`, opacity: '1', offset: 0.3 },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.5) rotate(${rot}deg)`, opacity: '0' },
    ], { duration: 700 + Math.random() * 300, easing: 'cubic-bezier(0,.6,.3,1)', fill: 'forwards', delay: Math.random() * 100 })
  }

  // Center splash — bright flash
  const splash = createEl('div', {
    position: 'absolute',
    left: `${lx}px`,
    top: `${ly}px`,
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(56,189,248,0.6) 40%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  })
  overlay.appendChild(splash)
  splash.animate([
    { transform: 'translate(-50%, -50%) scale(0)', opacity: '1' },
    { transform: 'translate(-50%, -50%) scale(2)', opacity: '0.6' },
    { transform: 'translate(-50%, -50%) scale(3)', opacity: '0' },
  ], { duration: 400, easing: 'ease-out', fill: 'forwards' })
}

// ========== Effect registry ==========
const effectRenderers: Record<string, (clientX: number, clientY: number, rect: DOMRect) => void> = {
  ripple: renderRipple,
  glow: renderGlow,
  particle: renderParticle,
  shockwave: renderShockwave,
  neon: renderNeon,
  slide: renderSlide,
  morphGlow: renderMorphGlow,
  electricArc: renderElectricArc,
  hologram: renderHologram,
  confettiBurst: renderConfettiBurst,
  songkran: renderSongkran,
}

// ========== Hook: useMenuClickEffect ==========
export function useMenuClickEffect() {
  const { settings } = useSettings()
  const effectId = settings.menuClickEffect || 'none'

  const triggerEffect = useCallback((e: React.MouseEvent | MouseEvent, targetEl?: HTMLElement) => {
    if (effectId === 'none') return
    const renderer = effectRenderers[effectId]
    if (!renderer) return

    const el = targetEl || (e.currentTarget as HTMLElement)
    if (!el) return

    const rect = el.getBoundingClientRect()
    const x = e.clientX || rect.left + rect.width / 2
    const y = e.clientY || rect.top + rect.height / 2

    // Render on body as fixed overlay — no clipping, survives unmount
    renderer(x, y, rect)
  }, [effectId])

  return { triggerEffect, effectId, isEnabled: effectId !== 'none' }
}

// ========== Component for preview (admin page) ==========
export function MenuClickEffectPreview({ effectId, className }: { effectId: string; className?: string }) {
  const previewRef = useRef<HTMLDivElement>(null)

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (effectId === 'none') return
    const renderer = effectRenderers[effectId]
    if (!renderer) return

    const el = previewRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const x = e.clientX || rect.left + rect.width / 2
    const y = e.clientY || rect.top + rect.height / 2

    renderer(x, y, rect)
  }, [effectId])

  return (
    <div
      ref={previewRef}
      onClick={handleClick}
      className={`relative overflow-visible cursor-pointer ${className || ''}`}
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-700/50 transition-all">
        <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center text-zinc-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1m-6 0h6" />
          </svg>
        </div>
        <span className="text-sm font-medium text-zinc-300">คลิกเพื่อทดสอบเอฟเฟกต์</span>
        <svg className="w-4 h-4 ml-auto text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  )
}
