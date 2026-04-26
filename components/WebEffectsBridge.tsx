'use client'

import { useSettings } from '@/components/SettingsProvider'
import WebEffectsRenderer from '@/components/WebEffectsRenderer'
import CustomHtmlEffect from '@/components/CustomHtmlEffect'

type EffectType = 'none' | 'snow' | 'rain' | 'fireflies' | 'sakura' | 'bubbles' | 'matrix' | 'stars' | 'hearts' | 'confetti'
  | 'aurora' | 'lightning' | 'smoke' | 'embers' | 'leaves' | 'diamonds' | 'neon' | 'galaxy' | 'thunder' | 'goldDust'
  | 'jellyfish' | 'meteor' | 'dna' | 'pixel' | 'plasma' | 'lanterns' | 'dandelion' | 'glitch' | 'comet' | 'ripple'
  | 'crystals' | 'zodiac' | 'roses' | 'sparkle' | 'geometric' | 'feathers' | 'musicNotes' | 'butterflies' | 'fog' | 'fireworks'
  | 'songkran' | 'money'
  | 'customHtml'

const validEffects: EffectType[] = [
  'none', 'snow', 'rain', 'fireflies', 'sakura', 'bubbles', 'matrix', 'stars', 'hearts', 'confetti',
  'aurora', 'lightning', 'smoke', 'embers', 'leaves', 'diamonds', 'neon', 'galaxy', 'thunder', 'goldDust',
  'jellyfish', 'meteor', 'dna', 'pixel', 'plasma', 'lanterns', 'dandelion', 'glitch', 'comet', 'ripple',
  'crystals', 'zodiac', 'roses', 'sparkle', 'geometric', 'feathers', 'musicNotes', 'butterflies', 'fog', 'fireworks',
  'songkran', 'money',
  'customHtml',
]

export default function WebEffectsBridge() {
  const { settings } = useSettings()
  const effect = validEffects.includes(settings.webEffect as EffectType)
    ? (settings.webEffect as EffectType)
    : 'none'

  if (effect === 'none') return null

  // Custom HTML effect — render user-provided HTML overlay
  if (effect === 'customHtml') {
    const html = settings.webEffectCustomHtml
    if (!html) return null
    return <CustomHtmlEffect html={html} />
  }

  return <WebEffectsRenderer effect={effect} />
}
