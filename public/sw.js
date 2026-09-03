const CACHE_NAME = 'lado-a-lado-v3'
const URLS_TO_CACHE = ['/icon-192.png', '/icon-512.png', '/favicon.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Para navegações (HTML principal), rede primeiro para sempre receber o build mais recente
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html') || caches.match('/'))
    )
    return
  }

  // Para assets estáticos em cache (ícones, etc.)
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((c) => c.visibilityState === 'visible')
      if (existing) return existing.focus()
      return self.clients.openWindow('/')
    })
  )
})

self.addEventListener('push', (event) => {
  let payload = { title: 'Lado a Lado', body: 'Voce tem uma nova mensagem.' }

  if (event.data) {
    try {
      const raw = event.data.json()
      // FCM format: { notification: { title, body }, data: {...} }
      if (raw.notification) {
        payload = {
          title: raw.notification.title || payload.title,
          body: raw.notification.body || payload.body,
          data: raw.data || {},
        }
      } else {
        // Plain format: { title, body }
        payload = { title: raw.title || payload.title, body: raw.body || payload.body, data: raw.data || {} }
      }
    } catch {
      payload.body = event.data.text()
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: payload.data,
    })
  )
})
