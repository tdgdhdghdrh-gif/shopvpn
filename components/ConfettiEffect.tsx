'use client'

import { useEffect, useRef, useCallback } from 'react'

interface ConfettiPiece {
  x: number
  y: number
  color: string
  size: number
  speedX: number
  speedY: number
  rotation: number
  rotationSpeed: number
  opacity: number
}

export function triggerConfetti() {
  window.dispatchEvent(new CustomEvent('trigger-confetti'))
}

export default function ConfettiEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const piecesRef = useRef<ConfettiPiece[]>([])

  const fire = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4']
    const newPieces: ConfettiPiece[] = []

    for (let i = 0; i < 100; i++) {
      newPieces.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height - 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        speedX: (Math.random() - 0.5) * 15,
        speedY: -(Math.random() * 15 + 10),
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      })
    }

    piecesRef.current = [...piecesRef.current, ...newPieces]
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const handleTrigger = () => fire()
    window.addEventListener('trigger-confetti', handleTrigger)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      piecesRef.current = piecesRef.current.filter(p => {
        p.x += p.speedX
        p.y += p.speedY
        p.speedY += 0.3 // gravity
        p.rotation += p.rotationSpeed
        p.opacity -= 0.008

        if (p.opacity <= 0) return false

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        ctx.restore()

        return true
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('trigger-confetti', handleTrigger)
      cancelAnimationFrame(animationRef.current)
    }
  }, [fire])

  return <canvas ref={canvasRef} className="fixed inset-0 z-[100] pointer-events-none" />
}
