import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

let app = null
let messaging = null

function getFirebaseMessaging() {
  if (typeof window === 'undefined') return null
  if (!firebaseConfig.apiKey) return null

  try {
    if (!app) {
      app = initializeApp(firebaseConfig)
    }
    if (!messaging) {
      messaging = getMessaging(app)
    }
    return messaging
  } catch {
    return null
  }
}

export async function solicitarTokenFCM() {
  const msg = getFirebaseMessaging()
  if (!msg || !VAPID_KEY) return null

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const swRegistration = await navigator.serviceWorker.ready
    const token = await getToken(msg, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    })
    return token
  } catch (err) {
    console.error('Erro ao obter token FCM:', err)
    return null
  }
}

export function escutarMensagensEmTempoReal(callback) {
  const msg = getFirebaseMessaging()
  if (!msg) return () => {}

  return onMessage(msg, (payload) => {
    const title = payload.notification?.title || 'Lado a Lado'
    const body = payload.notification?.body || ''

    if (Notification.permission === 'granted') {
      const options = { body, icon: '/icon-192.png' }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
          .then((reg) => reg.showNotification(title, options))
          .catch(() => {
            try { new Notification(title, options) } catch(e) {}
          })
      } else {
        try { new Notification(title, options) } catch(e) {}
      }
    }

    if (callback) callback(payload)
  })
}
