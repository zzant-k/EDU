// Utility for Native Mobile / Desktop Device Notifications

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported'

  try {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      await sendDeviceNotification('🔔 Notifikasi HP Aktif!', {
        body: 'Anda akan menerima pengumuman panitia langsung di status bar HP.',
        tag: 'welcome-notification',
      })
    }
    return permission
  } catch (err) {
    console.warn('Failed to request notification permission:', err)
    return 'denied'
  }
}

export async function sendDeviceNotification(
  title: string,
  options?: {
    body?: string
    icon?: string
    badge?: string
    tag?: string
    url?: string
    data?: any
  }
): Promise<boolean> {
  if (!isNotificationSupported()) return false
  if (Notification.permission !== 'granted') return false

  const iconUrl = options?.icon || '/logo-edufair.jpeg'
  const notifOptions: NotificationOptions = {
    body: options?.body || '',
    icon: iconUrl,
    badge: options?.badge || iconUrl,
    tag: options?.tag,
    data: { url: options?.url || '/', ...options?.data },
    // Vibration pattern for mobile phones (vibrate 200ms, pause 100ms, vibrate 200ms)
    ...(typeof navigator !== 'undefined' && 'vibrate' in navigator ? { vibrate: [200, 100, 200] } : {}),
  }

  // 1. Try via Service Worker (preferred for Mobile Android Chrome)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, notifOptions)
        return true
      }
    } catch (err) {
      console.warn('Service worker showNotification failed, trying standard API:', err)
    }
  }

  // 2. Fallback to standard Notification constructor
  try {
    new Notification(title, notifOptions)
    return true
  } catch (err) {
    console.warn('Standard Notification failed:', err)
    return false
  }
}

const NOTIFIED_KEY = 'edufair_notified_announcements'

export function getNotifiedAnnouncementIds(): number[] {
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function markAnnouncementAsNotified(id: number): void {
  try {
    const ids = getNotifiedAnnouncementIds()
    if (!ids.includes(id)) {
      ids.push(id)
      localStorage.setItem(NOTIFIED_KEY, JSON.stringify(ids.slice(-50))) // keep last 50
    }
  } catch (err) {
    console.warn('Failed to save notified announcement ID:', err)
  }
}
