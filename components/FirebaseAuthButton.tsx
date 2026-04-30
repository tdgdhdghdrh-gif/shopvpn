'use client'

import { useState } from 'react'
import { auth, googleProvider, signInWithPopup } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

interface FirebaseAuthButtonProps {
  mode?: 'login' | 'register'
  className?: string
}

export default function FirebaseAuthButton({ mode = 'login', className = '' }: FirebaseAuthButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Get ID token
      const idToken = await user.getIdToken()

      // Send to server
      const res = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      const data = await res.json()

      if (data.success) {
        router.push('/vpn')
        router.refresh()
      } else {
        setError(data.error || 'เข้าสู่ระบบไม่สำเร็จ')
        // Sign out from Firebase if server auth failed
        await auth.signOut()
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err)
      if (err.code === 'auth/popup-closed-by-user') {
        setError('ปิดหน้าต่างล็อกอิน')
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('')
      } else {
        setError('เข้าสู่ระบบด้วย Google ไม่สำเร็จ')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      {error && (
        <div className="mb-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 text-center">
          {error}
        </div>
      )}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white text-zinc-900 font-bold py-3 rounded-xl hover:bg-zinc-100 transition-colors active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        {mode === 'login' ? 'เข้าสู่ระบบด้วย Google' : 'สมัครด้วย Google'}
      </button>
    </div>
  )
}
