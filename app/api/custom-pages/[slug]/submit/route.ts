import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - รับข้อมูลจากฟอร์มใน Custom Page
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // หา page จาก slug
    const page = await prisma.customPage.findUnique({
      where: { slug },
      select: { id: true, isPublished: true },
    })

    if (!page || !page.isPublished) {
      return NextResponse.json({ error: 'ไม่พบหน้าเว็บ' }, { status: 404 })
    }

    // รับข้อมูลที่ส่งมา (JSON body)
    const body = await request.json()

    // เก็บ IP และ User-Agent
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = request.headers.get('user-agent') || null

    // บันทึกลง database
    const submission = await prisma.formSubmission.create({
      data: {
        pageId: page.id,
        data: body,
        ipAddress,
        userAgent,
      },
    })

    return NextResponse.json({
      success: true,
      id: submission.id,
    })
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
