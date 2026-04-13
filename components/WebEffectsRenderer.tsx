'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  rotation: number
  rotationSpeed: number
  life: number
  maxLife: number
  color: string
  // extra props for specific effects
  wobble?: number
  wobbleSpeed?: number
  trail?: { x: number; y: number }[]
  char?: string
  swing?: number
  swingSpeed?: number
  phase?: number
  amplitude?: number
  gravity?: number
  targetX?: number
  targetY?: number
  pulseSpeed?: number
}

type EffectType = 'none' | 'snow' | 'rain' | 'fireflies' | 'sakura' | 'bubbles' | 'matrix' | 'stars' | 'hearts' | 'confetti'
  | 'aurora' | 'lightning' | 'smoke' | 'embers' | 'leaves' | 'diamonds' | 'neon' | 'galaxy' | 'thunder' | 'goldDust'
  | 'jellyfish' | 'meteor' | 'dna' | 'pixel' | 'plasma' | 'lanterns' | 'dandelion' | 'glitch' | 'comet' | 'ripple'
  | 'crystals' | 'zodiac' | 'roses' | 'sparkle' | 'geometric' | 'feathers' | 'musicNotes' | 'butterflies' | 'fog' | 'fireworks'
  | 'songkran'

interface Props {
  effect: EffectType
}

const PARTICLE_COUNTS: Record<EffectType, number> = {
  none: 0,
  snow: 80,
  rain: 120,
  fireflies: 40,
  sakura: 35,
  bubbles: 30,
  matrix: 60,
  stars: 50,
  hearts: 25,
  confetti: 60,
  aurora: 8,
  lightning: 5,
  smoke: 20,
  embers: 45,
  leaves: 30,
  diamonds: 25,
  neon: 30,
  galaxy: 60,
  thunder: 100,
  goldDust: 50,
  jellyfish: 8,
  meteor: 12,
  dna: 40,
  pixel: 50,
  plasma: 15,
  lanterns: 12,
  dandelion: 35,
  glitch: 20,
  comet: 8,
  ripple: 10,
  crystals: 30,
  zodiac: 20,
  roses: 25,
  sparkle: 40,
  geometric: 20,
  feathers: 20,
  musicNotes: 18,
  butterflies: 15,
  fog: 12,
  fireworks: 15,
  songkran: 50,
}

