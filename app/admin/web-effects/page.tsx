'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import {
  Sparkles, Snowflake, CloudRain, Bug, Flower2, Circle,
  Binary, Star, Heart, PartyPopper, CheckCircle, Loader2,
  Save, Eye, Power, PowerOff, Monitor, Code2,
  CloudLightning, Wind, Flame, Leaf, Diamond, Zap, Globe,
  CloudDrizzle, Coins, Fish, MoveUpRight, Dna, Grid3x3, Atom,
  Lamp, Flower, ShieldAlert, Orbit, Waves, Gem, CircleDot,
  Shell, Feather, Music, Bird, CloudFog, Rocket,
  Shapes, Hexagon, SunMedium,
} from 'lucide-react'

type EffectId = 'none' | 'snow' | 'rain' | 'fireflies' | 'sakura' | 'bubbles' | 'matrix' | 'stars' | 'hearts' | 'confetti'
  | 'aurora' | 'lightning' | 'smoke' | 'embers' | 'leaves' | 'diamonds' | 'neon' | 'galaxy' | 'thunder' | 'goldDust'
  | 'jellyfish' | 'meteor' | 'dna' | 'pixel' | 'plasma' | 'lanterns' | 'dandelion' | 'glitch' | 'comet' | 'ripple'
  | 'crystals' | 'zodiac' | 'roses' | 'sparkle' | 'geometric' | 'feathers' | 'musicNotes' | 'butterflies' | 'fog' | 'fireworks'
  | 'customHtml'

interface EffectInfo {
  id: EffectId
  name: string
  nameTh: string
  desc: string
  icon: React.ElementType
  gradient: string
  border: string
  previewBg: string
}

