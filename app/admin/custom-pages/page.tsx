'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Code2, Plus, Edit3, Trash2, Eye, EyeOff, ExternalLink,
  CheckCircle2, AlertCircle, Loader2, Save, X, Copy,
  FileCode, Globe, BarChart3, Clock, Search, ArrowLeft,
  Smartphone, Monitor, Maximize2,
  Calendar, Link2, Hash, RefreshCw, Droplets, Image, Timer, Link,
  Lock, CalendarClock, Settings,
  CopyPlus, QrCode, Code, RotateCcw, ChevronDown, ImagePlus, Replace,
  MoreHorizontal, Inbox, Download, ChevronLeft, ChevronRight,
  Database, ClipboardCopy, FilePlus2, Files, Pencil,
} from 'lucide-react'

interface SubPage {
  filename: string
  title: string
  htmlContent: string
}

interface CustomPage {
  id: string
  title: string
  slug: string
  htmlContent?: string
  isPublished: boolean
  views: number
  watermarkEnabled: boolean
  adImageUrl: string | null
  adLinkUrl: string | null
  adDuration: number
  useGlobalAd: boolean
  password: string | null
  expiresAt: string | null
  dbEnabled: boolean
  subPages?: SubPage[] | null
  createdAt: string
  updatedAt: string
  _count?: { submissions: number; dbRecords: number }
}

interface GlobalAd {
  enabled: boolean
  imageUrl: string | null
  linkUrl: string | null
  duration: number
}

interface FormSubmission {
  id: string
  pageId: string
  data: Record<string, unknown>
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  page: { title: string; slug: string }
}

type ViewMode = 'list' | 'editor' | 'submissions' | 'database'
type PreviewDevice = 'desktop' | 'mobile' | 'fullscreen'

