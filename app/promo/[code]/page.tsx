import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import PromoActivateClient from './PromoActivateClient'

interface Props {
  params: Promise<{ code: string }>
}

export default async function PromoPage({ params }: Props) {
  const { code } = await params

  // หาลิงก์โปร
  const promo = await prisma.promoLink.findUnique({
    where: { code },
  })

  // เช็คว่าโปรไม่มีอยู่ / ปิดอยู่ / หมดอายุ / เต็มจำนวน
  const isExpired = promo?.expiresAt ? new Date() > new Date(promo.expiresAt) : false
  const isFull = promo?.maxUsage !== null && promo?.maxUsage !== undefined ? promo.usageCount >= promo.maxUsage : false

  if (!promo || !promo.isActive || isExpired || isFull) {
    const errorMsg = !promo || !promo.isActive
      ? 'ลิงก์โปรนี้ไม่มีอยู่หรือถูกปิดแล้ว'
      : isExpired
        ? 'โปรนี้หมดอายุแล้ว'
        : 'โปรนี้ถูกใช้เต็มจำนวนแล้ว'

    return (
      <div className="min-h-dvh bg-transparent text-white flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center">
            <span className="text-4xl">x</span>
          </div>
          <h1 className="text-2xl font-black">ลิงก์ไม่ถูกต้อง</h1>
          <p className="text-zinc-500 text-sm">{errorMsg}</p>
          <a href="/" className="inline-block px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold hover:bg-white/10 transition-all">
            กลับหน้าหลัก
          </a>
        </div>
      </div>
    )
  }

  // เช็ค session
  const session = await getSession()
  
  if (!session.isLoggedIn || !session.userId) {
    // ยังไม่ล็อกอิน -> redirect ไปล็อกอินก่อน แล้วกลับมา
    redirect(`/login?redirect=/promo/${code}`)
  }

  // เช็คว่ารับไปแล้วหรือยัง
  const existingActivation = await prisma.promoActivation.findUnique({
    where: {
      promoId_userId: {
        promoId: promo.id,
        userId: session.userId,
      }
    }
  })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { promoDiscountPercent: true, promoLinkCode: true }
  })

  return (
    <PromoActivateClient 
      promo={{
        code: promo.code,
        name: promo.name,
        description: promo.description,
        discountPercent: promo.discountPercent,
      }}
      alreadyActivated={!!existingActivation}
      currentDiscount={user?.promoDiscountPercent || null}
    />
  )
}
