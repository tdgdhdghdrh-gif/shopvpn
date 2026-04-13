'use client'

import { useEffect } from 'react'
import { useSettings } from './SettingsProvider'

// Import effect renderers registry
const effectRenderers: Record<string, (clientX: number, clientY: number) => void> = {}

// ========== Helper ==========
function createOverlayAt(x: number, y: number, size: number, duration: number): HTMLDivElement {
  const overlay = document.createElement('div')
  Object.assign(overlay.style, {
    position: 'fixed',
    left: `${x - size / 2}px`,
    top: `${y - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    pointerEvents: 'none',
    zIndex: '99999',
    overflow: 'visible',
    borderRadius: '50%',
  })
  document.body.appendChild(overlay)
  setTimeout(() => overlay.remove(), duration + 100)
  return overlay
}

function createEl(tag: string, styles: Partial<CSSStyleDeclaration>): HTMLElement {
  const el = document.createElement(tag)
  Object.assign(el.style, styles)
  return el
}

// ========== Effects (centered on click point) ==========

effectRenderers.ripple = (x, y) => {
  const overlay = createOverlayAt(x, y, 250, 700)
  const ripple = createEl('div', {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: '0',
    height: '0',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 70%)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  })
  overlay.appendChild(ripple)
  ripple.animate([
    { width: '0px', height: '0px', opacity: '1' },
    { width: '250px', height: '250px', opacity: '0' },
  ], { duration: 600, easing: 'ease-out', fill: 'forwards' })
}

effectRenderers.glow = (x, y) => {
  const overlay = createOverlayAt(x, y, 200, 550)
  const glow = createEl('div', {
    position: 'absolute',
    left: '50%',
    top: '50%',
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
    { transform: 'translate(-50%, -50%) scale(2)', opacity: '0.4' },
    { transform: 'translate(-50%, -50%) scale(2.8)', opacity: '0' },
  ], { duration: 500, easing: 'ease-out', fill: 'forwards' })
}

effectRenderers.particle = (x, y) => {
  const overlay = createOverlayAt(x, y, 200, 800)
  const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#a855f7', '#f97316', '#06b6d4', '#ec4899']
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.5
    const dist = 40 + Math.random() * 60
    const size = 4 + Math.random() * 5
    const color = colors[i % colors.length]
    const p = createEl('div', {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: color,
      boxShadow: `0 0 6px ${color}`,
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

effectRenderers.shockwave = (x, y) => {
  const overlay = createOverlayAt(x, y, 250, 600)
  for (let i = 0; i < 3; i++) {
    const ring = createEl('div', {
      position: 'absolute',
      left: '50%',
      top: '50%',
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
        { width: '200px', height: '200px', opacity: '0', borderWidth: '0.5px' },
      ], { duration: 450, easing: 'ease-out', fill: 'forwards' })
    }, i * 100)
  }
}

effectRenderers.neon = (x, y) => {
  const overlay = createOverlayAt(x, y, 120, 500)
  overlay.style.borderRadius = '50%'
  const flash = createEl('div', {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    pointerEvents: 'none',
    boxShadow: '0 0 30px rgba(0,255,170,0.6), 0 0 60px rgba(0,255,170,0.3), inset 0 0 20px rgba(0,255,170,0.3)',
    border: '1.5px solid rgba(0,255,170,0.7)',
  })
  overlay.appendChild(flash)
  flash.animate([
    { opacity: '0', transform: 'scale(0.5)' },
    { opacity: '1', transform: 'scale(1)' },
    { opacity: '0.2', transform: 'scale(1.1)' },
    { opacity: '0.8', transform: 'scale(1.2)' },
    { opacity: '0', transform: 'scale(1.5)' },
  ], { duration: 450, easing: 'ease-in-out', fill: 'forwards' })
}

effectRenderers.slide = (x, y) => {
  const overlay = createOverlayAt(x, y, 180, 550)
  overlay.style.overflow = 'hidden'
  overlay.style.borderRadius = '50%'
  const shine = createEl('div', {
    position: 'absolute',
    top: '0',
    width: '40%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    pointerEvents: 'none',
    transform: 'skewX(-20deg)',
  })
  overlay.appendChild(shine)
  shine.animate([
    { left: '-60%', opacity: '1' },
    { left: '160%', opacity: '0.5' },
  ], { duration: 500, easing: 'ease-in-out', fill: 'forwards' })
  // Also add a scale pulse
  overlay.animate([
    { transform: 'scale(0.3)', opacity: '0' },
    { transform: 'scale(1)', opacity: '1' },
    { transform: 'scale(1.2)', opacity: '0' },
  ], { duration: 500, easing: 'ease-out', fill: 'forwards' })
}

effectRenderers.morphGlow = (x, y) => {
  const overlay = createOverlayAt(x, y, 200, 700)
  const colors = [
    { color: 'rgba(59,130,246,0.5)', delay: 0 },
    { color: 'rgba(168,85,247,0.5)', delay: 80 },
    { color: 'rgba(236,72,153,0.5)', delay: 160 },
  ]
  colors.forEach(({ color, delay }) => {
    const blob = createEl('div', {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      transform: 'translate(-50%, -50%) scale(0.3)',
      pointerEvents: 'none',
    })
    overlay.appendChild(blob)
    setTimeout(() => {
      blob.animate([
        { transform: 'translate(-50%, -50%) scale(0.3)', opacity: '0' },
        { transform: 'translate(-50%, -50%) scale(1.5)', opacity: '1' },
        { transform: 'translate(-50%, -50%) scale(2)', opacity: '0' },
      ], { duration: 550, easing: 'ease-out', fill: 'forwards' })
    }, delay)
  })
}

effectRenderers.electricArc = (x, y) => {
  const size = 200
  const overlay = createOverlayAt(x, y, size, 500)
  const canvas = document.createElement('canvas')
  const scale = 2
  canvas.width = size * scale
  canvas.height = size * scale
  Object.assign(canvas.style, {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  })
  overlay.appendChild(canvas)
  const ctx = canvas.getContext('2d')!
  const w = canvas.width, h = canvas.height
  const cx = w / 2, cy = h / 2

  let frame = 0
  const maxFrames = 10
  const interval = setInterval(() => {
    ctx.clearRect(0, 0, w, h)
    ctx.strokeStyle = `rgba(100,200,255,${0.6 + Math.random() * 0.4})`
    ctx.lineWidth = 2 + Math.random() * 2
    ctx.shadowBlur = 12
    ctx.shadowColor = '#38bdf8'
    for (let a = 0; a < 5; a++) {
      ctx.beginPath()
      const angle = Math.random() * Math.PI * 2
      const endAngle = angle + (Math.random() - 0.5) * 2
      let px = cx, py = cy
      ctx.moveTo(px, py)
      const steps = 4 + Math.floor(Math.random() * 5)
      for (let i = 0; i < steps; i++) {
        const r = (i + 1) / steps * (w / 2)
        const a2 = angle + (endAngle - angle) * ((i + 1) / steps)
        px = cx + Math.cos(a2) * r + (Math.random() - 0.5) * 20
        py = cy + Math.sin(a2) * r + (Math.random() - 0.5) * 20
        ctx.lineTo(px, py)
      }
      ctx.stroke()
    }
    frame++
    if (frame >= maxFrames) clearInterval(interval)
  }, 45)
  overlay.animate([
    { opacity: '1' },
    { opacity: '0' },
  ], { duration: 500, easing: 'ease-in', fill: 'forwards' })
}

effectRenderers.hologram = (x, y) => {
  const overlay = createOverlayAt(x, y, 160, 600)
  overlay.style.overflow = 'hidden'
  overlay.style.borderRadius = '8px'
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
  const colorShift = createEl('div', {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(0,255,255,0.25), rgba(255,0,255,0.2), rgba(0,255,0,0.15))',
    pointerEvents: 'none',
    borderRadius: '8px',
  })
  overlay.appendChild(colorShift)
  overlay.animate([
    { opacity: '0', transform: 'scale(0.6)' },
    { opacity: '1', transform: 'scale(1)' },
    { opacity: '0.3', transform: 'scale(1.05)' },
    { opacity: '1', transform: 'scale(1.1)' },
    { opacity: '0', transform: 'scale(1.3)' },
  ], { duration: 550, easing: 'steps(5)', fill: 'forwards' })
}

effectRenderers.confettiBurst = (x, y) => {
  const overlay = createOverlayAt(x, y, 200, 900)
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
      left: '50%',
      top: '50%',
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

effectRenderers.songkran = (x, y) => {
  const overlay = createOverlayAt(x, y, 250, 1200)
  const emojis = ['💧', '💦', '🌸', '☀️', '🌊', '🪷', '🎉', '🐘']

  // Water splash ring
  const ring = createEl('div', {
    position: 'absolute',
    left: '50%',
    top: '50%',
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
    { width: '220px', height: '220px', opacity: '0', borderWidth: '0.5px' },
  ], { duration: 600, easing: 'ease-out', fill: 'forwards' })

  // Water droplets
  for (let i = 0; i < 14; i++) {
    const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.6
    const dist = 40 + Math.random() * 65
    const size = 4 + Math.random() * 7
    const blueShade = Math.random() > 0.5 ? 'rgba(56,189,248,0.9)' : 'rgba(14,165,233,0.9)'
    const drop = createEl('div', {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: `${size}px`,
      height: `${size * 1.3}px`,
      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
      background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), ${blueShade})`,
      boxShadow: `0 0 6px ${blueShade}`,
      pointerEvents: 'none',
    })
    overlay.appendChild(drop)
    const tx = Math.cos(angle) * dist
    const ty = Math.sin(angle) * dist + 12
    drop.animate([
      { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', opacity: '1' },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.3) rotate(${Math.random() * 180}deg)`, opacity: '0' },
    ], { duration: 500 + Math.random() * 300, easing: 'cubic-bezier(0,.8,.3,1)', fill: 'forwards' })
  }

  // Emoji burst
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.5
    const dist = 45 + Math.random() * 55
    const emoji = emojis[i % emojis.length]
    const fontSize = 14 + Math.random() * 12
    const span = createEl('span', {
      position: 'absolute',
      left: '50%',
      top: '50%',
      fontSize: `${fontSize}px`,
      lineHeight: '1',
      pointerEvents: 'none',
      filter: 'drop-shadow(0 0 4px rgba(56,189,248,0.5))',
    })
    span.textContent = emoji
    overlay.appendChild(span)
    const tx = Math.cos(angle) * dist
    const ty = Math.sin(angle) * dist - 18
    const rot = (Math.random() - 0.5) * 60
    span.animate([
      { transform: 'translate(-50%, -50%) scale(0) rotate(0deg)', opacity: '1' },
      { transform: `translate(calc(-50% + ${tx * 0.5}px), calc(-50% + ${ty * 0.5}px)) scale(1.3) rotate(${rot / 2}deg)`, opacity: '1', offset: 0.3 },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.5) rotate(${rot}deg)`, opacity: '0' },
    ], { duration: 700 + Math.random() * 300, easing: 'cubic-bezier(0,.6,.3,1)', fill: 'forwards', delay: Math.random() * 100 })
  }

  // Center splash flash
  const splash = createEl('div', {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(56,189,248,0.6) 40%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  })
  overlay.appendChild(splash)
  splash.animate([
    { transform: 'translate(-50%, -50%) scale(0)', opacity: '1' },
    { transform: 'translate(-50%, -50%) scale(2.5)', opacity: '0.6' },
    { transform: 'translate(-50%, -50%) scale(4)', opacity: '0' },
  ], { duration: 400, easing: 'ease-out', fill: 'forwards' })
}

effectRenderers.animePower = (x, y) => {
  const overlay = createOverlayAt(x, y, 300, 1400)

  // 1) Impact flash — white/yellow core
  const flash = createEl('div', {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #fff 0%, rgba(255,220,50,0.9) 30%, rgba(255,100,50,0.6) 60%, transparent 80%)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: '10',
  })
  overlay.appendChild(flash)
  flash.animate([
    { transform: 'translate(-50%, -50%) scale(0)', opacity: '1' },
    { transform: 'translate(-50%, -50%) scale(5)', opacity: '1', offset: 0.15 },
    { transform: 'translate(-50%, -50%) scale(8)', opacity: '0' },
  ], { duration: 350, easing: 'ease-out', fill: 'forwards' })

  // 2) Cross slash — X-shaped energy
  const slashColors = ['rgba(255,50,50,0.9)', 'rgba(50,150,255,0.9)']
  for (let s = 0; s < 2; s++) {
    const slash = createEl('div', {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: '4px',
      height: '0px',
      background: `linear-gradient(to bottom, transparent, ${slashColors[s]}, #fff, ${slashColors[s]}, transparent)`,
      boxShadow: `0 0 12px ${slashColors[s]}, 0 0 24px ${slashColors[s]}`,
      transform: `translate(-50%, -50%) rotate(${s === 0 ? 45 : -45}deg)`,
      pointerEvents: 'none',
      zIndex: '8',
    })
    overlay.appendChild(slash)
    slash.animate([
      { height: '0px', opacity: '1', width: '4px' },
      { height: '240px', opacity: '1', width: '3px', offset: 0.3 },
      { height: '300px', opacity: '0', width: '1px' },
    ], { duration: 450, easing: 'cubic-bezier(0,.8,.2,1)', fill: 'forwards', delay: 50 + s * 60 })
  }

  // 3) Speed lines — radiating outward
  for (let i = 0; i < 24; i++) {
    const angle = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.3
    const lineLen = 35 + Math.random() * 60
    const dist = 25 + Math.random() * 20
    const line = createEl('div', {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: `${lineLen}px`,
      height: `${1.5 + Math.random() * 1.5}px`,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,200,50,0.6), transparent)',
      transform: `translate(-50%, -50%) rotate(${(angle * 180) / Math.PI}deg) translateX(${dist}px)`,
      pointerEvents: 'none',
      borderRadius: '1px',
    })
    overlay.appendChild(line)
    const endDist = dist + 50 + Math.random() * 40
    line.animate([
      { transform: `translate(-50%, -50%) rotate(${(angle * 180) / Math.PI}deg) translateX(${dist}px) scaleX(0)`, opacity: '1' },
      { transform: `translate(-50%, -50%) rotate(${(angle * 180) / Math.PI}deg) translateX(${dist + 12}px) scaleX(1)`, opacity: '1', offset: 0.2 },
      { transform: `translate(-50%, -50%) rotate(${(angle * 180) / Math.PI}deg) translateX(${endDist}px) scaleX(0.3)`, opacity: '0' },
    ], { duration: 350 + Math.random() * 150, easing: 'ease-out', fill: 'forwards', delay: Math.random() * 80 })
  }

  // 4) Aura rings
  const ringColors = ['rgba(255,80,80,0.7)', 'rgba(80,140,255,0.6)', 'rgba(255,200,50,0.5)']
  for (let i = 0; i < 3; i++) {
    const ring = createEl('div', {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      border: `2.5px solid ${ringColors[i]}`,
      boxShadow: `0 0 10px ${ringColors[i]}, inset 0 0 5px ${ringColors[i]}`,
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
    })
    overlay.appendChild(ring)
    setTimeout(() => {
      ring.animate([
        { width: '10px', height: '10px', opacity: '1', borderWidth: '2.5px' },
        { width: '180px', height: '180px', opacity: '0.4', borderWidth: '1.5px', offset: 0.5 },
        { width: '260px', height: '260px', opacity: '0', borderWidth: '0.5px' },
      ], { duration: 500, easing: 'ease-out', fill: 'forwards' })
    }, i * 120)
  }

  // 5) Energy sparks
  const sparkColors = ['#ff4444', '#ffcc00', '#44aaff', '#ff66aa', '#ffffff']
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.5
    const dist = 55 + Math.random() * 70
    const size = 3 + Math.random() * 5
    const color = sparkColors[i % sparkColors.length]
    const spark = createEl('div', {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: color,
      boxShadow: `0 0 8px ${color}, 0 0 16px ${color}`,
      pointerEvents: 'none',
    })
    overlay.appendChild(spark)
    const tx = Math.cos(angle) * dist
    const ty = Math.sin(angle) * dist
    spark.animate([
      { transform: 'translate(-50%, -50%) scale(0)', opacity: '1' },
      { transform: `translate(calc(-50% + ${tx * 0.4}px), calc(-50% + ${ty * 0.4}px)) scale(1.5)`, opacity: '1', offset: 0.25 },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: '0' },
    ], { duration: 600 + Math.random() * 200, easing: 'cubic-bezier(0,.7,.3,1)', fill: 'forwards', delay: 30 + Math.random() * 100 })
  }

  // 6) Kanji flash
  const kanjis = ['斬', '轟', '爆', '閃', '烈', '覇', '滅', '雷']
  const kanji = createEl('span', {
    position: 'absolute',
    left: '50%',
    top: '50%',
    fontSize: '32px',
    fontWeight: '900',
    color: '#fff',
    textShadow: '0 0 10px rgba(255,80,80,0.8), 0 0 20px rgba(255,50,50,0.5), 0 0 40px rgba(255,0,0,0.3)',
    pointerEvents: 'none',
    fontFamily: 'serif',
    zIndex: '12',
    lineHeight: '1',
  })
  kanji.textContent = kanjis[Math.floor(Math.random() * kanjis.length)]
  overlay.appendChild(kanji)
  kanji.animate([
    { transform: 'translate(-50%, -50%) scale(0) rotate(-10deg)', opacity: '0' },
    { transform: 'translate(-50%, -50%) scale(2) rotate(0deg)', opacity: '1', offset: 0.15 },
    { transform: 'translate(-50%, -80%) scale(1.4) rotate(2deg)', opacity: '1', offset: 0.5 },
    { transform: 'translate(-50%, -120%) scale(0.8) rotate(5deg)', opacity: '0' },
  ], { duration: 800, easing: 'cubic-bezier(0,.6,.3,1)', fill: 'forwards', delay: 80 })
}

// ========== Main Component ==========
export default function GlobalClickEffect() {
  const { settings } = useSettings()
  const effectId = settings.menuClickEffect || 'none'

  useEffect(() => {
    if (effectId === 'none') return
    const renderer = effectRenderers[effectId]
    if (!renderer) return

    // Throttle to prevent spam
    let lastTime = 0
    const THROTTLE_MS = 100

    function handleClick(e: MouseEvent) {
      const now = Date.now()
      if (now - lastTime < THROTTLE_MS) return
      lastTime = now

      // Don't trigger on inputs, textareas, selects, or admin pages
      const target = e.target as HTMLElement
      const tag = target.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return
      // Don't trigger if user is selecting text
      if (window.getSelection()?.toString()) return

      renderer(e.clientX, e.clientY)
    }

    document.addEventListener('click', handleClick, { passive: true })
    return () => document.removeEventListener('click', handleClick)
  }, [effectId])

  return null // This component has no visual output — effects are rendered via DOM
}
