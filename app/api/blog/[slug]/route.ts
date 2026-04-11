import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/blog/[slug] - ดึงบทความตาม slug (public)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)

  const post = await prisma.blogPost.findUnique({
    where: { slug },
  })

  if (!post || !post.isPublished) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  // เพิ่ม view count
  await prisma.blogPost.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  })

  return NextResponse.json(post)
}