// ─── Color Map (static classes for Tailwind purge) ───
const COLOR_MAP: Record<string, { icon: string; bg: string }> = {
  cyan:    { icon: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20' },
  emerald: { icon: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  amber:   { icon: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  purple:  { icon: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20' },
  blue:    { icon: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
  red:     { icon: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
  yellow:  { icon: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20' },
  rose:    { icon: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20' },
}

// ─── Stat Card ───
function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string
}) {
  const c = COLOR_MAP[color] || COLOR_MAP.cyan
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-3">
      <div className={`w-10 h-10 ${c.bg} border rounded-xl flex items-center justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${c.icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-zinc-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      </div>
    </div>
  )
}

// ─── Toggle Switch ───
function Toggle({ enabled, onChange, size = 'md' }: { enabled: boolean; onChange: () => void; size?: 'sm' | 'md' }) {
  const w = size === 'sm' ? 'w-9 h-5' : 'w-11 h-6'
  const dot = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
  const onPos = size === 'sm' ? 'left-[18px]' : 'left-[22px]'
  return (
    <button
      onClick={onChange}
      className={`relative ${w} rounded-full transition-all duration-200 shrink-0 ${enabled ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.3)]' : 'bg-zinc-700'}`}
    >
      <div className={`absolute top-0.5 ${dot} bg-white rounded-full transition-all duration-200 shadow-md ${enabled ? onPos : 'left-0.5'}`} />
    </button>
  )
}

export default function CustomPagesAdmin() {
  const [pages, setPages] = useState<CustomPage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [detailPage, setDetailPage] = useState<CustomPage | null>(null)

  // Global Ad state
  const [globalAd, setGlobalAd] = useState<GlobalAd>({ enabled: false, imageUrl: null, linkUrl: null, duration: 5 })
  const [showGlobalAdSettings, setShowGlobalAdSettings] = useState(false)
  const [savingGlobalAd, setSavingGlobalAd] = useState(false)
  const [gAdEnabled, setGAdEnabled] = useState(false)
  const [gAdImageUrl, setGAdImageUrl] = useState('')
  const [gAdLinkUrl, setGAdLinkUrl] = useState('')
  const [gAdDuration, setGAdDuration] = useState(5)
  const [uploadingGlobalAd, setUploadingGlobalAd] = useState(false)

  // Editor state
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formHtml, setFormHtml] = useState('')
  const [formPublished, setFormPublished] = useState(true)
  const [formWatermark, setFormWatermark] = useState(true)
  const [formAdImageUrl, setFormAdImageUrl] = useState('')
  const [formAdLinkUrl, setFormAdLinkUrl] = useState('')
  const [formAdDuration, setFormAdDuration] = useState(0)
  const [formUseGlobalAd, setFormUseGlobalAd] = useState(true)
  const [formPassword, setFormPassword] = useState('')
  const [formExpiresAt, setFormExpiresAt] = useState('')
  const [formDbEnabled, setFormDbEnabled] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop')
  const previewRef = useRef<HTMLIFrameElement>(null)
  const [uploadingAd, setUploadingAd] = useState(false)
  const [showQrModal, setShowQrModal] = useState<string | null>(null)
  const [showEmbedModal, setShowEmbedModal] = useState<string | null>(null)

  // Multi-file state
  const [formSubPages, setFormSubPages] = useState<SubPage[]>([])
  const [activeFileIndex, setActiveFileIndex] = useState(-1) // -1 = main page (index.html)
  const [showAddFileModal, setShowAddFileModal] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileTitle, setNewFileTitle] = useState('')
  const [editingFileName, setEditingFileName] = useState<number | null>(null)
  const [editFileNameValue, setEditFileNameValue] = useState('')
  const [editFileTitleValue, setEditFileTitleValue] = useState('')

  // Mobile action menu
  const [mobileMenuId, setMobileMenuId] = useState<string | null>(null)

  // Submissions state
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [submissionsPage, setSubmissionsPage] = useState(1)
  const [submissionsTotalPages, setSubmissionsTotalPages] = useState(1)
  const [submissionsTotal, setSubmissionsTotal] = useState(0)
  const [submissionsFilter, setSubmissionsFilter] = useState<string | null>(null) // pageId filter
  const [submissionsFilterTitle, setSubmissionsFilterTitle] = useState<string>('')
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null)

  // Database viewer state
  const [dbRecords, setDbRecords] = useState<{ id: string; collection: string; data: Record<string, unknown>; createdAt: string; updatedAt: string; page: { title: string; slug: string } }[]>([])
  const [dbLoading, setDbLoading] = useState(false)
  const [dbPage, setDbPage] = useState(1)
  const [dbTotalPages, setDbTotalPages] = useState(1)
  const [dbTotal, setDbTotal] = useState(0)
  const [dbFilter, setDbFilter] = useState<string | null>(null) // pageId filter
  const [dbFilterTitle, setDbFilterTitle] = useState<string>('')
  const [dbCollections, setDbCollections] = useState<string[]>([])
  const [dbCollectionFilter, setDbCollectionFilter] = useState<string | null>(null)
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null)

  // Refs for file inputs
  const adImageInputRef = useRef<HTMLInputElement>(null)
  const globalAdImageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPages()
  }, [])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  async function fetchPages() {
    try {
      const res = await fetch('/api/admin/custom-pages')
      const data = await res.json()
      if (data.success) {
        setPages(data.pages)
        if (data.globalAd) {
          setGlobalAd(data.globalAd)
          setGAdEnabled(data.globalAd.enabled)
          setGAdImageUrl(data.globalAd.imageUrl || '')
          setGAdLinkUrl(data.globalAd.linkUrl || '')
          setGAdDuration(data.globalAd.duration || 5)
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'ไม่สามารถดึงข้อมูลได้' })
    } finally {
      setLoading(false)
    }
  }

  function openEditor(page?: CustomPage) {
    if (page) {
      setEditingPage(page)
      setFormTitle(page.title)
      setFormSlug(page.slug)
      setFormHtml(page.htmlContent || '')
      setFormPublished(page.isPublished)
      setFormWatermark(page.watermarkEnabled !== false)
      setFormAdImageUrl(page.adImageUrl || '')
      setFormAdLinkUrl(page.adLinkUrl || '')
      setFormAdDuration(page.adDuration || 0)
      setFormUseGlobalAd(page.useGlobalAd !== false)
      setFormPassword(page.password || '')
      setFormExpiresAt(page.expiresAt ? new Date(page.expiresAt).toISOString().slice(0, 16) : '')
      setFormDbEnabled(page.dbEnabled === true)
      setFormSubPages(page.subPages && Array.isArray(page.subPages) ? page.subPages as SubPage[] : [])
      setActiveFileIndex(-1)
      if (!page.htmlContent) {
        fetch(`/api/custom-pages/${page.slug}`)
          .then(r => r.json())
          .then(d => {
            if (d.success) setFormHtml(d.page.htmlContent)
          })
      }
    } else {
      setEditingPage(null)
      setFormTitle('')
      setFormSlug('')
      setFormHtml('')
      setFormPublished(true)
      setFormWatermark(true)
      setFormAdImageUrl('')
      setFormAdLinkUrl('')
      setFormAdDuration(0)
      setFormUseGlobalAd(true)
      setFormPassword('')
      setFormExpiresAt('')
      setFormDbEnabled(false)
      setFormSubPages([])
      setActiveFileIndex(-1)
    }
    setShowPreview(false)
    setViewMode('editor')
  }

  function generateSlugFromTitle(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 80)
  }

  async function uploadImage(file: File): Promise<string | null> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const base64 = reader.result as string
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64, type: 'custom-page' }),
          })
          const data = await res.json()
          if (data.success && data.url) {
            resolve(data.url)
          } else {
            setMessage({ type: 'error', text: 'อัปโหลดรูปไม่สำเร็จ' })
            resolve(null)
          }
        } catch {
          setMessage({ type: 'error', text: 'อัปโหลดรูปล้มเหลว' })
          resolve(null)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  async function handleAdImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAd(true)
    const url = await uploadImage(file)
    if (url) setFormAdImageUrl(url)
    setUploadingAd(false)
    e.target.value = ''
  }

  async function handleGlobalAdImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingGlobalAd(true)
    const url = await uploadImage(file)
    if (url) setGAdImageUrl(url)
    setUploadingGlobalAd(false)
    e.target.value = ''
  }

  async function saveGlobalAd() {
    setSavingGlobalAd(true)
    try {
      const res = await fetch('/api/admin/custom-pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateGlobalAd',
          enabled: gAdEnabled,
          imageUrl: gAdImageUrl.trim() || null,
          linkUrl: gAdLinkUrl.trim() || null,
          duration: gAdDuration,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setGlobalAd({ enabled: gAdEnabled, imageUrl: gAdImageUrl.trim() || null, linkUrl: gAdLinkUrl.trim() || null, duration: gAdDuration })
        setMessage({ type: 'success', text: 'บันทึกตั้งค่าโฆษณากลางแล้ว' })
        setShowGlobalAdSettings(false)
      } else {
        setMessage({ type: 'error', text: data.error || 'เกิดข้อผิดพลาด' })
      }
    } catch {
      setMessage({ type: 'error', text: 'การเชื่อมต่อล้มเหลว' })
    } finally {
      setSavingGlobalAd(false)
    }
  }

  async function handleSave() {
    if (!formTitle.trim()) {
      setMessage({ type: 'error', text: 'กรุณากรอกชื่อหน้าเว็บ' })
      return
    }
    if (!formHtml.trim()) {
      setMessage({ type: 'error', text: 'กรุณาใส่โค้ด HTML' })
      return
    }

    setSaving(true)
    try {
      const slug = formSlug.trim() || generateSlugFromTitle(formTitle)
      const body: Record<string, unknown> = {
        title: formTitle.trim(),
        htmlContent: formHtml,
        slug,
        isPublished: formPublished,
        watermarkEnabled: formWatermark,
        adImageUrl: formAdImageUrl.trim() || null,
        adLinkUrl: formAdLinkUrl.trim() || null,
        adDuration: formAdDuration,
        useGlobalAd: formUseGlobalAd,
        password: formPassword.trim() || null,
        expiresAt: formExpiresAt || null,
        dbEnabled: formDbEnabled,
        subPages: formSubPages.length > 0 ? formSubPages : null,
      }

      let res: Response
      if (editingPage) {
        body.id = editingPage.id
        res = await fetch('/api/admin/custom-pages', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/admin/custom-pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: editingPage ? 'อัปเดตสำเร็จ!' : 'สร้างหน้าเว็บสำเร็จ!' })
        await fetchPages()
        setViewMode('list')
      } else {
        setMessage({ type: 'error', text: data.error || 'เกิดข้อผิดพลาด' })
      }
    } catch {
      setMessage({ type: 'error', text: 'การเชื่อมต่อล้มเหลว' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/custom-pages?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'ลบหน้าเว็บสำเร็จ!' })
        setPages(prev => prev.filter(p => p.id !== id))
        setDeleteConfirm(null)
      } else {
        setMessage({ type: 'error', text: data.error || 'ลบไม่สำเร็จ' })
      }
    } catch {
      setMessage({ type: 'error', text: 'การเชื่อมต่อล้มเหลว' })
    }
  }

  async function togglePublish(page: CustomPage) {
    try {
      const res = await fetch('/api/admin/custom-pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: page.id, isPublished: !page.isPublished }),
      })
      const data = await res.json()
      if (data.success) {
        setPages(prev => prev.map(p => p.id === page.id ? { ...p, isPublished: !p.isPublished } : p))
        setMessage({ type: 'success', text: page.isPublished ? 'ซ่อนหน้าเว็บแล้ว' : 'เผยแพร่หน้าเว็บแล้ว' })
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    }
  }

  async function handleClone(page: CustomPage) {
    try {
      const res = await fetch('/api/admin/custom-pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clone', id: page.id }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'สำเนาหน้าเว็บสำเร็จ!' })
        await fetchPages()
      } else {
        setMessage({ type: 'error', text: data.error || 'ไม่สำเร็จ' })
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    }
  }

  async function handleResetViews(page: CustomPage) {
    try {
      const res = await fetch('/api/admin/custom-pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resetViews', id: page.id }),
      })
      const data = await res.json()
      if (data.success) {
        setPages(prev => prev.map(p => p.id === page.id ? { ...p, views: 0 } : p))
        setMessage({ type: 'success', text: 'รีเซ็ตยอดเข้าชมแล้ว' })
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
    }
  }

  async function fetchSubmissions(pageId?: string | null, pg?: number) {
    setSubmissionsLoading(true)
    try {
      const p = pg || 1
      let url = `/api/admin/custom-pages/submissions?page=${p}&limit=20`
      if (pageId) url += `&pageId=${pageId}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setSubmissions(data.submissions)
        setSubmissionsTotalPages(data.totalPages)
        setSubmissionsTotal(data.total)
        setSubmissionsPage(p)
      }
    } catch {
      setMessage({ type: 'error', text: 'โหลดข้อมูลไม่สำเร็จ' })
    } finally {
      setSubmissionsLoading(false)
    }
  }

  async function deleteSubmission(id: string) {
    try {
      const res = await fetch(`/api/admin/custom-pages/submissions?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setSubmissions(prev => prev.filter(s => s.id !== id))
        setSubmissionsTotal(prev => prev - 1)
        setMessage({ type: 'success', text: 'ลบข้อมูลแล้ว' })
      }
    } catch {
      setMessage({ type: 'error', text: 'ลบไม่สำเร็จ' })
    }
  }

  async function deleteAllSubmissions(pageId: string) {
    try {
      const res = await fetch(`/api/admin/custom-pages/submissions?pageId=${pageId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setSubmissions([])
        setSubmissionsTotal(0)
        setMessage({ type: 'success', text: `ลบข้อมูลทั้งหมด ${data.deleted} รายการแล้ว` })
      }
    } catch {
      setMessage({ type: 'error', text: 'ลบไม่สำเร็จ' })
    }
  }

  function openSubmissions(pageId?: string, pageTitle?: string) {
    setSubmissionsFilter(pageId || null)
    setSubmissionsFilterTitle(pageTitle || 'ทั้งหมด')
    setExpandedSubmission(null)
    fetchSubmissions(pageId || null, 1)
    setViewMode('submissions')
  }

  function exportSubmissionsCSV() {
    if (submissions.length === 0) return
    // Collect all unique keys from data
    const allKeys = new Set<string>()
    submissions.forEach(s => {
      Object.keys(s.data as Record<string, unknown>).forEach(k => {
        if (!k.startsWith('__')) allKeys.add(k)
      })
    })
    const keys = Array.from(allKeys)
    const header = ['เวลา', 'IP', 'หน้า', ...keys].join(',')
    const rows = submissions.map(s => {
      const d = s.data as Record<string, unknown>
      return [
        new Date(s.createdAt).toLocaleString('th-TH'),
        s.ipAddress || '',
        s.page?.title || '',
        ...keys.map(k => {
          const v = d[k]
          const str = typeof v === 'string' ? v : JSON.stringify(v) || ''
          return `"${str.replace(/"/g, '""')}"`
        }),
      ].join(',')
    })
    const csv = '\uFEFF' + header + '\n' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `submissions-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Database functions ───
  async function fetchDbRecords(pageId: string | null, collection: string | null, p: number) {
    setDbLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' })
      if (pageId) params.set('pageId', pageId)
      if (collection) params.set('collection', collection)
      const res = await fetch(`/api/admin/custom-pages/database?${params}`)
      const data = await res.json()
      if (data.success) {
        setDbRecords(data.records)
        setDbTotal(data.total)
        setDbPage(data.page)
        setDbTotalPages(data.totalPages)
        setDbCollections(data.collections || [])
      }
    } catch {
      setMessage({ type: 'error', text: 'โหลดข้อมูลไม่สำเร็จ' })
    } finally {
      setDbLoading(false)
    }
  }

  async function deleteDbRecord(id: string) {
    try {
      const res = await fetch(`/api/admin/custom-pages/database?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setDbRecords(prev => prev.filter(r => r.id !== id))
        setDbTotal(prev => prev - 1)
        setMessage({ type: 'success', text: 'ลบข้อมูลแล้ว' })
      }
    } catch {
      setMessage({ type: 'error', text: 'ลบไม่สำเร็จ' })
    }
  }

  async function deleteAllDbRecords() {
    if (!dbFilter) return
    if (!confirm('ลบข้อมูลทั้งหมดของหน้านี้?')) return
    try {
      const params = new URLSearchParams({ pageId: dbFilter })
      if (dbCollectionFilter) params.set('collection', dbCollectionFilter)
      const res = await fetch(`/api/admin/custom-pages/database?${params}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setDbRecords([])
        setDbTotal(0)
        setMessage({ type: 'success', text: `ลบข้อมูล ${data.deleted} รายการแล้ว` })
      }
    } catch {
      setMessage({ type: 'error', text: 'ลบไม่สำเร็จ' })
    }
  }

  function openDatabase(pageId?: string, pageTitle?: string) {
    setDbFilter(pageId || null)
    setDbFilterTitle(pageTitle || 'ทั้งหมด')
    setDbCollectionFilter(null)
    setExpandedRecord(null)
    fetchDbRecords(pageId || null, null, 1)
    setViewMode('database')
  }

  function exportDbCSV() {
    if (dbRecords.length === 0) return
    const allKeys = new Set<string>()
    dbRecords.forEach(r => {
      Object.keys(r.data as Record<string, unknown>).forEach(k => allKeys.add(k))
    })
    const keys = Array.from(allKeys)
    const header = ['ID', 'Collection', 'เวลาสร้าง', 'อัปเดต', 'หน้า', ...keys].join(',')
    const rows = dbRecords.map(r => {
      const d = r.data as Record<string, unknown>
      return [
        r.id,
        r.collection,
        new Date(r.createdAt).toLocaleString('th-TH'),
        new Date(r.updatedAt).toLocaleString('th-TH'),
        r.page?.title || '',
        ...keys.map(k => {
          const v = d[k]
          const str = typeof v === 'string' ? v : JSON.stringify(v) || ''
          return `"${str.replace(/"/g, '""')}"`
        }),
      ].join(',')
    })
    const csv = '\uFEFF' + header + '\n' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `database-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/p/${slug}`
    navigator.clipboard.writeText(url)
    setMessage({ type: 'success', text: 'คัดลอกลิงก์แล้ว!' })
  }

  function copyEmbed(slug: string) {
    const url = `${window.location.origin}/p/${slug}`
    const embed = `<iframe src="${url}" width="100%" height="600" frameborder="0" style="border:none;border-radius:12px;" allowfullscreen></iframe>`
    navigator.clipboard.writeText(embed)
    setMessage({ type: 'success', text: 'คัดลอกโค้ด Embed แล้ว!' })
  }

  function updatePreview() {
    if (previewRef.current) {
      const doc = previewRef.current.contentDocument
      if (doc) {
        doc.open()
        // Show active file's content
        const content = activeFileIndex === -1 ? formHtml : (formSubPages[activeFileIndex]?.htmlContent || '')
        doc.write(content)
        doc.close()
      }
    }
  }

  useEffect(() => {
    if (showPreview) {
      const timer = setTimeout(updatePreview, 100)
      return () => clearTimeout(timer)
    }
  }, [showPreview, formHtml, activeFileIndex, formSubPages])

  const filteredPages = pages.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function pageBadges(page: CustomPage) {
    const badges: { text: string; cls: string }[] = []
    if (page.password) badges.push({ text: 'รหัสผ่าน', cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' })
    if (page.expiresAt) {
      const expired = new Date(page.expiresAt) < new Date()
      badges.push({
        text: expired ? 'หมดอายุ' : 'มีวันหมดอายุ',
        cls: expired ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      })
    }
    if (page.adDuration > 0 && page.adImageUrl && !page.useGlobalAd) badges.push({ text: `โฆษณา ${page.adDuration}วิ`, cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' })
    if (page.useGlobalAd && globalAd.enabled) badges.push({ text: 'โฆษณากลาง', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' })
    if (page.watermarkEnabled) badges.push({ text: 'ลายน้ำ', cls: 'text-purple-400 bg-purple-500/10 border-purple-500/20' })
    if (page.dbEnabled) badges.push({ text: 'DB', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' })
    if (page.subPages && Array.isArray(page.subPages) && page.subPages.length > 0) {
      badges.push({ text: `${(page.subPages as SubPage[]).length + 1} ไฟล์`, cls: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' })
    }
    return badges
  }

  // ─── Image Uploader Component ───
  function ImageUploader({
    imageUrl,
    onImageChange,
    onUpload,
    uploading,
    inputRef,
    label,
    height = 'h-32',
  }: {
    imageUrl: string
    onImageChange: (url: string) => void
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    uploading: boolean
    inputRef: React.RefObject<HTMLInputElement | null>
    label: string
    height?: string
  }) {
    return (
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-0.5 flex items-center gap-1.5">
          <Image className="w-3 h-3" /> {label}
        </label>
        {imageUrl ? (
          <div className="space-y-2">
            <div className={`relative rounded-xl overflow-hidden border border-white/[0.08] bg-black/40 ${height}`}>
              <img src={imageUrl} alt="Preview" className="w-full h-full object-contain" />
            </div>
            <div className="flex gap-2">
              <label className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] font-bold text-blue-400 cursor-pointer hover:bg-blue-500/20 active:scale-[0.98] transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Replace className="w-3.5 h-3.5" />}
                เปลี่ยนรูป
                <input ref={inputRef} type="file" accept="image/*" onChange={onUpload} className="hidden" disabled={uploading} />
              </label>
              <button
                onClick={() => onImageChange('')}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] font-bold text-red-400 hover:bg-red-500/20 active:scale-[0.98] transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                ลบ
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <label className={`flex-1 flex flex-col items-center justify-center gap-2 py-6 bg-white/[0.02] border-2 border-dashed border-white/[0.08] rounded-xl text-xs font-bold text-zinc-500 cursor-pointer hover:border-amber-500/30 hover:text-amber-400 hover:bg-amber-500/[0.03] active:scale-[0.98] transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              ) : (
                <ImagePlus className="w-6 h-6" />
              )}
              <span>{uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปภาพ'}</span>
              <span className="text-[9px] text-zinc-600 font-normal">PNG, JPG, GIF, WebP</span>
              <input ref={inputRef} type="file" accept="image/*" onChange={onUpload} className="hidden" disabled={uploading} />
            </label>
            <div className="flex-1 space-y-1.5">
              <span className="text-[10px] text-zinc-600 font-medium ml-0.5">หรือวาง URL</span>
              <input
                value={imageUrl}
                onChange={(e) => onImageChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono placeholder:text-zinc-700"
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── Toast Notification ───
  function Toast() {
    if (!message.text) return null
    return (
      <div className={`fixed bottom-20 sm:bottom-8 right-4 sm:right-8 left-4 sm:left-auto z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl transition-all animate-in slide-in-from-bottom-4 duration-300 ${
        message.type === 'success'
          ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400'
          : 'bg-red-500/15 border border-red-500/25 text-red-400'
      }`}>
        {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
        <span className="font-semibold text-xs sm:text-sm">{message.text}</span>
      </div>
    )
  }

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="relative">
          <div className="w-14 h-14 border-[3px] border-cyan-500/20 rounded-full" />
          <div className="absolute inset-0 w-14 h-14 border-[3px] border-transparent border-t-cyan-500 rounded-full animate-spin" />
        </div>
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">กำลังโหลด...</p>
      </div>
    )
  }

  // ═══════════════════════════════════════════
  // SUBMISSIONS VIEW
  // ═══════════════════════════════════════════
  if (viewMode === 'submissions') {
    return (
      <div className="space-y-5 sm:space-y-6 pb-28 sm:pb-8 max-w-6xl mx-auto">
        <Toast />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('list')}
              className="w-10 h-10 bg-zinc-900/50 border border-white/5 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/10 transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                ข้อมูลที่ส่งมา
              </h2>
              <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                {submissionsFilter ? submissionsFilterTitle : 'ทุกหน้า'} — {submissionsTotal} รายการ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {submissionsFilter && submissionsTotal > 0 && (
              <button
                onClick={() => { if (confirm(`ลบข้อมูลทั้งหมด ${submissionsTotal} รายการ?`)) deleteAllSubmissions(submissionsFilter) }}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ลบทั้งหมด</span>
              </button>
            )}
            {submissions.length > 0 && (
              <button
                onClick={exportSubmissionsCSV}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Submissions List */}
        {submissionsLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-[3px] border-cyan-500/20 rounded-full" />
              <div className="absolute inset-0 w-12 h-12 border-[3px] border-transparent border-t-cyan-500 rounded-full animate-spin" />
            </div>
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">กำลังโหลด...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16 sm:py-24">
            <div className="w-16 h-16 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Inbox className="w-7 h-7 text-zinc-700" />
            </div>
            <h3 className="text-base font-bold text-zinc-400 mb-1.5">ยังไม่มีข้อมูลที่ส่งมา</h3>
            <p className="text-xs text-zinc-600 font-medium">เมื่อมีคนกรอกฟอร์มใน HTML ข้อมูลจะแสดงที่นี่</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => {
              const dataObj = sub.data as Record<string, unknown>
              const displayKeys = Object.keys(dataObj).filter(k => !k.startsWith('__'))
              const isExpanded = expandedSubmission === sub.id
              return (
                <div
                  key={sub.id}
                  className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden transition-all"
                >
                  {/* Summary Row */}
                  <div
                    className="flex items-start gap-3 p-4 sm:p-5 cursor-pointer hover:bg-white/[0.02] transition-all"
                    onClick={() => setExpandedSubmission(isExpanded ? null : sub.id)}
                  >
                    <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <Inbox className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {!submissionsFilter && (
                          <span className="text-xs font-bold text-white">{sub.page?.title}</span>
                        )}
                        <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(sub.createdAt).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {sub.ipAddress && (
                          <span className="text-[10px] text-zinc-600 font-mono">{sub.ipAddress}</span>
                        )}
                      </div>
                      {/* Preview first 2-3 fields */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {displayKeys.slice(0, 3).map((key) => (
                          <span key={key} className="inline-flex items-center px-2 py-0.5 bg-white/[0.03] border border-white/[0.06] rounded-md text-[10px] text-zinc-400 font-mono truncate max-w-[150px]">
                            <span className="text-zinc-600 mr-1">{key}:</span>
                            {String(dataObj[key] ?? '')}
                          </span>
                        ))}
                        {displayKeys.length > 3 && (
                          <span className="text-[10px] text-zinc-600">+{displayKeys.length - 3} fields</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); if (confirm('ลบข้อมูลนี้?')) deleteSubmission(sub.id) }}
                        className="p-2 rounded-xl text-zinc-600 hover:text-red-400 active:scale-90 transition-all"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.06] p-4 sm:p-5 space-y-2">
                      {Object.entries(dataObj).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3">
                          <span className={`text-[11px] font-bold shrink-0 min-w-[80px] sm:min-w-[120px] ${key.startsWith('__') ? 'text-zinc-600' : 'text-zinc-400'}`}>
                            {key}
                          </span>
                          <span className="text-xs text-white font-mono break-all">
                            {typeof value === 'string' ? value : JSON.stringify(value)}
                          </span>
                        </div>
                      ))}
                      {sub.userAgent && (
                        <div className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3">
                          <span className="text-[11px] font-bold text-zinc-600 shrink-0 min-w-[80px] sm:min-w-[120px]">User-Agent</span>
                          <span className="text-[10px] text-zinc-600 font-mono break-all">{sub.userAgent}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Pagination */}
            {submissionsTotalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => fetchSubmissions(submissionsFilter, submissionsPage - 1)}
                  disabled={submissionsPage <= 1}
                  className="p-2.5 rounded-xl bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none active:scale-90 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-zinc-500 px-3">
                  {submissionsPage} / {submissionsTotalPages}
                </span>
                <button
                  onClick={() => fetchSubmissions(submissionsFilter, submissionsPage + 1)}
                  disabled={submissionsPage >= submissionsTotalPages}
                  className="p-2.5 rounded-xl bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none active:scale-90 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ═══════════════════════════════════════════
  // DATABASE VIEW
  // ═══════════════════════════════════════════
  if (viewMode === 'database') {
    return (
      <div className="space-y-5 sm:space-y-6 pb-8 max-w-6xl mx-auto">
        <Toast />

        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('list')}
                className="w-10 h-10 bg-zinc-900/50 border border-white/5 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/10 transition-all active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  ฐานข้อมูล {dbFilterTitle && <span className="text-blue-400">— {dbFilterTitle}</span>}
                </h2>
                <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                  ทั้งหมด {dbTotal.toLocaleString()} รายการ
                  {dbFilter && dbCollections.length > 0 && ` · ${dbCollections.length} collections`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {dbFilter && (
                <button
                  onClick={deleteAllDbRecords}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] font-bold text-red-400 hover:bg-red-500/20 transition-all active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" /> ลบทั้งหมด
                </button>
              )}
              <button
                onClick={exportDbCSV}
                disabled={dbRecords.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] font-bold text-blue-400 hover:bg-blue-500/20 transition-all active:scale-95 disabled:opacity-30"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>

          {/* Collection filter */}
          {dbFilter && dbCollections.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Collection:</span>
              <button
                onClick={() => { setDbCollectionFilter(null); fetchDbRecords(dbFilter, null, 1) }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  !dbCollectionFilter ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400' : 'bg-white/[0.03] border border-white/[0.06] text-zinc-500 hover:text-white'
                }`}
              >
                ทั้งหมด
              </button>
              {dbCollections.map(col => (
                <button
                  key={col}
                  onClick={() => { setDbCollectionFilter(col); fetchDbRecords(dbFilter, col, 1) }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    dbCollectionFilter === col ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400' : 'bg-white/[0.03] border border-white/[0.06] text-zinc-500 hover:text-white'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        {dbLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : dbRecords.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Database className="w-10 h-10 text-zinc-700 mx-auto" />
            <p className="text-sm text-zinc-500 font-medium">ยังไม่มีข้อมูล</p>
            {dbFilter && (
              <p className="text-[11px] text-zinc-600">
                HTML สามารถใช้ API เพื่อเก็บข้อมูลได้ เมื่อเปิดฐานข้อมูลในหน้านั้น
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {dbRecords.map((record) => (
              <div
                key={record.id}
                className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden"
              >
                {/* Summary row */}
                <div
                  className="flex items-center gap-3 p-3 sm:p-4 cursor-pointer hover:bg-white/[0.02] transition-all"
                  onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                >
                  <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {!dbFilter && (
                        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-md px-1.5 py-0.5">{record.page?.title}</span>
                      )}
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-md px-1.5 py-0.5">{record.collection}</span>
                      <span className="text-[10px] text-zinc-600 font-medium">{new Date(record.createdAt).toLocaleString('th-TH')}</span>
                    </div>
                    {/* Preview first 3 fields */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {Object.entries(record.data as Record<string, unknown>).slice(0, 3).map(([k, v]) => (
                        <span key={k} className="text-[10px] text-zinc-500 truncate max-w-[150px]">
                          <span className="text-zinc-600">{k}:</span> {typeof v === 'string' ? v : JSON.stringify(v)}
                        </span>
                      ))}
                      {Object.keys(record.data as Record<string, unknown>).length > 3 && (
                        <span className="text-[10px] text-zinc-600">+{Object.keys(record.data as Record<string, unknown>).length - 3}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteDbRecord(record.id) }}
                    className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors shrink-0"
                    title="ลบ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform shrink-0 ${expandedRecord === record.id ? 'rotate-180' : ''}`} />
                </div>
                {/* Expanded detail */}
                {expandedRecord === record.id && (
                  <div className="border-t border-white/5 p-3 sm:p-4 bg-black/20 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-600 mb-2">
                      <span>ID: <span className="font-mono text-zinc-500">{record.id}</span></span>
                      <span>·</span>
                      <span>อัปเดต: {new Date(record.updatedAt).toLocaleString('th-TH')}</span>
                    </div>
                    {Object.entries(record.data as Record<string, unknown>).map(([key, val]) => (
                      <div key={key} className="flex items-start gap-2 text-xs">
                        <span className="text-blue-400/70 font-bold shrink-0 min-w-[80px]">{key}</span>
                        <span className="text-zinc-300 break-all font-mono text-[11px]">
                          {typeof val === 'string' ? val : JSON.stringify(val, null, 2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            {dbTotalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => fetchDbRecords(dbFilter, dbCollectionFilter, dbPage - 1)}
                  disabled={dbPage <= 1}
                  className="p-2.5 rounded-xl bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none active:scale-90 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] text-zinc-500 font-medium">
                  {dbPage} / {dbTotalPages}
                </span>
                <button
                  onClick={() => fetchDbRecords(dbFilter, dbCollectionFilter, dbPage + 1)}
                  disabled={dbPage >= dbTotalPages}
                  className="p-2.5 rounded-xl bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none active:scale-90 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ═══════════════════════════════════════════
  // EDITOR VIEW
  // ═══════════════════════════════════════════
  if (viewMode === 'editor') {
    return (
      <div className="space-y-5 sm:space-y-6 pb-28 sm:pb-8 max-w-6xl mx-auto">
        <Toast />

        {/* Editor Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('list')}
              className="w-10 h-10 bg-zinc-900/50 border border-white/5 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/10 transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {editingPage ? 'แก้ไขหน้าเว็บ' : 'สร้างหน้าเว็บใหม่'}
              </h2>
              <p className="text-[11px] text-zinc-500 font-medium mt-0.5">ใส่โค้ด HTML แล้วระบบจะสร้างลิงก์ให้</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                showPreview
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">พรีวิว</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 border border-cyan-400/20 rounded-xl text-xs sm:text-sm font-bold text-white hover:from-cyan-500 hover:to-cyan-400 transition-all active:scale-95 disabled:opacity-40 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </div>

        {/* Title + Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-0.5">ชื่อหน้าเว็บ</label>
            <input
              value={formTitle}
              onChange={(e) => {
                setFormTitle(e.target.value)
                if (!editingPage) setFormSlug(generateSlugFromTitle(e.target.value))
              }}
              placeholder="เช่น โปรโมชั่นพิเศษ, หน้าแนะนำ..."
              className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all font-medium placeholder:text-zinc-700"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-0.5">Slug (URL)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm font-mono">/p/</span>
              <input
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="my-page"
                className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono placeholder:text-zinc-700"
              />
            </div>
          </div>
        </div>

        {/* Settings Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Publish toggle */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <Toggle enabled={formPublished} onChange={() => setFormPublished(!formPublished)} />
            <div className="min-w-0 flex-1">
              <span className={`text-xs font-bold ${formPublished ? 'text-cyan-400' : 'text-zinc-500'}`}>
                {formPublished ? 'เผยแพร่' : 'ซ่อน (Draft)'}
              </span>
              {formSlug && (
                <p className="text-[9px] font-mono text-zinc-600 truncate mt-0.5">/p/{formSlug}</p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">รหัสผ่าน</span>
            </div>
            <input
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              placeholder="ไม่มีรหัส (เปิดสาธารณะ)"
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-500/40 focus:ring-1 focus:ring-yellow-500/20 transition-all font-mono placeholder:text-zinc-700"
            />
          </div>

          {/* Expiry */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarClock className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">วันหมดอายุ</span>
            </div>
            <input
              type="datetime-local"
              value={formExpiresAt}
              onChange={(e) => setFormExpiresAt(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all [color-scheme:dark] placeholder:text-zinc-700"
            />
            {formExpiresAt && (
              <button onClick={() => setFormExpiresAt('')} className="text-[10px] text-red-400 font-bold mt-1.5 hover:text-red-300 transition-colors">ลบวันหมดอายุ</button>
            )}
          </div>
        </div>

        {/* Database Toggle */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <Toggle enabled={formDbEnabled} onChange={() => setFormDbEnabled(!formDbEnabled)} />
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white">เปิดฐานข้อมูล</h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">เปิดใช้ API สำหรับเก็บ/ดึงข้อมูลจาก HTML ของหน้านี้</p>
            </div>
          </div>
          {formDbEnabled && formSlug && (
            <div className="mt-3 bg-black/30 border border-white/5 rounded-lg p-3 space-y-2">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">API Endpoint</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[11px] font-mono text-blue-400 bg-blue-500/5 border border-blue-500/10 rounded-lg px-3 py-2 truncate">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/api/custom-pages/{formSlug}/db
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/api/custom-pages/${formSlug}/db`)
                    setMessage({ type: 'success', text: 'คัดลอก API URL แล้ว!' })
                  }}
                  className="p-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-zinc-500 hover:text-blue-400 hover:border-blue-500/20 transition-all active:scale-90 shrink-0"
                  title="คัดลอก"
                >
                  <ClipboardCopy className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[10px] text-zinc-600 space-y-1 mt-2">
                <p><span className="text-emerald-400 font-bold">GET</span> <span className="text-zinc-500">— ดึงข้อมูล (?collection=xxx&limit=50&offset=0)</span></p>
                <p><span className="text-blue-400 font-bold">POST</span> <span className="text-zinc-500">— เพิ่มข้อมูล {`{ collection?, data: {...} }`}</span></p>
                <p><span className="text-amber-400 font-bold">PUT</span> <span className="text-zinc-500">— อัปเดต {`{ id, data: {...} }`}</span></p>
                <p><span className="text-red-400 font-bold">DELETE</span> <span className="text-zinc-500">— ลบ (?id=xxx)</span></p>
              </div>
            </div>
          )}
        </div>

        {/* Watermark & Ad Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Watermark */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Droplets className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white">ลายน้ำ (Watermark)</h4>
                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">โลโก้ + ชื่อเว็บ ล่างซ้าย (กดได้)</p>
              </div>
              <Toggle enabled={formWatermark} onChange={() => setFormWatermark(!formWatermark)} />
            </div>
            <div className={`text-[11px] font-medium px-3 py-2 rounded-lg ${formWatermark ? 'text-purple-400 bg-purple-500/5 border border-purple-500/10' : 'text-zinc-600 bg-white/[0.02] border border-white/[0.04]'}`}>
              {formWatermark ? 'เปิด — แสดงโลโก้เว็บ + ลิงก์ไปหน้าหลัก' : 'ปิด — ไม่แสดงลายน้ำ'}
            </div>
          </div>

          {/* Ad Settings */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Image className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white">โฆษณา (Ad Overlay)</h4>
                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">แสดงโฆษณาก่อนเข้าดู</p>
              </div>
            </div>

            {/* Global Ad Toggle */}
            <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
              <Toggle enabled={formUseGlobalAd} onChange={() => setFormUseGlobalAd(!formUseGlobalAd)} size="sm" />
              <div className="min-w-0 flex-1">
                <span className={`text-[11px] font-bold ${formUseGlobalAd ? 'text-amber-400' : 'text-zinc-500'}`}>
                  {formUseGlobalAd ? 'ใช้โฆษณากลาง' : 'ตั้งโฆษณาเฉพาะหน้านี้'}
                </span>
                {formUseGlobalAd && (
                  <p className="text-[9px] text-zinc-600 mt-0.5">
                    {globalAd.enabled ? `เปิดอยู่ (${globalAd.duration} วิ)` : 'โฆษณากลางยังปิดอยู่ — ไปเปิดที่ตั้งค่าโฆษณากลาง'}
                  </p>
                )}
              </div>
            </div>

            {/* Per-page ad settings */}
            {!formUseGlobalAd && (
              <div className="space-y-4 pt-1">
                <ImageUploader
                  imageUrl={formAdImageUrl}
                  onImageChange={setFormAdImageUrl}
                  onUpload={handleAdImageUpload}
                  uploading={uploadingAd}
                  inputRef={adImageInputRef}
                  label="รูปโฆษณา"
                  height="h-24"
                />

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-0.5 flex items-center gap-1">
                    <Link className="w-2.5 h-2.5" /> ลิงก์โฆษณา (redirect หลังนับเวลา)
                  </label>
                  <input
                    value={formAdLinkUrl}
                    onChange={(e) => setFormAdLinkUrl(e.target.value)}
                    placeholder="https://example.com/promo"
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono placeholder:text-zinc-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-0.5 flex items-center gap-1">
                    <Timer className="w-2.5 h-2.5" /> เวลาโฆษณา
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={formAdDuration}
                      onChange={(e) => setFormAdDuration(parseInt(e.target.value))}
                      className="flex-1 accent-amber-500 h-1.5"
                    />
                    <span className={`text-sm font-bold min-w-[3rem] text-center px-2 py-1 rounded-lg ${formAdDuration > 0 ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-600 bg-white/[0.03]'}`}>
                      {formAdDuration === 0 ? 'ปิด' : `${formAdDuration} วิ`}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* HTML Editor + Preview */}
        <div className={`grid gap-4 ${showPreview ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Code Editor */}
          <div className="space-y-2">
            {/* ─── File Tabs (Multi-file system) ─── */}
            <div className="flex items-center gap-1 flex-wrap">
              {/* Main file tab (index.html) */}
              <button
                onClick={() => setActiveFileIndex(-1)}
                className={`group flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-bold transition-all border border-b-0 ${
                  activeFileIndex === -1
                    ? 'bg-zinc-950/80 border-cyan-500/30 text-cyan-400'
                    : 'bg-zinc-900/30 border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10'
                }`}
              >
                <FileCode className="w-3 h-3" />
                <span>index.html</span>
                <span className="text-[9px] text-zinc-600 font-mono ml-1">({formHtml.length.toLocaleString()})</span>
              </button>

              {/* Sub-page tabs */}
              {formSubPages.map((sp, idx) => (
                <div key={idx} className="relative group flex items-center">
                  {editingFileName === idx ? (
                    <div className="flex items-center gap-1 bg-zinc-900/80 border border-cyan-500/30 rounded-t-xl px-2 py-1.5">
                      <input
                        value={editFileTitleValue}
                        onChange={(e) => setEditFileTitleValue(e.target.value)}
                        placeholder="ชื่อ"
                        className="bg-transparent text-[11px] text-white font-bold w-16 outline-none"
                        autoFocus
                      />
                      <input
                        value={editFileNameValue}
                        onChange={(e) => setEditFileNameValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="filename"
                        className="bg-transparent text-[11px] text-cyan-300 font-mono w-16 outline-none"
                      />
                      <button
                        onClick={() => {
                          if (editFileNameValue.trim()) {
                            // Check for duplicate filenames
                            const dup = formSubPages.some((s, i) => i !== idx && s.filename === editFileNameValue.trim())
                            if (dup) {
                              setMessage({ type: 'error', text: 'ชื่อไฟล์ซ้ำ!' })
                              return
                            }
                            setFormSubPages(prev => prev.map((s, i) => i === idx ? { ...s, filename: editFileNameValue.trim(), title: editFileTitleValue.trim() || editFileNameValue.trim() } : s))
                          }
                          setEditingFileName(null)
                        }}
                        className="p-0.5 text-emerald-400 hover:text-emerald-300"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => setEditingFileName(null)} className="p-0.5 text-zinc-500 hover:text-zinc-300">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveFileIndex(idx)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-bold transition-all border border-b-0 ${
                        activeFileIndex === idx
                          ? 'bg-zinc-950/80 border-cyan-500/30 text-cyan-400'
                          : 'bg-zinc-900/30 border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10'
                      }`}
                    >
                      <FileCode className="w-3 h-3" />
                      <span>{sp.title || sp.filename}.html</span>
                      <span className="text-[9px] text-zinc-600 font-mono ml-1">({sp.htmlContent.length.toLocaleString()})</span>
                      {/* Edit & Delete (visible when active) */}
                      {activeFileIndex === idx && (
                        <span className="flex items-center gap-0.5 ml-1">
                          <span
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingFileName(idx)
                              setEditFileNameValue(sp.filename)
                              setEditFileTitleValue(sp.title)
                            }}
                            className="p-0.5 text-zinc-600 hover:text-blue-400 transition-colors cursor-pointer"
                            title="เปลี่ยนชื่อ"
                          >
                            <Pencil className="w-2.5 h-2.5" />
                          </span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm(`ลบไฟล์ "${sp.title || sp.filename}.html"?`)) {
                                setFormSubPages(prev => prev.filter((_, i) => i !== idx))
                                if (activeFileIndex === idx) setActiveFileIndex(-1)
                                else if (activeFileIndex > idx) setActiveFileIndex(activeFileIndex - 1)
                              }
                            }}
                            className="p-0.5 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                            title="ลบไฟล์"
                          >
                            <X className="w-2.5 h-2.5" />
                          </span>
                        </span>
                      )}
                    </button>
                  )}
                </div>
              ))}

              {/* Add file button */}
              <button
                onClick={() => {
                  setNewFileName('')
                  setNewFileTitle('')
                  setShowAddFileModal(true)
                }}
                className="flex items-center gap-1 px-2.5 py-2 rounded-t-xl text-xs font-bold text-zinc-600 hover:text-cyan-400 border border-b-0 border-dashed border-white/5 hover:border-cyan-500/30 transition-all bg-zinc-900/20"
                title="เพิ่มไฟล์ HTML ใหม่"
              >
                <FilePlus2 className="w-3 h-3" />
                <span className="hidden sm:inline">เพิ่มไฟล์</span>
              </button>
            </div>

            {/* Add File Modal */}
            {showAddFileModal && (
              <div className="bg-zinc-900/80 border border-cyan-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FilePlus2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-white">เพิ่มไฟล์ HTML ใหม่</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">ชื่อไฟล์ (filename)</label>
                    <div className="relative">
                      <input
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="login"
                        className="w-full bg-zinc-950/50 border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white font-mono focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-zinc-700"
                        autoFocus
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 text-xs font-mono">.html</span>
                    </div>
                    {newFileName && (
                      <p className="text-[9px] font-mono text-zinc-600">/p/{formSlug || 'slug'}/{newFileName}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">ชื่อแสดง (title)</label>
                    <input
                      value={newFileTitle}
                      onChange={(e) => setNewFileTitle(e.target.value)}
                      placeholder="หน้าล็อกอิน"
                      className="w-full bg-zinc-950/50 border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-zinc-700"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (!newFileName.trim()) {
                        setMessage({ type: 'error', text: 'กรุณากรอกชื่อไฟล์' })
                        return
                      }
                      const dup = formSubPages.some(s => s.filename === newFileName.trim())
                      if (dup) {
                        setMessage({ type: 'error', text: 'ชื่อไฟล์ซ้ำ!' })
                        return
                      }
                      const newSp: SubPage = {
                        filename: newFileName.trim(),
                        title: newFileTitle.trim() || newFileName.trim(),
                        htmlContent: `<!DOCTYPE html>\n<html lang="th">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${newFileTitle.trim() || newFileName.trim()}</title>\n  <style>\n    * { margin: 0; padding: 0; box-sizing: border-box; }\n    body { background: #000; color: #fff; font-family: sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; }\n  </style>\n</head>\n<body>\n  <h1>${newFileTitle.trim() || newFileName.trim()}</h1>\n</body>\n</html>`,
                      }
                      setFormSubPages(prev => [...prev, newSp])
                      setActiveFileIndex(formSubPages.length)
                      setShowAddFileModal(false)
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 border border-cyan-400/20 rounded-xl text-xs font-bold text-white hover:from-cyan-500 hover:to-cyan-400 transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    เพิ่มไฟล์
                  </button>
                  <button
                    onClick={() => setShowAddFileModal(false)}
                    className="px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all active:scale-95"
                  >
                    ยกเลิก
                  </button>
                </div>
                {/* Quick templates */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-zinc-600 font-bold self-center mr-1">เทมเพลต:</span>
                  {[
                    { name: 'login', title: 'หน้าล็อกอิน' },
                    { name: 'register', title: 'หน้าสมัคร' },
                    { name: 'success', title: 'สำเร็จ' },
                    { name: 'error', title: 'ข้อผิดพลาด' },
                    { name: 'about', title: 'เกี่ยวกับ' },
                    { name: 'contact', title: 'ติดต่อ' },
                  ].filter(t => !formSubPages.some(s => s.filename === t.name)).map(t => (
                    <button
                      key={t.name}
                      onClick={() => { setNewFileName(t.name); setNewFileTitle(t.title) }}
                      className="px-2 py-1 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[10px] font-bold text-zinc-500 hover:text-cyan-400 hover:border-cyan-500/20 transition-all"
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* File info bar */}
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-0.5 flex items-center gap-1.5">
                <FileCode className="w-3 h-3" />
                {activeFileIndex === -1 ? 'index.html (หน้าหลัก)' : `${formSubPages[activeFileIndex]?.filename || ''}.html`}
                {activeFileIndex >= 0 && formSlug && (
                  <span className="text-zinc-600 font-mono">— /p/{formSlug}/{formSubPages[activeFileIndex]?.filename}</span>
                )}
              </label>
              <span className="text-[10px] font-mono text-zinc-700">
                {(activeFileIndex === -1 ? formHtml : formSubPages[activeFileIndex]?.htmlContent || '').length.toLocaleString()} chars
              </span>
            </div>

            {/* Multi-file link helper */}
            {formSubPages.length > 0 && formSlug && (
              <div className="bg-zinc-900/40 border border-white/5 rounded-lg p-3 space-y-1.5">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Files className="w-3 h-3" /> ลิงก์ไฟล์ทั้งหมด
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded px-2 py-0.5 cursor-pointer hover:bg-emerald-500/10 transition-all"
                    onClick={() => { navigator.clipboard.writeText(`/p/${formSlug}`); setMessage({ type: 'success', text: 'คัดลอกแล้ว' }) }}
                  >/p/{formSlug}</span>
                  {formSubPages.map((sp, idx) => (
                    <span key={idx} className="text-[10px] font-mono text-cyan-400 bg-cyan-500/5 border border-cyan-500/10 rounded px-2 py-0.5 cursor-pointer hover:bg-cyan-500/10 transition-all"
                      onClick={() => { navigator.clipboard.writeText(`/p/${formSlug}/${sp.filename}`); setMessage({ type: 'success', text: 'คัดลอกแล้ว' }) }}
                    >/p/{formSlug}/{sp.filename}</span>
                  ))}
                </div>
                <p className="text-[9px] text-zinc-600">ใช้ลิงก์เหล่านี้ในโค้ด HTML เพื่อเชื่อมหน้ากัน เช่น <code className="text-cyan-500">&lt;a href=&quot;/p/{formSlug}/login&quot;&gt;ไปหน้าล็อกอิน&lt;/a&gt;</code></p>
              </div>
            )}

            {/* Textarea for active file */}
            <textarea
              value={activeFileIndex === -1 ? formHtml : (formSubPages[activeFileIndex]?.htmlContent || '')}
              onChange={(e) => {
                if (activeFileIndex === -1) {
                  setFormHtml(e.target.value)
                } else {
                  setFormSubPages(prev => prev.map((sp, i) => i === activeFileIndex ? { ...sp, htmlContent: e.target.value } : sp))
                }
              }}
              placeholder={'<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { background: #000; color: #fff; font-family: sans-serif; }\n  </style>\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>'}
              spellCheck={false}
              className="w-full bg-zinc-950/80 border border-white/[0.06] rounded-xl px-4 py-3.5 text-sm text-emerald-300 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono leading-relaxed placeholder:text-zinc-800 resize-none"
              style={{ minHeight: showPreview ? '500px' : '600px' }}
            />
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-0.5 flex items-center gap-1.5">
                  <Eye className="w-3 h-3" /> พรีวิว
                </label>
                <div className="flex items-center gap-0.5 bg-zinc-900/50 border border-white/5 rounded-lg p-0.5">
                  {([
                    { key: 'mobile' as PreviewDevice, icon: Smartphone, title: 'มือถือ' },
                    { key: 'desktop' as PreviewDevice, icon: Monitor, title: 'คอมพิวเตอร์' },
                    { key: 'fullscreen' as PreviewDevice, icon: Maximize2, title: 'เต็มจอ' },
                  ] as const).map(({ key, icon: Icon, title }) => (
                    <button
                      key={key}
                      onClick={() => setPreviewDevice(key)}
                      className={`p-1.5 rounded-md transition-all ${previewDevice === key ? 'bg-cyan-500/15 text-cyan-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                      title={title}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>
              <div className={`bg-white rounded-xl overflow-hidden border border-white/[0.06] mx-auto ${
                previewDevice === 'mobile' ? 'max-w-[375px]' : 'w-full'
              }`}>
                <iframe
                  ref={previewRef}
                  className="w-full bg-white"
                  style={{ height: '500px' }}
                  sandbox="allow-scripts allow-same-origin"
                  title="Preview"
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile floating save */}
        <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 p-3 bg-black/90 backdrop-blur-xl border-t border-white/[0.06]">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className="px-4 py-3.5 bg-zinc-800 border border-white/10 rounded-xl text-sm font-bold text-zinc-400 active:scale-95 transition-all"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-cyan-600 to-cyan-500 border border-cyan-400/20 rounded-xl text-sm font-bold text-white active:scale-[0.98] disabled:opacity-40 transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════
  // LIST VIEW
  // ═══════════════════════════════════════════
  return (
    <div className="space-y-6 sm:space-y-8 pb-28 sm:pb-12 max-w-6xl mx-auto">
      <Toast />

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowQrModal(null)} />
          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <h3 className="text-sm font-bold text-white mb-4">QR Code</h3>
            <div className="bg-white rounded-xl p-4 mx-auto w-fit">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '/p/' + showQrModal)}`}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>
            <p className="text-[11px] font-mono text-zinc-500 mt-3 truncate">{window.location.origin}/p/{showQrModal}</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(window.location.origin + '/p/' + showQrModal)}`
                  window.open(url, '_blank')
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 border border-cyan-400/20 rounded-xl text-xs font-bold text-white hover:from-cyan-500 hover:to-cyan-400 transition-all active:scale-95"
              >
                ดาวน์โหลด
              </button>
              <button
                onClick={() => setShowQrModal(null)}
                className="flex-1 py-2.5 bg-zinc-800 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all active:scale-95"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embed Code Modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowEmbedModal(null)} />
          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" />
              Embed Code (iframe)
            </h3>
            <textarea
              readOnly
              value={`<iframe src="${window.location.origin}/p/${showEmbedModal}" width="100%" height="600" frameborder="0" style="border:none;border-radius:12px;" allowfullscreen></iframe>`}
              rows={4}
              className="w-full bg-zinc-950 border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs text-cyan-300 font-mono resize-none"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => { copyEmbed(showEmbedModal); setShowEmbedModal(null) }}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 border border-cyan-400/20 rounded-xl text-xs font-bold text-white hover:from-cyan-500 hover:to-cyan-400 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Copy className="w-3 h-3" /> คัดลอก
              </button>
              <button
                onClick={() => setShowEmbedModal(null)}
                className="flex-1 py-2.5 bg-zinc-800 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all active:scale-95"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-zinc-900 border border-red-500/20 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">ลบหน้าเว็บนี้?</h3>
            <p className="text-xs text-zinc-500 mb-5">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-zinc-800 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all active:scale-95"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-600 border border-red-500/30 rounded-xl text-xs font-bold text-white hover:bg-red-500 transition-all active:scale-95"
              >
                ยืนยันลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal (Bottom Sheet on Mobile) */}
      {detailPage && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDetailPage(null)} />
          <div className="relative bg-zinc-900 border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl overflow-hidden max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Drag indicator (mobile) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-zinc-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06] sticky top-0 bg-zinc-900/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${
                  detailPage.isPublished
                    ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                    : 'bg-zinc-800 border-white/10 text-zinc-600'
                }`}>
                  <FileCode className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{detailPage.title}</h3>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                      detailPage.isPublished
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                    }`}>
                      {detailPage.isPublished ? 'เผยแพร่' : 'ซ่อน'}
                    </span>
                    {pageBadges(detailPage).map((b, i) => (
                      <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold border ${b.cls}`}>{b.text}</span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDetailPage(null)}
                className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all active:scale-90 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">เข้าชม</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{detailPage.views.toLocaleString()}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">ID</span>
                  </div>
                  <p className="text-xs font-mono text-zinc-400 truncate mt-1" title={detailPage.id}>{detailPage.id}</p>
                </div>
              </div>

              {/* Info Rows */}
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Link2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="text-xs font-mono text-zinc-400 truncate">/p/{detailPage.slug}</span>
                  </div>
                  <button
                    onClick={() => copyLink(detailPage.slug)}
                    className="p-1.5 rounded-lg text-zinc-600 hover:text-cyan-400 active:scale-90 transition-all shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Globe className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="text-[11px] font-mono text-zinc-500 truncate">{typeof window !== 'undefined' ? window.location.origin : ''}/p/{detailPage.slug}</span>
                  </div>
                  <a
                    href={`/p/${detailPage.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-zinc-600 hover:text-emerald-400 active:scale-90 transition-all shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {detailPage.expiresAt && (
                  <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                    <CalendarClock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">หมดอายุ</span>
                      <p className={`text-xs font-medium ${new Date(detailPage.expiresAt) < new Date() ? 'text-red-400' : 'text-zinc-400'}`}>
                        {new Date(detailPage.expiresAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })} &middot; {new Date(detailPage.expiresAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        {new Date(detailPage.expiresAt) < new Date() && ' (หมดอายุแล้ว)'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">สร้างเมื่อ</span>
                    <p className="text-xs text-zinc-400 font-medium">
                      {new Date(detailPage.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })} &middot; {new Date(detailPage.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                  <RefreshCw className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">แก้ไขล่าสุด</span>
                    <p className="text-xs text-zinc-400 font-medium">
                      {new Date(detailPage.updatedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })} &middot; {new Date(detailPage.updatedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-white/[0.06] space-y-2.5 sticky bottom-0 bg-zinc-900/95 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setDetailPage(null); openEditor(detailPage) }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 border border-cyan-400/20 rounded-xl text-xs font-bold text-white hover:from-cyan-500 hover:to-cyan-400 transition-all active:scale-[0.98]"
                >
                  <Edit3 className="w-3.5 h-3.5" /> แก้ไข
                </button>
                <button
                  onClick={() => { togglePublish(detailPage); setDetailPage({ ...detailPage, isPublished: !detailPage.isPublished }) }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-xl text-xs font-bold transition-all active:scale-[0.98] ${
                    detailPage.isPublished
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {detailPage.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {detailPage.isPublished ? 'ซ่อน' : 'เผยแพร่'}
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => { handleClone(detailPage); setDetailPage(null) }}
                  className="flex flex-col items-center justify-center gap-1 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[10px] font-bold text-zinc-400 hover:text-white hover:border-white/[0.12] active:scale-95 transition-all"
                >
                  <CopyPlus className="w-3.5 h-3.5" />
                  <span>สำเนา</span>
                </button>
                <button
                  onClick={() => { setShowQrModal(detailPage.slug); setDetailPage(null) }}
                  className="flex flex-col items-center justify-center gap-1 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[10px] font-bold text-zinc-400 hover:text-white hover:border-white/[0.12] active:scale-95 transition-all"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Code</span>
                </button>
                <button
                  onClick={() => { setShowEmbedModal(detailPage.slug); setDetailPage(null) }}
                  className="flex flex-col items-center justify-center gap-1 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[10px] font-bold text-zinc-400 hover:text-white hover:border-white/[0.12] active:scale-95 transition-all"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Embed</span>
                </button>
                <button
                  onClick={() => { if (confirm('รีเซ็ตยอดเข้าชม?')) { handleResetViews(detailPage); setDetailPage({ ...detailPage, views: 0 }) } }}
                  className="flex flex-col items-center justify-center gap-1 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[10px] font-bold text-zinc-400 hover:text-red-400 hover:border-red-500/20 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>รีเซ็ต</span>
                </button>
              </div>
              {(detailPage._count?.submissions || 0) > 0 && (
                <button
                  onClick={() => { openSubmissions(detailPage.id, detailPage.title); setDetailPage(null) }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] font-bold text-rose-400 hover:bg-rose-500/20 transition-all active:scale-[0.98]"
                >
                  <Inbox className="w-3.5 h-3.5" /> ดูข้อมูลฟอร์ม ({detailPage._count.submissions})
                </button>
              )}
              {(detailPage._count?.submissions || 0) === 0 && (
                <button
                  onClick={() => { openSubmissions(detailPage.id, detailPage.title); setDetailPage(null) }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-[11px] font-bold text-zinc-500 hover:text-zinc-300 hover:border-white/[0.12] transition-all active:scale-[0.98]"
                >
                  <Inbox className="w-3.5 h-3.5" /> ดูข้อมูลฟอร์ม
                </button>
              )}
              {detailPage.dbEnabled && (
                <button
                  onClick={() => { openDatabase(detailPage.id, detailPage.title); setDetailPage(null) }}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold transition-all active:scale-[0.98] ${
                    (detailPage._count?.dbRecords || 0) > 0
                      ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
                      : 'bg-white/[0.02] border border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.12]'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" /> ฐานข้อมูล {(detailPage._count?.dbRecords || 0) > 0 && `(${detailPage._count!.dbRecords})`}
                </button>
              )}
              <button
                onClick={() => { setDeleteConfirm(detailPage.id); setDetailPage(null) }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/5 border border-red-500/10 rounded-xl text-[11px] font-bold text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-[0.98]"
              >
                <Trash2 className="w-3 h-3" /> ลบหน้าเว็บนี้
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center shrink-0">
              <Code2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">สร้างเว็บ</h2>
              <p className="text-zinc-500 text-xs font-medium mt-0.5">สร้างหน้าเว็บจากโค้ด HTML แล้วแชร์ลิงก์ได้เลย</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => openEditor()}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 border border-cyan-400/20 rounded-xl text-sm font-bold text-white hover:from-cyan-500 hover:to-cyan-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.15)] sm:shrink-0"
        >
          <Plus className="w-4 h-4" />
          สร้างหน้าใหม่
        </button>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="ทั้งหมด" value={pages.length} icon={FileCode} color="cyan" />
        <StatCard label="เผยแพร่" value={pages.filter(p => p.isPublished).length} icon={Globe} color="emerald" />
        <StatCard label="ซ่อนอยู่" value={pages.filter(p => !p.isPublished).length} icon={EyeOff} color="amber" />
        <StatCard label="เข้าชมรวม" value={pages.reduce((sum, p) => sum + p.views, 0)} icon={BarChart3} color="purple" />
        <button
          onClick={() => openSubmissions()}
          className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-3 hover:border-rose-500/20 hover:bg-rose-500/[0.03] transition-all group text-left"
        >
          <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-rose-500/20 transition-all">
            <Inbox className="w-4 h-4 text-rose-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-zinc-500 font-medium">ข้อมูลฟอร์ม</p>
            <p className="text-lg font-bold text-white">{pages.reduce((sum, p) => sum + (p._count?.submissions || 0), 0).toLocaleString()}</p>
          </div>
        </button>
        <button
          onClick={() => openDatabase()}
          className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center gap-3 hover:border-blue-500/20 hover:bg-blue-500/[0.03] transition-all group text-left"
        >
          <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-all">
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-zinc-500 font-medium">ฐานข้อมูล</p>
            <p className="text-lg font-bold text-white">{pages.reduce((sum, p) => sum + (p._count?.dbRecords || 0), 0).toLocaleString()}</p>
          </div>
        </button>
      </div>

      {/* ─── Global Ad Settings ─── */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowGlobalAdSettings(!showGlobalAdSettings)}
          className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-white/[0.02] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${globalAd.enabled ? 'bg-amber-500/10 border-amber-500/20' : 'bg-zinc-800/50 border-white/10'}`}>
              <Settings className={`w-5 h-5 ${globalAd.enabled ? 'text-amber-400' : 'text-zinc-600'}`} />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-white">ตั้งค่าโฆษณากลาง</h3>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                {globalAd.enabled
                  ? `เปิดอยู่ — ${globalAd.duration} วินาที${globalAd.linkUrl ? ' + redirect' : ''}`
                  : 'ปิดอยู่ — กดเพื่อตั้งค่าโฆษณาใช้กับทุกหน้า'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${globalAd.enabled ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-zinc-800 border border-white/10 text-zinc-600'}`}>
              {globalAd.enabled ? 'ON' : 'OFF'}
            </span>
            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${showGlobalAdSettings ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {showGlobalAdSettings && (
          <div className="border-t border-white/[0.06] p-5 space-y-5">
            <div className="flex items-center gap-3">
              <Toggle enabled={gAdEnabled} onChange={() => setGAdEnabled(!gAdEnabled)} />
              <span className={`text-xs font-bold ${gAdEnabled ? 'text-amber-400' : 'text-zinc-500'}`}>
                {gAdEnabled ? 'เปิดโฆษณากลาง' : 'ปิดโฆษณากลาง'}
              </span>
            </div>

            <ImageUploader
              imageUrl={gAdImageUrl}
              onImageChange={setGAdImageUrl}
              onUpload={handleGlobalAdImageUpload}
              uploading={uploadingGlobalAd}
              inputRef={globalAdImageInputRef}
              label="รูปโฆษณา"
              height="h-36"
            />

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-0.5 flex items-center gap-1.5">
                <Link className="w-3 h-3" /> ลิงก์โฆษณา (redirect หลังนับเวลา)
              </label>
              <input
                value={gAdLinkUrl}
                onChange={(e) => setGAdLinkUrl(e.target.value)}
                placeholder="https://example.com/promo"
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono placeholder:text-zinc-700"
              />
              <p className="text-[10px] text-zinc-600 font-medium ml-0.5">หลังนับเวลาเสร็จจะ redirect ไปลิงก์นี้ (ถ้าไม่ใส่จะแสดงเนื้อหาปกติ)</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-0.5 flex items-center gap-1.5">
                <Timer className="w-3 h-3" /> เวลาโฆษณา
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={gAdDuration}
                  onChange={(e) => setGAdDuration(parseInt(e.target.value))}
                  className="flex-1 accent-amber-500 h-1.5"
                />
                <span className="text-sm font-bold text-amber-400 min-w-[3.5rem] text-center px-2 py-1 rounded-lg bg-amber-500/10">{gAdDuration} วิ</span>
              </div>
            </div>

            <button
              onClick={saveGlobalAd}
              disabled={savingGlobalAd}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-600 to-amber-500 border border-amber-400/20 rounded-xl text-sm font-bold text-white hover:from-amber-500 hover:to-amber-400 transition-all active:scale-[0.98] disabled:opacity-40 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
            >
              {savingGlobalAd ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {savingGlobalAd ? 'กำลังบันทึก...' : 'บันทึกตั้งค่าโฆษณากลาง'}
            </button>
          </div>
        )}
      </div>

      {/* ─── Search ─── */}
      {pages.length > 0 && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อหรือ slug..."
            className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all font-medium placeholder:text-zinc-700"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ─── Pages List ─── */}
      {filteredPages.length === 0 ? (
        <div className="text-center py-16 sm:py-24">
          <div className="w-16 h-16 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Code2 className="w-7 h-7 text-zinc-700" />
          </div>
          <h3 className="text-base font-bold text-zinc-400 mb-1.5">
            {searchQuery ? 'ไม่พบผลลัพธ์' : 'ยังไม่มีหน้าเว็บ'}
          </h3>
          <p className="text-xs text-zinc-600 font-medium mb-6">
            {searchQuery ? 'ลองค้นหาด้วยคำอื่น' : 'กดปุ่ม "สร้างหน้าใหม่" เพื่อเริ่มต้น'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => openEditor()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 border border-cyan-400/20 rounded-xl text-sm font-bold text-white hover:from-cyan-500 hover:to-cyan-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
            >
              <Plus className="w-4 h-4" />
              สร้างหน้าแรก
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPages.map((page) => (
            <div
              key={page.id}
              className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Icon + Info (clickable to open detail) */}
                <div
                  className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
                  onClick={() => setDetailPage(page)}
                >
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
                    page.isPublished
                      ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                      : 'bg-zinc-800/50 border-white/10 text-zinc-600'
                  }`}>
                    <FileCode className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {/* Title + Status */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-none">{page.title}</h3>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                        page.isPublished
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                      }`}>
                        {page.isPublished ? 'เผยแพร่' : 'ซ่อน'}
                      </span>
                    </div>
                    {/* Slug */}
                    <p className="text-[11px] font-mono text-zinc-600 mt-1 truncate">/p/{page.slug}</p>
                    {/* Meta: views, date, badges */}
                    <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
                      <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {page.views.toLocaleString()}
                      </span>
                      {(page._count?.submissions || 0) > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openSubmissions(page.id, page.title) }}
                          className="text-[10px] text-rose-400/80 font-medium flex items-center gap-1 hover:text-rose-400 transition-colors"
                          title="ดูข้อมูลฟอร์ม"
                        >
                          <Inbox className="w-3 h-3" /> {page._count.submissions}
                        </button>
                      )}
                      {page.dbEnabled && (page._count?.dbRecords || 0) > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openDatabase(page.id, page.title) }}
                          className="text-[10px] text-blue-400/80 font-medium flex items-center gap-1 hover:text-blue-400 transition-colors"
                          title="ดูฐานข้อมูล"
                        >
                          <Database className="w-3 h-3" /> {page._count.dbRecords}
                        </button>
                      )}
                      <span className="text-[10px] text-zinc-600 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(page.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </span>
                      {/* Badges - hidden on very small screens */}
                      {pageBadges(page).map((b, i) => (
                        <span key={i} className={`hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold border shrink-0 ${b.cls}`}>{b.text}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Desktop Actions - visible on sm+ */}
                <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => copyLink(page.slug)}
                    className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-500 hover:text-cyan-400 hover:border-cyan-500/20 active:scale-90 transition-all"
                    title="คัดลอกลิงก์"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={`/p/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/20 active:scale-90 transition-all"
                    title="เปิดดู"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => openEditor(page)}
                    className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-500 hover:text-blue-400 hover:border-blue-500/20 active:scale-90 transition-all"
                    title="แก้ไข"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDetailPage(page)}
                    className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-500 hover:text-purple-400 hover:border-purple-500/20 active:scale-90 transition-all"
                    title="รายละเอียดเพิ่มเติม"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Actions - 3 essential buttons only */}
                <div className="flex sm:hidden items-center gap-1 shrink-0">
                  <button
                    onClick={() => copyLink(page.slug)}
                    className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-500 active:scale-90 transition-all"
                    title="คัดลอกลิงก์"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEditor(page)}
                    className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-500 active:scale-90 transition-all"
                    title="แก้ไข"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDetailPage(page)}
                    className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-500 active:scale-90 transition-all"
                    title="เพิ่มเติม"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile floating create button */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 p-3 bg-black/90 backdrop-blur-xl border-t border-white/[0.06]">
        <button
          onClick={() => openEditor()}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-cyan-600 to-cyan-500 border border-cyan-400/20 rounded-xl text-sm font-bold text-white active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)]"
        >
          <Plus className="w-4 h-4" />
          สร้างหน้าเว็บใหม่
        </button>
      </div>
    </div>
  )
}
