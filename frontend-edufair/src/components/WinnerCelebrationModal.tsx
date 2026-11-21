import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Sparkles, Gift } from 'lucide-react'
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
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + startTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + startTime)
      osc.stop(ctx.currentTime + startTime + duration + 0.05)
    }

    // Festive arpeggio C5 -> E5 -> G5 -> C6
    playNote(523.25, 0.0, 0.22)
    playNote(659.25, 0.14, 0.22)
    playNote(783.99, 0.28, 0.26)
    playNote(1046.5, 0.42, 0.75)
  } catch {
    // Silently ignore if audio autoplay blocked
  }
}

// Confetti positions matching reference image
const CONFETTI_PIECES = [
  { top: '12%', left: '16%', rotate: 18, size: 8, delay: 0 },
  { top: '18%', left: '82%', rotate: -25, size: 10, delay: 0.1 },
  { top: '28%', left: '10%', rotate: 42, size: 7, delay: 0.2 },
  { top: '34%', left: '88%', rotate: -12, size: 9, delay: 0.15 },
  { top: '48%', left: '14%', rotate: -35, size: 8, delay: 0.25 },
  { top: '52%', left: '84%', rotate: 28, size: 11, delay: 0.05 },
  { top: '14%', left: '50%', rotate: 15, size: 6, delay: 0.3 },
  { top: '22%', left: '26%', rotate: -40, size: 9, delay: 0.18 },
  { top: '24%', left: '72%', rotate: 30, size: 7, delay: 0.22 },
  { top: '60%', left: '22%', rotate: 20, size: 8, delay: 0.12 },
  { top: '58%', left: '76%', rotate: -18, size: 8, delay: 0.28 },
]

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

          // Send native mobile notification
          sendDeviceNotification('🎉 Congratulations! Kamu Terpilih!', {
            body: `Selamat! Kamu terpilih memenangkan doorprize: "${w.prize}". Segera menuju panggung utama!`,
            tag: `winner-${w.id}`,
          })
        }
      }
    } catch {
      // Silently ignore
    }
  }

  useEffect(() => {
    checkWinner()
    const interval = setInterval(checkWinner, 25000)
    return () => clearInterval(interval)
  }, [])

  const handleDismiss = () => {
    if (winner) {
      localStorage.setItem(`winner_seen_${winner.id}`, 'true')
    }
    setIsOpen(false)
  }

  const handleCollect = () => {
    handleDismiss()
    navigate('/lucky-draw')
  }

  return (
    <>
      {/* Floating Pill if student won and dismissed (to re-open anytime) */}
      {winner && !isOpen && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-24 lg:bottom-6 right-4 sm:right-6 z-40 max-w-xs"
        >
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 bg-[#5468ff] text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-xl hover:bg-[#4357ec] active:scale-95 transition-all"
          >
            
            <div className="flex flex-col text-left leading-none">
              <span className="text-[10px] text-white/80 uppercase font-semibold">Pemenang Doorprize</span>
              <span className="truncate max-w-[150px] font-bold">{winner.prize}</span>
            </div>
          </button>
        </motion.div>
      )}

      {/* Main Congratulations Modal Popup matching exact reference design */}
      <AnimatePresence>
        {isOpen && winner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleDismiss}
              className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-full max-w-[340px] sm:max-w-[360px] bg-white rounded-[32px] shadow-2xl overflow-hidden z-10 flex flex-col"
            >
              {/* Close 'X' Button on top right */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-xl bg-black hover:bg-slate-900 border border-slate-800 flex items-center justify-center text-white transition active:scale-90 cursor-pointer shadow-sm"
                aria-label="Tutup"
              >
                <X size={15} className="text-white" />
              </button>

              {/* ===== TOP SECTION: Periwinkle Lavender Gradient + Confetti + 3D Gold Trophy ===== */}
              <div className="relative w-full h-[250px] sm:h-[270px] bg-gradient-to-b from-[#8f9ff5] via-[#aab8fa] to-[#e4e9fd] flex flex-col items-center justify-end overflow-hidden pb-4">
                {/* Floating Gold Confetti */}
                {CONFETTI_PIECES.map((piece, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -8, opacity: 0 }}
                    animate={{
                      y: [0, 6, 0],
                      rotate: [piece.rotate, piece.rotate + 12, piece.rotate],
                      opacity: [0.85, 1, 0.85],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.8 + (i % 3) * 0.5,
                      delay: piece.delay,
                      ease: 'easeInOut',
                    }}
                    style={{
                      position: 'absolute',
                      top: piece.top,
                      left: piece.left,
                      width: `${piece.size}px`,
                      height: `${piece.size * (i % 2 === 0 ? 1 : 1.4)}px`,
                      backgroundColor: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#f59e0b' : '#fef08a',
                      borderRadius: i % 4 === 0 ? '50%' : '2px',
                      transform: `rotate(${piece.rotate}deg)`,
                      boxShadow: '0 1px 3px rgba(217, 119, 6, 0.35)',
                    }}
                  />
                ))}

                {/* 3D Shiny Gold Trophy Illustration */}
                <motion.div
                  initial={{ scale: 0.7, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, type: 'spring', damping: 18, stiffness: 200 }}
                  className="relative z-10 flex items-center justify-center -mb-1"
                >
                  <svg
                    viewBox="0 0 240 240"
                    className="w-44 h-44 sm:w-48 sm:h-48 drop-shadow-[0_16px_24px_rgba(20,30,80,0.22)]"
                  >
                    <defs>
                      {/* 3D Gold Cup Gradient */}
                      <linearGradient id="refGoldCup" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#eab308" />
                        <stop offset="25%" stopColor="#fef08a" />
                        <stop offset="55%" stopColor="#f59e0b" />
                        <stop offset="85%" stopColor="#d97706" />
                        <stop offset="100%" stopColor="#92400e" />
                      </linearGradient>

                      {/* Rim Gradient */}
                      <linearGradient id="refGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fffbeb" />
                        <stop offset="40%" stopColor="#fde047" />
                        <stop offset="100%" stopColor="#b45309" />
                      </linearGradient>

                      {/* Handles */}
                      <linearGradient id="refGoldHandle" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fef08a" />
                        <stop offset="45%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#92400e" />
                      </linearGradient>

                      {/* Stem */}
                      <linearGradient id="refGoldStem" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#b45309" />
                        <stop offset="35%" stopColor="#fef08a" />
                        <stop offset="75%" stopColor="#d97706" />
                        <stop offset="100%" stopColor="#78350f" />
                      </linearGradient>

                      {/* Pedestal Base (Dark Black / Slate) */}
                      <linearGradient id="refPedestal" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="30%" stopColor="#475569" />
                        <stop offset="70%" stopColor="#334155" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                    </defs>

                    {/* Pedestal Shadow */}
                    <ellipse cx="120" cy="216" rx="64" ry="10" fill="#1e1b4b" opacity="0.22" />

                    {/* Black Pedestal Plinth Base */}
                    <path
                      d="M68 196 L172 196 L165 214 L75 214 Z"
                      fill="url(#refPedestal)"
                    />
                    <rect x="70" y="210" width="100" height="5" rx="2.5" fill="#0f172a" />

                    {/* Gold Base Plate */}
                    <path
                      d="M82 186 L158 186 L164 196 L76 196 Z"
                      fill="url(#refGoldRim)"
                    />

                    {/* Stem */}
                    <path
                      d="M107 146 L133 146 L138 186 L102 186 Z"
                      fill="url(#refGoldStem)"
                    />
                    <ellipse cx="120" cy="148" rx="14" ry="4" fill="#fde047" />

                    {/* Left Handle */}
                    <path
                      d="M78 64 C38 64 34 126 82 136 C77 144 28 126 28 64 C28 46 54 46 78 50 Z"
                      fill="url(#refGoldHandle)"
                    />
                    {/* Inner cutout left handle */}
                    <path
                      d="M74 68 C48 68 44 116 78 124 C72 116 52 108 52 74 C52 64 64 66 74 68 Z"
                      fill="#91a2f6"
                      opacity="0.9"
                    />

                    {/* Right Handle */}
                    <path
                      d="M162 64 C202 64 206 126 158 136 C163 144 212 126 212 64 C212 46 186 46 162 50 Z"
                      fill="url(#refGoldHandle)"
                    />
                    {/* Inner cutout right handle */}
                    <path
                      d="M166 68 C192 68 196 116 162 124 C168 116 188 108 188 74 C188 64 176 66 166 68 Z"
                      fill="#91a2f6"
                      opacity="0.9"
                    />

                    {/* Trophy Cup Body */}
                    <path
                      d="M62 48 C62 122 94 150 120 150 C146 150 178 122 178 48 Z"
                      fill="url(#refGoldCup)"
                    />

                    {/* Specular curved reflection on left bowl */}
                    <path
                      d="M84 54 C84 98 98 134 112 140 C102 132 92 98 92 54 Z"
                      fill="#ffffff"
                      opacity="0.38"
                    />

                    {/* Specular glint spot on right bowl */}
                    <ellipse
                      cx="146"
                      cy="86"
                      rx="10"
                      ry="28"
                      transform="rotate(18 146 86)"
                      fill="#ffffff"
                      opacity="0.22"
                    />

                    {/* Top Rim Oval */}
                    <ellipse cx="120" cy="48" rx="58" ry="12" fill="url(#refGoldRim)" />
                    <ellipse cx="120" cy="47" rx="52" ry="9.5" fill="#ca8a04" />
                    <ellipse cx="120" cy="46" rx="46" ry="7" fill="#78350f" />
                  </svg>
                </motion.div>
              </div>

              {/* ===== BOTTOM SECTION: Clean White Card + Congratulations + Pill + Collect Button ===== */}
              <div className="bg-white px-6 sm:px-7 pt-6 pb-7 flex flex-col items-center text-center">
                {/* Heading: Exactly matching reference "Congratulations!" */}
                <h2 className="text-2xl sm:text-[26px] font-black text-[#1e2348] tracking-tight font-sans leading-tight">
                  Congratulations!
                </h2>

                {/* Subtitle description */}
                <p className="text-xs sm:text-[13px] text-[#6b7280] font-normal leading-relaxed mt-2 max-w-[270px]">
                  Kamu terpilih memenangkan undian doorprize <strong className="font-bold text-[#1e2348]">"{winner.prize}"</strong>. Segera ke panggung utama!
                </p>

                {/* Center Badge: Black Box with White Text */}
                <div className="flex items-center gap-2 bg-black border border-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl mt-4 shadow-sm">
                  <Gift size={13} className="text-white" />
                  <span className="tracking-wider text-white font-black text-xs">#{winner.participant_number}</span>
                </div>

                {/* Action Button: Exactly matching reference "✓ COLLECT" button style */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCollect}
                  className="w-full mt-6 py-3.5 px-6 bg-[#5468ff] hover:bg-[#4357ec] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#5468ff]/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>COLLECT</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
