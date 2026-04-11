// VPN Shop Service Worker - PWA + Push Notifications
const CACHE_NAME = 'vpnshop-v2'
const OFFLINE_URL = '/'

// Assets to cache for offline support
const PRECACHE_URLS = [
  '/',
  '/icon-192x192.png',
  '/icon-512x512.png',
]

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS)
    }).then(() => {
      self.skipWaiting()
    })
  )
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    }).then(() => {
      self.clients.claim()
    })
  )
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and API calls
  if (event.request.method !== 'GET') return
  if (event.request.url.includes('/api/')) return
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        if (response.ok) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || caches.match(OFFLINE_URL)
        })
      })
  )
})

// Push notification event - this fires when server sends push
self.addEventListener('push', (event) => {
  let data = { title: 'VPN Shop', body: 'คุณมีการแจ้งเตือนใหม่', icon: '/icon-192x192.png' }
  
  try {
    if (event.data) {
      data = event.data.json()
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    image: data.image || undefined,
    tag: data.tag || 'vpnshop-notification',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
    },
    vibrate: [200, 100, 200],
    actions: data.actions || [],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'VPN Shop', options)
  )
})

// Notification click event - open the app/URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  // Handle action button clicks
  if (event.action === 'renew') {
    event.waitUntil(
      clients.openWindow('/profile/renew')
    )
    return
  }

  if (event.action === 'dismiss') {
    return
  }

  // Default click - open/focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen)
          return client.focus()
        }
      }
      // No window open, open new one
      return clients.openWindow(urlToOpen)
    })
  )
})

// Notification close event
self.addEventListener('notificationclose', (event) => {
  // Could track dismissed notifications if needed
})
