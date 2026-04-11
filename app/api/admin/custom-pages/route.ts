import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function requireAdminSession() {
  const session = await getSession()
  if (!session?.isLoggedIn || !session?.userId) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isAdmin: true, isSuperAdmin: true }
  })

  if (!user || (!user.isAdmin && !user.isSuperAdmin)) return null
  return user
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80) || `page-${Date.now()}`
}

// GET - List all custom pages + global ad settings
export async function GET(request: NextRequest) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [pages, settings] = await Promise.all([
    prisma.customPage.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        views: true,
        watermarkEnabled: true,
        adImageUrl: true,
        adLinkUrl: true,
        adDuration: true,
        useGlobalAd: true,
        password: true,
        expiresAt: true,
        dbEnabled: true,
        subPages: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { submissions: true, dbRecords: true } },
      }
    }),
    prisma.settings.findFirst({
      select: {
        globalAdEnabled: true,
        globalAdImageUrl: true,
        globalAdLinkUrl: true,
        globalAdDuration: true,
      }
    })
  ])

  return NextResponse.json({ success: true, pages, globalAd: settings ? { enabled: settings.globalAdEnabled, imageUrl: settings.globalAdImageUrl, linkUrl: settings.globalAdLinkUrl, duration: settings.globalAdDuration } : { enabled: false, imageUrl: null, linkUrl: null, duration: 5 } })
}

// POST - Create new custom page
export async function POST(request: NextRequest) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { title, htmlContent, slug: customSlug, isPublished, watermarkEnabled, adImageUrl, adLinkUrl, adDuration, useGlobalAd, password, expiresAt, dbEnabled, subPages } = body

    if (!title || !htmlContent) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อหน้าและโค้ด HTML' }, { status: 400 })
    }

    let slug = customSlug ? customSlug.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-') : generateSlug(title)

    // Check slug unique
    const existing = await prisma.customPage.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    // Validate subPages format
    let validSubPages: { filename: string; title: string; htmlContent: string }[] | null = null
    if (subPages && Array.isArray(subPages) && subPages.length > 0) {
      validSubPages = subPages.map((sp: any) => ({
        filename: (sp.filename || '').toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-') || `page-${Date.now().toString(36)}`,
        title: sp.title || sp.filename || 'Untitled',
        htmlContent: sp.htmlContent || '',
      }))
    }

    const page = await prisma.customPage.create({
      data: {
        title,
        slug,
        htmlContent,
        isPublished: isPublished !== false,
        watermarkEnabled: watermarkEnabled !== false,
        adImageUrl: adImageUrl || null,
        adLinkUrl: adLinkUrl || null,
        adDuration: Math.min(Math.max(parseInt(adDuration) || 0, 0), 10),
        useGlobalAd: useGlobalAd !== false,
        password: password || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        dbEnabled: dbEnabled === true,
        subPages: validSubPages || undefined,
      }
    })

    return NextResponse.json({ success: true, page })
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// PUT - Update custom page
export async function PUT(request: NextRequest) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()

    // ─── Special actions ───
    // Update global ad settings
    if (body.action === 'updateGlobalAd') {
      const settings = await prisma.settings.findFirst()
      if (!settings) return NextResponse.json({ error: 'ไม่พบ Settings' }, { status: 404 })
      await prisma.settings.update({
        where: { id: settings.id },
        data: {
          globalAdEnabled: body.enabled ?? false,
          globalAdImageUrl: body.imageUrl || null,
          globalAdLinkUrl: body.linkUrl || null,
          globalAdDuration: Math.min(Math.max(parseInt(body.duration) || 5, 1), 30),
        }
      })
      return NextResponse.json({ success: true })
    }

    // Clone page
    if (body.action === 'clone' && body.id) {
      const source = await prisma.customPage.findUnique({ where: { id: body.id } })
      if (!source) return NextResponse.json({ error: 'ไม่พบหน้าเว็บ' }, { status: 404 })

      let newSlug = `${source.slug}-copy`
      const slugExists = await prisma.customPage.findUnique({ where: { slug: newSlug } })
      if (slugExists) newSlug = `${source.slug}-copy-${Date.now().toString(36)}`

      const cloned = await prisma.customPage.create({
        data: {
          title: `${source.title} (สำเนา)`,
          slug: newSlug,
          htmlContent: source.htmlContent,
          isPublished: false, // draft by default
          watermarkEnabled: source.watermarkEnabled,
          adImageUrl: source.adImageUrl,
          adLinkUrl: source.adLinkUrl,
          adDuration: source.adDuration,
          useGlobalAd: source.useGlobalAd,
          password: source.password,
          expiresAt: source.expiresAt,
          dbEnabled: source.dbEnabled,
          subPages: source.subPages || undefined,
        }
      })
      return NextResponse.json({ success: true, page: cloned })
    }

    // Reset views
    if (body.action === 'resetViews' && body.id) {
      await prisma.customPage.update({ where: { id: body.id }, data: { views: 0 } })
      return NextResponse.json({ success: true })
    }

    // ─── Normal update ───
    const { id, title, htmlContent, slug: customSlug, isPublished, watermarkEnabled, adImageUrl, adLinkUrl, adDuration, useGlobalAd, password, expiresAt, dbEnabled, subPages } = body

    if (!id) {
      return NextResponse.json({ error: 'ไม่พบ ID' }, { status: 400 })
    }

    const existing = await prisma.customPage.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'ไม่พบหน้าเว็บ' }, { status: 404 })
    }

    const data: any = {}
    if (title !== undefined) data.title = title
    if (htmlContent !== undefined) data.htmlContent = htmlContent
    if (isPublished !== undefined) data.isPublished = isPublished
    if (watermarkEnabled !== undefined) data.watermarkEnabled = watermarkEnabled
    if (adImageUrl !== undefined) data.adImageUrl = adImageUrl || null
    if (adLinkUrl !== undefined) data.adLinkUrl = adLinkUrl || null
    if (adDuration !== undefined) data.adDuration = Math.min(Math.max(parseInt(adDuration) || 0, 0), 10)
    if (useGlobalAd !== undefined) data.useGlobalAd = useGlobalAd
    if (password !== undefined) data.password = password || null
    if (expiresAt !== undefined) data.expiresAt = expiresAt ? new Date(expiresAt) : null
    if (dbEnabled !== undefined) data.dbEnabled = dbEnabled

    // Handle subPages
    if (subPages !== undefined) {
      if (subPages === null || (Array.isArray(subPages) && subPages.length === 0)) {
        data.subPages = null
      } else if (Array.isArray(subPages)) {
        data.subPages = subPages.map((sp: any) => ({
          filename: (sp.filename || '').toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-') || `page-${Date.now().toString(36)}`,
          title: sp.title || sp.filename || 'Untitled',
          htmlContent: sp.htmlContent || '',
        }))
      }
    }

    if (customSlug !== undefined && customSlug !== existing.slug) {
      const slugClean = customSlug.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
      const slugExists = await prisma.customPage.findUnique({ where: { slug: slugClean } })
      if (slugExists && slugExists.id !== id) {
        return NextResponse.json({ error: 'Slug นี้ถูกใช้แล้ว' }, { status: 400 })
      }
      data.slug = slugClean
    }

    const page = await prisma.customPage.update({ where: { id }, data })

    return NextResponse.json({ success: true, page })
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// DELETE - Delete custom page
export async function DELETE(request: NextRequest) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ไม่พบ ID' }, { status: 400 })
    }

    await prisma.customPage.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
