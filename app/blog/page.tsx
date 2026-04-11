'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  BookOpen, Clock, Eye, Tag, ArrowRight, Search,
  Sparkles, TrendingUp, ChevronDown, Loader2, FileText
} from 'lucide-react'
import Navbar from '@/components/Navbar'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  coverImage: string | null
  category: string
  tags: string[]
  isFeatured: boolean
  publishedAt: string
  views: number
  readTime: number
}

const categories = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'tips', label: 'เทคนิค & ทิปส์' },
  { value: 'guide', label: 'คู่มือการใช้งาน' },
  { value: 'review', label: 'รีวิว' },
  { value: 'news', label: 'ข่าวสาร' },
  { value: 'knowledge', label: 'ความรู้ทั่วไป' },
]

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

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/blog?category=${category}&page=${page}&limit=12`)
      const data = await res.json()
      setPosts(data.posts)
      setTotalPages(data.totalPages)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [category, page])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const filteredPosts = search
    ? posts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : posts

  const featuredPosts = filteredPosts.filter(p => p.isFeatured)
  const regularPosts = filteredPosts.filter(p => !p.isFeatured)

  return (
    <div className="min-h-screen bg-transparent text-white font-sans">
      <Navbar user={null} isAdmin={false} />

      {/* Hero Header */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.05)_0%,transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-zinc-400 text-sm font-medium mb-6">
              <BookOpen size={16} className="text-cyan-400" />
              บทความ & ความรู้
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight">
              เรียนรู้เรื่อง{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                VPN & เน็ตเวิร์ก
              </span>
            </h1>
            <p className="text-zinc-500 text-base md:text-lg max-w-2xl mx-auto">
              เทคนิคแก้เน็ตช้า วิธีเล่นเกมไม่แลค รีวิวแอป คู่มือตั้งค่า และความรู้ที่จะช่วยให้คุณใช้อินเทอร์เน็ตได้เต็มประสิทธิภาพ
            </p>
          </div>

          {/* Search + Filter */}
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="ค้นหาบทความ..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/30 transition-colors"
              />
            </div>
            <div className="relative">
              <select
                value={category}
                onChange={e => { setCategory(e.target.value); setPage(1) }}
                className="appearance-none w-full sm:w-48 px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/30 transition-colors cursor-pointer"
              >
                {categories.map(c => (
                  <option key={c.value} value={c.value} className="bg-zinc-900">{c.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
              <p className="text-sm text-zinc-500">กำลังโหลดบทความ...</p>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-zinc-600" />
            </div>
            <p className="text-zinc-400 font-medium">ยังไม่มีบทความ</p>
            <p className="text-zinc-600 text-sm mt-1">กรุณาลองเปลี่ยนหมวดหมู่หรือคำค้นหา</p>
          </div>
        ) : (
          <>
            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles size={18} className="text-amber-400" />
                  <h2 className="text-lg font-bold text-white">บทความแนะนำ</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {featuredPosts.map(post => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group relative rounded-2xl overflow-hidden border border-white/[0.08] bg-gradient-to-br from-cyan-500/[0.05] to-violet-500/[0.05] hover:border-cyan-500/20 transition-all"
                    >
                      {post.coverImage && (
                        <div className="aspect-[2/1] overflow-hidden">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${categoryColors[post.category] || 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>
                            {categoryLabels[post.category] || post.category}
                          </span>
                          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
                            แนะนำ
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-zinc-500 line-clamp-2 mb-4">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-[11px] text-zinc-600">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime} นาที</span>
                            <span className="flex items-center gap-1"><Eye size={12} /> {post.views.toLocaleString()}</span>
                          </div>
                          <span>{post.publishedAt && formatDate(post.publishedAt)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Posts */}
            {regularPosts.length > 0 && (
              <div>
                {featuredPosts.length > 0 && (
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp size={18} className="text-cyan-400" />
                    <h2 className="text-lg font-bold text-white">บทความล่าสุด</h2>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {regularPosts.map(post => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group rounded-2xl overflow-hidden border border-white/[0.05] bg-white/[0.02] hover:border-white/[0.12] transition-all"
                    >
                      {post.coverImage && (
                        <div className="aspect-[16/9] overflow-hidden">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${categoryColors[post.category] || 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>
                            {categoryLabels[post.category] || post.category}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-zinc-500 line-clamp-2 mb-4">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-[11px] text-zinc-600">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime} นาที</span>
                            <span className="flex items-center gap-1"><Eye size={12} /> {post.views.toLocaleString()}</span>
                          </div>
                          <ArrowRight size={14} className="text-zinc-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                      p === page
                        ? 'bg-cyan-500 text-white'
                        : 'bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] border border-white/[0.06]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-zinc-600">&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
