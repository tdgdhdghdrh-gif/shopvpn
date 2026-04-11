'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  X,
  ChevronRight,
  ChevronLeft,
  Wallet,
  ShoppingBag,
  Zap,
  MessageSquare,
  Gift,
  Ticket,
  CheckCircle2,
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  highlight?: string
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'vpn',
    title: 'ซื้อ VPN',
    description: 'เลือกแพ็กเกจที่ต้องการ ราคาถูก ใช้งานง่าย รวดเร็ว',
    icon: <Zap className="w-8 h-8 text-yellow-400" />,
    highlight: '/vpn',
  },
  {
    id: 'marketplace',
    title: 'ร้านค้าออนไลน์',
    description: 'ซื้อสินค้าออนไลน์ได้เลย มีสินค้าหลากหลายให้เลือก',
    icon: <ShoppingBag className="w-8 h-8 text-blue-400" />,
    highlight: '/marketplace',
  },
  {
    id: 'topup',
    title: 'เติมเงิน',
    description: 'เติมเงินผ่าน TrueMoney Wallet หรือสลิปธนาคาร ขั้นต่ำ 50 บาท',
    icon: <Wallet className="w-8 h-8 text-green-400" />,
    highlight: '/topup',
  },
  {
    id: 'tickets',
    title: 'ตั๋วสนับสนุน',
    description: 'ติดต่อทีมงานได้ตลอด 24 ชั่วโมง รอบคอบ ปลอดภัย',
    icon: <Ticket className="w-8 h-8 text-purple-400" />,
    highlight: '/tickets',
  },
  {
    id: 'referral',
    title: 'แนะนำเพื่อน',
    description: 'แนะนำเพื่อนรับส่วนแบ่ง 20 บาท ต่อคน สะสมได้ไม่อั้น',
    icon: <Gift className="w-8 h-8 text-pink-400" />,
    highlight: '/profile/referral',
  },
  {
    id: 'chat',
    title: 'แชทสด',
    description: 'พูดคุยกับทีมงานได้ทันที ตอบไว มีมารยาท',
    icon: <MessageSquare className="w-8 h-8 text-cyan-400" />,
    highlight: '/chat',
  },
]

interface OnboardingProps {
  onComplete: () => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSkipping, setIsSkipping] = useState(false)

  const step = onboardingSteps[currentStep]
  const isLastStep = currentStep === onboardingSteps.length - 1
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100

  const handleNext = async () => {
    if (isLastStep) {
      setIsSkipping(true)
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

  const handleSkip = async () => {
    setIsSkipping(true)
    try {
      await fetch('/api/user/onboarding', { method: 'POST' })
    } catch (error) {
      console.error('Failed to skip onboarding:', error)
    }
    onComplete()
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="relative p-6 pb-4">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Step Counter */}
          <p className="text-xs text-zinc-500 mb-4">
            {currentStep + 1} / {onboardingSteps.length}
          </p>

          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-zinc-800/50 rounded-2xl flex items-center justify-center">
            {step.icon}
          </div>

          {/* Content */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-6 pt-4 border-t border-white/5">
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                กลับ
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isSkipping}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-500 hover:to-yellow-400 text-white font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
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

          {/* Skip All */}
          {!isLastStep && (
            <button
              onClick={handleSkip}
              className="w-full mt-3 text-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              ข้ามทั้งหมด
            </button>
          )}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 pb-4">
          {onboardingSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-6 bg-orange-500'
                  : index < currentStep
                  ? 'bg-orange-500/50'
                  : 'bg-zinc-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
