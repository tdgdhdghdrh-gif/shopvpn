'use client'

import { useEffect } from 'react'
import { useSiteAppearance } from '@/components/SiteAppearanceProvider'

export default function GradientBackground() {
  const { appearance } = useSiteAppearance()
  const a = appearance as any

  useEffect(() => {
    const id = 'gradient-bg-style'
    let style = document.getElementById(id) as HTMLStyleElement | null

    if (!a?.gradientEnabled) {
      if (style) style.remove()
      return
    }

    const colors: string[] = Array.isArray(a.gradientColors) && a.gradientColors.length >= 2
      ? a.gradientColors
      : ['#1a2980', '#26d0ce']
    const type = a.gradientType || 'linear'
    const angle = Number(a.gradientAngle ?? 135)
    const animated = Boolean(a.gradientAnimated)
    const speed = Math.max(5, Number(a.gradientSpeed ?? 15))

    let bgImage = ''
    let bgSize = '100% 100%'

    if (type === 'linear') {
      bgImage = animated
        ? `linear-gradient(${angle}deg, ${[...colors, ...colors.slice().reverse()].join(', ')})`
        : `linear-gradient(${angle}deg, ${colors.join(', ')})`
      if (animated) bgSize = '400% 400%'
    } else if (type === 'radial') {
      bgImage = `radial-gradient(circle at 50% 50%, ${colors.join(', ')})`
      if (animated) bgSize = '200% 200%'
    } else if (type === 'conic') {
      bgImage = `conic-gradient(from var(--gbg-rot, 0deg) at 50% 50%, ${colors.join(', ')})`
    } else if (type === 'mesh') {
      const c = colors
      const parts = c.map((color, i) => {
        const x = (i * 37) % 100
        const y = (i * 53) % 100
        return `radial-gradient(at ${x}% ${y}%, ${color} 0px, transparent 50%)`
      })
      bgImage = parts.join(', ')
    }

    const animationCss = animated
      ? type === 'conic'
        ? `@keyframes gbg-conic { 0%{--gbg-rot:0deg} 100%{--gbg-rot:360deg} }
           @property --gbg-rot { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
           .gradient-bg-layer { animation: gbg-conic ${speed}s linear infinite; }`
        : type === 'radial'
        ? `@keyframes gbg-radial { 0%,100%{background-position:50% 50%} 50%{background-position:60% 40%} }
           .gradient-bg-layer { animation: gbg-radial ${speed}s ease-in-out infinite; }`
        : `@keyframes gbg-linear { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
           .gradient-bg-layer { animation: gbg-linear ${speed}s ease-in-out infinite; }`
      : ''

    const css = `
      .gradient-bg-layer {
        position: fixed;
        inset: 0;
        z-index: -1;
        pointer-events: none;
        background-image: ${bgImage};
        background-size: ${bgSize};
        background-repeat: no-repeat;
        transition: opacity 0.5s;
      }
      ${animationCss}
    `

    if (!style) {
      style = document.createElement('style')
      style.id = id
      document.head.appendChild(style)
    }
    style.textContent = css

    let layer = document.getElementById('gradient-bg-layer') as HTMLDivElement | null
    if (!layer) {
      layer = document.createElement('div')
      layer.id = 'gradient-bg-layer'
      layer.className = 'gradient-bg-layer'
      document.body.prepend(layer)
    } else {
      layer.className = 'gradient-bg-layer'
    }

    return () => {
      // cleanup is handled by next effect run
    }
  }, [
    a?.gradientEnabled,
    a?.gradientType,
    JSON.stringify(a?.gradientColors),
    a?.gradientAngle,
    a?.gradientAnimated,
    a?.gradientSpeed,
  ])

  return null
}
