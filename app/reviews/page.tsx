'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Star, Heart, MessageSquare, Send, ImageIcon,
  X, Camera, Sparkles, Quote, ThumbsUp, Shield, AlertCircle,
  CheckCircle, Loader2, TrendingUp, Users, ChevronDown
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────
interface ReviewEntry {
  id: string
  rating: number
  message: string
  imageUrl: string | null
  createdAt: string
  user: {
    name: string
    avatar: string | null
    isOwner: boolean
  }
  likeCount: number
  isLiked: boolean
}

interface ReviewStats {
  totalReviews: number
  avgRating: number
  distribution: Record<number, number>
}

// ─── Star Rating Component ───────────────────────────────────────
function StarRating({
  value,
  onChange,
  size = 'md',
  readonly = false,
}: {
  value: number
  onChange?: (v: number) => void
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
}) {
  const [hover, setHover] = useState(0)
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`transition-all ${readonly ? 'cursor-default' : 'cursor-pointer active:scale-90 hover:scale-110'}`}
        >
          <Star
            className={`${sizes[size]} transition-colors ${
              star <= (hover || value)
                ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.4)]'
                : 'text-zinc-700'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

// ─── Image Modal ─────────────────────────────────────────────────
function ImageModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl rv-fade-in p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full max-h-[85vh] rv-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors active:scale-90"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="รูปรีวิว"
          className="w-full h-auto rounded-2xl border border-white/10 shadow-2xl"
        />
      </div>
    </div>
  )
}

// ─── Toast ───────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] rv-slide-down">
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl ${
        type === 'success'
          ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
          : 'bg-rose-500/15 border-rose-500/25 text-rose-400'
      }`}>
        {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        <span className="text-xs font-bold">{message}</span>
      </div>
    </div>
  )
}