const effects: EffectInfo[] = [
  {
    id: 'none',
    name: 'None',
    nameTh: 'ปิดเอฟเฟกต์',
    desc: 'ไม่แสดงเอฟเฟกต์ใดๆ บนหน้าเว็บ',
    icon: PowerOff,
    gradient: 'from-zinc-500 to-zinc-600',
    border: 'border-zinc-500',
    previewBg: 'bg-zinc-900',
  },
  {
    id: 'snow',
    name: 'Snow',
    nameTh: 'หิมะตก',
    desc: 'เกล็ดหิมะตกลงมาอย่างนุ่มนวล เหมาะกับฤดูหนาวหรือเทศกาลคริสต์มาส',
    icon: Snowflake,
    gradient: 'from-sky-400 to-blue-500',
    border: 'border-sky-400',
    previewBg: 'bg-gradient-to-b from-slate-900 to-blue-950',
  },
  {
    id: 'rain',
    name: 'Rain',
    nameTh: 'ฝนตก',
    desc: 'สายฝนตกลงมาเฉียงอย่างสมจริง บรรยากาศวันฝนพรำ',
    icon: CloudRain,
    gradient: 'from-blue-400 to-cyan-500',
    border: 'border-blue-400',
    previewBg: 'bg-gradient-to-b from-gray-900 to-slate-950',
  },
  {
    id: 'fireflies',
    name: 'Fireflies',
    nameTh: 'หิ่งห้อย',
    desc: 'แสงหิ่งห้อยลอยระยิบระยับ บรรยากาศยามค่ำคืนอันมหัศจรรย์',
    icon: Bug,
    gradient: 'from-yellow-400 to-amber-500',
    border: 'border-yellow-400',
    previewBg: 'bg-gradient-to-b from-gray-950 to-emerald-950',
  },
  {
    id: 'sakura',
    name: 'Sakura',
    nameTh: 'กลีบซากุระ',
    desc: 'กลีบดอกซากุระร่วงหล่น บรรยากาศดั่งฤดูใบไม้ผลิในญี่ปุ่น',
    icon: Flower2,
    gradient: 'from-pink-400 to-rose-500',
    border: 'border-pink-400',
    previewBg: 'bg-gradient-to-b from-pink-950 to-gray-950',
  },
  {
    id: 'bubbles',
    name: 'Bubbles',
    nameTh: 'ฟองสบู่',
    desc: 'ฟองสบู่ลอยขึ้นเบาๆ บรรยากาศสดใส สนุกสนาน',
    icon: Circle,
    gradient: 'from-cyan-400 to-teal-500',
    border: 'border-cyan-400',
    previewBg: 'bg-gradient-to-b from-teal-950 to-gray-950',
  },
  {
    id: 'matrix',
    name: 'Matrix',
    nameTh: 'ตัวอักษร Matrix',
    desc: 'ตัวอักษรญี่ปุ่นตกลงมาสไตล์ The Matrix สุดล้ำ',
    icon: Binary,
    gradient: 'from-green-400 to-emerald-600',
    border: 'border-green-400',
    previewBg: 'bg-black',
  },
  {
    id: 'stars',
    name: 'Stars',
    nameTh: 'ดาวระยิบ',
    desc: 'ดาวกะพริบบนท้องฟ้า บรรยากาศยามราตรีอันสวยงาม',
    icon: Star,
    gradient: 'from-indigo-400 to-purple-500',
    border: 'border-indigo-400',
    previewBg: 'bg-gradient-to-b from-indigo-950 to-gray-950',
  },
  {
    id: 'hearts',
    name: 'Hearts',
    nameTh: 'หัวใจลอย',
    desc: 'หัวใจลอยขึ้นอย่างโรแมนติก เหมาะกับวาเลนไทน์หรือเทศกาลแห่งความรัก',
    icon: Heart,
    gradient: 'from-red-400 to-pink-500',
    border: 'border-red-400',
    previewBg: 'bg-gradient-to-b from-red-950 to-gray-950',
  },
  {
    id: 'confetti',
    name: 'Confetti',
    nameTh: 'กระดาษสีตก',
    desc: 'กระดาษสีหลากสีตกลงมาฉลองเทศกาล ปาร์ตี้สุดมันส์',
    icon: PartyPopper,
    gradient: 'from-orange-400 to-yellow-500',
    border: 'border-orange-400',
    previewBg: 'bg-gradient-to-b from-violet-950 to-gray-950',
  },

  // ======== 30 NEW EFFECTS ========

  {
    id: 'aurora',
    name: 'Aurora',
    nameTh: 'แสงเหนือ',
    desc: 'แสงเหนือออโรร่าเต้นระยิบระยับบนท้องฟ้า สีสันอันตระการตา',
    icon: SunMedium,
    gradient: 'from-emerald-400 to-cyan-500',
    border: 'border-emerald-400',
    previewBg: 'bg-gradient-to-b from-emerald-950 to-indigo-950',
  },
  {
    id: 'lightning',
    name: 'Lightning',
    nameTh: 'สายฟ้าแลบ',
    desc: 'สายฟ้าฟาดข้ามท้องฟ้า บรรยากาศสุดอลังการ',
    icon: Zap,
    gradient: 'from-yellow-300 to-amber-500',
    border: 'border-yellow-300',
    previewBg: 'bg-gradient-to-b from-slate-950 to-gray-950',
  },
  {
    id: 'smoke',
    name: 'Smoke',
    nameTh: 'ควันลอย',
    desc: 'ม่านควันลอยขึ้นช้าๆ อย่างนุ่มนวล บรรยากาศลึกลับ',
    icon: Wind,
    gradient: 'from-gray-400 to-gray-600',
    border: 'border-gray-400',
    previewBg: 'bg-gradient-to-b from-gray-950 to-slate-950',
  },
  {
    id: 'embers',
    name: 'Embers',
    nameTh: 'ประกายไฟ',
    desc: 'ประกายไฟลอยขึ้นจากกองไฟ เรืองแสงอุ่นในความมืด',
    icon: Flame,
    gradient: 'from-orange-500 to-red-600',
    border: 'border-orange-500',
    previewBg: 'bg-gradient-to-b from-orange-950 to-gray-950',
  },
  {
    id: 'leaves',
    name: 'Autumn Leaves',
    nameTh: 'ใบไม้ร่วง',
    desc: 'ใบไม้สีสันฤดูใบไม้ร่วงปลิวลงมาอย่างงดงาม',
    icon: Leaf,
    gradient: 'from-amber-500 to-orange-600',
    border: 'border-amber-500',
    previewBg: 'bg-gradient-to-b from-amber-950 to-gray-950',
  },
  {
    id: 'diamonds',
    name: 'Diamonds',
    nameTh: 'เพชรระยิบ',
    desc: 'เพชรเจียระไนส่องประกาย หรูหรา ล้ำค่า',
    icon: Diamond,
    gradient: 'from-sky-300 to-blue-400',
    border: 'border-sky-300',
    previewBg: 'bg-gradient-to-b from-blue-950 to-slate-950',
  },
  {
    id: 'neon',
    name: 'Neon Glow',
    nameTh: 'แสงนีออน',
    desc: 'แสงนีออนสุดล้ำลอยเลื่อนพร้อมทิ้งหาง สไตล์ไซเบอร์พังค์',
    icon: Zap,
    gradient: 'from-fuchsia-500 to-violet-500',
    border: 'border-fuchsia-500',
    previewBg: 'bg-gradient-to-b from-fuchsia-950 to-gray-950',
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    nameTh: 'กาแล็กซี',
    desc: 'ฝุ่นดาวหมุนเป็นวงกาแล็กซีสุดอลังการ จักรวาลบนเว็บคุณ',
    icon: Globe,
    gradient: 'from-purple-400 to-indigo-600',
    border: 'border-purple-400',
    previewBg: 'bg-gradient-to-b from-purple-950 to-black',
  },
  {
    id: 'thunder',
    name: 'Thunder Rain',
    nameTh: 'ฝนฟ้าคะนอง',
    desc: 'ฝนตกหนักพร้อมฟ้าแลบฟ้าร้อง บรรยากาศสุดดราม่าติก',
    icon: CloudLightning,
    gradient: 'from-slate-400 to-blue-600',
    border: 'border-slate-400',
    previewBg: 'bg-gradient-to-b from-slate-950 to-blue-950',
  },
  {
    id: 'goldDust',
    name: 'Gold Dust',
    nameTh: 'ผงทอง',
    desc: 'ผงทองเปล่งประกายระยิบระยับ หรูหราราวกับเทพนิยาย',
    icon: Coins,
    gradient: 'from-yellow-400 to-yellow-600',
    border: 'border-yellow-400',
    previewBg: 'bg-gradient-to-b from-yellow-950 to-gray-950',
  },
  {
    id: 'jellyfish',
    name: 'Jellyfish',
    nameTh: 'แมงกะพรุน',
    desc: 'แมงกะพรุนเรืองแสงลอยขึ้น สวยงามลึกลับดั่งใต้ท้องทะเลลึก',
    icon: Fish,
    gradient: 'from-violet-400 to-pink-500',
    border: 'border-violet-400',
    previewBg: 'bg-gradient-to-b from-violet-950 to-blue-950',
  },
  {
    id: 'meteor',
    name: 'Meteor Shower',
    nameTh: 'ฝนดาวตก',
    desc: 'ดาวตกพุ่งผ่านท้องฟ้าพร้อมหางยาวอันสวยงาม',
    icon: MoveUpRight,
    gradient: 'from-orange-300 to-amber-500',
    border: 'border-orange-300',
    previewBg: 'bg-gradient-to-b from-gray-950 to-indigo-950',
  },
  {
    id: 'dna',
    name: 'DNA Helix',
    nameTh: 'เกลียว DNA',
    desc: 'โครงสร้างเกลียว DNA หมุนตกลงมา สไตล์ไซไฟสุดเท่',
    icon: Dna,
    gradient: 'from-blue-400 to-pink-500',
    border: 'border-blue-400',
    previewBg: 'bg-gradient-to-b from-blue-950 to-pink-950',
  },
  {
    id: 'pixel',
    name: 'Pixel Rain',
    nameTh: 'พิกเซลตก',
    desc: 'บล็อกพิกเซลสีสันตกลงมาสไตล์เรโทรเกม 8-bit',
    icon: Grid3x3,
    gradient: 'from-green-400 to-blue-500',
    border: 'border-green-400',
    previewBg: 'bg-black',
  },
  {
    id: 'plasma',
    name: 'Plasma Orbs',
    nameTh: 'ลูกพลาสม่า',
    desc: 'ลูกพลังงานพลาสม่าลอยระเรื่อ สวยงามและลึกลับ',
    icon: Atom,
    gradient: 'from-fuchsia-400 to-blue-500',
    border: 'border-fuchsia-400',
    previewBg: 'bg-gradient-to-b from-fuchsia-950 to-blue-950',
  },
  {
    id: 'lanterns',
    name: 'Sky Lanterns',
    nameTh: 'โคมลอย',
    desc: 'โคมลอยเรืองแสงลอยขึ้นสู่ท้องฟ้า บรรยากาศลอยกระทง',
    icon: Lamp,
    gradient: 'from-orange-400 to-red-500',
    border: 'border-orange-400',
    previewBg: 'bg-gradient-to-b from-orange-950 to-slate-950',
  },
  {
    id: 'dandelion',
    name: 'Dandelion',
    nameTh: 'ดอกแดนดิไลออน',
    desc: 'เมล็ดดอกแดนดิไลออนลอยล่องไปตามสายลม อ่อนโยนนุ่มนวล',
    icon: Flower,
    gradient: 'from-white to-gray-300',
    border: 'border-gray-300',
    previewBg: 'bg-gradient-to-b from-teal-950 to-green-950',
  },
  {
    id: 'glitch',
    name: 'Glitch',
    nameTh: 'กลิตช์',
    desc: 'เอฟเฟกต์เส้นสัญญาณรบกวน สไตล์ดิจิตอลสุดล้ำ',
    icon: ShieldAlert,
    gradient: 'from-red-400 to-green-400',
    border: 'border-red-400',
    previewBg: 'bg-black',
  },
  {
    id: 'comet',
    name: 'Comet Trail',
    nameTh: 'ดาวหาง',
    desc: 'ดาวหางพุ่งผ่านท้องฟ้าพร้อมหางเรืองแสงยาว',
    icon: Orbit,
    gradient: 'from-cyan-300 to-blue-500',
    border: 'border-cyan-300',
    previewBg: 'bg-gradient-to-b from-gray-950 to-blue-950',
  },
  {
    id: 'ripple',
    name: 'Water Ripple',
    nameTh: 'ระลอกน้ำ',
    desc: 'วงน้ำกระเพื่อมขยายออก บรรยากาศสงบเงียบ เหมือนหยดน้ำบนผิวสระ',
    icon: Waves,
    gradient: 'from-blue-300 to-cyan-500',
    border: 'border-blue-300',
    previewBg: 'bg-gradient-to-b from-blue-950 to-slate-950',
  },
  {
    id: 'crystals',
    name: 'Crystals',
    nameTh: 'คริสตัล',
    desc: 'เกล็ดคริสตัลตกลงมาพร้อมประกายแสง สวยหรูดั่งเพชรพลอย',
    icon: Gem,
    gradient: 'from-cyan-300 to-purple-400',
    border: 'border-cyan-300',
    previewBg: 'bg-gradient-to-b from-cyan-950 to-purple-950',
  },
  {
    id: 'zodiac',
    name: 'Zodiac',
    nameTh: 'จักรราศี',
    desc: 'สัญลักษณ์จักรราศีทั้ง 12 ลอยตกอย่างศักดิ์สิทธิ์',
    icon: CircleDot,
    gradient: 'from-yellow-400 to-purple-500',
    border: 'border-yellow-400',
    previewBg: 'bg-gradient-to-b from-indigo-950 to-yellow-950',
  },
  {
    id: 'roses',
    name: 'Rose Petals',
    nameTh: 'กลีบกุหลาบ',
    desc: 'กลีบกุหลาบแดงร่วงหล่นอย่างโรแมนติก',
    icon: Shell,
    gradient: 'from-red-500 to-rose-600',
    border: 'border-red-500',
    previewBg: 'bg-gradient-to-b from-red-950 to-rose-950',
  },
  {
    id: 'sparkle',
    name: 'Sparkle Burst',
    nameTh: 'ประกายดาว',
    desc: 'ประกายดาว 4 แฉกระเบิดกะพริบสว่างไสว สุดอลังการ',
    icon: Sparkles,
    gradient: 'from-yellow-300 to-white',
    border: 'border-yellow-300',
    previewBg: 'bg-gradient-to-b from-gray-950 to-yellow-950',
  },
  {
    id: 'geometric',
    name: 'Geometric',
    nameTh: 'เรขาคณิต',
    desc: 'รูปทรงเรขาคณิตลอยตกสุดมินิมอล สามเหลี่ยม สี่เหลี่ยม หกเหลี่ยม',
    icon: Hexagon,
    gradient: 'from-teal-400 to-indigo-500',
    border: 'border-teal-400',
    previewBg: 'bg-gradient-to-b from-teal-950 to-indigo-950',
  },
  {
    id: 'feathers',
    name: 'Feathers',
    nameTh: 'ขนนก',
    desc: 'ขนนกลอยเลื่อนอ่อนโยนดั่งความฝัน เบาสบายตา',
    icon: Feather,
    gradient: 'from-gray-300 to-blue-300',
    border: 'border-gray-300',
    previewBg: 'bg-gradient-to-b from-blue-950 to-gray-950',
  },
  {
    id: 'musicNotes',
    name: 'Music Notes',
    nameTh: 'ตัวโน้ตดนตรี',
    desc: 'ตัวโน้ตดนตรีลอยขึ้นอย่างสดใส บรรยากาศแห่งเสียงเพลง',
    icon: Music,
    gradient: 'from-pink-400 to-purple-500',
    border: 'border-pink-400',
    previewBg: 'bg-gradient-to-b from-pink-950 to-purple-950',
  },
  {
    id: 'butterflies',
    name: 'Butterflies',
    nameTh: 'ผีเสื้อ',
    desc: 'ผีเสื้อกระพือปีกบินไปมาอย่างสวยงาม บรรยากาศสวนดอกไม้',
    icon: Bird,
    gradient: 'from-orange-400 to-pink-500',
    border: 'border-orange-400',
    previewBg: 'bg-gradient-to-b from-green-950 to-gray-950',
  },
  {
    id: 'fog',
    name: 'Fog',
    nameTh: 'หมอกหนา',
    desc: 'หมอกลอยผ่านหน้าจออย่างเชื่องช้า บรรยากาศลึกลับน่าค้นหา',
    icon: CloudFog,
    gradient: 'from-gray-400 to-slate-500',
    border: 'border-gray-400',
    previewBg: 'bg-gradient-to-b from-gray-900 to-slate-950',
  },
  {
    id: 'fireworks',
    name: 'Fireworks',
    nameTh: 'พลุไฟ',
    desc: 'พลุพุ่งขึ้นแล้วระเบิดเป็นประกายสีสัน ฉลองสุดยิ่งใหญ่',
    icon: Rocket,
    gradient: 'from-red-400 to-yellow-500',
    border: 'border-red-400',
    previewBg: 'bg-gradient-to-b from-gray-950 to-indigo-950',
  },
  {
    id: 'customHtml',
    name: 'Custom HTML',
    nameTh: 'HTML กำหนดเอง',
    desc: 'นำเข้า HTML/CSS/JS ของคุณเองเพื่อสร้างเอฟเฟกต์ที่ต้องการ ไร้ขีดจำกัด',
    icon: Code2,
    gradient: 'from-emerald-400 to-teal-500',
    border: 'border-emerald-400',
    previewBg: 'bg-gradient-to-b from-gray-950 to-emerald-950',
  },
]

