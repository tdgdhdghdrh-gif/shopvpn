import { NextRequest } from 'next/server'
import { getSession, updateBalance, checkImpersonation } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { notifyTopup, notifyError } from '@/lib/telegram'

// Check and give referral reward
async function checkReferralReward(userId: string, amount: number) {
  try {
    // Only reward for topups >= 100
    if (amount < 100) return

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referredBy: true, name: true }
    })

    if (!user?.referredBy) return

    // Check if already rewarded for this user
    const existingReward = await prisma.referralHistory.findFirst({
      where: {
        referrerId: user.referredBy,
        referredId: userId,
        type: 'TOPUP_REWARD'
      }
    })

    if (existingReward) return // Already rewarded

    // Give 20 credit to referrer
    const updatedReferrer = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.referredBy },
        data: { 
          balance: { increment: 20 },
          totalReferralEarned: { increment: 20 }
        }
      }),
      prisma.referralHistory.create({
        data: {
          referrerId: user.referredBy,
          referredId: userId,
          referredName: user.name,
          amount: 20,
          type: 'TOPUP_REWARD'
        }
      })
    ])

    // Update referrer session balance - ใช้ยอด balance ล่าสุดจาก database
    // หมายเหตุ: ถ้า referrer คนละคนกับผู้เติมเงิน ไม่ต้องอัพเดท session ตรงนี้
    // เพราะ session ปัจจุบันเป็นของผู้เติมเงิน ไม่ใช่ referrer

  } catch (error) {
    console.error('Referral reward error:', error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.isLoggedIn || !session.userId) {
      return Response.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' })
    }

    // Block impersonation
    const impBlock = await checkImpersonation()
    if (impBlock) return impBlock

    const body = await req.json()
    const { type, url, imageUrl } = body

    if (type === 'wallet' && url) {
      // TrueMoney Wallet Gift
      const voucherCode = extractVoucherCode(url)
      if (!voucherCode) {
        return Response.json({ success: false, error: 'ลิงก์ซองเล็ทไม่ถูกต้อง' })
      }

      // Get settings
      const settings = await prisma.settings.findFirst()
      if (!settings?.truemoneyPhone || !settings?.truemoneyApiKey) {
        return Response.json({ success: false, error: 'ระบบเติมเงินยังไม่พร้อมใช้งาน' })
      }

      // Check for duplicate
      const existing = await prisma.topUp.findFirst({
        where: { reference: voucherCode }
      })
      if (existing) {
        return Response.json({ success: false, error: 'ซองเล็ทนี้ถูกใช้งานแล้ว' })
      }

      // Call API
      const apiUrl = `https://api.darkx.shop/tools/truemoney?code=${voucherCode}&phone=${settings.truemoneyPhone}`
      const apiRes = await fetch(apiUrl, {
        headers: { 'x-api-key': settings.truemoneyApiKey }
      })
      
      if (!apiRes.ok) {
        return Response.json({ success: false, error: 'ไม่สามารถตรวจสอบซองเล็ทได้' })
      }

      const apiData = await apiRes.json()
      console.log('TrueMoney API Response:', JSON.stringify(apiData, null, 2))

      // API response format: { status: true/false, msg: "...", amount: "60.00", raw_data: { voucher: { amount_baht: "60.00" } } }
      // Also support legacy format: { status: true, code: "SUCCESS", amount: { amount_baht: "60.00" } }
      if (!apiData.status) {
        console.log('Topup failed:', apiData.msg || 'Unknown error')
        return Response.json({ success: false, error: apiData.msg || 'ซองเล็ทหมดอายุหรือถูกใช้งานแล้ว' })
      }

      // Support both new format (amount as string) and legacy format (amount as object with amount_baht)
      let amount = 0
      if (typeof apiData.amount === 'string') {
        amount = parseFloat(apiData.amount)
      } else if (typeof apiData.amount === 'number') {
        amount = apiData.amount
      } else if (apiData.amount?.amount_baht) {
        amount = parseFloat(apiData.amount.amount_baht)
      } else if (apiData.raw_data?.voucher?.amount_baht) {
        amount = parseFloat(apiData.raw_data.voucher.amount_baht)
      }

      if (!amount || amount <= 0) {
        return Response.json({ success: false, error: 'ไม่พบยอดเงินในซองเล็ท' })
      }

      if (amount < (settings.minTopupAmount ?? 60)) {
        return Response.json({ success: false, error: `เติมเงินขั้นต่ำ ${settings.minTopupAmount ?? 60} บาท` })
      }

      // Create topup record and update balance
      await prisma.$transaction([
        prisma.topUp.create({
          data: {
            userId: session.userId,
            amount,
            method: 'WALLET',
            reference: voucherCode,
            status: 'SUCCESS'
          }
        }),
        prisma.user.update({
          where: { id: session.userId },
          data: { balance: { increment: amount } }
        })
      ])

      // Check referral reward
      await checkReferralReward(session.userId, amount)

      // Update session balance
      const updatedUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { balance: true }
      })

      if (updatedUser) {
        session.balance = updatedUser.balance
        await session.save()
      }

      // Notify admin
      const userInfo = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true } })
      await notifyTopup(userInfo?.name || 'ไม่ทราบ', amount, 'TrueMoney Wallet', updatedUser?.balance || 0)

      return Response.json({ 
        success: true, 
        amount, 
        newBalance: updatedUser?.balance || (session.balance || 0) + amount
      })

    } else if (type === 'slip' && imageUrl) {
      // Bank Slip Check
      const settings = await prisma.settings.findFirst()
      if (!settings?.slipApiKey) {
        return Response.json({ success: false, error: 'ระบบตรวจสอบสลิปยังไม่พร้อมใช้งาน' })
      }

      // Check for duplicate slip
      const existing = await prisma.topUp.findFirst({
        where: { slipUrl: imageUrl }
      })
      if (existing) {
        return Response.json({ success: false, error: 'สลิปนี้ถูกใช้งานแล้ว' })
      }

      // Call SlipCheck API
      const apiUrl = `https://api.darkx.shop/tools/slipcheck?image=${encodeURIComponent(imageUrl)}`
      const apiRes = await fetch(apiUrl, {
        headers: { 'x-api-key': settings.slipApiKey }
      })
      
      if (!apiRes.ok) {
        return Response.json({ success: false, error: 'ไม่สามารถตรวจสอบสลิปได้' })
      }

      const apiData = await apiRes.json()

      if (!apiData.status || !apiData.data) {
        return Response.json({ success: false, error: apiData.msg || 'ตรวจสอบสลิปไม่สำเร็จ' })
      }

      const slipData = apiData.data
      const amount = slipData['จำนวนเงิน']

      if (!amount || amount <= 0) {
        return Response.json({ success: false, error: 'ไม่พบยอดเงินในสลิป' })
      }

      if (amount < (settings.minTopupAmount ?? 60)) {
        return Response.json({ success: false, error: `เติมเงินขั้นต่ำ ${settings.minTopupAmount ?? 60} บาท` })
      }

      // Validate slip date - must be today
      const transactionDate = slipData['วันที่ทำรายการ']
      if (transactionDate) {
        const slipDate = new Date(transactionDate)
        const today = new Date()
        
        // Reset time to compare dates only
        const slipDateOnly = new Date(slipDate.getFullYear(), slipDate.getMonth(), slipDate.getDate())
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        
        if (slipDateOnly.getTime() !== todayOnly.getTime()) {
          return Response.json({ 
            success: false, 
            error: 'สลิปต้องเป็นวันที่วันนี้เท่านั้น ไม่รับสลิปย้อนหลัง' 
          })
        }
      }

      // Verify receiver name (optional validation)
      const receiverName = slipData['ผู้รับเงิน'] || ''
      const expectedName = settings.bankReceiverName || 'พันวิลา'
      
      if (!receiverName.toLowerCase().includes(expectedName.toLowerCase())) {
        return Response.json({ success: false, error: 'ชื่อผู้รับเงินไม่ตรงกับบัญชีระบบ' })
      }

      const transactionRef = slipData['รหัสอ้างอิง']

      // Check for duplicate transaction reference
      const existingRef = await prisma.topUp.findFirst({
        where: { reference: transactionRef }
      })
      if (existingRef) {
        return Response.json({ success: false, error: 'รายการนี้ถูกเติมเงินแล้ว' })
      }

      // Create topup record and update balance
      await prisma.$transaction([
        prisma.topUp.create({
          data: {
            userId: session.userId,
            amount,
            method: 'SLIP',
            reference: transactionRef,
            slipUrl: imageUrl,
            status: 'SUCCESS'
          }
        }),
        prisma.user.update({
          where: { id: session.userId },
          data: { balance: { increment: amount } }
        })
      ])

      // Check referral reward
      await checkReferralReward(session.userId, amount)

      // Update session balance
      const updatedUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { balance: true }
      })

      if (updatedUser) {
        session.balance = updatedUser.balance
        await session.save()
      }

      // Notify admin
      const userInfo2 = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true } })
      await notifyTopup(userInfo2?.name || 'ไม่ทราบ', amount, 'สลิปธนาคาร', updatedUser?.balance || 0)

      return Response.json({ 
        success: true, 
        amount, 
        newBalance: updatedUser?.balance || (session.balance || 0) + amount
      })

    } else {
      return Response.json({ success: false, error: 'กรุณาระบุข้อมูลให้ครบถ้วน' })
    }

  } catch (error) {
    console.error('Topup error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    await notifyError('ระบบเติมเงิน', errMsg)
    return Response.json({ success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' })
  }
}

function extractVoucherCode(url: string): string | null {
  try {
    const parsed = new URL(url)
    return parsed.searchParams.get('v')
  } catch {
    return null
  }
}
