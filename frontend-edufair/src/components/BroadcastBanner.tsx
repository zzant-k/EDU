import React, { useState, useEffect } from 'react'
import { Bell, AlertTriangle, Calendar, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiClient } from '../api/client'

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

  const fetchAnnouncements = async () => {
    try {
      const res = await apiClient.get('/student/announcements')
      setAnnouncements(res.data || [])
    } catch {
      // Silently ignore network failures for announcements
    }
  }

  useEffect(() => {
    fetchAnnouncements()
    // Poll every 45s for live updates
    const interval = setInterval(fetchAnnouncements, 45000)
    return () => clearInterval(interval)
  }, [])

  const activeList = announcements.filter(
    (item) => item.is_active && !dismissedIds.includes(item.id)
  )

  if (activeList.length === 0) return null

  // Show the latest announcement
  const current = activeList[0]

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

  const style = getStyle(current.type)

  return (
    <AnimatePresence>
      <motion.div
        key={current.id}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <div
          className={`w-full py-2.5 px-4 sm:px-6 border-b flex items-center justify-between gap-3 text-xs shadow-xs ${style.bg}`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="flex-shrink-0 flex items-center justify-center">
              {style.icon}
            </div>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-wider uppercase flex-shrink-0 ${style.badge}`}
            >
              {style.badgeText}
            </span>
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {current.title && (
                <span className="font-bold truncate hidden sm:inline">
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
      </motion.div>
    </AnimatePresence>
  )
}