// ===== Mini Canvas Preview =====
function EffectPreview({ effectId, bgClass }: { effectId: EffectId; bgClass: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  interface MiniParticle {
    x: number; y: number; vx: number; vy: number
    size: number; opacity: number; rotation: number; rSpeed: number
    color: string; char?: string; wobble: number; life: number; maxLife: number
    phase?: number; amplitude?: number; trail?: { x: number; y: number }[]
    pulseSpeed?: number
  }

  const createMini = useCallback((w: number, h: number, top = true): MiniParticle => {
    const base = {
      x: Math.random() * w, y: top ? -5 : Math.random() * h,
      vx: 0, vy: 0, size: 2, opacity: 0.5,
      rotation: 0, rSpeed: 0, color: '#fff',
      wobble: Math.random() * Math.PI * 2, life: 0, maxLife: 9999,
    }
    switch (effectId) {
      case 'snow': return { ...base, vy: 0.3 + Math.random() * 0.8, size: 1 + Math.random() * 2.5, opacity: 0.4 + Math.random() * 0.6 }
      case 'rain': return { ...base, vx: -0.5, vy: 4 + Math.random() * 6, size: 0.5 + Math.random(), opacity: 0.2 + Math.random() * 0.3, color: '#88ccff' }
      case 'fireflies': return { ...base, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, size: 1.5 + Math.random() * 2, maxLife: 100 + Math.random() * 150, color: ['#ffff00', '#ffd700', '#00ff88'][Math.floor(Math.random() * 3)] }
      case 'sakura': return { ...base, vx: 0.3 + Math.random() * 0.5, vy: 0.5 + Math.random() * 0.8, size: 3 + Math.random() * 4, rotation: Math.random() * 360, rSpeed: (Math.random() - 0.5) * 2, color: ['#ffb7c5', '#ff92a5', '#ffc0cb'][Math.floor(Math.random() * 3)] }
      case 'bubbles': return { ...base, y: h + 5, vy: -(0.3 + Math.random() * 0.8), size: 2 + Math.random() * 6, opacity: 0.15 + Math.random() * 0.25, color: '#88ddff' }
      case 'matrix': { const c = 'アイウ012ABC'; return { ...base, x: Math.floor(Math.random() * (w / 8)) * 8, vy: 1 + Math.random() * 2, size: 7, opacity: 0.4 + Math.random() * 0.6, color: '#00ff41', char: c[Math.floor(Math.random() * c.length)] } }
      case 'stars': return { ...base, y: Math.random() * h, size: 0.5 + Math.random() * 1.5, maxLife: 60 + Math.random() * 120, color: ['#ffffff', '#ffffcc', '#ccddff'][Math.floor(Math.random() * 3)] }
      case 'hearts': return { ...base, y: h + 5, vx: (Math.random() - 0.5) * 0.5, vy: -(0.5 + Math.random() * 1), size: 4 + Math.random() * 6, opacity: 0.3 + Math.random() * 0.4, color: ['#ff4466', '#ff6688', '#ff3355'][Math.floor(Math.random() * 3)] }
      case 'confetti': return { ...base, vx: (Math.random() - 0.5) * 1, vy: 0.5 + Math.random() * 1.5, size: 2 + Math.random() * 3, opacity: 0.6 + Math.random() * 0.4, rotation: Math.random() * 360, rSpeed: (Math.random() - 0.5) * 5, color: ['#ff3366', '#33ccff', '#ffcc00', '#66ff66', '#ff66ff'][Math.floor(Math.random() * 5)] }

      // 30 new mini previews
      case 'aurora': return { ...base, y: Math.random() * h * 0.3, size: 40 + Math.random() * 60, opacity: 0, maxLife: 150 + Math.random() * 200, color: ['#00ff88', '#00ddff', '#8844ff'][Math.floor(Math.random() * 3)] }
      case 'lightning': return { ...base, y: 0, opacity: 0, maxLife: 10 + Math.random() * 15, color: '#ccddff', phase: 0, amplitude: h * 0.6 }
      case 'smoke': return { ...base, y: h + 10, vy: -(0.2 + Math.random() * 0.4), size: 12 + Math.random() * 20, opacity: 0.06 + Math.random() * 0.06, color: '#999999' }
      case 'embers': return { ...base, y: h + 5, vx: (Math.random() - 0.5) * 0.8, vy: -(0.5 + Math.random() * 1.5), size: 1 + Math.random() * 2, opacity: 0.5 + Math.random() * 0.5, maxLife: 120 + Math.random() * 100, color: ['#ff4400', '#ff6600', '#ffaa00'][Math.floor(Math.random() * 3)] }
      case 'leaves': return { ...base, vx: 0.3 + Math.random() * 0.8, vy: 0.3 + Math.random() * 0.8, size: 4 + Math.random() * 5, rotation: Math.random() * 360, rSpeed: (Math.random() - 0.5) * 3, color: ['#cc5500', '#dd7700', '#aa3300', '#ee8800'][Math.floor(Math.random() * 4)] }
      case 'diamonds': return { ...base, vy: 0.3 + Math.random() * 0.6, size: 3 + Math.random() * 5, rotation: Math.random() * 360, rSpeed: (Math.random() - 0.5) * 2, color: ['#88ddff', '#aaeeff', '#ffffff'][Math.floor(Math.random() * 3)] }
      case 'neon': return { ...base, y: Math.random() * h, vx: (Math.random() - 0.5) * 1, vy: (Math.random() - 0.5) * 1, size: 1.5 + Math.random() * 2.5, maxLife: 80 + Math.random() * 100, color: ['#ff00ff', '#00ffff', '#ff0088', '#00ff44'][Math.floor(Math.random() * 4)], trail: [] }
      case 'galaxy': { const a = Math.random() * Math.PI * 2; const d = Math.random() * Math.min(w, h) * 0.35; return { ...base, x: w / 2 + Math.cos(a) * d, y: h / 2 + Math.sin(a) * d, size: 0.5 + Math.random() * 1.5, opacity: 0.3 + Math.random() * 0.5, color: ['#8888ff', '#ff88ff', '#88ffff', '#ffffff'][Math.floor(Math.random() * 4)], phase: a, amplitude: d } }
      case 'thunder': return { ...base, vx: -0.8, vy: 5 + Math.random() * 8, size: 0.5 + Math.random(), opacity: 0.2 + Math.random() * 0.3, color: '#88aadd' }
      case 'goldDust': return { ...base, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.3, vy: -(0.1 + Math.random() * 0.2), size: 0.8 + Math.random() * 1.5, maxLife: 80 + Math.random() * 120, color: ['#ffd700', '#ffcc00', '#ffe066'][Math.floor(Math.random() * 3)] }
      case 'jellyfish': return { ...base, y: h + 15, vy: -(0.2 + Math.random() * 0.3), size: 8 + Math.random() * 12, opacity: 0.2 + Math.random() * 0.2, color: ['#ff66cc', '#66aaff', '#aa66ff'][Math.floor(Math.random() * 3)] }
      case 'meteor': return { ...base, x: Math.random() * w * 1.3, y: -5, vx: -(2 + Math.random() * 3), vy: 2 + Math.random() * 3, size: 1.5 + Math.random() * 2, opacity: 0.6 + Math.random() * 0.4, maxLife: 50 + Math.random() * 40, color: ['#ffffff', '#ffddaa'][Math.floor(Math.random() * 2)], trail: [] }
      case 'dna': return { ...base, x: w / 2, size: 2 + Math.random() * 2, vy: 0.3 + Math.random() * 0.6, color: ['#00aaff', '#ff4488'][Math.floor(Math.random() * 2)], phase: Math.random() * Math.PI * 2, amplitude: 20 + Math.random() * 30 }
      case 'pixel': return { ...base, x: Math.floor(Math.random() * (w / 6)) * 6, vy: 1 + Math.random() * 2, size: 4 + Math.floor(Math.random() * 2) * 2, opacity: 0.4 + Math.random() * 0.4, color: ['#ff0044', '#00ff44', '#0044ff', '#ffff00'][Math.floor(Math.random() * 4)] }
      case 'plasma': return { ...base, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, size: 8 + Math.random() * 15, maxLife: 100 + Math.random() * 150, color: ['#ff44ff', '#44aaff', '#ff8844'][Math.floor(Math.random() * 3)] }
      case 'lanterns': return { ...base, y: h + 10, vy: -(0.15 + Math.random() * 0.3), size: 6 + Math.random() * 8, opacity: 0.3 + Math.random() * 0.3, color: ['#ff6600', '#ff8833', '#ffaa00'][Math.floor(Math.random() * 3)] }
      case 'dandelion': return { ...base, vx: 0.2 + Math.random() * 0.4, vy: 0.1 + Math.random() * 0.2, size: 2 + Math.random() * 3, opacity: 0.3 + Math.random() * 0.4, rotation: Math.random() * 360, rSpeed: (Math.random() - 0.5) * 1 }
      case 'glitch': return { ...base, y: Math.random() * h, size: 10 + Math.random() * 40, opacity: 0, maxLife: 8 + Math.random() * 12, color: ['#ff0044', '#00ff44', '#0044ff'][Math.floor(Math.random() * 3)] }
      case 'comet': { const fl = Math.random() > 0.5; return { ...base, x: fl ? -10 : w + 10, y: Math.random() * h * 0.5, vx: fl ? (1.5 + Math.random() * 2) : -(1.5 + Math.random() * 2), vy: 0.3 + Math.random() * 0.8, size: 2 + Math.random() * 2, opacity: 0.7 + Math.random() * 0.3, maxLife: 80 + Math.random() * 60, color: ['#66ddff', '#aaeeff'][Math.floor(Math.random() * 2)], trail: [] } }
      case 'ripple': return { ...base, x: Math.random() * w, y: Math.random() * h, size: 0, opacity: 0.3, maxLife: 50 + Math.random() * 40, color: ['#44aaff', '#66ccff'][Math.floor(Math.random() * 2)] }
      case 'crystals': return { ...base, vy: 0.5 + Math.random() * 1, size: 3 + Math.random() * 5, rotation: Math.random() * 360, rSpeed: (Math.random() - 0.5) * 3, color: ['#88ddff', '#ddccff', '#ffccdd'][Math.floor(Math.random() * 3)] }
      case 'zodiac': { const sym = '\u2648\u2649\u264A\u264B\u264C\u264D\u264E\u264F\u2650\u2651\u2652\u2653'; return { ...base, vy: 0.2 + Math.random() * 0.5, size: 8 + Math.random() * 5, opacity: 0.2 + Math.random() * 0.3, color: ['#ffd700', '#ffaa00'][Math.floor(Math.random() * 2)], char: sym[Math.floor(Math.random() * sym.length)] } }
      case 'roses': return { ...base, vy: 0.3 + Math.random() * 0.7, size: 3 + Math.random() * 5, rotation: Math.random() * 360, rSpeed: (Math.random() - 0.5) * 2, color: ['#cc0033', '#ee1144', '#ff3366'][Math.floor(Math.random() * 3)] }
      case 'sparkle': return { ...base, y: Math.random() * h, size: 1.5 + Math.random() * 2.5, opacity: 0, maxLife: 25 + Math.random() * 35, color: ['#ffffff', '#ffff88', '#88ffff'][Math.floor(Math.random() * 3)], pulseSpeed: 0.1 + Math.random() * 0.08 }
      case 'geometric': return { ...base, vx: (Math.random() - 0.5) * 0.5, vy: 0.2 + Math.random() * 0.5, size: 5 + Math.random() * 10, opacity: 0.15 + Math.random() * 0.15, rotation: Math.random() * 360, rSpeed: (Math.random() - 0.5) * 1, color: ['#44aaff', '#ff4488', '#44ff88'][Math.floor(Math.random() * 3)], phase: Math.floor(Math.random() * 3) }
      case 'feathers': return { ...base, vy: 0.15 + Math.random() * 0.3, size: 4 + Math.random() * 6, opacity: 0.25 + Math.random() * 0.3, rotation: Math.random() * 360, rSpeed: (Math.random() - 0.5) * 1.5, color: ['#ffffff', '#eeeedd', '#ffeeee'][Math.floor(Math.random() * 3)] }
      case 'musicNotes': { const notes = ['\u266A', '\u266B', '\u2669']; return { ...base, y: h + 5, vx: (Math.random() - 0.5) * 0.5, vy: -(0.5 + Math.random() * 0.8), size: 8 + Math.random() * 5, opacity: 0.3 + Math.random() * 0.4, color: ['#ff66aa', '#66aaff', '#ffaa33'][Math.floor(Math.random() * 3)], char: notes[Math.floor(Math.random() * notes.length)] } }
      case 'butterflies': return { ...base, y: Math.random() * h, vx: (Math.random() - 0.5) * 1, vy: (Math.random() - 0.5) * 0.3, size: 4 + Math.random() * 5, opacity: 0.3, maxLife: 200 + Math.random() * 200, color: ['#ff8844', '#ffaa22', '#ff6688', '#44aaff'][Math.floor(Math.random() * 4)], pulseSpeed: 0.12 + Math.random() * 0.1 }
      case 'fog': return { ...base, y: Math.random() * h, vx: 0.15 + Math.random() * 0.3, size: 30 + Math.random() * 50, opacity: 0, maxLife: 200 + Math.random() * 150, color: ['#cccccc', '#bbbbbb'][Math.floor(Math.random() * 2)] }
      case 'fireworks': return { ...base, y: h, vx: (Math.random() - 0.5) * 1.5, vy: -(2.5 + Math.random() * 3), size: 1.5, opacity: 0.8, maxLife: 40 + Math.random() * 20, color: ['#ff3366', '#33ccff', '#ffcc00', '#66ff66', '#ff66ff'][Math.floor(Math.random() * 5)], phase: 0, trail: [] }
      default: return base
    }
  }, [effectId])

  useEffect(() => {
    if (effectId === 'none') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 200
    canvas.height = 140
    const w = canvas.width, h = canvas.height

    let particles: MiniParticle[] = []
    const countMap: Partial<Record<EffectId, number>> = {
      rain: 40, matrix: 20, snow: 30, confetti: 25, thunder: 35,
      pixel: 20, galaxy: 30, dna: 20, embers: 20, neon: 12,
      aurora: 4, lightning: 3, smoke: 8, leaves: 15, diamonds: 12,
      goldDust: 20, jellyfish: 4, meteor: 6, plasma: 6, lanterns: 6,
      dandelion: 15, glitch: 8, comet: 4, ripple: 5, crystals: 15,
      zodiac: 10, roses: 12, sparkle: 18, geometric: 10, feathers: 10,
      musicNotes: 8, butterflies: 6, fog: 5, fireworks: 6,
    }
    const count = countMap[effectId] || 15
    for (let i = 0; i < count; i++) particles.push(createMini(w, h, false))

    let thunderFlash = 0
    let running = true
    const animate = () => {
      if (!running) return
      ctx.clearRect(0, 0, w, h)

      // Thunder flash
      if (effectId === 'thunder') {
        if (Math.random() < 0.008) thunderFlash = 5
        if (thunderFlash > 0) {
          ctx.fillStyle = `rgba(200,210,255,${thunderFlash * 0.03})`
          ctx.fillRect(0, 0, w, h)
          thunderFlash--
        }
      }

      const alive: MiniParticle[] = []
      for (const p of particles) {
        p.life++
        p.wobble += 0.03

        // Update
        let dead = false
        switch (effectId) {
          case 'snow': p.x += Math.sin(p.wobble) * 0.3; p.y += p.vy; if (p.y > h + 5) dead = true; break
          case 'rain': p.x += p.vx; p.y += p.vy; if (p.y > h + 10) dead = true; break
          case 'fireflies': {
            p.x += p.vx + Math.sin(p.wobble) * 0.2; p.y += p.vy + Math.cos(p.wobble * 1.3) * 0.2
            const lp = p.life / p.maxLife
            p.opacity = lp < 0.2 ? lp * 5 : lp > 0.8 ? (1 - lp) * 5 : 0.5 + Math.sin(p.life * 0.08) * 0.3
            if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1
            if (p.life >= p.maxLife) dead = true; break
          }
          case 'sakura': p.x += p.vx + Math.sin(p.wobble) * 0.8; p.y += p.vy; p.rotation += p.rSpeed; if (p.y > h + 10) dead = true; break
          case 'bubbles': p.x += Math.sin(p.wobble) * 0.3; p.y += p.vy; if (p.y < -10) dead = true; break
          case 'matrix': p.y += p.vy; p.opacity -= 0.004; if (p.y > h + 8 || p.opacity <= 0) dead = true; break
          case 'stars': { const lp2 = p.life / p.maxLife; p.opacity = lp2 < 0.3 ? lp2 / 0.3 : lp2 > 0.7 ? (1 - lp2) / 0.3 : 0.5 + Math.sin(p.life * 0.1) * 0.5; if (p.life >= p.maxLife) dead = true; break }
          case 'hearts': p.x += p.vx + Math.sin(p.wobble) * 0.3; p.y += p.vy; p.opacity -= 0.002; if (p.y < -15 || p.opacity <= 0) dead = true; break
          case 'confetti': p.x += p.vx; p.y += p.vy; p.vy += 0.01; p.rotation += p.rSpeed; if (p.y > h + 10) dead = true; break

          // 30 new mini updates
          case 'aurora': {
            p.x += Math.sin(p.wobble) * 0.3
            const ap = p.life / p.maxLife
            p.opacity = ap < 0.15 ? ap / 0.15 * 0.2 : ap > 0.85 ? (1 - ap) / 0.15 * 0.2 : 0.12 + Math.sin(p.life * 0.03) * 0.08
            if (p.life >= p.maxLife) dead = true; break
          }
          case 'lightning': {
            const lp3 = p.life / p.maxLife
            p.opacity = lp3 < 0.15 ? 0.6 : lp3 < 0.3 ? 0.1 : lp3 < 0.4 ? 0.5 : Math.max(0, 0.5 * (1 - lp3))
            if (p.life >= p.maxLife) dead = true; break
          }
          case 'smoke': {
            p.x += Math.sin(p.wobble) * 0.2; p.y += p.vy; p.size += 0.08; p.opacity -= 0.0004
            if (p.y < -p.size || p.opacity <= 0) dead = true; break
          }
          case 'embers': {
            p.x += p.vx + Math.sin(p.wobble) * 0.5; p.y += p.vy
            const ep = p.life / p.maxLife
            if (ep > 0.7) p.opacity = (1 - ep) / 0.3
            if (p.life >= p.maxLife) dead = true; break
          }
          case 'leaves': {
            p.x += p.vx + Math.sin(p.wobble) * 1.2; p.y += p.vy; p.rotation += p.rSpeed
            if (p.y > h + 15) dead = true; break
          }
          case 'diamonds': {
            p.x += Math.sin(p.wobble) * 0.2; p.y += p.vy; p.rotation += p.rSpeed
            if (p.y > h + 10) dead = true; break
          }
          case 'neon': {
            p.x += p.vx + Math.sin(p.wobble) * 0.3; p.y += p.vy + Math.cos(p.wobble * 0.7) * 0.3
            if (!p.trail) p.trail = []; p.trail.push({ x: p.x, y: p.y }); if (p.trail.length > 8) p.trail.shift()
            const np = p.life / p.maxLife
            p.opacity = np < 0.2 ? np * 5 : np > 0.8 ? (1 - np) * 5 : 0.5 + Math.sin(p.life * 0.1) * 0.3
            if (p.x < -10 || p.x > w + 10) p.vx *= -1; if (p.y < -10 || p.y > h + 10) p.vy *= -1
            if (p.life >= p.maxLife) dead = true; break
          }
          case 'galaxy': {
            p.wobble += 0.002
            const cx = w / 2, cy = h / 2
            const newA = (p.phase || 0) + p.wobble
            p.x = cx + Math.cos(newA) * (p.amplitude || 50)
            p.y = cy + Math.sin(newA) * (p.amplitude || 50)
            p.opacity = 0.3 + Math.sin(p.life * 0.04) * 0.2
            break
          }
          case 'thunder': {
            p.x += p.vx; p.y += p.vy; if (p.y > h + 10) dead = true; break
          }
          case 'goldDust': {
            p.x += p.vx + Math.sin(p.wobble) * 0.2; p.y += p.vy
            const gp = p.life / p.maxLife
            p.opacity = gp < 0.2 ? gp * 5 * 0.5 : gp > 0.8 ? (1 - gp) * 5 * 0.5 : 0.3 + Math.sin(p.life * 0.08) * 0.2
            if (p.life >= p.maxLife) dead = true; break
          }
          case 'jellyfish': {
            p.x += Math.sin(p.wobble) * 0.3; p.y += p.vy + Math.sin(p.life * 0.03) * 0.1
            if (p.y < -p.size) dead = true; break
          }
          case 'meteor': {
            p.x += p.vx; p.y += p.vy
            if (!p.trail) p.trail = []; p.trail.push({ x: p.x, y: p.y }); if (p.trail.length > 12) p.trail.shift()
            const mp = p.life / p.maxLife
            if (mp > 0.7) p.opacity = (1 - mp) / 0.3
            if (p.life >= p.maxLife || p.x < -30 || p.y > h + 30) dead = true; break
          }
          case 'dna': {
            p.x = w / 2 + Math.sin(p.wobble + (p.phase || 0)) * (p.amplitude || 25)
            p.y += p.vy
            if (p.y > h + 5) dead = true; break
          }
          case 'pixel': {
            p.y += p.vy; p.opacity -= 0.003
            if (p.y > h + 5 || p.opacity <= 0) dead = true; break
          }
          case 'plasma': {
            p.x += p.vx + Math.sin(p.wobble) * 0.3; p.y += p.vy + Math.cos(p.wobble * 0.8) * 0.3
            const pp = p.life / p.maxLife
            p.opacity = pp < 0.15 ? pp / 0.15 * 0.15 : pp > 0.85 ? (1 - pp) / 0.15 * 0.15 : 0.1 + Math.sin(p.life * 0.04) * 0.05
            if (p.x < -5 || p.x > w + 5) p.vx *= -1; if (p.y < -5 || p.y > h + 5) p.vy *= -1
            if (p.life >= p.maxLife) dead = true; break
          }
          case 'lanterns': {
            p.x += Math.sin(p.wobble) * 0.2; p.y += p.vy
            if (p.y < -p.size) dead = true; break
          }
          case 'dandelion': {
            p.x += p.vx + Math.sin(p.wobble) * 0.3; p.y += p.vy + Math.sin(p.wobble * 0.7) * 0.1
            p.rotation += p.rSpeed
            if (p.x > w + 10 || p.y > h + 10) dead = true; break
          }
          case 'glitch': {
            const gp2 = p.life / p.maxLife
            p.opacity = gp2 < 0.1 ? 0.3 : gp2 < 0.3 ? Math.random() * 0.2 : gp2 < 0.5 ? 0.25 : Math.max(0, (1 - gp2) * 0.25)
            p.x += (Math.random() - 0.5) * 2
            if (p.life >= p.maxLife) dead = true; break
          }
          case 'comet': {
            p.x += p.vx; p.y += p.vy
            if (!p.trail) p.trail = []; p.trail.push({ x: p.x, y: p.y }); if (p.trail.length > 15) p.trail.shift()
            const cp = p.life / p.maxLife
            if (cp > 0.7) p.opacity = (1 - cp) / 0.3
            if (p.life >= p.maxLife) dead = true; break
          }
          case 'ripple': {
            p.size += 0.5
            p.opacity = (1 - p.life / p.maxLife) * 0.3
            if (p.life >= p.maxLife) dead = true; break
          }
          case 'crystals': {
            p.y += p.vy; p.rotation += p.rSpeed
            if (p.y > h + 10) dead = true; break
          }
          case 'zodiac': {
            p.x += Math.sin(p.wobble) * 0.2; p.y += p.vy; p.opacity -= 0.001
            if (p.y > h + 10 || p.opacity <= 0) dead = true; break
          }
          case 'roses': {
            p.x += Math.sin(p.wobble) * 0.8; p.y += p.vy; p.rotation += p.rSpeed
            if (p.y > h + 10) dead = true; break
          }
          case 'sparkle': {
            const sp = p.life / p.maxLife
            p.opacity = sp < 0.3 ? sp / 0.3 : sp > 0.6 ? (1 - sp) / 0.4 : 0.7 + Math.sin(p.life * (p.pulseSpeed || 0.12)) * 0.2
            p.rotation += p.rSpeed
            if (p.life >= p.maxLife) dead = true; break
          }
          case 'geometric': {
            p.x += p.vx; p.y += p.vy; p.rotation += p.rSpeed
            if (p.y > h + 15) dead = true; break
          }
          case 'feathers': {
            p.x += Math.sin(p.wobble) * 1; p.y += p.vy + Math.sin(p.wobble * 0.5) * 0.1
            p.rotation += p.rSpeed
            if (p.y > h + 10) dead = true; break
          }
          case 'musicNotes': {
            p.x += p.vx + Math.sin(p.wobble) * 0.5; p.y += p.vy; p.opacity -= 0.002
            if (p.y < -15 || p.opacity <= 0) dead = true; break
          }
          case 'butterflies': {
            p.x += p.vx + Math.sin(p.wobble) * 1; p.y += p.vy + Math.cos(p.wobble * 0.7) * 0.5
            if (Math.random() < 0.008) { p.vx = (Math.random() - 0.5) * 1; p.vy = (Math.random() - 0.5) * 0.3 }
            if (p.x < -10) p.x = w + 5; if (p.x > w + 10) p.x = -5
            if (p.y < -10) p.y = h + 5; if (p.y > h + 10) p.y = -5
            if (p.life >= p.maxLife) dead = true; break
          }
          case 'fog': {
            p.x += p.vx
            const fp = p.life / p.maxLife
            p.opacity = fp < 0.2 ? fp / 0.2 * 0.06 : fp > 0.8 ? (1 - fp) / 0.2 * 0.06 : 0.04 + Math.sin(p.life * 0.015) * 0.02
            if (p.x > w + p.size) p.x = -p.size
            if (p.life >= p.maxLife) dead = true; break
          }
          case 'fireworks': {
            if ((p.phase || 0) === 0) {
              p.x += p.vx * 0.3; p.y += p.vy; p.vy += 0.06
              if (!p.trail) p.trail = []; p.trail.push({ x: p.x, y: p.y }); if (p.trail.length > 5) p.trail.shift()
              if (p.vy >= -0.5) { p.phase = 1; p.size = 15 + Math.random() * 10 }
            } else {
              p.opacity -= 0.02
            }
            if (p.life >= p.maxLife || p.opacity <= 0) dead = true; break
          }
        }

        if (!dead) {
          // Draw
          ctx.save()
          ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity))
          switch (effectId) {
            case 'snow': {
              const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
              g.addColorStop(0, 'rgba(255,255,255,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0)')
              ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
              break
            }
            case 'rain': {
              ctx.strokeStyle = p.color; ctx.lineWidth = p.size; ctx.lineCap = 'round'
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx, p.y + p.vy * 0.8); ctx.stroke()
              break
            }
            case 'fireflies': {
              const g2 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
              g2.addColorStop(0, p.color); g2.addColorStop(0.5, p.color + '40'); g2.addColorStop(1, 'transparent')
              ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2); ctx.fill()
              break
            }
            case 'sakura': {
              ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180); ctx.fillStyle = p.color
              for (let i2 = 0; i2 < 5; i2++) { ctx.beginPath(); ctx.ellipse(0, -p.size * 0.25, p.size * 0.2, p.size * 0.35, 0, 0, Math.PI * 2); ctx.fill(); ctx.rotate(Math.PI * 2 / 5) }
              break
            }
            case 'bubbles': {
              ctx.strokeStyle = p.color; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.stroke()
              ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.15, 0, Math.PI * 2); ctx.fill()
              break
            }
            case 'matrix': {
              ctx.font = `${p.size}px monospace`; ctx.fillStyle = p.color; ctx.fillText(p.char || '0', p.x, p.y)
              break
            }
            case 'stars': {
              const g3 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2)
              g3.addColorStop(0, p.color); g3.addColorStop(0.5, p.color + '30'); g3.addColorStop(1, 'transparent')
              ctx.fillStyle = g3; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2); ctx.fill()
              break
            }
            case 'hearts': {
              ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180); ctx.fillStyle = p.color
              const s2 = p.size * 0.04
              ctx.beginPath(); ctx.moveTo(0, s2 * 5)
              ctx.bezierCurveTo(0, s2 * 3, -s2 * 8, s2 * 1, -s2 * 8, -s2 * 2)
              ctx.bezierCurveTo(-s2 * 8, -s2 * 6, -s2 * 3, -s2 * 8, 0, -s2 * 5)
              ctx.bezierCurveTo(s2 * 3, -s2 * 8, s2 * 8, -s2 * 6, s2 * 8, -s2 * 2)
              ctx.bezierCurveTo(s2 * 8, s2 * 1, 0, s2 * 3, 0, s2 * 5)
              ctx.fill()
              break
            }
            case 'confetti': {
              ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180)
              ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
              break
            }

            // 30 new mini draws
            case 'aurora': {
              const grd = ctx.createLinearGradient(p.x - p.size, p.y, p.x + p.size, p.y + p.size * 0.4)
              grd.addColorStop(0, 'transparent'); grd.addColorStop(0.3, p.color + '30'); grd.addColorStop(0.5, p.color + '50'); grd.addColorStop(0.7, p.color + '30'); grd.addColorStop(1, 'transparent')
              ctx.fillStyle = grd; ctx.beginPath(); ctx.moveTo(p.x - p.size, p.y)
              for (let i = 0; i <= 10; i++) ctx.lineTo(p.x - p.size + (p.size * 2 * i / 10), p.y + Math.sin(p.wobble + i * 0.5) * 10)
              for (let i = 10; i >= 0; i--) ctx.lineTo(p.x - p.size + (p.size * 2 * i / 10), p.y + p.size * 0.3 + Math.sin(p.wobble + i * 0.5 + 1) * 8)
              ctx.closePath(); ctx.fill()
              break
            }
            case 'lightning': {
              if (p.opacity < 0.05) break
              ctx.strokeStyle = p.color; ctx.lineWidth = 1.5
              ctx.beginPath(); let lx = p.x, ly = 0; ctx.moveTo(lx, ly)
              const segs = 5; const segH = (p.amplitude || 80) / segs
              for (let i = 1; i <= segs; i++) { lx += (Math.random() - 0.5) * 30; ly += segH; ctx.lineTo(lx, ly) }
              ctx.stroke()
              break
            }
            case 'smoke': {
              const sg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
              sg.addColorStop(0, p.color + '25'); sg.addColorStop(0.5, p.color + '12'); sg.addColorStop(1, 'transparent')
              ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
              break
            }
            case 'embers': {
              const eg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5)
              eg.addColorStop(0, p.color); eg.addColorStop(0.3, p.color + '60'); eg.addColorStop(1, 'transparent')
              ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2); ctx.fill()
              break
            }
            case 'leaves': {
              ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180); ctx.fillStyle = p.color
              ctx.beginPath(); ctx.moveTo(0, -p.size * 0.4)
              ctx.bezierCurveTo(p.size * 0.3, -p.size * 0.2, p.size * 0.3, p.size * 0.2, 0, p.size * 0.4)
              ctx.bezierCurveTo(-p.size * 0.3, p.size * 0.2, -p.size * 0.3, -p.size * 0.2, 0, -p.size * 0.4)
              ctx.fill()
              break
            }
            case 'diamonds': {
              ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180)
              const ds = p.size / 2; ctx.fillStyle = p.color + '50'
              ctx.beginPath(); ctx.moveTo(0, -ds); ctx.lineTo(ds * 0.7, 0); ctx.lineTo(0, ds); ctx.lineTo(-ds * 0.7, 0); ctx.closePath(); ctx.fill()
              ctx.strokeStyle = p.color; ctx.lineWidth = 0.3; ctx.stroke()
              break
            }
            case 'neon': {
              if (p.trail && p.trail.length > 1) {
                for (let i = 1; i < p.trail.length; i++) {
                  ctx.globalAlpha = Math.max(0, p.opacity * (i / p.trail.length) * 0.4)
                  ctx.strokeStyle = p.color; ctx.lineWidth = p.size * (i / p.trail.length)
                  ctx.beginPath(); ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y); ctx.lineTo(p.trail[i].x, p.trail[i].y); ctx.stroke()
                }
              }
              ctx.globalAlpha = Math.max(0, p.opacity)
              const ng = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2)
              ng.addColorStop(0, '#ffffff'); ng.addColorStop(0.3, p.color); ng.addColorStop(1, 'transparent')
              ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2); ctx.fill()
              break
            }
            case 'galaxy': {
              const gg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 1.5)
              gg.addColorStop(0, p.color); gg.addColorStop(0.5, p.color + '30'); gg.addColorStop(1, 'transparent')
              ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2); ctx.fill()
              break
            }
            case 'thunder': {
              ctx.strokeStyle = p.color; ctx.lineWidth = p.size; ctx.lineCap = 'round'
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx, p.y + p.vy * 0.8); ctx.stroke()
              break
            }
            case 'goldDust': {
              const gdg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2)
              gdg.addColorStop(0, p.color); gdg.addColorStop(0.4, p.color + '50'); gdg.addColorStop(1, 'transparent')
              ctx.fillStyle = gdg; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2); ctx.fill()
              break
            }
            case 'jellyfish': {
              const jS = p.size; const jpulse = Math.sin(p.wobble)
              ctx.fillStyle = p.color + '35'
              ctx.beginPath(); ctx.ellipse(p.x, p.y, jS * (0.7 + jpulse * 0.15), jS * 0.5, 0, Math.PI, 0); ctx.fill()
              ctx.strokeStyle = p.color + '25'; ctx.lineWidth = 0.5
              for (let t = 0; t < 3; t++) {
                const tx = p.x - jS * 0.4 + (jS * 0.8 * t / 2)
                ctx.beginPath(); ctx.moveTo(tx, p.y)
                ctx.lineTo(tx + Math.sin(p.wobble + t) * jS * 0.15, p.y + jS * 0.5)
                ctx.stroke()
              }
              break
            }
            case 'meteor': {
              if (p.trail && p.trail.length > 1) {
                for (let i = 1; i < p.trail.length; i++) {
                  const t = i / p.trail.length
                  ctx.globalAlpha = Math.max(0, p.opacity * t * 0.5)
                  ctx.strokeStyle = p.color; ctx.lineWidth = p.size * t
                  ctx.beginPath(); ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y); ctx.lineTo(p.trail[i].x, p.trail[i].y); ctx.stroke()
                }
              }
              ctx.globalAlpha = Math.max(0, p.opacity)
              const mg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 1.5)
              mg.addColorStop(0, '#ffffff'); mg.addColorStop(0.3, p.color); mg.addColorStop(1, 'transparent')
              ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2); ctx.fill()
              break
            }
            case 'dna': {
              ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
              break
            }
            case 'pixel': {
              ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size)
              break
            }
            case 'plasma': {
              const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
              pg.addColorStop(0, p.color + '40'); pg.addColorStop(0.5, p.color + '20'); pg.addColorStop(1, 'transparent')
              ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
              break
            }
            case 'lanterns': {
              const lg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 1.2)
              lg.addColorStop(0, p.color + '40'); lg.addColorStop(0.4, p.color + '20'); lg.addColorStop(1, 'transparent')
              ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2); ctx.fill()
              ctx.fillStyle = p.color + '70'
              ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size * 0.35, p.size * 0.45, 0, 0, Math.PI * 2); ctx.fill()
              break
            }
            case 'dandelion': {
              ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180)
              ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.2; ctx.fillStyle = '#ffffff'
              for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 * i) / 6; const len = p.size * 0.5
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len); ctx.stroke()
                ctx.beginPath(); ctx.arc(Math.cos(angle) * len, Math.sin(angle) * len, p.size * 0.08, 0, Math.PI * 2); ctx.fill()
              }
              break
            }
            case 'glitch': {
              ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, 1 + Math.random() * 2)
              break
            }
            case 'comet': {
              if (p.trail && p.trail.length > 1) {
                for (let i = 1; i < p.trail.length; i++) {
                  const t = i / p.trail.length; ctx.globalAlpha = Math.max(0, p.opacity * t * 0.3)
                  ctx.fillStyle = p.color + '50'; ctx.beginPath(); ctx.arc(p.trail[i].x, p.trail[i].y, p.size * t, 0, Math.PI * 2); ctx.fill()
                }
              }
              ctx.globalAlpha = Math.max(0, p.opacity)
              const cg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2)
              cg.addColorStop(0, '#ffffff'); cg.addColorStop(0.3, p.color); cg.addColorStop(1, 'transparent')
              ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2); ctx.fill()
              break
            }
            case 'ripple': {
              ctx.strokeStyle = p.color; ctx.lineWidth = 1
              for (let r = 0; r < 2; r++) {
                const rSize = p.size * (0.5 + r * 0.3)
                ctx.globalAlpha = Math.max(0, p.opacity * (1 - r * 0.3))
                ctx.beginPath(); ctx.arc(p.x, p.y, rSize, 0, Math.PI * 2); ctx.stroke()
              }
              break
            }
            case 'crystals': {
              ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180)
              const cs = p.size / 2; ctx.fillStyle = p.color + '35'; ctx.strokeStyle = p.color + '60'; ctx.lineWidth = 0.5
              ctx.beginPath()
              for (let i = 0; i < 6; i++) {
                const a = (Math.PI * 2 * i) / 6 - Math.PI / 2
                if (i === 0) ctx.moveTo(Math.cos(a) * cs, Math.sin(a) * cs)
                else ctx.lineTo(Math.cos(a) * cs, Math.sin(a) * cs)
              }
              ctx.closePath(); ctx.fill(); ctx.stroke()
              break
            }
            case 'zodiac': {
              ctx.font = `${p.size}px serif`; ctx.fillStyle = p.color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
              ctx.fillText(p.char || '\u2648', p.x, p.y)
              break
            }
            case 'roses': {
              ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180); ctx.fillStyle = p.color
              const rs = p.size * 0.35
              ctx.beginPath(); ctx.moveTo(0, -rs)
              ctx.bezierCurveTo(rs * 0.7, -rs * 0.5, rs * 0.9, rs * 0.3, 0, rs * 1)
              ctx.bezierCurveTo(-rs * 0.9, rs * 0.3, -rs * 0.7, -rs * 0.5, 0, -rs)
              ctx.fill()
              break
            }
            case 'sparkle': {
              ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180); ctx.fillStyle = p.color
              const sk = p.size
              ctx.beginPath(); ctx.moveTo(0, -sk); ctx.lineTo(sk * 0.12, -sk * 0.12); ctx.lineTo(sk, 0)
              ctx.lineTo(sk * 0.12, sk * 0.12); ctx.lineTo(0, sk); ctx.lineTo(-sk * 0.12, sk * 0.12)
              ctx.lineTo(-sk, 0); ctx.lineTo(-sk * 0.12, -sk * 0.12); ctx.closePath(); ctx.fill()
              break
            }
            case 'geometric': {
              ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180)
              ctx.strokeStyle = p.color; ctx.lineWidth = 0.8
              const gs = p.size / 2; const sides = (p.phase || 0) === 0 ? 3 : (p.phase || 0) === 1 ? 4 : 6
              ctx.beginPath()
              for (let i = 0; i <= sides; i++) {
                const a = (Math.PI * 2 * i) / sides - Math.PI / 2
                if (i === 0) ctx.moveTo(Math.cos(a) * gs, Math.sin(a) * gs)
                else ctx.lineTo(Math.cos(a) * gs, Math.sin(a) * gs)
              }
              ctx.closePath(); ctx.stroke()
              ctx.fillStyle = p.color + '10'; ctx.fill()
              break
            }
            case 'feathers': {
              ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180); ctx.fillStyle = p.color
              ctx.beginPath(); ctx.moveTo(0, -p.size * 0.4)
              ctx.bezierCurveTo(p.size * 0.15, -p.size * 0.15, p.size * 0.2, p.size * 0.15, 0, p.size * 0.4)
              ctx.bezierCurveTo(-p.size * 0.2, p.size * 0.15, -p.size * 0.15, -p.size * 0.15, 0, -p.size * 0.4)
              ctx.fill()
              break
            }
            case 'musicNotes': {
              ctx.font = `${p.size}px serif`; ctx.fillStyle = p.color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
              ctx.fillText(p.char || '\u266A', p.x, p.y)
              break
            }
            case 'butterflies': {
              ctx.translate(p.x, p.y)
              const flap = Math.sin(p.life * (p.pulseSpeed || 0.12)) * 0.6
              ctx.save(); ctx.scale(1, Math.cos(flap))
              ctx.fillStyle = p.color
              ctx.beginPath(); ctx.ellipse(-p.size * 0.25, 0, p.size * 0.3, p.size * 0.18, -0.3, 0, Math.PI * 2); ctx.fill()
              ctx.beginPath(); ctx.ellipse(p.size * 0.25, 0, p.size * 0.3, p.size * 0.18, 0.3, 0, Math.PI * 2); ctx.fill()
              ctx.restore()
              ctx.fillStyle = '#333'; ctx.beginPath(); ctx.ellipse(0, 0, p.size * 0.04, p.size * 0.15, 0, 0, Math.PI * 2); ctx.fill()
              break
            }
            case 'fog': {
              const fg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
              fg.addColorStop(0, p.color + '14'); fg.addColorStop(0.5, p.color + '0a'); fg.addColorStop(1, 'transparent')
              ctx.fillStyle = fg; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size, p.size * 0.35, 0, 0, Math.PI * 2); ctx.fill()
              break
            }
            case 'fireworks': {
              if ((p.phase || 0) === 0) {
                ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
              } else {
                const sparkCount = 8; const br = p.size * ((p.life - (p.maxLife * 0.5)) * 0.3)
                if (br > 0) {
                  for (let i = 0; i < sparkCount; i++) {
                    const angle = (Math.PI * 2 * i) / sparkCount
                    const sx = p.x + Math.cos(angle) * br; const sy = p.y + Math.sin(angle) * br
                    ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI * 2); ctx.fill()
                  }
                }
              }
              break
            }
          }
          ctx.restore()
          alive.push(p)
        }
      }
      particles = alive

      while (particles.length < count) particles.push(createMini(w, h, true))

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => { running = false; cancelAnimationFrame(animRef.current) }
  }, [effectId, createMini])

  if (effectId === 'none') {
    return (
      <div className="w-full h-[140px] rounded-lg bg-zinc-900 flex items-center justify-center">
        <PowerOff className="w-8 h-8 text-zinc-700" />
      </div>
    )
  }

  // Special preview for customHtml — show a code icon instead of canvas
  if (effectId === 'customHtml') {
    return (
      <div className={`relative w-full h-[140px] rounded-lg overflow-hidden ${bgClass}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="relative">
            <Code2 className="w-10 h-10 text-emerald-400/60" />
            <div className="absolute inset-0 animate-pulse">
              <Code2 className="w-10 h-10 text-emerald-400/30" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-emerald-500/50">&lt;/&gt;</span>
            <span className="text-[10px] text-zinc-600">Your code here</span>
          </div>
        </div>
        <div className="absolute bottom-2 left-3 right-3 space-y-1 opacity-20">
          <div className="h-1 w-3/4 bg-emerald-500/30 rounded-full" />
          <div className="h-1 w-1/2 bg-emerald-500/20 rounded-full" />
          <div className="h-1 w-2/3 bg-emerald-500/25 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full h-[140px] rounded-lg overflow-hidden relative ${bgClass}`}>
      <canvas ref={canvasRef} className="w-full h-full" style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

// ===== Main Page =====
export default function WebEffectsPage() {
  const [current, setCurrent] = useState<EffectId>('none')
  const [selected, setSelected] = useState<EffectId>('none')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [previewEffect, setPreviewEffect] = useState<EffectId | null>(null)
  const [customHtml, setCustomHtml] = useState('')
  const [savedCustomHtml, setSavedCustomHtml] = useState('')

  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        const eff = (data.settings?.webEffect || data.webEffect || 'none') as EffectId
        setCurrent(eff)
        setSelected(eff)
        // Load custom HTML from admin settings
        if (eff === 'customHtml') {
          fetch('/api/admin/settings')
            .then(r => r.json())
            .then(d => {
              const html = d.settings?.webEffectCustomHtml || ''
              setCustomHtml(html)
              setSavedCustomHtml(html)
            })
            .catch(() => {})
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Load custom HTML when switching to customHtml for the first time
  useEffect(() => {
    if (selected === 'customHtml' && !customHtml && !savedCustomHtml) {
      fetch('/api/admin/settings')
        .then(r => r.json())
        .then(d => {
          const html = d.settings?.webEffectCustomHtml || ''
          setCustomHtml(html)
          setSavedCustomHtml(html)
        })
        .catch(() => {})
    }
  }, [selected])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const getRes = await fetch('/api/admin/settings')
      const getData = await getRes.json()
      const currentSettings = getData.settings || {}

      const payload: Record<string, unknown> = { ...currentSettings, webEffect: selected }
      if (selected === 'customHtml') {
        payload.webEffectCustomHtml = customHtml
      }

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setCurrent(selected)
        setSavedCustomHtml(customHtml)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      // error
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = current !== selected || (selected === 'customHtml' && customHtml !== savedCustomHtml)
  const activePreview = previewEffect || selected

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-cyan-400" />
            </div>
            เอฟเฟกต์เว็บไซต์
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 ml-[46px]">เลือกเอฟเฟกต์พิเศษ 40 แบบ หรือนำเข้า HTML ของคุณเอง</p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            saved
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : hasChanges
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white shadow-lg shadow-cyan-500/20'
                : 'bg-zinc-900 border border-white/5 text-zinc-600 cursor-not-allowed'
          }`}
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...</>
          ) : saved ? (
            <><CheckCircle className="w-4 h-4" /> บันทึกแล้ว</>
          ) : (
            <><Save className="w-4 h-4" /> บันทึก</>
          )}
        </button>
      </div>

      {/* Currently Active */}
      <div className="mb-6 px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${effects.find(e => e.id === current)?.gradient || 'from-zinc-500 to-zinc-600'} flex items-center justify-center`}>
          {(() => {
            const Icon = effects.find(e => e.id === current)?.icon || PowerOff
            return <Icon className="w-4 h-4 text-white" />
          })()}
        </div>
        <div>
          <p className="text-[11px] text-zinc-500">เอฟเฟกต์ปัจจุบัน</p>
          <p className="text-sm font-bold text-white">
            {effects.find(e => e.id === current)?.nameTh || 'ปิดเอฟเฟกต์'}
          </p>
        </div>
        {current !== 'none' && (
          <div className="ml-auto flex items-center gap-1.5 text-emerald-400">
            <Power className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">กำลังทำงาน</span>
          </div>
        )}
        {hasChanges && (
          <div className="ml-auto flex items-center gap-1.5 text-amber-400">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-medium">มีการเปลี่ยนแปลง</span>
          </div>
        )}
      </div>

      {/* Effect Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {effects.map((eff) => {
          const isSelected = selected === eff.id
          const isCurrent = current === eff.id

          return (
            <button
              key={eff.id}
              onClick={() => setSelected(eff.id)}
              onMouseEnter={() => setPreviewEffect(eff.id)}
              onMouseLeave={() => setPreviewEffect(null)}
              className={`relative text-left rounded-2xl border-2 transition-all overflow-hidden group ${
                isSelected
                  ? `${eff.border}/40 bg-white/[0.03] shadow-lg`
                  : 'border-white/[0.06] hover:border-white/[0.15] bg-white/[0.01] hover:bg-white/[0.02]'
              }`}
            >
              {/* Active badge */}
              {isSelected && (
                <div className="absolute top-3 right-3 z-10">
                  <div className={`w-7 h-7 bg-gradient-to-r ${eff.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              {/* Currently in use badge */}
              {isCurrent && eff.id !== 'none' && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400">ACTIVE</span>
                </div>
              )}

              {/* Preview */}
              <div className="p-3 pb-0">
                <EffectPreview effectId={eff.id} bgClass={eff.previewBg} />
              </div>

              {/* Info */}
              <div className="p-4 pt-3">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br ${eff.gradient}/10 border border-white/[0.08] flex items-center justify-center`}>
                    <eff.icon className={`w-4.5 h-4.5 ${isSelected ? 'text-white' : 'text-zinc-400'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>{eff.nameTh}</h3>
                      <span className="text-[10px] text-zinc-600">{eff.name}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">{eff.desc}</p>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Custom HTML Editor */}
      {selected === 'customHtml' && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">HTML/CSS/JS Code Editor</h2>
            <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">Custom Effect</span>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-black/50 overflow-hidden">
            {/* Editor header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                <span className="text-[11px] text-zinc-400 font-mono">custom-effect.html</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-600">{customHtml.length} chars</span>
                {customHtml !== savedCustomHtml && (
                  <span className="text-[10px] text-amber-400 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    มีการแก้ไข
                  </span>
                )}
              </div>
            </div>

            {/* Code textarea */}
            <textarea
              value={customHtml}
              onChange={(e) => setCustomHtml(e.target.value)}
              placeholder={`<!-- วาง HTML/CSS/JS ของคุณที่นี่ -->\n<!-- ตัวอย่าง: เอฟเฟกต์หิมะแบบ CSS -->\n\n<style>\n.snowflake {\n  position: fixed;\n  color: white;\n  font-size: 1.5rem;\n  pointer-events: none;\n  animation: fall linear infinite;\n  z-index: 1;\n}\n@keyframes fall {\n  0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }\n  100% { transform: translateY(110vh) rotate(360deg); opacity: 0.3; }\n}\n</style>\n\n<div class="snowflake" style="left:10%;animation-duration:8s;animation-delay:0s">❄</div>\n<div class="snowflake" style="left:30%;animation-duration:12s;animation-delay:2s">❄</div>\n<div class="snowflake" style="left:50%;animation-duration:10s;animation-delay:1s">❄</div>\n<div class="snowflake" style="left:70%;animation-duration:9s;animation-delay:3s">❄</div>\n<div class="snowflake" style="left:90%;animation-duration:11s;animation-delay:0.5s">❄</div>`}
              spellCheck={false}
              className="w-full h-[400px] bg-black text-emerald-300 text-xs font-mono p-4 resize-y focus:outline-none focus:ring-0 placeholder:text-zinc-700 leading-relaxed"
              style={{ tabSize: 2 }}
            />

            {/* Helper tips */}
            <div className="px-4 py-3 bg-zinc-900/50 border-t border-zinc-800 space-y-1.5">
              <p className="text-[11px] text-zinc-500">
                <span className="text-emerald-400 font-bold">TIP:</span> วาง HTML, CSS (ใน {'<style>'}), และ JavaScript (ใน {'<script>'}) ได้เลย
              </p>
              <p className="text-[11px] text-zinc-500">
                <span className="text-emerald-400 font-bold">NOTE:</span> เอฟเฟกต์จะแสดงเป็น overlay แบบ <code className="text-zinc-400 bg-zinc-800 px-1 rounded">position: fixed</code> คลุมทั้งหน้า พร้อม <code className="text-zinc-400 bg-zinc-800 px-1 rounded">pointer-events: none</code>
              </p>
              <p className="text-[11px] text-zinc-500">
                <span className="text-amber-400 font-bold">WARNING:</span> ตรวจสอบโค้ดก่อนบันทึก — โค้ดจะถูกรันบนเว็บไซต์จริง
              </p>
            </div>
          </div>

          {/* Live preview of custom HTML */}
          {customHtml && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[11px] text-zinc-400 font-medium">ตัวอย่าง Custom HTML</span>
              </div>
              <div className="rounded-2xl border border-white/5 overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                  <div className="w-2 h-2 rounded-full bg-red-500/60" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                  <div className="w-2 h-2 rounded-full bg-green-500/60" />
                  <span className="text-[10px] text-zinc-600 ml-2 font-mono">preview</span>
                </div>
                <div className="relative h-[250px] bg-black overflow-hidden">
                  <iframe
                    srcDoc={`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;overflow:hidden;width:100%;height:100%}</style></head><body>${customHtml}</body></html>`}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                    title="Custom effect preview"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Large Preview */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-zinc-500" />
          <h2 className="text-sm font-bold text-white">ตัวอย่างขนาดใหญ่</h2>
          <span className="text-[11px] text-zinc-600">- {effects.find(e => e.id === activePreview)?.nameTh}</span>
        </div>

        <div className="rounded-2xl border border-white/5 overflow-hidden">
          {/* Desktop-like frame */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            <div className="flex-1 mx-8">
              <div className="bg-zinc-800 rounded-md px-3 py-1 text-[10px] text-zinc-500 text-center max-w-xs mx-auto flex items-center justify-center gap-1.5">
                <Monitor className="w-3 h-3" />
                simonvpn.darkx.shop
              </div>
            </div>
          </div>
          <div className="h-[300px] sm:h-[400px]">
            <EffectPreview effectId={activePreview} bgClass={effects.find(e => e.id === activePreview)?.previewBg || 'bg-zinc-900'} />
          </div>
        </div>
      </div>

      {/* Bottom save bar (sticky on mobile) */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-50 p-4 bg-zinc-950/90 backdrop-blur-xl border-t border-white/5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/20"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...</>
            ) : (
              <><Save className="w-4 h-4" /> บันทึกเอฟเฟกต์ - {effects.find(e => e.id === selected)?.nameTh}</>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
