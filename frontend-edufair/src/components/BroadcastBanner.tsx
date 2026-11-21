import React, { useState, useEffect } from 'react'
import { Bell, AlertTriangle, Calendar, X, BellRing } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiClient } from '../api/client'
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendDeviceNotification,
  getNotifiedAnnouncementIds,
  markAnnouncementAsNotified,
} from '../utils/deviceNotification'

export interface Announcement {
  id: number
  title?: string
  message: string
  type: 'info' | 'urgent' | 'event'
  is_active: boolean
  created_at: string
}

export const BroadcastBanner: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissedIds, setDismissedIds] = useState<number[]>([])
  const [permStatus, setPermStatus] = useState<string>('unsupported')
  const [hidePrompt, setHidePrompt] = useState<boolean>(() => {
    return localStorage.getItem('edufair_hide_notif_prompt') === 'true'
  })

  useEffect(() => {
    setPermStatus(getNotificationPermission())
  }, [])

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission()
    setPermStatus(res)
    setHidePrompt(true)
    localStorage.setItem('edufair_hide_notif_prompt', 'true')
  }

  const dismissPrompt = () => {
    setHidePrompt(true)
    localStorage.setItem('edufair_hide_notif_prompt', 'true')
  }

  const fetchAnnouncements = async () => {
    try {
      const res = await apiClient.get('/student/announcements')
      const list: Announcement[] = res.data || []
      setAnnouncements(list)

      // Check for unnotified active announcements and trigger device mobile notification
      const notified = getNotifiedAnnouncementIds()
      list.forEach((item) => {
        if (item.is_active && !notified.includes(item.id)) {
          const title = item.title ? `📢 ${item.title}` : '📢 Pengumuman Smanis EduFair'
          sendDeviceNotification(title, {
            body: item.message,
            tag: `announcement-${item.id}`,
          })
          markAnnouncementAsNotified(item.id)
        }
      })
    } catch {
      // Silently ignore network failures for announcements
    }
  }

  useEffect(() => {
    fetchAnnouncements()
    // Poll every 35s for live updates
    const interval = setInterval(fetchAnnouncements, 35000)
    return () => clearInterval(interval)
  }, [])

  const activeList = announcements.filter(
    (item) => item.is_active && !dismissedIds.includes(item.id)
  )

  const handleDismiss = (id: number) => {
    setDismissedIds((prev) => [...prev, id])
  }

  const getStyle = (type: string) => {
    switch (type) {
      case 'urgent':
        return {
          bg: 'bg-rose-600 text-white border-rose-700',
          badge: 'bg-white text-rose-700',
          badgeText: 'PENTING',
          icon: <AlertTriangle size={15} className="text-white animate-pulse" />,
        }
      case 'event':
        return {
          bg: 'bg-amber-500 text-slate-950 border-amber-600',
          badge: 'bg-slate-950 text-amber-400',
          badgeText: 'JADWAL ACARA',
          icon: <Calendar size={15} className="text-slate-950" />,
        }
      default:
        return {
          bg: 'bg-blue-600 text-white border-blue-700',
          badge: 'bg-white/20 text-white',
          badgeText: 'PENGUMUMAN',
          icon: <Bell size={15} className="text-white" />,
        }
    }
  }

  const current = activeList[0]

  return (
    <div className="flex flex-col w-full">
      {/* 1. Mobile Notification Permission Request Bar (If not yet enabled) */}
      {isNotificationSupported() && permStatus === 'default' && !hidePrompt && (
        <div className="w-full bg-slate-900 text-white py-2 px-4 sm:px-6 flex items-center justify-between text-xs border-b border-slate-800 transition-all">
          <div className="flex items-center gap-2">
            <BellRing size={14} className="text-amber-400 shrink-0 animate-bounce" />
            <span className="text-[11px] font-medium text-slate-200">
              Munculkan info panitia langsung di layar/status bar HP kamu?
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRequestPermission}
              className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-[10px] rounded-md transition shadow-xs cursor-pointer"
            >
              Aktifkan
            </button>
            <button
              onClick={dismissPrompt}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              title="Abaikan"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 2. Live Panitia Broadcast Banner */}
      <AnimatePresence>
        {current && (
          <motion.div
            key={current.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {(() => {
              const style = getStyle(current.type)
              return (
                <div
                  className={`w-full py-2.5 px-4 sm:px-6 border-b flex items-center justify-between gap-3 text-xs shadow-xs ${style.bg}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex-shrink-0 flex items-center justify-center">
                      {style.icon}
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {current.title && (
                        <span className="font-bold shrink-0">
                          {current.title}:
                        </span>
                      )}
                      <span className="font-medium truncate">{current.message}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {activeList.length > 1 && (
                      <span className="text-[10px] opacity-80 hidden sm:inline">
                        +{activeList.length - 1} lainnya
                      </span>
                    )}
                    <button
                      onClick={() => handleDismiss(current.id)}
                      className="p-1 rounded-md hover:bg-black/10 active:scale-90 transition cursor-pointer"
                      title="Tutup pengumuman"
                      aria-label="Tutup pengumuman"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
