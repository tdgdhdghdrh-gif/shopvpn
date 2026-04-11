import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BreadcrumbJsonLd } from '@/components/JsonLd'
import { getSiteUrl } from '@/lib/server-utils'
import BlogPostClient from './BlogPostClient'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const [post, SITE_URL] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { slug },
      select: { title: true, excerpt: true, metaTitle: true, metaDesc: true, coverImage: true, tags: true, category: true, publishedAt: true },
    }),
    getSiteUrl(),
  ])

  if (!post) return { title: 'ไม่พบบทความ' }

  const title = post.metaTitle || post.title
  const description = post.metaDesc || post.excerpt

  return {
    title,
    description,
    keywords: post.tags,
    alternates: {
      canonical: `${SITE_URL}/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/blog/${slug}`,
      siteName: '',
      locale: 'th_TH',
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [''],
      tags: post.tags,
      ...(post.coverImage && {
        images: [{ url: post.coverImage, alt: title }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(post.coverImage && { images: [post.coverImage] }),
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  })

  if (!post || !post.isPublished) {
    notFound()
  }

  // เพิ่ม view count
  await prisma.blogPost.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  })

  // ดึงบทความแนะนำ (ที่ไม่ใช่บทความนี้)
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      isPublished: true,
      id: { not: post.id },
      OR: [
        { category: post.category },
        { tags: { hasSome: post.tags } },
      ],
    },
    orderBy: { views: 'desc' },
    take: 3,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      category: true,
      readTime: true,
      views: true,
      publishedAt: true,
    },
  })

  // JSON-LD สำหรับ BlogPosting
  const blogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    ...(post.coverImage && { image: post.coverImage }),
    author: {
      '@type': 'Organization',
      name: '',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: '',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon-512x512.png`,
      },
    },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    keywords: post.tags.join(', '),
    wordCount: post.content.replace(/<[^>]*>/g, '').split(/\s+/).length,
    articleSection: post.category,
    inLanguage: 'th',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <BreadcrumbJsonLd items={[
        { name: 'หน้าแรก', url: SITE_URL },
        { name: 'บทความ', url: `${SITE_URL}/blog` },
        { name: post.title, url: `${SITE_URL}/blog/${post.slug}` },
      ]} />
      <BlogPostClient
        post={{
          ...post,
          publishedAt: post.publishedAt?.toISOString() || null,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        }}
        relatedPosts={relatedPosts.map(p => ({
          ...p,
          publishedAt: p.publishedAt?.toISOString() || null,
        }))}
      />
    </>
  )
}
