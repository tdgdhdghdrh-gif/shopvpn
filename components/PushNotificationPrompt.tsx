'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, X, Zap } from 'lucide-react'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushNotificationPrompt() {
  const [show, setShow] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    // Check if push is supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      return
    }
    setSupported(true)

    // Check if already dismissed recently
    const dismissedAt = localStorage.getItem('push-prompt-dismissed')
    if (dismissedAt) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60)
      if (hoursSinceDismissed < 24) {
        return
      }
    }

    // Check current subscription status
    checkSubscription()
  }, [])

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        setIsSubscribed(true)
        // Also check server-side
        const res = await fetch('/api/push/subscribe')
        const data = await res.json()
        if (!data.subscribed) {
          // Re-register server-side
          await saveSubscription(subscription)
        }
      } else {
        // Not subscribed - check if permission was already denied
        if (Notification.permission === 'denied') {
          return
        }
        // Show prompt after a short delay
        setTimeout(() => setShow(true), 3000)
      }
    } catch (error) {
      console.log('Push check error:', error)
    }
  }

  async function saveSubscription(subscription: PushSubscription) {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() })
      })
    } catch (error) {
      console.error('Failed to save subscription:', error)
    }
  }

  async function handleSubscribe() {
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setShow(false)
        return
      }

      const registration = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

      if (!vapidKey) {
        console.error('VAPID key not found')
        return
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      await saveSubscription(subscription)
      setIsSubscribed(true)
      setShow(false)
    } catch (error) {
      console.error('Subscribe error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUnsubscribe() {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        })
        await subscription.unsubscribe()
      }
      setIsSubscribed(false)
    } catch (error) {
      console.error('Unsubscribe error:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleDismiss() {
    localStorage.setItem('push-prompt-dismissed', Date.now().toString())
    setDismissed(true)
    setTimeout(() => setShow(false), 300)
  }

  if (!supported || !show || isSubscribed) return null

  return (
    <div className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm z-50 transition-all duration-300 ${dismissed ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0 animate-in slide-in-from-bottom-4'}`}>
      <div className="bg-zinc-950 border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-bold text-white text-sm">เปิดการแจ้งเตือน</p>
              <button onClick={handleDismiss} className="p-1 hover:bg-white/5 rounded-lg transition-colors -mr-1">
                <X className="w-4 h-4 text-zinc-600" />
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
              รับแจ้งเตือนก่อน VPN หมดอายุ แม้ไม่ได้เปิดเว็บ
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-[11px] font-bold text-white transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-600/20"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                เปิดแจ้งเตือน
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[11px] font-bold text-zinc-500 transition-all active:scale-95"
              >
                ไว้ทีหลัง
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Separate component for notification toggle in profile/settings
export function NotificationToggle() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setLoading(false)
      return
    }
    setSupported(true)
    checkStatus()
  }, [])

  async function checkStatus() {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function toggle() {
    setLoading(true)
    try {
      if (isSubscribed) {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          await fetch('/api/push/subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: subscription.endpoint })
          })
          await subscription.unsubscribe()
        }
        setIsSubscribed(false)
      } else {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          setLoading(false)
          return
        }

        const registration = await navigator.serviceWorker.ready
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!vapidKey) return

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })

        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: subscription.toJSON() })
        })
        setIsSubscribed(true)
      }
    } catch (error) {
      console.error('Toggle error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!supported) {
    return (
      <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-xl">
        <div className="flex items-center gap-3">
          <BellOff className="w-5 h-5 text-zinc-600" />
          <div>
            <p className="text-sm font-bold text-zinc-500">การแจ้งเตือน</p>
            <p className="text-[10px] text-zinc-700">เบราว์เซอร์ไม่รองรับ</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-xl">
      <div className="flex items-center gap-3">
        {isSubscribed ? (
          <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
            <Bell className="w-4 h-4 text-blue-400" />
          </div>
        ) : (
          <div className="w-9 h-9 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center">
            <BellOff className="w-4 h-4 text-zinc-600" />
          </div>
        )}
        <div>
          <p className="text-sm font-bold text-white">การแจ้งเตือน</p>
          <p className="text-[10px] text-zinc-500">
            {isSubscribed ? 'เปิดอยู่ — แจ้งเตือนก่อน VPN หมดอายุ' : 'ปิดอยู่ — กดเปิดเพื่อรับแจ้งเตือน'}
          </p>
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
          isSubscribed ? 'bg-blue-600' : 'bg-zinc-700'
        } ${loading ? 'opacity-50' : ''}`}
      >
        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
          isSubscribed ? 'left-6' : 'left-1'
        }`} />
      </button>
    </div>
  )
}
