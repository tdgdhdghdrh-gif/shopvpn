'use client'

import { useSiteAppearance } from './SiteAppearanceProvider'
import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
}

export default function ParticleBackground() {
  const { appearance } = useSiteAppearance()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    if (!appearance?.enableParticles || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let particles: Particle[] = []
    const type = appearance.particleType || 'snow'

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const getColor = () => {
      switch (type) {
        case 'snow': return 'rgba(255, 255, 255, 0.6)'
        case 'stars': return 'rgba(255, 255, 200, 0.8)'
        case 'bubbles': return 'rgba(100, 200, 255, 0.3)'
        case 'leaves': return ['rgba(255, 150, 50, 0.6)', 'rgba(200, 100, 30, 0.6)', 'rgba(180, 80, 20, 0.6)'][Math.floor(Math.random() * 3)]
        case 'rain': return 'rgba(150, 200, 255, 0.4)'
        case 'fireflies': return 'rgba(200, 255, 100, 0.7)'
        default: return 'rgba(255, 255, 255, 0.5)'
      }
    }

    const createParticle = (): Particle => {
      const w = canvas.width
      const h = canvas.height

      if (type === 'snow') {
        return { x: Math.random() * w, y: -10, size: Math.random() * 3 + 1, speedX: Math.random() * 1 - 0.5, speedY: Math.random() * 2 + 1, opacity: Math.random() * 0.5 + 0.3, color: getColor() }
      } else if (type === 'rain') {
        return { x: Math.random() * w, y: -20, size: Math.random() * 1 + 0.5, speedX: 0, speedY: Math.random() * 15 + 10, opacity: Math.random() * 0.3 + 0.1, color: getColor() }
      } else if (type === 'bubbles') {
        return { x: Math.random() * w, y: h + 10, size: Math.random() * 8 + 4, speedX: Math.random() * 1 - 0.5, speedY: -(Math.random() * 1 + 0.5), opacity: Math.random() * 0.3 + 0.1, color: getColor() }
      } else if (type === 'fireflies') {
        return { x: Math.random() * w, y: Math.random() * h, size: Math.random() * 2 + 1, speedX: Math.random() * 0.5 - 0.25, speedY: Math.random() * 0.5 - 0.25, opacity: Math.random() * 0.5 + 0.3, color: getColor() }
      } else {
        return { x: Math.random() * w, y: Math.random() * h, size: Math.random() * 2 + 1, speedX: Math.random() * 0.5 - 0.25, speedY: Math.random() * 0.5 - 0.25, opacity: Math.random() * 0.5 + 0.2, color: getColor() }
      }
    }

    const particleCount = type === 'rain' ? 100 : type === 'snow' ? 80 : 50
    particles = Array.from({ length: particleCount }, createParticle)

    let frame = 0
    const animate = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, i) => {
        p.x += p.speedX
        p.y += p.speedY

        if (type === 'fireflies') {
          p.opacity = 0.3 + Math.sin(frame * 0.05 + i) * 0.3
        }

        if (type === 'snow') {
          if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width }
        } else if (type === 'rain') {
          if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width }
        } else if (type === 'bubbles') {
          if (p.y < -20) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
        } else if (type === 'leaves') {
          if (p.y > canvas.height || p.x > canvas.width || p.x < 0) {
            p.y = -10; p.x = Math.random() * canvas.width
          }
          p.speedX += Math.sin(frame * 0.01 + i) * 0.02
        }

        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color

        if (type === 'rain') {
          ctx.fillRect(p.x, p.y, p.size, p.size * 8)
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      ctx.globalAlpha = 1
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [appearance?.enableParticles, appearance?.particleType])

  if (!appearance?.enableParticles) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
