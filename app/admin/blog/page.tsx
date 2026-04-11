'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FileText, Plus, Edit3, Trash2, Eye, EyeOff, Star, StarOff,
  Search, Loader2, Save, X, ExternalLink, Clock, TrendingUp
} from 'lucide-react'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage: string | null
  category: string
  tags: string[]
  isPublished: boolean
  isFeatured: boolean
  publishedAt: string | null
  views: number
  readTime: number
  metaTitle: string | null
  metaDesc: string | null
  createdAt: string
}

const categories = [
  { value: 'tips', label: 'เทคนิค & ทิปส์' },
  { value: 'guide', label: 'คู่มือการใช้งาน' },
  { value: 'review', label: 'รีวิว' },
  { value: 'news', label: 'ข่าวสาร' },
  { value: 'knowledge', label: 'ความรู้ทั่วไป' },
]

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\u0E00-\u0E7Fa-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  // Form state
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    category: 'tips',
    tags: '',
    isPublished: false,
    isFeatured: false,
    readTime: 5,
    metaTitle: '',
    metaDesc: '',
  })

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/blog?admin=true&limit=100')
      const data = await res.json()
      setPosts(data.posts || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const resetForm = () => {
    setForm({
      title: '', slug: '', excerpt: '', content: '', coverImage: '',
      category: 'tips', tags: '', isPublished: false, isFeatured: false,
      readTime: 5, metaTitle: '', metaDesc: '',
    })
  }

  const openCreate = () => {
    resetForm()
    setEditing(null)
    setCreating(true)
  }

  const openEdit = (post: BlogPost) => {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage || '',
      category: post.category,
      tags: post.tags.join(', '),
      isPublished: post.isPublished,
      isFeatured: post.isFeatured,
      readTime: post.readTime,
      metaTitle: post.metaTitle || '',
      metaDesc: post.metaDesc || '',
    })
    setEditing(post)
    setCreating(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.excerpt || !form.content) {
      alert('กรุณากรอก หัวข้อ, slug, สรุป, และเนื้อหา')
      return
    }

    setSaving(true)
    try {
      const body = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        coverImage: form.coverImage || null,
        metaTitle: form.metaTitle || null,
        metaDesc: form.metaDesc || null,
      }

      let res
      if (editing) {
        res = await fetch('/api/blog', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...body }),
        })
      } else {
        res = await fetch('/api/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'เกิดข้อผิดพลาด')
        return
      }

      setCreating(false)
      setEditing(null)
      fetchPosts()
    } catch {
      alert('เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบบทความนี้?')) return
    try {
      await fetch(`/api/blog?id=${id}`, { method: 'DELETE' })
      fetchPosts()
    } catch {
      alert('ลบไม่สำเร็จ')
    }
  }

  const togglePublish = async (post: BlogPost) => {
    await fetch('/api/blog', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: post.id, isPublished: !post.isPublished }),
    })
    fetchPosts()
  }

  const toggleFeatured = async (post: BlogPost) => {
    await fetch('/api/blog', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: post.id, isFeatured: !post.isFeatured }),
    })
    fetchPosts()
  }

  const filteredPosts = search
    ? posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : posts

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-cyan-400" />
            จัดการบทความ
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Content Marketing สำหรับ SEO</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          <Plus size={16} />
          เขียนบทความ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <p className="text-[11px] text-zinc-500 font-medium">ทั้งหมด</p>
          <p className="text-2xl font-black text-white">{posts.length}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <p className="text-[11px] text-zinc-500 font-medium">เผยแพร่แล้ว</p>
          <p className="text-2xl font-black text-emerald-400">{posts.filter(p => p.isPublished).length}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <p className="text-[11px] text-zinc-500 font-medium">ฉบับร่าง</p>
          <p className="text-2xl font-black text-amber-400">{posts.filter(p => !p.isPublished).length}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <p className="text-[11px] text-zinc-500 font-medium">ยอดอ่านรวม</p>
          <p className="text-2xl font-black text-cyan-400">{posts.reduce((a, p) => a + p.views, 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="ค้นหาบทความ..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/30"
        />
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPosts.map(post => (
            <div key={post.id} className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-white truncate">{post.title}</h3>
                  {post.isFeatured && <Star size={12} className="text-amber-400 shrink-0" />}
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${post.isPublished ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}`}>
                    {post.isPublished ? 'เผยแพร่' : 'ฉบับร่าง'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                  <span>{post.category}</span>
                  <span className="flex items-center gap-1"><Eye size={10} /> {post.views}</span>
                  <span className="flex items-center gap-1"><Clock size={10} /> {post.readTime} นาที</span>
                  <span>/blog/{post.slug}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleFeatured(post)} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors" title={post.isFeatured ? 'ยกเลิกแนะนำ' : 'ตั้งเป็นแนะนำ'}>
                  {post.isFeatured ? <StarOff size={14} className="text-amber-400" /> : <Star size={14} className="text-zinc-500" />}
                </button>
                <button onClick={() => togglePublish(post)} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors" title={post.isPublished ? 'ซ่อน' : 'เผยแพร่'}>
                  {post.isPublished ? <EyeOff size={14} className="text-zinc-500" /> : <Eye size={14} className="text-emerald-400" />}
                </button>
                {post.isPublished && (
                  <a href={`/blog/${post.slug}`} target="_blank" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors" title="ดูบทความ">
                    <ExternalLink size={14} className="text-zinc-500" />
                  </a>
                )}
                <button onClick={() => openEdit(post)} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors" title="แก้ไข">
                  <Edit3 size={14} className="text-blue-400" />
                </button>
                <button onClick={() => handleDelete(post.id)} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors" title="ลบ">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
          {filteredPosts.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              <FileText className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
              <p>ยังไม่มีบทความ</p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {creating && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 pt-20">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editing ? 'แก้ไขบทความ' : 'เขียนบทความใหม่'}
              </h2>
              <button onClick={() => { setCreating(false); setEditing(null) }} className="p-2 hover:bg-zinc-800 rounded-lg">
                <X size={18} className="text-zinc-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">หัวข้อ *</label>
                <input
                  value={form.title}
                  onChange={e => {
                    setForm(f => ({ ...f, title: e.target.value }))
                    if (!editing) setForm(f => ({ ...f, slug: slugify(e.target.value) }))
                  }}
                  className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/30"
                  placeholder="5 วิธีแก้เน็ตช้า เล่นเกมปิงสูง"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">Slug (URL) *</label>
                <input
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/30"
                  placeholder="5-วิธีแก้เน็ตช้า"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-500 font-medium">สรุปสั้นๆ (SEO Description) *</label>
              <textarea
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/30 resize-none"
                placeholder="สรุปเนื้อหาสั้นๆ 1-2 ประโยค สำหรับแสดงใน Google"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-500 font-medium">เนื้อหา (HTML) *</label>
              <textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                rows={12}
                className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/30 resize-y font-mono"
                placeholder="<h2>หัวข้อ</h2><p>เนื้อหา...</p>"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">หมวดหมู่</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/30"
                >
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">แท็ก (คั่นด้วย ,)</label>
                <input
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/30"
                  placeholder="VPN, เกม, เน็ตช้า"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">เวลาอ่าน (นาที)</label>
                <input
                  type="number"
                  value={form.readTime}
                  onChange={e => setForm(f => ({ ...f, readTime: parseInt(e.target.value) || 5 }))}
                  className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">รูปปก (URL)</label>
                <input
                  value={form.coverImage}
                  onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/30"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 font-medium">SEO Title (ถ้าไม่กรอกจะใช้หัวข้อ)</label>
                <input
                  value={form.metaTitle}
                  onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/30"
                  placeholder="Custom SEO Title"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-cyan-500 focus:ring-0" />
                <span className="text-sm text-zinc-300">เผยแพร่ทันที</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-0" />
                <span className="text-sm text-zinc-300">บทความแนะนำ</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setCreating(false); setEditing(null) }}
                className="px-5 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-medium hover:bg-zinc-700 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {editing ? 'บันทึก' : 'สร้างบทความ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
