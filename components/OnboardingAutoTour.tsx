'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  X, ChevronRight, ChevronLeft, 
  Home, Globe, CreditCard, ShoppingBag, History, User, Gift, Ticket, MessageSquare,
  ShoppingCart, Store, LayoutDashboard, Server, Users, Wallet, Check
} from 'lucide-react'

interface TourStep {
  id: string
  menuId: string
  icon: any
  label: string
  description: string
  color: string
}

const tourSteps: TourStep[] = [
  { id: '1', menuId: 'menu-home', icon: Home, label: 'หน้าแรก', description: 'กลับสู่หน้าหลัก เลือกเซิร์ฟเวอร์ VPN ที่ต้องการ', color: 'text-zinc-400' },
  { id: '2', menuId: 'menu-public-vless', icon: Globe, label: 'Free VLESS', description: 'ทดลองใช้ VPN ฟรี ไม่ต้องเติมเงิน', color: 'text-emerald-400' },
  { id: '3', menuId: 'menu-topup', icon: CreditCard, label: 'เติมเงินเข้าระบบ', description: 'เติมเงินขั้นต่ำ 50 บาท ผ่าน TrueMoney หรือสลิปธนาคาร', color: 'text-amber-400' },
  { id: '4', menuId: 'menu-profile-orders', icon: ShoppingBag, label: 'รายการสั่งซื้อ VPN', description: 'ดูประวัติการซื้อ VPN และจัดการบริการ', color: 'text-zinc-400' },
  { id: '5', menuId: 'menu-profile-topups', icon: History, label: 'ประวัติการเติมเงิน', description: 'ดูรายละเอียดการเติมเงินทั้งหมดของคุณ', color: 'text-zinc-400' },
  { id: '6', menuId: 'menu-profile', icon: User, label: 'ตั้งค่าโปรไฟล์', description: 'แก้ไขข้อมูลส่วนตัวและรหัสผ่าน', color: 'text-zinc-400' },
  { id: '7', menuId: 'menu-profile-referral', icon: Gift, label: 'เชิญเพื่อน', description: 'แนะนำเพื่อนรับ 20 บาท ต่อคน สะสมได้ไม่อั้น!', color: 'text-pink-400' },
  { id: '8', menuId: 'menu-tickets', icon: Ticket, label: 'ติดต่อแอดมิน', description: 'สร้างตั๋วติดต่อทีมงาน ตอบ 24/7', color: 'text-violet-400' },
  { id: '9', menuId: 'menu-chat', icon: MessageSquare, label: 'แชทสด', description: 'พูดคุยกับทีมงานได้ทันที ตอบไว', color: 'text-cyan-400' },
  { id: '10', menuId: 'menu-marketplace', icon: ShoppingCart, label: 'ตลาดซื้อขายพ่อค้า', description: 'ร้านค้าออนไลน์สำหรับตัวแทนจำหน่าย', color: 'text-emerald-400' },
]

interface OnboardingAutoTourProps {
  onComplete: () => void
  onMenuOpen: () => void
  menuRef: React.RefObject<HTMLDivElement | null>
}

export default function OnboardingAutoTour({ onComplete, onMenuOpen, menuRef }: OnboardingAutoTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [menuHighlight, setMenuHighlight] = useState<string | null>(null)
  const highlightRef = useRef<HTMLDivElement | null>(null)

  const step = tourSteps[currentStep]
  const isLastStep = currentStep === tourSteps.length - 1
  const progress = ((currentStep + 1) / tourSteps.length) * 100

  useEffect(() => {
    const timer = setTimeout(() => {
      onMenuOpen()
      setIsVisible(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [onMenuOpen])

  useEffect(() => {
    if (isVisible && menuRef.current) {
      const menuElement = menuRef.current.querySelector(`[data-menu-id="${step.menuId}"]`)
      if (menuElement) {
        setMenuHighlight(step.menuId)
        menuElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [isVisible, step, menuRef])

  const handleNext = async () => {
    if (isLastStep) {
      try {
        await fetch('/api/user/onboarding', { method: 'POST' })
      } catch (error) {
        console.error('Failed to complete onboarding:', error)
      }
      onComplete()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSkip = async () => {
    try {
      await fetch('/api/user/onboarding', { method: 'POST' })
    } catch (error) {
      console.error('Failed to skip onboarding:', error)
    }
    onComplete()
  }

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[150] bg-black/50" />
      
      {/* Highlight Box */}
      {menuHighlight && (
        <div 
          ref={highlightRef}
          className="fixed z-[160] pointer-events-none"
          style={{
            top: '50%',
            left: '0',
            right: '0',
            height: '1px',
          }}
        />
      )}

      {/* Tour Card */}
      <div className="fixed bottom-0 left-0 right-0 z-[170] p-4 animate-slide-up">
        <div className="max-w-md mx-auto bg-zinc-900 border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/10">
          {/* Header */}
          <div className="p-5 pb-4">
            {/* Progress Bar */}
            <div className="h-1 bg-zinc-800 rounded-full mb-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Step Counter */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-zinc-500">
                {currentStep + 1} / {tourSteps.length}
              </p>
              <button
                onClick={handleSkip}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
                ข้าม
              </button>
            </div>

            {/* Content */}
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center flex-shrink-0 ${step.color}`}>
                <step.icon className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">{step.label}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3 p-4 pt-2 border-t border-white/5">
            {currentStep > 0 ? (
              <button
                onClick={handleBack}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                กลับ
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all text-sm"
            >
              {isLastStep ? (
                <>
                  <Check className="w-4 h-4" />
                  เสร็จสิ้น
                </>
              ) : (
                <>
                  ถัดไป
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 pb-4">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-4 bg-cyan-500'
                    : index < currentStep
                    ? 'bg-cyan-500/50'
                    : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </>
  )
}