export default function WebEffectsRenderer({ effect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)
  const effectRef = useRef<EffectType>(effect)

  useEffect(() => {
    effectRef.current = effect
  }, [effect])

  const createParticle = useCallback((w: number, h: number, fromTop = true): Particle => {
    const eff = effectRef.current

    switch (eff) {
      case 'snow': {
        return {
          x: Math.random() * w,
          y: fromTop ? -10 : Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: 0.5 + Math.random() * 1.5,
          size: 2 + Math.random() * 4,
          opacity: 0.3 + Math.random() * 0.7,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 9999,
          color: '#ffffff',
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.02 + Math.random() * 0.03,
        }
      }

      case 'rain': {
        return {
          x: Math.random() * w,
          y: fromTop ? -20 : Math.random() * h,
          vx: -1 + Math.random() * 0.5,
          vy: 8 + Math.random() * 12,
          size: 1 + Math.random() * 1.5,
          opacity: 0.2 + Math.random() * 0.4,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 9999,
          color: '#88ccff',
        }
      }

      case 'fireflies': {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: 2 + Math.random() * 3,
          opacity: 0,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 200 + Math.random() * 300,
          color: ['#ffff00', '#ffd700', '#00ff88', '#88ffcc'][Math.floor(Math.random() * 4)],
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.01 + Math.random() * 0.02,
        }
      }

      case 'sakura': {
        return {
          x: Math.random() * w,
          y: fromTop ? -15 : Math.random() * h,
          vx: 0.5 + Math.random() * 1,
          vy: 0.8 + Math.random() * 1.5,
          size: 6 + Math.random() * 8,
          opacity: 0.4 + Math.random() * 0.6,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 3,
          life: 0, maxLife: 9999,
          color: ['#ffb7c5', '#ff92a5', '#ffc0cb', '#ffaec0', '#f8a4b8'][Math.floor(Math.random() * 5)],
          swing: Math.random() * Math.PI * 2,
          swingSpeed: 0.02 + Math.random() * 0.03,
        }
      }

      case 'bubbles': {
        return {
          x: Math.random() * w,
          y: h + 10 + Math.random() * 50,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -(0.5 + Math.random() * 1.5),
          size: 4 + Math.random() * 12,
          opacity: 0.15 + Math.random() * 0.3,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 9999,
          color: '#88ddff',
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.015 + Math.random() * 0.02,
        }
      }

      case 'matrix': {
        const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF'
        return {
          x: Math.floor(Math.random() * (w / 14)) * 14,
          y: fromTop ? -14 : Math.random() * h,
          vx: 0,
          vy: 2 + Math.random() * 4,
          size: 12,
          opacity: 0.3 + Math.random() * 0.7,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 9999,
          color: '#00ff41',
          char: chars[Math.floor(Math.random() * chars.length)],
        }
      }

      case 'stars': {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: 0, vy: 0,
          size: 1 + Math.random() * 2,
          opacity: 0,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 100 + Math.random() * 200,
          color: ['#ffffff', '#ffffcc', '#ccddff', '#ffddcc'][Math.floor(Math.random() * 4)],
        }
      }

      case 'hearts': {
        return {
          x: Math.random() * w,
          y: h + 10,
          vx: (Math.random() - 0.5) * 1,
          vy: -(1 + Math.random() * 2),
          size: 8 + Math.random() * 12,
          opacity: 0.3 + Math.random() * 0.5,
          rotation: (Math.random() - 0.5) * 30,
          rotationSpeed: (Math.random() - 0.5) * 2,
          life: 0, maxLife: 9999,
          color: ['#ff4466', '#ff6688', '#ff3355', '#ee2244', '#ff5577'][Math.floor(Math.random() * 5)],
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.02 + Math.random() * 0.03,
        }
      }

      case 'confetti': {
        return {
          x: Math.random() * w,
          y: fromTop ? -10 : Math.random() * h,
          vx: (Math.random() - 0.5) * 2,
          vy: 1 + Math.random() * 3,
          size: 4 + Math.random() * 6,
          opacity: 0.6 + Math.random() * 0.4,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          life: 0, maxLife: 9999,
          color: ['#ff3366', '#33ccff', '#ffcc00', '#66ff66', '#ff66ff', '#ff9933', '#66ccff'][Math.floor(Math.random() * 7)],
        }
      }

      // ======== 30 NEW EFFECTS ========

      case 'aurora': {
        return {
          x: Math.random() * w,
          y: Math.random() * h * 0.4,
          vx: (Math.random() - 0.5) * 0.3,
          vy: 0,
          size: 80 + Math.random() * 150,
          opacity: 0,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 300 + Math.random() * 400,
          color: ['#00ff88', '#00ddff', '#8844ff', '#ff44aa', '#44ffaa'][Math.floor(Math.random() * 5)],
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.005 + Math.random() * 0.01,
          phase: Math.random() * Math.PI * 2,
        }
      }

      case 'lightning': {
        return {
          x: Math.random() * w,
          y: 0,
          vx: 0, vy: 0,
          size: 2 + Math.random() * 3,
          opacity: 0,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 15 + Math.random() * 20,
          color: ['#ffffff', '#ccddff', '#aaccff'][Math.floor(Math.random() * 3)],
          phase: Math.random() * 100,
          targetY: h * (0.3 + Math.random() * 0.5),
        }
      }

      case 'smoke': {
        return {
          x: Math.random() * w,
          y: h + 20,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -(0.3 + Math.random() * 0.8),
          size: 20 + Math.random() * 40,
          opacity: 0.05 + Math.random() * 0.1,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 0.5,
          life: 0, maxLife: 9999,
          color: ['#888888', '#999999', '#777777', '#aaaaaa'][Math.floor(Math.random() * 4)],
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.01 + Math.random() * 0.01,
        }
      }

      case 'embers': {
        return {
          x: Math.random() * w,
          y: h + 10,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -(1 + Math.random() * 2.5),
          size: 1 + Math.random() * 3,
          opacity: 0.5 + Math.random() * 0.5,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 200 + Math.random() * 200,
          color: ['#ff4400', '#ff6600', '#ff8800', '#ffaa00', '#ffcc00'][Math.floor(Math.random() * 5)],
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.02 + Math.random() * 0.03,
        }
      }

      case 'leaves': {
        return {
          x: Math.random() * w,
          y: fromTop ? -20 : Math.random() * h,
          vx: 0.5 + Math.random() * 1.5,
          vy: 0.5 + Math.random() * 1.5,
          size: 8 + Math.random() * 10,
          opacity: 0.4 + Math.random() * 0.5,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 4,
          life: 0, maxLife: 9999,
          color: ['#cc5500', '#dd7700', '#aa3300', '#ee8800', '#996600', '#bb4400'][Math.floor(Math.random() * 6)],
          swing: Math.random() * Math.PI * 2,
          swingSpeed: 0.015 + Math.random() * 0.025,
        }
      }

      case 'diamonds': {
        return {
          x: Math.random() * w,
          y: fromTop ? -10 : Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: 0.5 + Math.random() * 1,
          size: 4 + Math.random() * 8,
          opacity: 0.3 + Math.random() * 0.5,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 3,
          life: 0, maxLife: 9999,
          color: ['#88ddff', '#aaeeff', '#ffffff', '#ddeeff', '#66ccff'][Math.floor(Math.random() * 5)],
          pulseSpeed: 0.03 + Math.random() * 0.04,
          wobble: Math.random() * Math.PI * 2,
        }
      }

      case 'neon': {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: 2 + Math.random() * 4,
          opacity: 0,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 150 + Math.random() * 200,
          color: ['#ff00ff', '#00ffff', '#ff0088', '#00ff44', '#ffff00', '#8800ff'][Math.floor(Math.random() * 6)],
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.02 + Math.random() * 0.03,
          trail: [],
        }
      }

      case 'galaxy': {
        const angle = Math.random() * Math.PI * 2
        const dist = Math.random() * Math.min(w, h) * 0.4
        const cx = w / 2, cy = h / 2
        return {
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: 0, vy: 0,
          size: 0.5 + Math.random() * 2,
          opacity: 0.2 + Math.random() * 0.6,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 9999,
          color: ['#8888ff', '#ff88ff', '#88ffff', '#ffffff', '#ffaaff', '#aaaaff'][Math.floor(Math.random() * 6)],
          phase: angle,
          amplitude: dist,
          wobble: 0,
          wobbleSpeed: 0.002 + Math.random() * 0.003,
        }
      }

      case 'thunder': {
        return {
          x: Math.random() * w,
          y: fromTop ? -20 : Math.random() * h,
          vx: -1.5 + Math.random() * 0.5,
          vy: 10 + Math.random() * 15,
          size: 1 + Math.random() * 1.5,
          opacity: 0.2 + Math.random() * 0.4,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 9999,
          color: '#88aadd',
          phase: Math.random() * 1000,
        }
      }

      case 'goldDust': {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -(0.1 + Math.random() * 0.3),
          size: 1 + Math.random() * 2.5,
          opacity: 0,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 150 + Math.random() * 250,
          color: ['#ffd700', '#ffcc00', '#ffaa00', '#ffe066', '#ffdd33'][Math.floor(Math.random() * 5)],
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.02 + Math.random() * 0.03,
          pulseSpeed: 0.05 + Math.random() * 0.05,
        }
      }

      case 'jellyfish': {
        return {
          x: Math.random() * w,
          y: h + 30 + Math.random() * 50,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -(0.3 + Math.random() * 0.5),
          size: 15 + Math.random() * 25,
          opacity: 0.15 + Math.random() * 0.25,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 9999,
          color: ['#ff66cc', '#66aaff', '#aa66ff', '#66ffcc', '#ffaa66'][Math.floor(Math.random() * 5)],
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.015 + Math.random() * 0.015,
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.03 + Math.random() * 0.02,
        }
      }

      case 'meteor': {
        const startX = Math.random() * w * 1.5
        return {
          x: startX,
          y: -10 - Math.random() * 100,
          vx: -(3 + Math.random() * 5),
          vy: 4 + Math.random() * 6,
          size: 2 + Math.random() * 3,
          opacity: 0.6 + Math.random() * 0.4,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 80 + Math.random() * 60,
          color: ['#ffffff', '#ffddaa', '#ffccaa', '#ffeecc'][Math.floor(Math.random() * 4)],
          trail: [],
        }
      }

      case 'dna': {
        return {
          x: w / 2,
          y: fromTop ? -10 : Math.random() * h,
          vx: 0, vy: 0.5 + Math.random() * 1,
          size: 3 + Math.random() * 3,
          opacity: 0.4 + Math.random() * 0.4,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 9999,
          color: ['#00aaff', '#ff4488'][Math.floor(Math.random() * 2)],
          phase: Math.random() * Math.PI * 2,
          amplitude: 40 + Math.random() * 60,
          wobbleSpeed: 0.03 + Math.random() * 0.02,
        }
      }

      case 'pixel': {
        return {
          x: Math.floor(Math.random() * (w / 10)) * 10,
          y: fromTop ? -10 : Math.random() * h,
          vx: 0,
          vy: 2 + Math.random() * 4,
          size: 6 + Math.floor(Math.random() * 3) * 2,
          opacity: 0.4 + Math.random() * 0.5,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 9999,
          color: ['#ff0044', '#00ff44', '#0044ff', '#ffff00', '#ff00ff', '#00ffff'][Math.floor(Math.random() * 6)],
        }
      }

      case 'plasma': {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: 15 + Math.random() * 30,
          opacity: 0,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 200 + Math.random() * 300,
          color: ['#ff44ff', '#44aaff', '#ff8844', '#44ff88'][Math.floor(Math.random() * 4)],
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.01 + Math.random() * 0.01,
          pulseSpeed: 0.02 + Math.random() * 0.03,
        }
      }

      case 'lanterns': {
        return {
          x: Math.random() * w,
          y: h + 20 + Math.random() * 50,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -(0.3 + Math.random() * 0.6),
          size: 12 + Math.random() * 15,
          opacity: 0.3 + Math.random() * 0.4,
          rotation: (Math.random() - 0.5) * 10,
          rotationSpeed: (Math.random() - 0.5) * 0.3,
          life: 0, maxLife: 9999,
          color: ['#ff6600', '#ff8833', '#ffaa00', '#ff4400'][Math.floor(Math.random() * 4)],
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.008 + Math.random() * 0.01,
          pulseSpeed: 0.03 + Math.random() * 0.02,
        }
      }

      case 'dandelion': {
        return {
          x: Math.random() * w,
          y: fromTop ? -10 : Math.random() * h,
          vx: 0.3 + Math.random() * 0.8,
          vy: 0.1 + Math.random() * 0.4,
          size: 3 + Math.random() * 5,
          opacity: 0.3 + Math.random() * 0.5,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 2,
          life: 0, maxLife: 9999,
          color: '#ffffff',
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.01 + Math.random() * 0.02,
          swing: Math.random() * Math.PI * 2,
          swingSpeed: 0.008 + Math.random() * 0.015,
        }
      }

      case 'glitch': {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: 0, vy: 0,
          size: 20 + Math.random() * 80,
          opacity: 0,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 10 + Math.random() * 20,
          color: ['#ff0044', '#00ff44', '#0044ff', '#ffffff'][Math.floor(Math.random() * 4)],
          phase: Math.random() * 10,
        }
      }

      case 'comet': {
        const fromLeft = Math.random() > 0.5
        return {
          x: fromLeft ? -20 : w + 20,
          y: Math.random() * h * 0.6,
          vx: fromLeft ? (2 + Math.random() * 4) : -(2 + Math.random() * 4),
          vy: 0.5 + Math.random() * 1.5,
          size: 3 + Math.random() * 4,
          opacity: 0.7 + Math.random() * 0.3,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 150 + Math.random() * 100,
          color: ['#66ddff', '#aaeeff', '#ffffff', '#88ccff'][Math.floor(Math.random() * 4)],
          trail: [],
        }
      }

      case 'ripple': {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: 0, vy: 0,
          size: 0,
          opacity: 0.4 + Math.random() * 0.3,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 80 + Math.random() * 60,
          color: ['#44aaff', '#66ccff', '#88ddff', '#aaeeff'][Math.floor(Math.random() * 4)],
        }
      }

      case 'crystals': {
        return {
          x: Math.random() * w,
          y: fromTop ? -15 : Math.random() * h,
          vx: (Math.random() - 0.5) * 1,
          vy: 0.8 + Math.random() * 2,
          size: 5 + Math.random() * 10,
          opacity: 0.3 + Math.random() * 0.5,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 4,
          life: 0, maxLife: 9999,
          color: ['#88ddff', '#aaeeff', '#ddccff', '#ffccdd', '#ccffee'][Math.floor(Math.random() * 5)],
          pulseSpeed: 0.04 + Math.random() * 0.03,
          wobble: Math.random() * Math.PI * 2,
        }
      }

      case 'zodiac': {
        const symbols = '\u2648\u2649\u264A\u264B\u264C\u264D\u264E\u264F\u2650\u2651\u2652\u2653'
        return {
          x: Math.random() * w,
          y: fromTop ? -20 : Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: 0.3 + Math.random() * 0.8,
          size: 14 + Math.random() * 10,
          opacity: 0.2 + Math.random() * 0.4,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 1,
          life: 0, maxLife: 9999,
          color: ['#ffd700', '#ffaa00', '#ffcc44', '#ffe066'][Math.floor(Math.random() * 4)],
          char: symbols[Math.floor(Math.random() * symbols.length)],
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.01 + Math.random() * 0.02,
        }
      }

      case 'roses': {
        return {
          x: Math.random() * w,
          y: fromTop ? -15 : Math.random() * h,
          vx: (Math.random() - 0.5) * 0.8,
          vy: 0.5 + Math.random() * 1.2,
          size: 6 + Math.random() * 8,
          opacity: 0.4 + Math.random() * 0.5,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 3,
          life: 0, maxLife: 9999,
          color: ['#cc0033', '#ee1144', '#ff3366', '#bb0022', '#dd2255'][Math.floor(Math.random() * 5)],
          swing: Math.random() * Math.PI * 2,
          swingSpeed: 0.015 + Math.random() * 0.02,
        }
      }

      case 'sparkle': {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: 0, vy: 0,
          size: 2 + Math.random() * 4,
          opacity: 0,
          rotation: Math.random() * 45,
          rotationSpeed: (Math.random() - 0.5) * 3,
          life: 0, maxLife: 40 + Math.random() * 60,
          color: ['#ffffff', '#ffff88', '#88ffff', '#ff88ff', '#ffdd44'][Math.floor(Math.random() * 5)],
          pulseSpeed: 0.08 + Math.random() * 0.06,
        }
      }

      case 'geometric': {
        return {
          x: Math.random() * w,
          y: fromTop ? -20 : Math.random() * h,
          vx: (Math.random() - 0.5) * 1,
          vy: 0.3 + Math.random() * 1,
          size: 10 + Math.random() * 20,
          opacity: 0.1 + Math.random() * 0.2,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 1.5,
          life: 0, maxLife: 9999,
          color: ['#44aaff', '#ff4488', '#44ff88', '#ffaa44', '#aa44ff', '#ff8844'][Math.floor(Math.random() * 6)],
          phase: Math.floor(Math.random() * 3), // 0=triangle, 1=square, 2=hexagon
        }
      }

      case 'feathers': {
        return {
          x: Math.random() * w,
          y: fromTop ? -15 : Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: 0.2 + Math.random() * 0.6,
          size: 8 + Math.random() * 12,
          opacity: 0.2 + Math.random() * 0.4,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 2,
          life: 0, maxLife: 9999,
          color: ['#ffffff', '#eeeedd', '#ddddcc', '#ffeeee', '#eeeeff'][Math.floor(Math.random() * 5)],
          swing: Math.random() * Math.PI * 2,
          swingSpeed: 0.01 + Math.random() * 0.02,
        }
      }

      case 'musicNotes': {
        const notes = ['\u266A', '\u266B', '\u2669', '\u266C']
        return {
          x: Math.random() * w,
          y: h + 10,
          vx: (Math.random() - 0.5) * 1,
          vy: -(0.8 + Math.random() * 1.5),
          size: 14 + Math.random() * 10,
          opacity: 0.3 + Math.random() * 0.5,
          rotation: (Math.random() - 0.5) * 30,
          rotationSpeed: (Math.random() - 0.5) * 2,
          life: 0, maxLife: 9999,
          color: ['#ff66aa', '#66aaff', '#ffaa33', '#66ff99', '#ff6666', '#aa66ff'][Math.floor(Math.random() * 6)],
          char: notes[Math.floor(Math.random() * notes.length)],
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.02 + Math.random() * 0.02,
        }
      }

      case 'butterflies': {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: 8 + Math.random() * 10,
          opacity: 0.3 + Math.random() * 0.4,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 400 + Math.random() * 400,
          color: ['#ff8844', '#ffaa22', '#ff6688', '#44aaff', '#aa66ff', '#66ddaa'][Math.floor(Math.random() * 6)],
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.04 + Math.random() * 0.04,
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.1 + Math.random() * 0.1,
        }
      }

      case 'fog': {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: 0.2 + Math.random() * 0.5,
          vy: (Math.random() - 0.5) * 0.1,
          size: 60 + Math.random() * 120,
          opacity: 0,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 400 + Math.random() * 300,
          color: ['#cccccc', '#bbbbbb', '#dddddd', '#aaaaaa'][Math.floor(Math.random() * 4)],
        }
      }

      case 'fireworks': {
        return {
          x: Math.random() * w,
          y: h,
          vx: (Math.random() - 0.5) * 3,
          vy: -(5 + Math.random() * 6),
          size: 2 + Math.random() * 2,
          opacity: 0.8 + Math.random() * 0.2,
          rotation: 0, rotationSpeed: 0,
          life: 0, maxLife: 60 + Math.random() * 30,
          color: ['#ff3366', '#33ccff', '#ffcc00', '#66ff66', '#ff66ff', '#ff9933', '#ffffff'][Math.floor(Math.random() * 7)],
          phase: 0, // 0 = rising, 1 = exploded
          trail: [],
        }
      }

      case 'songkran': {
        // Mix of water drops, splash particles, and Songkran emojis
        const songkranType = Math.random()
        if (songkranType < 0.55) {
          // Water droplet - falls from top
          return {
            x: Math.random() * w,
            y: fromTop ? -10 : Math.random() * h,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 2 + Math.random() * 4,
            size: 3 + Math.random() * 6,
            opacity: 0.3 + Math.random() * 0.5,
            rotation: 0, rotationSpeed: 0,
            life: 0, maxLife: 9999,
            color: ['#38bdf8', '#22d3ee', '#06b6d4', '#67e8f9', '#a5f3fc'][Math.floor(Math.random() * 5)],
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.02 + Math.random() * 0.03,
            phase: 0, // 0 = water drop
          }
        } else if (songkranType < 0.8) {
          // Golden/flower petal - floats gently
          return {
            x: Math.random() * w,
            y: fromTop ? -15 : Math.random() * h,
            vx: 0.3 + Math.random() * 0.8,
            vy: 0.5 + Math.random() * 1,
            size: 5 + Math.random() * 7,
            opacity: 0.4 + Math.random() * 0.5,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 3,
            life: 0, maxLife: 9999,
            color: ['#fbbf24', '#f59e0b', '#fb923c', '#ff6b9d', '#c084fc'][Math.floor(Math.random() * 5)],
            swing: Math.random() * Math.PI * 2,
            swingSpeed: 0.02 + Math.random() * 0.02,
            phase: 1, // 1 = petal/flower
          }
        } else {
          // Songkran emoji particle - floats down slowly
          const emojis = ['💦', '🌊', '🐘', '🌸', '🏖️', '🎉', '🪷', '☀️', '🌺', '💧']
          return {
            x: Math.random() * w,
            y: fromTop ? -20 : Math.random() * h,
            vx: (Math.random() - 0.5) * 0.5,
            vy: 0.3 + Math.random() * 0.8,
            size: 16 + Math.random() * 12,
            opacity: 0.4 + Math.random() * 0.4,
            rotation: (Math.random() - 0.5) * 30,
            rotationSpeed: (Math.random() - 0.5) * 1,
            life: 0, maxLife: 9999,
            color: '#ffffff',
            char: emojis[Math.floor(Math.random() * emojis.length)],
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.01 + Math.random() * 0.02,
            phase: 2, // 2 = emoji
          }
        }
      }

      default:
        return {
          x: 0, y: 0, vx: 0, vy: 0, size: 0, opacity: 0,
          rotation: 0, rotationSpeed: 0, life: 0, maxLife: 0, color: '#fff',
        }
    }
  }, [])

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, p: Particle) => {
    const eff = effectRef.current
    ctx.save()
    ctx.globalAlpha = p.opacity

    switch (eff) {
      case 'snow': {
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
        grad.addColorStop(0, 'rgba(255,255,255,0.9)')
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'rain': {
        ctx.strokeStyle = p.color
        ctx.lineWidth = p.size
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x + p.vx * 2, p.y + p.vy * 1.5)
        ctx.stroke()
        break
      }

      case 'fireflies': {
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
        glow.addColorStop(0, p.color)
        glow.addColorStop(0.4, p.color + '60')
        glow.addColorStop(1, 'transparent')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.globalAlpha = p.opacity * 0.8
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'sakura': {
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        for (let i = 0; i < 5; i++) {
          ctx.beginPath()
          ctx.ellipse(0, -p.size * 0.3, p.size * 0.25, p.size * 0.45, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.rotate(Math.PI * 2 / 5)
        }
        ctx.fillStyle = '#fff8'
        ctx.beginPath()
        ctx.arc(0, 0, p.size * 0.15, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'bubbles': {
        ctx.strokeStyle = p.color
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.stroke()
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.beginPath()
        ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.2, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'matrix': {
        ctx.font = `${p.size}px monospace`
        ctx.fillStyle = p.color
        ctx.fillText(p.char || '0', p.x, p.y)
        break
      }

      case 'stars': {
        const starGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
        starGlow.addColorStop(0, p.color)
        starGlow.addColorStop(0.5, p.color + '40')
        starGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = starGlow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'hearts': {
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        const s = p.size * 0.05
        ctx.beginPath()
        ctx.moveTo(0, s * 6)
        ctx.bezierCurveTo(0, s * 4, -s * 10, s * 2, -s * 10, -s * 2)
        ctx.bezierCurveTo(-s * 10, -s * 8, -s * 4, -s * 10, 0, -s * 6)
        ctx.bezierCurveTo(s * 4, -s * 10, s * 10, -s * 8, s * 10, -s * 2)
        ctx.bezierCurveTo(s * 10, s * 2, 0, s * 4, 0, s * 6)
        ctx.fill()
        break
      }

      case 'confetti': {
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        break
      }

      // ======== 30 NEW EFFECTS DRAW ========

      case 'aurora': {
        const grd = ctx.createLinearGradient(p.x - p.size, p.y, p.x + p.size, p.y + p.size * 0.6)
        grd.addColorStop(0, 'transparent')
        grd.addColorStop(0.3, p.color + '40')
        grd.addColorStop(0.5, p.color + '60')
        grd.addColorStop(0.7, p.color + '40')
        grd.addColorStop(1, 'transparent')
        ctx.fillStyle = grd
        ctx.beginPath()
        // Wavy aurora band
        ctx.moveTo(p.x - p.size, p.y)
        for (let i = 0; i <= 20; i++) {
          const px = p.x - p.size + (p.size * 2 * i / 20)
          const py = p.y + Math.sin((p.wobble || 0) + i * 0.5) * 20
          ctx.lineTo(px, py)
        }
        for (let i = 20; i >= 0; i--) {
          const px = p.x - p.size + (p.size * 2 * i / 20)
          const py = p.y + p.size * 0.5 + Math.sin((p.wobble || 0) + i * 0.5 + 1) * 15
          ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fill()
        break
      }

      case 'lightning': {
        if (p.opacity < 0.1) break
        ctx.strokeStyle = p.color
        ctx.lineWidth = p.size
        ctx.shadowColor = '#88aaff'
        ctx.shadowBlur = 15
        ctx.beginPath()
        let lx = p.x, ly = 0
        ctx.moveTo(lx, ly)
        const segs = 8 + Math.floor(Math.random() * 5)
        const segH = (p.targetY || 300) / segs
        for (let i = 1; i <= segs; i++) {
          lx += (Math.random() - 0.5) * 60
          ly += segH
          ctx.lineTo(lx, ly)
        }
        ctx.stroke()
        ctx.shadowBlur = 0
        break
      }

      case 'smoke': {
        const smokeGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
        smokeGrad.addColorStop(0, p.color + '30')
        smokeGrad.addColorStop(0.5, p.color + '15')
        smokeGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = smokeGrad
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'embers': {
        const emberGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
        emberGlow.addColorStop(0, p.color)
        emberGlow.addColorStop(0.3, p.color + '80')
        emberGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = emberGlow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fill()
        // Bright core
        ctx.fillStyle = '#ffffcc'
        ctx.globalAlpha = p.opacity * 0.9
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'leaves': {
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        // Leaf shape
        ctx.beginPath()
        ctx.moveTo(0, -p.size * 0.5)
        ctx.bezierCurveTo(p.size * 0.4, -p.size * 0.3, p.size * 0.4, p.size * 0.3, 0, p.size * 0.5)
        ctx.bezierCurveTo(-p.size * 0.4, p.size * 0.3, -p.size * 0.4, -p.size * 0.3, 0, -p.size * 0.5)
        ctx.fill()
        // Center vein
        ctx.strokeStyle = p.color + '80'
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(0, -p.size * 0.4)
        ctx.lineTo(0, p.size * 0.4)
        ctx.stroke()
        break
      }

      case 'diamonds': {
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        const ds = p.size / 2
        // Diamond shape
        ctx.fillStyle = p.color + '60'
        ctx.beginPath()
        ctx.moveTo(0, -ds)
        ctx.lineTo(ds * 0.7, 0)
        ctx.lineTo(0, ds)
        ctx.lineTo(-ds * 0.7, 0)
        ctx.closePath()
        ctx.fill()
        // Shine
        ctx.strokeStyle = p.color
        ctx.lineWidth = 0.5
        ctx.stroke()
        // Inner sparkle
        ctx.fillStyle = '#ffffff'
        ctx.globalAlpha = p.opacity * 0.5 * (0.5 + Math.sin((p.wobble || 0)) * 0.5)
        ctx.beginPath()
        ctx.arc(0, -ds * 0.2, ds * 0.1, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'neon': {
        // Draw trail
        if (p.trail && p.trail.length > 1) {
          for (let i = 1; i < p.trail.length; i++) {
            const t = i / p.trail.length
            ctx.globalAlpha = p.opacity * t * 0.5
            ctx.strokeStyle = p.color
            ctx.lineWidth = p.size * t
            ctx.beginPath()
            ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y)
            ctx.lineTo(p.trail[i].x, p.trail[i].y)
            ctx.stroke()
          }
        }
        // Glow core
        ctx.globalAlpha = p.opacity
        const neonGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
        neonGlow.addColorStop(0, '#ffffff')
        neonGlow.addColorStop(0.2, p.color)
        neonGlow.addColorStop(0.6, p.color + '40')
        neonGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = neonGlow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'galaxy': {
        const gGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2)
        gGlow.addColorStop(0, p.color)
        gGlow.addColorStop(0.5, p.color + '40')
        gGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = gGlow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'thunder': {
        // Rain drop
        ctx.strokeStyle = p.color
        ctx.lineWidth = p.size
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x + p.vx * 2, p.y + p.vy * 1.2)
        ctx.stroke()
        break
      }

      case 'goldDust': {
        const gdGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5)
        gdGlow.addColorStop(0, p.color)
        gdGlow.addColorStop(0.4, p.color + '60')
        gdGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = gdGlow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2)
        ctx.fill()
        // Bright center
        ctx.fillStyle = '#ffffee'
        ctx.globalAlpha = p.opacity * 0.7
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'jellyfish': {
        const jSize = p.size
        const pulse = Math.sin((p.phase || 0) + p.life * (p.pulseSpeed || 0.03))
        // Bell/dome
        ctx.fillStyle = p.color + '40'
        ctx.beginPath()
        ctx.ellipse(p.x, p.y, jSize * (0.8 + pulse * 0.2), jSize * 0.6, 0, Math.PI, 0)
        ctx.fill()
        // Inner glow
        const jGlow = ctx.createRadialGradient(p.x, p.y - jSize * 0.2, 0, p.x, p.y, jSize * 0.5)
        jGlow.addColorStop(0, p.color + '50')
        jGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = jGlow
        ctx.beginPath()
        ctx.arc(p.x, p.y - jSize * 0.2, jSize * 0.5, 0, Math.PI * 2)
        ctx.fill()
        // Tentacles
        ctx.strokeStyle = p.color + '30'
        ctx.lineWidth = 1
        for (let t = 0; t < 5; t++) {
          const tx = p.x - jSize * 0.6 + (jSize * 1.2 * t / 4)
          ctx.beginPath()
          ctx.moveTo(tx, p.y)
          const tentLen = jSize * 0.8
          for (let s = 0; s < 4; s++) {
            ctx.lineTo(
              tx + Math.sin((p.wobble || 0) + s + t) * jSize * 0.2,
              p.y + tentLen * (s + 1) / 4
            )
          }
          ctx.stroke()
        }
        break
      }

      case 'meteor': {
        // Trail
        if (p.trail && p.trail.length > 1) {
          for (let i = 1; i < p.trail.length; i++) {
            const t = i / p.trail.length
            ctx.globalAlpha = p.opacity * t * 0.6
            ctx.strokeStyle = p.color
            ctx.lineWidth = p.size * t
            ctx.beginPath()
            ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y)
            ctx.lineTo(p.trail[i].x, p.trail[i].y)
            ctx.stroke()
          }
        }
        // Head
        ctx.globalAlpha = p.opacity
        const mGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2)
        mGlow.addColorStop(0, '#ffffff')
        mGlow.addColorStop(0.3, p.color)
        mGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = mGlow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'dna': {
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        // Glow
        const dnaGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2)
        dnaGlow.addColorStop(0, p.color + '40')
        dnaGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = dnaGlow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'pixel': {
        ctx.fillStyle = p.color
        ctx.fillRect(p.x, p.y, p.size, p.size)
        // Pixel border
        ctx.strokeStyle = p.color + '40'
        ctx.lineWidth = 0.5
        ctx.strokeRect(p.x, p.y, p.size, p.size)
        break
      }

      case 'plasma': {
        const pGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
        pGrad.addColorStop(0, p.color + '50')
        pGrad.addColorStop(0.3, p.color + '30')
        pGrad.addColorStop(0.7, p.color + '10')
        pGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = pGrad
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        // Inner bright core
        ctx.fillStyle = '#ffffff'
        ctx.globalAlpha = p.opacity * 0.3
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 0.15, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'lanterns': {
        const lSize = p.size
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        // Glow
        const lGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, lSize * 1.5)
        lGlow.addColorStop(0, p.color + '50')
        lGlow.addColorStop(0.5, p.color + '20')
        lGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = lGlow
        ctx.beginPath()
        ctx.arc(0, 0, lSize * 1.5, 0, Math.PI * 2)
        ctx.fill()
        // Lantern body
        ctx.fillStyle = p.color + '80'
        ctx.beginPath()
        ctx.ellipse(0, 0, lSize * 0.5, lSize * 0.65, 0, 0, Math.PI * 2)
        ctx.fill()
        // Top
        ctx.fillStyle = p.color + 'aa'
        ctx.fillRect(-lSize * 0.15, -lSize * 0.7, lSize * 0.3, lSize * 0.15)
        // Flame flicker
        const flicker = 0.7 + Math.sin(p.life * (p.pulseSpeed || 0.05)) * 0.3
        ctx.fillStyle = '#ffff88'
        ctx.globalAlpha = p.opacity * flicker
        ctx.beginPath()
        ctx.arc(0, 0, lSize * 0.12, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'dandelion': {
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        // Seed head (radial lines with dots)
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 0.3
        ctx.fillStyle = '#ffffff'
        const rays = 8
        for (let i = 0; i < rays; i++) {
          const angle = (Math.PI * 2 * i) / rays
          const len = p.size * 0.6
          const ex = Math.cos(angle) * len
          const ey = Math.sin(angle) * len
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(ex, ey)
          ctx.stroke()
          // Tiny puff at end
          ctx.beginPath()
          ctx.arc(ex, ey, p.size * 0.1, 0, Math.PI * 2)
          ctx.fill()
        }
        // Center dot
        ctx.beginPath()
        ctx.arc(0, 0, p.size * 0.08, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'glitch': {
        ctx.fillStyle = p.color
        const gh = 1 + Math.random() * 4
        ctx.fillRect(p.x, p.y, p.size, gh)
        // Secondary offset line
        if (Math.random() > 0.5) {
          ctx.globalAlpha = p.opacity * 0.5
          ctx.fillStyle = p.color === '#ff0044' ? '#00ff44' : '#ff0044'
          ctx.fillRect(p.x + (Math.random() - 0.5) * 10, p.y + gh + 2, p.size * 0.7, gh * 0.5)
        }
        break
      }

      case 'comet': {
        // Trail
        if (p.trail && p.trail.length > 1) {
          for (let i = 1; i < p.trail.length; i++) {
            const t = i / p.trail.length
            ctx.globalAlpha = p.opacity * t * 0.4
            const tGrad = ctx.createRadialGradient(p.trail[i].x, p.trail[i].y, 0, p.trail[i].x, p.trail[i].y, p.size * t * 2)
            tGrad.addColorStop(0, p.color + '60')
            tGrad.addColorStop(1, 'transparent')
            ctx.fillStyle = tGrad
            ctx.beginPath()
            ctx.arc(p.trail[i].x, p.trail[i].y, p.size * t * 2, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        // Head
        ctx.globalAlpha = p.opacity
        const cGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5)
        cGlow.addColorStop(0, '#ffffff')
        cGlow.addColorStop(0.2, p.color)
        cGlow.addColorStop(0.6, p.color + '40')
        cGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = cGlow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'ripple': {
        const maxR = 30 + (p.life / p.maxLife) * 50
        ctx.strokeStyle = p.color
        ctx.lineWidth = 1.5
        // Multiple rings
        for (let r = 0; r < 3; r++) {
          const rSize = maxR * (0.4 + r * 0.3)
          const rOpacity = p.opacity * (1 - r * 0.3) * (1 - p.life / p.maxLife)
          ctx.globalAlpha = Math.max(0, rOpacity)
          ctx.beginPath()
          ctx.arc(p.x, p.y, rSize, 0, Math.PI * 2)
          ctx.stroke()
        }
        break
      }

      case 'crystals': {
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        const cs = p.size / 2
        // Hexagonal crystal shape
        ctx.fillStyle = p.color + '40'
        ctx.strokeStyle = p.color + '80'
        ctx.lineWidth = 0.8
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2
          const cx2 = Math.cos(angle) * cs
          const cy2 = Math.sin(angle) * cs
          if (i === 0) ctx.moveTo(cx2, cy2)
          else ctx.lineTo(cx2, cy2)
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        // Shine line
        const shimmer = 0.3 + Math.sin((p.wobble || 0)) * 0.3
        ctx.globalAlpha = p.opacity * shimmer
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(-cs * 0.3, -cs * 0.5)
        ctx.lineTo(cs * 0.1, cs * 0.3)
        ctx.stroke()
        break
      }

      case 'zodiac': {
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.font = `${p.size}px serif`
        ctx.fillStyle = p.color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(p.char || '\u2648', 0, 0)
        // Subtle glow
        const zGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 0.8)
        zGlow.addColorStop(0, p.color + '20')
        zGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = zGlow
        ctx.beginPath()
        ctx.arc(0, 0, p.size * 0.8, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'roses': {
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        // Rose petal (teardrop shape)
        const rs = p.size * 0.4
        ctx.beginPath()
        ctx.moveTo(0, -rs)
        ctx.bezierCurveTo(rs * 0.8, -rs * 0.6, rs * 1.0, rs * 0.4, 0, rs * 1.2)
        ctx.bezierCurveTo(-rs * 1.0, rs * 0.4, -rs * 0.8, -rs * 0.6, 0, -rs)
        ctx.fill()
        // Lighter inner highlight
        ctx.fillStyle = p.color + '80'
        ctx.beginPath()
        ctx.ellipse(0, 0, rs * 0.3, rs * 0.5, 0, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'sparkle': {
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        // 4-point star
        const spk = p.size
        ctx.beginPath()
        ctx.moveTo(0, -spk)
        ctx.lineTo(spk * 0.15, -spk * 0.15)
        ctx.lineTo(spk, 0)
        ctx.lineTo(spk * 0.15, spk * 0.15)
        ctx.lineTo(0, spk)
        ctx.lineTo(-spk * 0.15, spk * 0.15)
        ctx.lineTo(-spk, 0)
        ctx.lineTo(-spk * 0.15, -spk * 0.15)
        ctx.closePath()
        ctx.fill()
        // Center glow
        const spGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, spk * 0.5)
        spGlow.addColorStop(0, '#ffffff')
        spGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = spGlow
        ctx.beginPath()
        ctx.arc(0, 0, spk * 0.5, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'geometric': {
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.strokeStyle = p.color
        ctx.lineWidth = 1
        const gs = p.size / 2
        const sides = (p.phase || 0) === 0 ? 3 : (p.phase || 0) === 1 ? 4 : 6
        ctx.beginPath()
        for (let i = 0; i <= sides; i++) {
          const a = (Math.PI * 2 * i) / sides - Math.PI / 2
          const gx = Math.cos(a) * gs
          const gy = Math.sin(a) * gs
          if (i === 0) ctx.moveTo(gx, gy)
          else ctx.lineTo(gx, gy)
        }
        ctx.closePath()
        ctx.stroke()
        // Subtle fill
        ctx.fillStyle = p.color + '15'
        ctx.fill()
        break
      }

      case 'feathers': {
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        // Feather shape: elongated with curve
        ctx.beginPath()
        ctx.moveTo(0, -p.size * 0.5)
        ctx.bezierCurveTo(p.size * 0.2, -p.size * 0.2, p.size * 0.25, p.size * 0.2, p.size * 0.05, p.size * 0.5)
        ctx.lineTo(0, p.size * 0.45)
        ctx.bezierCurveTo(-p.size * 0.25, p.size * 0.2, -p.size * 0.2, -p.size * 0.2, 0, -p.size * 0.5)
        ctx.fill()
        // Center quill
        ctx.strokeStyle = p.color + '60'
        ctx.lineWidth = 0.3
        ctx.beginPath()
        ctx.moveTo(0, -p.size * 0.4)
        ctx.quadraticCurveTo(p.size * 0.02, 0, 0, p.size * 0.45)
        ctx.stroke()
        break
      }

      case 'musicNotes': {
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.font = `${p.size}px serif`
        ctx.fillStyle = p.color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(p.char || '\u266A', 0, 0)
        break
      }

      case 'butterflies': {
        ctx.translate(p.x, p.y)
        const wingFlap = Math.sin(p.life * (p.pulseSpeed || 0.1)) * 0.7
        // Left wing
        ctx.save()
        ctx.scale(1, Math.cos(wingFlap))
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.ellipse(-p.size * 0.3, 0, p.size * 0.4, p.size * 0.25, -0.3, 0, Math.PI * 2)
        ctx.fill()
        // Wing pattern
        ctx.fillStyle = p.color + '60'
        ctx.beginPath()
        ctx.ellipse(-p.size * 0.35, 0, p.size * 0.15, p.size * 0.1, -0.3, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
        // Right wing
        ctx.save()
        ctx.scale(1, Math.cos(wingFlap))
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.ellipse(p.size * 0.3, 0, p.size * 0.4, p.size * 0.25, 0.3, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = p.color + '60'
        ctx.beginPath()
        ctx.ellipse(p.size * 0.35, 0, p.size * 0.15, p.size * 0.1, 0.3, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
        // Body
        ctx.fillStyle = '#333333'
        ctx.beginPath()
        ctx.ellipse(0, 0, p.size * 0.05, p.size * 0.2, 0, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'fog': {
        const fogGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
        fogGrad.addColorStop(0, p.color + '18')
        fogGrad.addColorStop(0.5, p.color + '0c')
        fogGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = fogGrad
        ctx.beginPath()
        ctx.ellipse(p.x, p.y, p.size, p.size * 0.4, 0, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 'fireworks': {
        if ((p.phase || 0) === 0) {
          // Rising
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
          // Trail glow
          if (p.trail && p.trail.length > 1) {
            for (let i = 1; i < p.trail.length; i++) {
              const t = i / p.trail.length
              ctx.globalAlpha = p.opacity * t * 0.3
              ctx.fillStyle = p.color
              ctx.beginPath()
              ctx.arc(p.trail[i].x, p.trail[i].y, p.size * t * 0.5, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        } else {
          // Exploded - draw as burst
          const sparkCount = 12
          const burstRadius = p.size * ((p.life - (p.maxLife * 0.6)) * 0.5)
          if (burstRadius > 0) {
            for (let i = 0; i < sparkCount; i++) {
              const angle = (Math.PI * 2 * i) / sparkCount
              const sx = p.x + Math.cos(angle) * burstRadius
              const sy = p.y + Math.sin(angle) * burstRadius + (burstRadius * 0.05)
              const spGlow2 = ctx.createRadialGradient(sx, sy, 0, sx, sy, 3)
              spGlow2.addColorStop(0, p.color)
              spGlow2.addColorStop(1, 'transparent')
              ctx.fillStyle = spGlow2
              ctx.beginPath()
              ctx.arc(sx, sy, 3, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        }
        break
      }

      case 'songkran': {
        const pType = p.phase || 0
        if (pType === 0) {
          // Water droplet
          ctx.translate(p.x, p.y)
          ctx.fillStyle = p.color
          // Teardrop shape
          ctx.beginPath()
          ctx.moveTo(0, -p.size * 0.6)
          ctx.bezierCurveTo(p.size * 0.4, -p.size * 0.1, p.size * 0.35, p.size * 0.4, 0, p.size * 0.5)
          ctx.bezierCurveTo(-p.size * 0.35, p.size * 0.4, -p.size * 0.4, -p.size * 0.1, 0, -p.size * 0.6)
          ctx.fill()
          // Shine highlight
          ctx.globalAlpha = p.opacity * 0.6
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.ellipse(-p.size * 0.12, -p.size * 0.15, p.size * 0.08, p.size * 0.15, -0.3, 0, Math.PI * 2)
          ctx.fill()
          // Glow
          ctx.globalAlpha = p.opacity * 0.15
          const dropGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 1.5)
          dropGlow.addColorStop(0, p.color)
          dropGlow.addColorStop(1, 'transparent')
          ctx.fillStyle = dropGlow
          ctx.beginPath()
          ctx.arc(0, 0, p.size * 1.5, 0, Math.PI * 2)
          ctx.fill()
        } else if (pType === 1) {
          // Petal / flower
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rotation * Math.PI) / 180)
          ctx.fillStyle = p.color
          // Petal shape with 5 petals
          for (let i = 0; i < 5; i++) {
            ctx.beginPath()
            ctx.ellipse(0, -p.size * 0.3, p.size * 0.2, p.size * 0.35, 0, 0, Math.PI * 2)
            ctx.fill()
            ctx.rotate(Math.PI * 2 / 5)
          }
          // Center dot
          ctx.fillStyle = '#fef08a'
          ctx.globalAlpha = p.opacity * 0.8
          ctx.beginPath()
          ctx.arc(0, 0, p.size * 0.12, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // Emoji
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rotation * Math.PI) / 180)
          ctx.font = `${p.size}px serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(p.char || '💦', 0, 0)
        }
        break
      }
    }

    ctx.restore()
  }, [])

  const updateParticle = useCallback((p: Particle, w: number, h: number): boolean => {
    const eff = effectRef.current
    p.life++

    switch (eff) {
      case 'snow': {
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.02)
        p.x += p.vx + Math.sin(p.wobble) * 0.5
        p.y += p.vy
        if (p.y > h + 10) return false
        break
      }

      case 'rain': {
        p.x += p.vx
        p.y += p.vy
        if (p.y > h + 20) return false
        break
      }

      case 'fireflies': {
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.02)
        p.x += p.vx + Math.sin(p.wobble) * 0.3
        p.y += p.vy + Math.cos(p.wobble * 1.3) * 0.3
        const lifePct = p.life / p.maxLife
        if (lifePct < 0.2) p.opacity = lifePct * 5
        else if (lifePct > 0.8) p.opacity = (1 - lifePct) * 5
        else p.opacity = 0.5 + Math.sin(p.life * 0.05) * 0.3
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
        if (p.life >= p.maxLife) return false
        break
      }

      case 'sakura': {
        p.swing = (p.swing || 0) + (p.swingSpeed || 0.02)
        p.x += p.vx + Math.sin(p.swing) * 1.5
        p.y += p.vy
        p.rotation += p.rotationSpeed
        if (p.y > h + 20) return false
        break
      }

      case 'bubbles': {
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.02)
        p.x += p.vx + Math.sin(p.wobble) * 0.5
        p.y += p.vy
        p.opacity -= 0.0005
        if (p.y < -20 || p.opacity <= 0) return false
        break
      }

      case 'matrix': {
        p.y += p.vy
        if (Math.random() < 0.05) {
          const chars = 'アイウエオカキクケコサシスセソ0123456789ABCDEF'
          p.char = chars[Math.floor(Math.random() * chars.length)]
        }
        p.opacity -= 0.003
        if (p.y > h + 14 || p.opacity <= 0) return false
        break
      }

      case 'stars': {
        const lp = p.life / p.maxLife
        if (lp < 0.3) p.opacity = lp / 0.3
        else if (lp > 0.7) p.opacity = (1 - lp) / 0.3
        else p.opacity = 0.5 + Math.sin(p.life * 0.08) * 0.5
        if (p.life >= p.maxLife) return false
        break
      }

      case 'hearts': {
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.02)
        p.x += p.vx + Math.sin(p.wobble) * 0.5
        p.y += p.vy
        p.rotation += p.rotationSpeed
        p.opacity -= 0.002
        if (p.y < -30 || p.opacity <= 0) return false
        break
      }

      case 'confetti': {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.02
        p.rotation += p.rotationSpeed
        p.vx *= 0.999
        if (p.y > h + 20) return false
        break
      }

      // ======== 30 NEW EFFECTS UPDATE ========

      case 'aurora': {
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.008)
        p.x += p.vx + Math.sin(p.wobble) * 0.5
        const lp = p.life / p.maxLife
        if (lp < 0.15) p.opacity = lp / 0.15 * 0.25
        else if (lp > 0.85) p.opacity = (1 - lp) / 0.15 * 0.25
        else p.opacity = 0.15 + Math.sin(p.life * 0.02) * 0.1
        if (p.life >= p.maxLife) return false
        break
      }

      case 'lightning': {
        const lp2 = p.life / p.maxLife
        if (lp2 < 0.1) p.opacity = 0.8
        else if (lp2 < 0.2) p.opacity = 0.1
        else if (lp2 < 0.3) p.opacity = 0.6
        else p.opacity = Math.max(0, 0.6 * (1 - lp2))
        if (p.life >= p.maxLife) return false
        break
      }

      case 'smoke': {
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.01)
        p.x += p.vx + Math.sin(p.wobble) * 0.3
        p.y += p.vy
        p.size += 0.15
        p.rotation += p.rotationSpeed
        p.opacity -= 0.0003
        if (p.y < -p.size || p.opacity <= 0) return false
        break
      }

      case 'embers': {
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.03)
        p.x += p.vx + Math.sin(p.wobble) * 0.8
        p.y += p.vy
        p.vy *= 0.998
        const ep = p.life / p.maxLife
        if (ep > 0.7) p.opacity = (1 - ep) / 0.3
        if (p.life >= p.maxLife) return false
        break
      }

      case 'leaves': {
        p.swing = (p.swing || 0) + (p.swingSpeed || 0.02)
        p.x += p.vx + Math.sin(p.swing) * 2
        p.y += p.vy
        p.rotation += p.rotationSpeed
        if (p.y > h + 30) return false
        break
      }

      case 'diamonds': {
        p.wobble = (p.wobble || 0) + (p.pulseSpeed || 0.04)
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed
        if (p.y > h + 20) return false
        break
      }

      case 'neon': {
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.02)
        p.x += p.vx + Math.sin(p.wobble) * 0.5
        p.y += p.vy + Math.cos(p.wobble * 0.7) * 0.5
        // Trail
        if (!p.trail) p.trail = []
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > 12) p.trail.shift()
        // Pulse
        const np = p.life / p.maxLife
        if (np < 0.2) p.opacity = np * 5
        else if (np > 0.8) p.opacity = (1 - np) * 5
        else p.opacity = 0.6 + Math.sin(p.life * 0.08) * 0.3
        if (p.x < -20 || p.x > w + 20) p.vx *= -1
        if (p.y < -20 || p.y > h + 20) p.vy *= -1
        if (p.life >= p.maxLife) return false
        break
      }

      case 'galaxy': {
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.003)
        const cx = w / 2, cy = h / 2
        const newAngle = (p.phase || 0) + p.wobble
        p.x = cx + Math.cos(newAngle) * (p.amplitude || 100)
        p.y = cy + Math.sin(newAngle) * (p.amplitude || 100)
        p.opacity = 0.3 + Math.sin(p.life * 0.03) * 0.3
        break
      }

      case 'thunder': {
        p.x += p.vx
        p.y += p.vy
        if (p.y > h + 20) return false
        break
      }

      case 'goldDust': {
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.02)
        p.x += p.vx + Math.sin(p.wobble) * 0.4
        p.y += p.vy
        const gp = p.life / p.maxLife
        if (gp < 0.2) p.opacity = gp * 5 * 0.6
        else if (gp > 0.8) p.opacity = (1 - gp) * 5 * 0.6
        else p.opacity = 0.4 + Math.sin(p.life * (p.pulseSpeed || 0.06)) * 0.2
        if (p.life >= p.maxLife) return false
        break
      }

      case 'jellyfish': {
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.02)
        p.x += p.vx + Math.sin(p.wobble) * 0.5
        p.y += p.vy + Math.sin(p.life * 0.02) * 0.2
        if (p.y < -p.size * 2 || p.opacity <= 0) return false
        break
      }

      case 'meteor': {
        p.x += p.vx
        p.y += p.vy
        if (!p.trail) p.trail = []
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > 20) p.trail.shift()
        const mp = p.life / p.maxLife
        if (mp > 0.7) p.opacity = (1 - mp) / 0.3
        if (p.life >= p.maxLife || p.x < -50 || p.y > h + 50) return false
        break
      }

      case 'dna': {
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.04)
        p.x = w / 2 + Math.sin(p.wobble + (p.phase || 0)) * (p.amplitude || 50)
        p.y += p.vy
        if (p.y > h + 10) return false
        break
      }

      case 'pixel': {
        p.y += p.vy
        p.opacity -= 0.002
        if (p.y > h + 10 || p.opacity <= 0) return false
        break
      }

      case 'plasma': {
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.01)
        p.x += p.vx + Math.sin(p.wobble) * 0.5
        p.y += p.vy + Math.cos(p.wobble * 0.8) * 0.5
        p.size += Math.sin(p.life * (p.pulseSpeed || 0.03)) * 0.3
        const pp = p.life / p.maxLife
        if (pp < 0.15) p.opacity = pp / 0.15 * 0.2
        else if (pp > 0.85) p.opacity = (1 - pp) / 0.15 * 0.2
        else p.opacity = 0.12 + Math.sin(p.life * 0.03) * 0.08
        if (p.x < -p.size || p.x > w + p.size) p.vx *= -1
        if (p.y < -p.size || p.y > h + p.size) p.vy *= -1
        if (p.life >= p.maxLife) return false
        break
      }

      case 'lanterns': {
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.01)
        p.x += p.vx + Math.sin(p.wobble) * 0.3
        p.y += p.vy
        p.rotation += p.rotationSpeed
        if (p.y < -p.size * 2) return false
        break
      }

      case 'dandelion': {
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.015)
        p.swing = (p.swing || 0) + (p.swingSpeed || 0.01)
        p.x += p.vx + Math.sin(p.wobble) * 0.5 + Math.sin(p.swing) * 0.3
        p.y += p.vy + Math.sin(p.wobble * 0.7) * 0.2
        p.rotation += p.rotationSpeed
        if (p.x > w + 20 || p.y > h + 20) return false
        break
      }

      case 'glitch': {
        const gp = p.life / p.maxLife
        if (gp < 0.1) p.opacity = 0.4
        else if (gp < 0.3) p.opacity = Math.random() * 0.3
        else if (gp < 0.5) p.opacity = 0.3
        else p.opacity = Math.max(0, (1 - gp) * 0.3)
        p.x += (Math.random() - 0.5) * 3
        if (p.life >= p.maxLife) return false
        break
      }

      case 'comet': {
        p.x += p.vx
        p.y += p.vy
        if (!p.trail) p.trail = []
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > 25) p.trail.shift()
        const cp = p.life / p.maxLife
        if (cp > 0.7) p.opacity = (1 - cp) / 0.3
        if (p.life >= p.maxLife) return false
        break
      }

      case 'ripple': {
        p.size += 0.8
        const rp = p.life / p.maxLife
        p.opacity = (1 - rp) * 0.35
        if (p.life >= p.maxLife) return false
        break
      }

      case 'crystals': {
        p.wobble = (p.wobble || 0) + (p.pulseSpeed || 0.04)
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed
        if (p.y > h + 20) return false
        break
      }

      case 'zodiac': {
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.015)
        p.x += p.vx + Math.sin(p.wobble) * 0.3
        p.y += p.vy
        p.rotation += p.rotationSpeed
        p.opacity -= 0.0008
        if (p.y > h + 20 || p.opacity <= 0) return false
        break
      }

      case 'roses': {
        p.swing = (p.swing || 0) + (p.swingSpeed || 0.02)
        p.x += p.vx + Math.sin(p.swing) * 1.2
        p.y += p.vy
        p.rotation += p.rotationSpeed
        if (p.y > h + 20) return false
        break
      }

      case 'sparkle': {
        const sp = p.life / p.maxLife
        if (sp < 0.3) p.opacity = sp / 0.3
        else if (sp > 0.6) p.opacity = (1 - sp) / 0.4
        else p.opacity = 0.8 + Math.sin(p.life * (p.pulseSpeed || 0.1)) * 0.2
        p.rotation += p.rotationSpeed
        if (p.life >= p.maxLife) return false
        break
      }

      case 'geometric': {
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed
        if (p.y > h + 30) return false
        break
      }

      case 'feathers': {
        p.swing = (p.swing || 0) + (p.swingSpeed || 0.015)
        p.x += p.vx + Math.sin(p.swing) * 1.5
        p.y += p.vy + Math.sin(p.swing * 0.5) * 0.2
        p.rotation += p.rotationSpeed
        if (p.y > h + 20) return false
        break
      }

      case 'musicNotes': {
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.02)
        p.x += p.vx + Math.sin(p.wobble) * 0.8
        p.y += p.vy
        p.rotation += p.rotationSpeed
        p.opacity -= 0.0015
        if (p.y < -30 || p.opacity <= 0) return false
        break
      }

      case 'butterflies': {
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.05)
        p.x += p.vx + Math.sin(p.wobble) * 1.5
        p.y += p.vy + Math.cos(p.wobble * 0.7) * 0.8
        // Randomly change direction
        if (Math.random() < 0.005) {
          p.vx = (Math.random() - 0.5) * 1.5
          p.vy = (Math.random() - 0.5) * 0.5
        }
        if (p.x < -20) p.x = w + 10
        if (p.x > w + 20) p.x = -10
        if (p.y < -20) p.y = h + 10
        if (p.y > h + 20) p.y = -10
        if (p.life >= p.maxLife) return false
        break
      }

      case 'fog': {
        p.x += p.vx
        p.y += p.vy
        const fp = p.life / p.maxLife
        if (fp < 0.2) p.opacity = fp / 0.2 * 0.08
        else if (fp > 0.8) p.opacity = (1 - fp) / 0.2 * 0.08
        else p.opacity = 0.06 + Math.sin(p.life * 0.01) * 0.02
        if (p.x > w + p.size) p.x = -p.size
        if (p.life >= p.maxLife) return false
        break
      }

      case 'fireworks': {
        if ((p.phase || 0) === 0) {
          // Rising phase
          p.x += p.vx * 0.3
          p.y += p.vy
          p.vy += 0.08 // gravity slows it
          if (!p.trail) p.trail = []
          p.trail.push({ x: p.x, y: p.y })
          if (p.trail.length > 8) p.trail.shift()
          // Check if reached peak
          if (p.vy >= -1) {
            p.phase = 1
            p.size = 25 + Math.random() * 20
          }
        } else {
          // Exploding phase
          p.opacity -= 0.015
        }
        if (p.life >= p.maxLife || p.opacity <= 0) return false
        break
      }

      case 'songkran': {
        const pType = p.phase || 0
        if (pType === 0) {
          // Water drop - falls with wobble
          p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.02)
          p.x += p.vx + Math.sin(p.wobble) * 0.8
          p.y += p.vy
          p.vy += 0.02 // slight gravity acceleration
          if (p.y > h + 15) return false
        } else if (pType === 1) {
          // Petal / flower - drifts with swing
          p.swing = (p.swing || 0) + (p.swingSpeed || 0.02)
          p.x += p.vx + Math.sin(p.swing) * 1.5
          p.y += p.vy
          p.rotation += p.rotationSpeed
          if (p.y > h + 20) return false
        } else {
          // Emoji - floats down gently
          p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.015)
          p.x += p.vx + Math.sin(p.wobble) * 0.5
          p.y += p.vy
          p.rotation += p.rotationSpeed * 0.3
          if (p.y > h + 30) return false
        }
        break
      }
    }

    return true
  }, [])

  useEffect(() => {
    if (effect === 'none') {
      particlesRef.current = []
      return
    }

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

    // Initialize particles
    const count = PARTICLE_COUNTS[effect] || 0
    particlesRef.current = []
    for (let i = 0; i < count; i++) {
      particlesRef.current.push(createParticle(canvas.width, canvas.height, false))
    }

    // Thunder flash state
    let thunderFlash = 0

    let running = true
    const animate = () => {
      if (!running) return
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // Thunder: random screen flash
      if (effectRef.current === 'thunder') {
        if (Math.random() < 0.003) thunderFlash = 8
        if (thunderFlash > 0) {
          ctx.fillStyle = `rgba(200,210,255,${thunderFlash * 0.02})`
          ctx.fillRect(0, 0, w, h)
          thunderFlash--
        }
      }

      // Update and draw
      const alive: Particle[] = []
      for (const p of particlesRef.current) {
        if (updateParticle(p, w, h)) {
          drawParticle(ctx, p)
          alive.push(p)
        }
      }
      particlesRef.current = alive

      // Replenish
      const target = PARTICLE_COUNTS[effectRef.current] || 0
      while (particlesRef.current.length < target) {
        particlesRef.current.push(createParticle(w, h, true))
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      running = false
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [effect, createParticle, updateParticle, drawParticle])

  if (effect === 'none') return null

   return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999, transform: 'translateZ(0)', willChange: 'transform' }}
    />
  )
}