// ─── Review Card ─────────────────────────────────────────────────
function ReviewCard({
  review,
  onLike,
  onImageClick,
  index,
}: {
  review: ReviewEntry
  onLike: (id: string) => void
  onImageClick: (url: string) => void
  index: number
}) {
  const timeAgo = getTimeAgo(review.createdAt)

  return (
    <div
      className="relative bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-4 sm:p-5 transition-all rv-fade-up group"
      style={{ animationDelay: `${0.15 + index * 0.05}s` }}
    >
      {/* Header: avatar + name + rating + time */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {review.user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.user.avatar}
            alt=""
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover ring-1 ring-white/10 flex-shrink-0"
          />
        ) : (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-black text-white/60">{review.user.name.charAt(0)}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-white">{review.user.name}</span>
            {review.user.isOwner && (
              <span className="px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-[8px] font-black text-cyan-400 uppercase tracking-wider">
                คุณ
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <StarRating value={review.rating} size="sm" readonly />
            <span className="text-[10px] text-zinc-600">{timeAgo}</span>
          </div>
        </div>
      </div>

      {/* Message */}
      <p className="text-sm text-zinc-300 leading-relaxed mt-3 break-words">{review.message}</p>

      {/* Image */}
      {review.imageUrl && (
        <button
          onClick={() => onImageClick(review.imageUrl!)}
          className="mt-3 rounded-xl overflow-hidden border border-white/5 hover:border-white/15 transition-all active:scale-[0.98] block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={review.imageUrl}
            alt="รูปรีวิว"
            className="max-h-48 sm:max-h-64 w-auto rounded-xl object-cover"
            loading="lazy"
          />
        </button>
      )}

      {/* Actions: like */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/[0.04]">
        <button
          onClick={() => onLike(review.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all active:scale-90 ${
            review.isLiked
              ? 'bg-rose-500/15 border border-rose-500/25 text-rose-400'
              : 'bg-white/[0.03] border border-white/[0.06] text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${review.isLiked ? 'fill-rose-400' : ''}`} />
          <span className="text-[11px] font-bold">{review.likeCount || ''}</span>
        </button>
      </div>
    </div>
  )
}

// ─── Write Review Form ───────────────────────────────────────────
function WriteReviewForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: { rating: number; message: string; imageUrl: string | null }) => void
  isSubmitting: boolean
}) {
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Convert to base64
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      setUploading(true)
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        })
        const data = await res.json()
        if (data.success && data.url) {
          setImagePreview(data.url)
        }
      } catch {
        // Fallback to local preview
        setImagePreview(base64)
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (rating === 0 || message.trim().length < 5) return
    onSubmit({ rating, message: message.trim(), imageUrl: imagePreview })
  }

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 sm:p-5 space-y-4 rv-fade-up" style={{ animationDelay: '0.1s' }}>
      {/* Rating */}
      <div>
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
          ให้คะแนน
        </label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {rating > 0 && (
          <p className="text-[10px] text-zinc-600 mt-1 font-bold">
            {['', 'แย่มาก 😢', 'ไม่ค่อยดี 😕', 'พอใช้ได้ 🙂', 'ดี 😊', 'ยอดเยี่ยม! 🔥'][rating]}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
          เขียนรีวิว
        </label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="เล่าประสบการณ์ใช้งานของคุณ..."
          maxLength={500}
          rows={3}
          className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-violet-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none resize-none transition-colors"
        />
        <p className="text-[9px] text-zinc-600 text-right mt-1">{message.length}/500</p>
      </div>

      {/* Image upload */}
      <div>
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
          แนบรูปภาพ (ไม่บังคับ)
        </label>
        {imagePreview ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="preview"
              className="max-h-32 rounded-xl border border-white/10"
            />
            <button
              onClick={() => { setImagePreview(null); if (fileRef.current) fileRef.current.value = '' }}
              className="absolute -top-2 -right-2 p-1 bg-rose-500 rounded-full shadow-lg active:scale-90"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-dashed border-white/[0.1] hover:border-violet-500/30 rounded-xl text-xs text-zinc-500 hover:text-violet-400 transition-all active:scale-95"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            {uploading ? 'กำลังอัพโหลด...' : 'เลือกรูปภาพ'}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || rating === 0 || message.trim().length < 5}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-white font-bold text-sm rounded-xl transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {isSubmitting ? 'กำลังส่ง...' : 'ส่งรีวิว'}
      </button>
    </div>
  )
}

// ─── Rating Distribution Bar ─────────────────────────────────────
function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-zinc-500 w-4 text-right">{star}</span>
      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
      <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-bold text-zinc-600 w-6 text-right">{count}</span>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────
export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewEntry[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [canReview, setCanReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => { fetchReviews() }, [])

  async function fetchReviews() {
    try {
      const res = await fetch('/api/reviews')
      const data = await res.json()
      if (data.success) {
        setReviews(data.reviews)
        setStats(data.stats)
        setCanReview(data.canReview)
        setHasReviewed(data.hasReviewed)
        setIsLoggedIn(data.isLoggedIn)
      }
    } catch {
      console.error('Failed to fetch reviews')
    } finally {
      setLoading(false)
      setTimeout(() => setReady(true), 50)
    }
  }

  const handleSubmitReview = async (data: { rating: number; message: string; imageUrl: string | null }) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (result.success) {
        setReviews(prev => [result.review, ...prev])
        setHasReviewed(true)
        setShowForm(false)
        setToast({ message: 'ส่งรีวิวเรียบร้อย! ขอบคุณ 🎉', type: 'success' })
        // Update stats
        if (stats) {
          const newTotal = stats.totalReviews + 1
          const newAvg = ((stats.avgRating * stats.totalReviews) + data.rating) / newTotal
          const newDist = { ...stats.distribution }
          newDist[data.rating] = (newDist[data.rating] || 0) + 1
          setStats({ totalReviews: newTotal, avgRating: newAvg, distribution: newDist })
        }
      } else {
        setToast({ message: result.error || 'เกิดข้อผิดพลาด', type: 'error' })
      }
    } catch {
      setToast({ message: 'เกิดข้อผิดพลาด', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = useCallback(async (reviewId: string) => {
    if (!isLoggedIn) {
      setToast({ message: 'กรุณาเข้าสู่ระบบเพื่อกดไลค์', type: 'error' })
      return
    }
    // Optimistic update
    setReviews(prev => prev.map(r =>
      r.id === reviewId
        ? { ...r, isLiked: !r.isLiked, likeCount: r.isLiked ? r.likeCount - 1 : r.likeCount + 1 }
        : r
    ))
    try {
      const res = await fetch('/api/reviews/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      })
      const data = await res.json()
      if (data.success) {
        setReviews(prev => prev.map(r =>
          r.id === reviewId ? { ...r, isLiked: data.isLiked, likeCount: data.likeCount } : r
        ))
      }
    } catch {
      // Revert on error
      fetchReviews()
    }
  }, [isLoggedIn])

  // ─── Loading ───
  if (loading) {
    return (
      <div className="min-h-dvh bg-black text-white">
        <RvStyles />
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="flex items-center h-14">
              <Link href="/" className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-all active:scale-95">
                <ArrowLeft className="w-5 h-5 text-zinc-400" />
              </Link>
              <div className="ml-3">
                <h1 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-violet-400" />
                  รีวิว
                </h1>
                <p className="text-[10px] text-zinc-500">กำลังโหลด...</p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-32 gap-5">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-[3px] border-violet-500/10 rounded-full" />
            <div className="absolute inset-0 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-3 border-[3px] border-cyan-400/10 rounded-full" />
            <div className="absolute inset-3 border-[3px] border-cyan-400 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-violet-500/40" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-zinc-400">กำลังโหลดรีวิว</p>
            <p className="text-[10px] text-zinc-600">โปรดรอสักครู่...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-dvh bg-transparent text-white ${ready ? 'rv-ready' : ''}`}>
      <RvStyles />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Image Modal */}
      {selectedImage && <ImageModal src={selectedImage} onClose={() => setSelectedImage(null)} />}

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-25%] left-[-20%] w-[80%] h-[60%] bg-violet-600/[0.04] rounded-full blur-[200px]" />
        <div className="absolute bottom-[-25%] right-[-20%] w-[70%] h-[50%] bg-cyan-600/[0.03] rounded-full blur-[200px]" />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-violet-400/25 rv-float-particle"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + (i % 3) * 2}s`,
            }}
          />
        ))}
      </div>

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-all active:scale-95"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-400" />
              </Link>
              <div>
                <h1 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-violet-400" />
                  รีวิวจากผู้ใช้
                </h1>
                <p className="text-[10px] text-zinc-500">
                  {stats ? `${stats.totalReviews} รีวิว` : 'ความคิดเห็นจากผู้ใช้งานจริง'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">

        {/* ─── Hero / Stats Section ─── */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl rv-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.08] via-zinc-900/80 to-cyan-500/[0.05]" />
          <div className="absolute -top-24 -right-24 w-56 h-56 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative border border-white/[0.06] rounded-2xl sm:rounded-3xl p-5 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Big rating display */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl shadow-violet-500/25">
                    <div className="text-center">
                      <p className="text-2xl sm:text-3xl font-black text-white">
                        {stats ? stats.avgRating.toFixed(1) : '0'}
                      </p>
                      <div className="flex items-center gap-0.5 justify-center">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.round(stats?.avgRating || 0) ? 'text-yellow-300 fill-yellow-300' : 'text-white/30'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Shimmer */}
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent rv-shimmer" />
                  </div>
                  {/* Sparkle */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-violet-300 rounded-full rv-sparkle shadow-lg shadow-violet-400/50" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">รีวิว</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">จากผู้ใช้งานจริง</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-[11px] font-bold text-zinc-400">{stats?.totalReviews || 0} รีวิว</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating distribution */}
              {stats && stats.totalReviews > 0 && (
                <div className="flex-1 w-full sm:w-auto sm:min-w-[200px] space-y-1.5 sm:ml-auto">
                  {[5, 4, 3, 2, 1].map(star => (
                    <RatingBar
                      key={star}
                      star={star}
                      count={stats.distribution[star] || 0}
                      total={stats.totalReviews}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Write Review Button / Form ─── */}
        {isLoggedIn && canReview && !hasReviewed && (
          <div className="rv-fade-up" style={{ animationDelay: '0.1s' }}>
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-500/15 to-cyan-500/15 hover:from-violet-500/25 hover:to-cyan-500/25 border border-violet-500/20 hover:border-violet-500/35 rounded-2xl text-sm font-bold text-violet-400 transition-all active:scale-[0.97]"
              >
                <Sparkles className="w-4 h-4" />
                เขียนรีวิว
              </button>
            ) : (
              <WriteReviewForm onSubmit={handleSubmitReview} isSubmitting={submitting} />
            )}
          </div>
        )}

        {/* Info: Not logged in */}
        {!isLoggedIn && (
          <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl rv-fade-up" style={{ animationDelay: '0.1s' }}>
            <Shield className="w-5 h-5 text-zinc-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-zinc-400">เข้าสู่ระบบเพื่อเขียนรีวิว</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">เฉพาะผู้ที่เคยเติมเงินเท่านั้นที่สามารถรีวิวได้</p>
            </div>
            <Link
              href="/login"
              className="ml-auto px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[11px] font-bold text-white transition-all active:scale-95 flex-shrink-0"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        )}

        {/* Info: Logged in but no topup */}
        {isLoggedIn && !canReview && (
          <div className="flex items-center gap-3 p-4 bg-amber-500/[0.04] border border-amber-500/10 rounded-2xl rv-fade-up" style={{ animationDelay: '0.1s' }}>
            <AlertCircle className="w-5 h-5 text-amber-500/60 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-400">เติมเงินเพื่อปลดล็อกการรีวิว</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">เฉพาะผู้ที่เคยเติมเงินเท่านั้นที่สามารถรีวิวได้</p>
            </div>
            <Link
              href="/topup"
              className="ml-auto px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg text-[11px] font-bold text-amber-400 transition-all active:scale-95 flex-shrink-0"
            >
              เติมเงิน
            </Link>
          </div>
        )}

        {/* Info: Already reviewed */}
        {isLoggedIn && canReview && hasReviewed && (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/[0.04] border border-emerald-500/10 rounded-2xl rv-fade-up" style={{ animationDelay: '0.1s' }}>
            <CheckCircle className="w-5 h-5 text-emerald-500/60 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-400">คุณรีวิวไปแล้ว</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">ขอบคุณสำหรับความคิดเห็น!</p>
            </div>
          </div>
        )}

        {/* ─── Reviews List ─── */}
        <div className="space-y-3">
          <h3 className="text-[10px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-widest px-1 rv-fade-up" style={{ animationDelay: '0.15s' }}>
            รีวิวทั้งหมด ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <div className="text-center py-16 rv-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto">
                <Quote className="w-10 h-10 text-zinc-700" />
              </div>
              <h3 className="text-lg font-bold text-white mt-5">ยังไม่มีรีวิว</h3>
              <p className="text-xs text-zinc-500 mt-1.5">เป็นคนแรกที่รีวิวเลย!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review, i) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onLike={handleLike}
                  onImageClick={(url) => setSelectedImage(url)}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>

        {/* ─── Footer ─── */}
        <div className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl sm:rounded-2xl rv-fade-up" style={{ animationDelay: '0.6s' }}>
          <Sparkles className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[11px] sm:text-xs font-bold text-zinc-500">หมายเหตุ</p>
            <p className="text-[10px] sm:text-[11px] text-zinc-600 leading-relaxed">
              เฉพาะผู้ที่เคยเติมเงินเท่านั้นที่สามารถเขียนรีวิวได้ ชื่อผู้ใช้ถูกซ่อนบางส่วนเพื่อความเป็นส่วนตัว
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Utility: Time ago ───────────────────────────────────────────
function getTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'เมื่อสักครู่'
  if (mins < 60) return `${mins} นาทีที่แล้ว`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} วันที่แล้ว`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} เดือนที่แล้ว`
  return `${Math.floor(months / 12)} ปีที่แล้ว`
}

// ─── CSS Animations ──────────────────────────────────────────────
function RvStyles() {
  return (
    <style jsx global>{`
      .rv-fade-up {
        opacity: 0;
        transform: translateY(16px);
        animation: rvFadeUp 0.6s ease-out forwards;
      }
      .rv-ready .rv-fade-up { }
      @keyframes rvFadeUp {
        to { opacity: 1; transform: translateY(0); }
      }

      .rv-shimmer {
        animation: rvShimmer 3s ease-in-out infinite;
      }
      @keyframes rvShimmer {
        0% { transform: translateX(-100%); }
        30% { transform: translateX(100%); }
        100% { transform: translateX(100%); }
      }

      .rv-sparkle {
        animation: rvSparkle 2s ease-in-out infinite;
      }
      @keyframes rvSparkle {
        0%, 100% { opacity: 0.4; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1.2); }
      }

      .rv-float-particle {
        animation: rvFloat 5s ease-in-out infinite;
      }
      @keyframes rvFloat {
        0%, 100% { transform: translateY(0) scale(1); opacity: 0.15; }
        50% { transform: translateY(-30px) scale(1.5); opacity: 0.4; }
      }

      .rv-fade-in {
        animation: rvFadeIn 0.2s ease-out;
      }
      @keyframes rvFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .rv-scale-in {
        animation: rvScaleIn 0.3s ease-out;
      }
      @keyframes rvScaleIn {
        from { opacity: 0; transform: scale(0.95) translateY(8px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }

      .rv-slide-down {
        animation: rvSlideDown 0.3s ease-out;
      }
      @keyframes rvSlideDown {
        from { opacity: 0; transform: translate(-50%, -12px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }
    `}</style>
  )
}
