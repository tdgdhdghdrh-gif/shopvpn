'use client'

import Link from 'next/link'
import {
  ArrowLeft, Clock, Eye, Tag, Calendar, Share2,
  BookOpen, ArrowRight, ChevronRight, Copy, Check
} from 'lucide-react'
import { useState } from 'react'
import Navbar from '@/components/Navbar'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage: string | null
  category: string
  tags: string[]
  publishedAt: string | null
  views: number
  readTime: number
  createdAt: string
  updatedAt: string
}

interface RelatedPost {
  slug: string
  title: string
  excerpt: string
  coverImage: string | null
  category: string
  readTime: number
  views: number
  publishedAt: string | null
}

const categoryColors: Record<string, string> = {
  tips: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  guide: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  review: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  news: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  knowledge: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
}

const categoryLabels: Record<string, string> = {
  tips: 'เทคนิค',
  guide: 'คู่มือ',
  review: 'รีวิว',
  news: 'ข่าวสาร',
  knowledge: 'ความรู้',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogPostClient({
  post,
  relatedPosts,
}: {
  post: BlogPost
  relatedPosts: RelatedPost[]
}) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: post.title, text: post.excerpt, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans">
      <Navbar user={null} isAdmin={false} />

      {/* Article Header */}
      <header className="relative pt-24 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.06)_0%,transparent_50%)]" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
            <Link href="/" className="hover:text-white transition-colors">หน้าแรก</Link>
            <ChevronRight size={12} />
            <Link href="/blog" className="hover:text-white transition-colors">บทความ</Link>
            <ChevronRight size={12} />
            <span className="text-zinc-400 truncate max-w-[200px]">{post.title}</span>
          </nav>

          {/* Category + Meta */}
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${categoryColors[post.category] || 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>
              {categoryLabels[post.category] || post.category}
            </span>
            <div className="flex items-center gap-3 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime} นาที</span>
              <span className="flex items-center gap-1"><Eye size={12} /> {post.views.toLocaleString()} views</span>
              {post.publishedAt && (
                <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(post.publishedAt)}</span>
              )}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-4">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-base text-zinc-400 leading-relaxed mb-6">
            {post.excerpt}
          </p>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-zinc-400 hover:text-white hover:border-white/[0.15] transition-all"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
            {copied ? 'คัดลอกลิงก์แล้ว' : 'แชร์บทความ'}
          </button>
        </div>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="rounded-2xl overflow-hidden border border-white/[0.08]">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full aspect-[2/1] object-cover"
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="blog-content-wrapper">
          <div
            className="blog-content prose prose-invert prose-lg max-w-none
              prose-headings:font-black prose-headings:text-white
              prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-white/[0.06]
              prose-h3:text-lg prose-h3:sm:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:text-[15px] prose-p:sm:text-base
              prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white prose-strong:font-bold
              prose-ul:text-zinc-400 prose-ol:text-zinc-400
              prose-li:marker:text-cyan-400 prose-li:text-[15px] prose-li:sm:text-base
              prose-code:text-cyan-300 prose-code:bg-white/[0.05] prose-code:px-2 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm
              prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-white/[0.08] prose-pre:rounded-xl
              prose-blockquote:border-l-cyan-400 prose-blockquote:bg-white/[0.02] prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:px-6
              prose-img:rounded-xl prose-img:border prose-img:border-white/[0.08]
              prose-table:border-hidden
              prose-th:text-left prose-th:text-zinc-300
              prose-td:text-zinc-400
            "
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={14} className="text-zinc-500" />
              <span className="text-xs text-zinc-500 font-medium">แท็ก</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <Link
                  key={tag}
                  href={`/blog?search=${encodeURIComponent(tag)}`}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-400 hover:text-white hover:border-white/[0.12] transition-all"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-cyan-500/[0.08] to-violet-500/[0.08] border border-cyan-500/20 text-center">
          <h3 className="text-xl font-bold text-white mb-3">อยากลองใช้ VPN แรงๆ ด้วยตัวเอง?</h3>
          <p className="text-sm text-zinc-400 mb-5">ทดลองใช้ VPN ฟรี! เน็ตแรง เสถียร เล่นเกมลื่น ดูหนังไม่กระตุก</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/public-vless"
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
            >
              ทดลองใช้ฟรี
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 bg-white/[0.03] border border-white/[0.08] text-white rounded-xl font-bold text-sm hover:bg-white/[0.06] transition-all"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-white/[0.06] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-8">
              <BookOpen size={18} className="text-cyan-400" />
              <h2 className="text-lg font-bold text-white">บทความที่เกี่ยวข้อง</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedPosts.map(rp => (
                <Link
                  key={rp.slug}
                  href={`/blog/${rp.slug}`}
                  className="group rounded-2xl overflow-hidden border border-white/[0.05] bg-white/[0.02] hover:border-white/[0.12] transition-all"
                >
                  {rp.coverImage && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={rp.coverImage} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${categoryColors[rp.category] || 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>
                      {categoryLabels[rp.category] || rp.category}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors mt-3 mb-2 line-clamp-2">{rp.title}</h3>
                    <p className="text-sm text-zinc-500 line-clamp-2">{rp.excerpt}</p>
                    <div className="flex items-center justify-between mt-4 text-[11px] text-zinc-600">
                      <span className="flex items-center gap-1"><Clock size={12} /> {rp.readTime} นาที</span>
                      <ArrowRight size={14} className="text-zinc-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to Blog */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft size={16} />
          กลับไปหน้าบทความ
        </Link>
      </div>
    </div>
  )
}
