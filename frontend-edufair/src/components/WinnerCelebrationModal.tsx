import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Gift, Ticket, ChevronRight, X, Sparkles, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../api/client'
import { sendDeviceNotification } from '../utils/deviceNotification'

interface WinnerData {
  id: number
  prize: string
  drawn_at: string
  participant_number: string
}

// Celebration Sound synthesis using Web Audio API
const playCelebrationChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime)
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime)
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + startTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + startTime)
      osc.stop(ctx.currentTime + startTime + duration + 0.05)
    }

    // Festive triumphant arpeggio: C5 -> E5 -> G5 -> C6
    playNote(523.25, 0.0, 0.25)
    playNote(659.25, 0.15, 0.25)
    playNote(783.99, 0.30, 0.30)
    playNote(1046.5, 0.45, 0.70)
  } catch {
    // Audio synthesis not allowed without interaction; silently ignore
  }
}

export const WinnerCelebrationModal: React.FC = () => {
  const [winner, setWinner] = useState<WinnerData | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const checkWinner = async () => {
    try {
      const res = await apiClient.get('/student/winner-status')
      if (res.data?.won && res.data?.winner) {
        const w = res.data.winner as WinnerData
        setWinner(w)

        const seenKey = `winner_seen_${w.id}`
        if (!localStorage.getItem(seenKey)) {
          setIsOpen(true)
          playCelebrationChime()

          // Send native push notification to mobile phone lockscreen / status bar
          sendDeviceNotification('🎉 SELAMAT! ANDA TERPILIH!', {
            body: `Selamat! Anda berhasil mendapatkan Doorprize: "${w.prize}". Segera ke panggung utama!`,
            tag: `winner-${w.id}`,
          })
        }
      }
    } catch {
      // Silently ignore network failures for winner polling
    }
  }

  useEffect(() => {
    checkWinner()
    // Poll every 25 seconds for live lucky draw announcements
    const interval = setInterval(checkWinner, 25000)
    return () => clearInterval(interval)
  }, [])

  const handleDismiss = () => {
    if (winner) {
      localStorage.setItem(`winner_seen_${winner.id}`, 'true')
    }
    setIsOpen(false)
  }

  const handleViewTicket = () => {
    handleDismiss()
    navigate('/lucky-draw')
  }

  return (
    <>
      {/* Floating Sticky Pill if student won (gives quick access to re-open anytime) */}
      {winner && !isOpen && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-24 lg:bottom-6 right-4 sm:right-6 z-40 max-w-xs"
        >
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-full shadow-xl border-2 border-amber-200 hover:scale-105 active:scale-95 transition-transform"
          >
            <Trophy size={16} className="text-slate-950 fill-amber-300 animate-bounce" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[10px] uppercase font-black text-amber-950/70">Pemenang Doorprize</span>
              <span className="truncate max-w-[150px] font-bold">{winner.prize}</span>
            </div>
            <Sparkles size={14} className="text-amber-900" />
          </button>
        </motion.div>
      )}

      {/* Main Celebration Modal Popup */}
      <AnimatePresence>
        {isOpen && winner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleDismiss}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              className="relative w-full max-w-sm bg-surface rounded-3xl shadow-2xl border-2 border-amber-400/40 p-6 sm:p-7 flex flex-col items-center text-center overflow-hidden z-10"
            >
              {/* Decorative top flare */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-slate-100 transition active:scale-90"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>

              {/* Glowing Trophy Badge */}
              <div className="relative mt-2 mb-4">
                <motion.div
                  animate={{ scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30 border-4 border-amber-200"
                >
                  <Trophy size={42} className="text-slate-950 fill-amber-100" />
                </motion.div>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                </span>
              </div>

              {/* Title & Congratulations */}
              <span className="text-[11px] font-black tracking-widest text-amber-600 dark:text-amber-400 uppercase mb-1">
                LUCKY DRAW SMANIS EDUFAIR
              </span>
              <h2 className="text-2xl font-black text-text-primary tracking-tight leading-tight">
                SELAMAT! KAMU TERPILIH! 🎉
              </h2>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                Akun dan tiketmu telah berhasil terpilih sebagai pemenang dalam pengundian doorprize!
              </p>

              {/* Prize Showcase Card */}
              <div className="w-full mt-5 bg-gradient-to-b from-amber-50 to-amber-100/60 dark:from-amber-950/20 dark:to-amber-900/10 border-2 border-amber-300 dark:border-amber-700/60 rounded-2xl p-4 flex flex-col gap-2.5 shadow-inner">
                <div className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 font-semibold border-b border-amber-200/80 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Gift size={15} className="text-amber-600" /> Hadiah Terpilih
                  </span>
                  <span className="text-[10px] font-bold uppercase bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded-full">
                    Resmi
                  </span>
                </div>

                <div className="text-base font-black text-slate-900 dark:text-amber-100 tracking-tight leading-tight py-1">
                  {winner.prize}
                </div>

                <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1 border-t border-amber-200/50">
                  <span className="flex items-center gap-1 font-medium">
                    <Ticket size={13} /> No. Kupon:
                  </span>
                  <span className="font-mono font-black text-xs text-primary bg-white px-2 py-0.5 rounded-md border border-border-custom shadow-2xs">
                    #{winner.participant_number}
                  </span>
                </div>
              </div>

              {/* Instructions Callout */}
              <div className="w-full mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-2.5 text-left">
                <CheckCircle2 size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-900 dark:text-blue-200 leading-snug">
                  Segera menuju ke <strong className="font-bold underline">Panggung Utama</strong> sekarang dan tunjukkan tiket digital Anda ke panitia untuk verifikasi dan pengambilan hadiah!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2 mt-5">
                <button
                  onClick={handleViewTicket}
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary to-primary-hover text-white font-extrabold text-xs rounded-xl shadow-md hover:brightness-105 active:scale-98 transition flex items-center justify-center gap-2"
                >
                  <Ticket size={15} />
                  Lihat Tiket Saya
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={handleDismiss}
                  className="w-full py-2.5 text-xs text-text-secondary hover:text-text-primary font-semibold transition rounded-lg hover:bg-slate-100"
                >
                  Tutup Notifikasi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

