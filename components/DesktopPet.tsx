'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface PetSettings {
  enabled: boolean
  imageUrl: string | null
  size: number
  speed: number
  gravity: number
  jumpPower: number
}

export default function DesktopPet() {
  const [settings, setSettings] = useState<PetSettings | null>(null)
  const [mounted, setMounted] = useState(false)
  const petRef = useRef<HTMLImageElement>(null)
  const stateRef = useRef({
    x: 100,
    y: 300,
    vx: 2,
    vy: 0,
    dragging: false,
    offsetX: 0,
    offsetY: 0,
  })

  useEffect(() => {
    setMounted(true)
    fetch('/api/settings/public')
      .then(r => r.json())
      .then(data => {
        if (data.settings) {
          setSettings({
            enabled: data.settings.desktopPetEnabled ?? false,
            imageUrl: data.settings.desktopPetImageUrl || null,
            size: data.settings.desktopPetSize ?? 60,
            speed: data.settings.desktopPetSpeed ?? 2,
            gravity: data.settings.desktopPetGravity ?? 0.4,
            jumpPower: data.settings.desktopPetJumpPower ?? 10,
          })
        }
      })
      .catch(() => {})
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const state = stateRef.current
    state.dragging = true
    state.offsetX = e.clientX - state.x
    state.offsetY = e.clientY - state.y
    state.vx = 0
    state.vy = 0
  }, [])

  const handleMouseUp = useCallback(() => {
    const state = stateRef.current
    if (state.dragging) {
      state.dragging = false
      if (settings) {
        state.vx = settings.speed * (Math.random() < 0.5 ? -1 : 1)
      }
    }
  }, [settings])

  const handleClick = useCallback(() => {
    const state = stateRef.current
    if (!state.dragging && settings) {
      state.vy = -settings.jumpPower * 1.5
    }
  }, [settings])

  useEffect(() => {
    if (!settings?.enabled || !mounted || !settings.imageUrl) return

    const state = stateRef.current
    state.vx = settings.speed * (Math.random() < 0.5 ? -1 : 1)
    let animId: number

    const handleMouseMove = (e: MouseEvent) => {
      if (state.dragging) {
        state.x = e.clientX - state.offsetX
        state.y = e.clientY - state.offsetY
      }
    }

    const handleResize = () => {
      // Keep pet on screen after resize
      state.x = Math.min(state.x, window.innerWidth - settings.size)
      state.y = Math.min(state.y, window.innerHeight - settings.size)
    }

    const move = () => {
      const pet = petRef.current
      if (!pet) { animId = requestAnimationFrame(move); return }
      const s = settings

      if (!state.dragging) {
        state.x += state.vx

        // Wall bounce + jump
        if (state.x <= 0) {
          state.x = 0
          state.vx = Math.abs(s.speed)
          state.vy = -s.jumpPower * 0.8
        }
        if (state.x >= window.innerWidth - s.size) {
          state.x = window.innerWidth - s.size
          state.vx = -Math.abs(s.speed)
          state.vy = -s.jumpPower * 0.8
        }

        // Gravity
        state.y += state.vy
        state.vy += s.gravity

        // Floor
        if (state.y >= window.innerHeight - s.size) {
          state.y = window.innerHeight - s.size
          state.vy = 0

          // Random sleep (stop for 2s)
          if (Math.random() < 0.005) {
            const prevVx = state.vx
            state.vx = 0
            setTimeout(() => { state.vx = prevVx || s.speed * (Math.random() < 0.5 ? -1 : 1) }, 2000)
          }

          // Random jump
          if (Math.random() < 0.015) {
            state.vy = -s.jumpPower
          }
        }

        // Random fly
        if (Math.random() < 0.002) {
          state.vy = -s.jumpPower * 1.2
        }
      }

      pet.style.left = `${state.x}px`
      pet.style.top = `${state.y}px`

      animId = requestAnimationFrame(move)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('resize', handleResize)
    animId = requestAnimationFrame(move)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animId)
    }
  }, [settings, mounted, handleMouseUp])

  if (!settings?.enabled || !mounted || !settings.imageUrl) return null

  return (
    <img
      ref={petRef}
      src={settings.imageUrl}
      alt="desktop pet"
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      draggable={false}
      style={{
        position: 'fixed',
        width: settings.size,
        height: 'auto',
        left: 100,
        top: 300,
        cursor: 'grab',
        userSelect: 'none',
        zIndex: 9999,
        pointerEvents: 'auto',
      }}
      className="desktop-pet"
    />
  )
}
