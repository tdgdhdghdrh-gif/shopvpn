import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/blog - ดึงบทความทั้งหมด (public) หรือทั้งหมด (admin)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const admin = searchParams.get('admin') === 'true'

  const where: Record<string, unknown> = {}

  if (!admin) {
    where.isPublished = true
  }

  if (category && category !== 'all') {
    where.category = category
  }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        category: true,
        tags: true,
        isPublished: true,
        isFeatured: true,
        publishedAt: true,
        views: true,
        readTime: true,
        createdAt: true,
      },
    }),
    prisma.blogPost.count({ where }),
  ])

  return NextResponse.json({
    posts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}

// POST /api/blog - สร้างบทความใหม่ (admin only)
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.userId,
      OR: [{ isSuperAdmin: true }, { isAdmin: true }],
    },
  })
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { title, slug, excerpt, content, coverImage, category, tags, isPublished, isFeatured, readTime, metaTitle, metaDesc } = body

  if (!title || !slug || !excerpt || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // เช็คว่า slug ซ้ำไหม
  const existing = await prisma.blogPost.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
  }

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage: coverImage || null,
      category: category || 'tips',
      tags: tags || [],
      isPublished: isPublished || false,
      isFeatured: isFeatured || false,
      publishedAt: isPublished ? new Date() : null,
      readTime: readTime || 5,
      metaTitle: metaTitle || null,
      metaDesc: metaDesc || null,
      createdBy: user.id,
    },
  })

  return NextResponse.json(post)
}

// PUT /api/blog - อัพเดทบทความ (admin only)
export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.userId,
      OR: [{ isSuperAdmin: true }, { isAdmin: true }],
    },
  })
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { id, ...data } = body

  if (!id) {
    return NextResponse.json({ error: 'Missing post id' }, { status: 400 })
  }

  // ถ้าเปลี่ยนเป็น published และยังไม่เคย publish
  if (data.isPublished) {
    const existing = await prisma.blogPost.findUnique({ where: { id } })
    if (existing && !existing.publishedAt) {
      data.publishedAt = new Date()
    }
  }

  const post = await prisma.blogPost.update({
    where: { id },
    data,
  })

  return NextResponse.json(post)
}

// DELETE /api/blog - ลบบทความ (admin only)
export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.userId,
      OR: [{ isSuperAdmin: true }, { isAdmin: true }],
    },
  })
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing post id' }, { status: 400 })
  }

  await prisma.blogPost.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
