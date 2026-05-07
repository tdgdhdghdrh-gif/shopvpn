import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get setup guide config (public, no auth required)
export async function GET() {
  try {
    let settings: any = null
    try {
      settings = await prisma.settings.findFirst()
    } catch {
      const rows: any[] = await prisma.$queryRaw`SELECT * FROM "Settings" LIMIT 1`
      settings = rows[0] || null
    }

    const defaultConfig = {
      heroTitle: 'โปรเสริมที่ต้องสมัคร',
      heroSubtitle: 'สมัครโปรเสริมก่อนใช้ VPN เพื่อความเสถียรสูงสุด',
      importantNotice: 'ควรเติมเงินไว้ในซิมให้พอสำหรับการต่ออายุอัตโนมัติในเดือนถัดไป เพื่อไม่ให้โปรหลุดกลางทาง',
      sections: [
        {
          id: 'ais',
          title: 'AIS One-2-Call',
          subtitle: 'ซิม AIS ต้องสมัครโปรกันรั่วก่อนใช้งาน',
          color: 'emerald',
          items: [
            {
              id: 'ais-step-1',
              stepLabel: 'ขั้นตอนที่ 1 - เปลี่ยนแพ็คเกจหลัก',
              title: 'Easy Free Net กันรั่ว 64kbps',
              code: '*777*44#',
              price: 'ครั้งแรกฟรี / ครั้งต่อไป 10 บาท',
              description: 'ลูกค้าใหม่กด *777*44# / ลูกค้าเดิมใช้งานเกิน 30 วัน กด *777*1043#',
              recommended: false,
            },
            {
              id: 'ais-step-2a',
              stepLabel: 'ขั้นตอนที่ 2 - เลือกโปรกันรั่ว (เลือก 1 อย่าง)',
              title: 'กันเน็ตรั่ว 64kbps',
              code: '*777*7067#',
              price: '32 บาท/เดือน (รวม VAT)',
              description: '',
              recommended: false,
            },
            {
              id: 'ais-step-2b',
              stepLabel: '',
              title: 'กันรั่ว 128kbps',
              code: '*777*7068#',
              price: '36 บาท/เดือน (รวม VAT)',
              description: '',
              recommended: false,
            },
            {
              id: 'ais-step-2c',
              stepLabel: '',
              title: 'กันรั่ว 7 วัน',
              code: '*777*7311#',
              price: '20 บาท / 7 วัน',
              description: 'เหมาะสำหรับทดลองใช้ระยะสั้น',
              recommended: false,
            },
            {
              id: 'ais-step-3',
              stepLabel: 'ขั้นตอนที่ 3 - เสริมความเสถียร (แนะนำ)',
              title: 'AIS PLAY',
              code: '*777*885#',
              price: '64 บาท/เดือน (รวม VAT)',
              description: 'แนะนำสมัครเพิ่มเพื่อความเสถียรสูงสุด เน็ตไม่หลุดง่าย',
              recommended: true,
            },
          ],
          extraCodes: [
            { code: '*777*1043#', label: 'สำหรับลูกค้าเดิมใช้งานเกิน 30 วัน' },
          ],
          recommendationText: 'เหมาะสำหรับ: สายเกม, สายไลฟ์สด, สายโหลด, สายดูหนัง, เล่นโซเซียลมีเดีย',
          recommendationSub: 'งบน้อยสมัครแค่กันรั่วก็พอ แต่ถ้าอยากเสถียรแนะนำสมัคร AIS Play ด้วย',
        },
        {
          id: 'true',
          title: 'True Zoom',
          subtitle: 'ซิม True สมัครโปร Zoom เพื่อใช้งาน VPN',
          color: 'red',
          items: [
            {
              id: 'true-zoom',
              stepLabel: '',
              title: 'True Zoom',
              code: '*900*8234#',
              price: '81 บาท / 30 วัน (รวม VAT)',
              description: 'ความเร็วสูงสุด 10Mbps เหมาะสำหรับดูหนัง ฟังเพลง ท่องโซเซียล',
              recommended: true,
            },
          ],
          extraCodes: [],
          recommendationText: 'เหมาะสำหรับ: ดูหนัง, ฟังเพลง, ท่องโซเซียล (MaxSpeed 10Mbps)',
          recommendationSub: '',
        },
      ],
      summaryTitle: 'สรุปค่าใช้จ่ายต่อเดือน',
      summaryItems: [
        { label: 'กันรั่ว 64kbps อย่างเดียว', operator: 'AIS', price: '32 บาท/ด.', highlight: false },
        { label: 'กันรั่ว 64kbps + AIS Play', operator: 'AIS', price: '96 บาท/ด.', highlight: true, highlightLabel: 'แนะนำ' },
        { label: 'กันรั่ว 128kbps + AIS Play', operator: 'AIS', price: '100 บาท/ด.', highlight: false },
        { label: 'True Zoom 10Mbps', operator: 'TRUE', price: '81 บาท/ด.', highlight: false },
      ],
      ctaText: 'เลือกเซิร์ฟเวอร์ VPN',
    }

    const config = settings?.setupGuideConfig || defaultConfig

    return NextResponse.json({ config })
  } catch (error) {
    console.error('Failed to get setup guide:', error)
    return NextResponse.json({ error: 'Failed to get setup guide' }, { status: 500 })
  }
}
