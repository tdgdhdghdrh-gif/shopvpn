import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get public custom page by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const page = await prisma.customPage.findUnique({
      where: { slug },
    })

    if (!page || !page.isPublished) {
      return NextResponse.json({ error: 'ไม่พบหน้าเว็บ' }, { status: 404 })
    }

    // Increment views
    await prisma.customPage.update({
      where: { id: page.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({
      success: true,
      page: {
        title: page.title,
        slug: page.slug,
        htmlContent: page.htmlContent,
        views: page.views + 1,
        createdAt: page.createdAt,
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
