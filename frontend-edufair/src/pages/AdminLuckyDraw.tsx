import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  Sparkles,
  Play,
  Square,
  RotateCcw,
  Undo2,
  Trophy,
  Users,
  CheckCircle2,
  Circle,
  Clock,
  LayoutGrid,
  UserRound,
  History,
  AlertCircle
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { apiClient } from '../api/client'
import { Skeleton } from '../components/ui/Skeleton'

interface Participant {
  id: number
  student_id: number
  student_name: string
  participant_number: string
  joined_at: string
}

interface Winner {
  id: number
  student_name: string
  participant_number: string
  prize: string
  drawn_at: string
}

const getParticipantColors = (name: string) => {
  const hues = [262, 150, 30, 300, 62, 200]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = hues[Math.abs(hash) % hues.length]
  return {
    bg: `oklch(0.93 0.04 ${hue})`,
    text: `oklch(0.36 0.15 ${hue})`,
    ring: `oklch(0.93 0.04 ${hue} / 0.15)`
  }
}

const getInitials = (name: string) => {
  if (!name) return '??'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

let sharedAudioCtx: AudioContext | null = null

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null
  if (!sharedAudioCtx) {
    sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume()
  }
  return sharedAudioCtx
}

// Synthesizes a rapid click sound for spin shuffle
const playTickSound = (isEasing = false) => {
  try {
    const audioCtx = getAudioContext()
    if (!audioCtx) return
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    
    // Triangle wave gives a crisper, more mechanical snap/body
    osc.type = 'triangle'
    
    // Exponential frequency sweep creates a very clear mechanical click transient
    const startFreq = isEasing ? 850 : 900
    osc.frequency.setValueAtTime(startFreq + Math.random() * 80, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.04)
    
    // Make the ticks during easing louder and more dramatic
    const volume = isEasing ? 0.18 : 0.07
    gain.gain.setValueAtTime(volume, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04)
    
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    
    osc.start()
    osc.stop(audioCtx.currentTime + 0.05)
  } catch (e) {
    console.warn('Audio synthesis failed:', e)
  }
}

// Synthesizes a beautiful major 9 arpeggio chord chime for the winner popup
const playWinnerChime = () => {
  try {
    const audioCtx = getAudioContext()
    if (!audioCtx) return
    
    const playNote = (frequency: number, delayTime: number, duration: number, volume: number = 0.1) => {
      const osc1 = audioCtx.createOscillator()
      const osc2 = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      
      osc1.type = 'triangle'
      osc2.type = 'sine'
      
      osc1.frequency.setValueAtTime(frequency, audioCtx.currentTime + delayTime)
      osc2.frequency.setValueAtTime(frequency * 1.006, audioCtx.currentTime + delayTime)
      
      gain.gain.setValueAtTime(0, audioCtx.currentTime + delayTime)
      gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + delayTime + 0.08)
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delayTime + duration)
      
      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(audioCtx.destination)
      
      osc1.start(audioCtx.currentTime + delayTime)
      osc2.start(audioCtx.currentTime + delayTime)
      
      osc1.stop(audioCtx.currentTime + delayTime + duration + 0.1)
      osc2.stop(audioCtx.currentTime + delayTime + duration + 0.1)
    }
    
    const baseDelay = 0
    playNote(261.63, baseDelay, 0.8, 0.12)        // C4
    playNote(329.63, baseDelay + 0.10, 0.8, 0.12) // E4
    playNote(392.00, baseDelay + 0.20, 0.8, 0.12) // G4
    playNote(493.88, baseDelay + 0.30, 1.2, 0.15) // B4
    playNote(523.25, baseDelay + 0.40, 1.5, 0.18) // C5
    playNote(659.25, baseDelay + 0.50, 1.8, 0.18) // E5
  } catch (e) {
    console.warn('Audio synthesis failed:', e)
  }
}

export const AdminLuckyDraw: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'participants' | 'winners' | 'history' | 'settings'>('dashboard')
  
  const [prizeName] = useState('Grand Prize MacBook Air')
  const [drawError, setDrawError] = useState<string | null>(null)
  
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [pendingWinner, setPendingWinner] = useState<any | null>(null)
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  
  const shuffleIntervalRef = useRef<any>(null)

  const fetchData = async () => {
    try {
      const [pRes, wRes] = await Promise.all([
        apiClient.get('/superadmin/lucky-draw/participants'),
        apiClient.get('/superadmin/lucky-draw/winners')
      ])
      setParticipants(pRes.data)
      setWinners(wRes.data)
      
      if (pRes.data.length > 0 && !selectedId) {
        setSelectedId(pRes.data[0].id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const selectedParticipant = participants.find(p => p.id === selectedId) || participants[0] || null

  const wonNames = winners.map(w => w.student_name)
  const eligible = participants.filter(p => !wonNames.includes(p.student_name))
  
  const totalCount = participants.length
  const eligibleCount = eligible.length
  const wonCount = winners.length
  const remainingCount = eligibleCount

  const filteredParticipants = participants.filter(p => {
    const searchLower = searchQuery.toLowerCase()
    return (
      p.student_name.toLowerCase().includes(searchLower) ||
      p.participant_number.toLowerCase().includes(searchLower)
    )
  })

  const startDraw = async () => {
    if (isDrawing || eligible.length === 0) return
    
    try {
      getAudioContext()
    } catch (e) {
      console.warn('AudioContext failed to initialize:', e)
    }

    setIsDrawing(true)
    setPendingWinner(null)
    setDrawError(null)
    
    // Start client-side fast shuffling
    shuffleIntervalRef.current = setInterval(() => {
      if (eligible.length > 0) {
        const randomIndex = Math.floor(Math.random() * eligible.length)
        setSelectedId(eligible[randomIndex].id)
        playTickSound()
      }
    }, 60)
    
    try {
      const res = await apiClient.post('/superadmin/lucky-draw/spin', {
        prize: prizeName || 'Mystery Prize'
      })
      setPendingWinner(res.data.winner)
    } catch (err: any) {
      if (shuffleIntervalRef.current) {
        clearInterval(shuffleIntervalRef.current)
        shuffleIntervalRef.current = null
      }
      setIsDrawing(false)
      setDrawError(err.response?.data?.message || err.message || 'Draw execution failed')
    }
  }

  const stopDraw = () => {
    if (!isDrawing || !shuffleIntervalRef.current) return
    
    clearInterval(shuffleIntervalRef.current)
    shuffleIntervalRef.current = null
    
    const delays = [140, 200, 280, 380, 520]
    let chain = Promise.resolve()
    
    delays.forEach((delay, index) => {
      chain = chain.then(() => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            if (index === delays.length - 1 && pendingWinner) {
              const match = participants.find(p => p.student_name === pendingWinner.student_name)
              if (match) {
                setSelectedId(match.id)
              } else {
                if (eligible.length > 0) {
                  const randomIndex = Math.floor(Math.random() * eligible.length)
                  setSelectedId(eligible[randomIndex].id)
                }
              }
            } else {
              if (eligible.length > 0) {
                const randomIndex = Math.floor(Math.random() * eligible.length)
                setSelectedId(eligible[randomIndex].id)
              }
            }
            playTickSound(true)
            resolve()
          }, delay)
        })
      })
    })
    
    chain.then(() => {
      setTimeout(() => {
        setIsDrawing(false)
        setShowWinnerModal(true)
        playWinnerChime()
        fetchData()
      }, 260)
    })
  }

  const resetDraw = () => {
    if (shuffleIntervalRef.current) {
      clearInterval(shuffleIntervalRef.current)
      shuffleIntervalRef.current = null
    }
    setIsDrawing(false)
    setPendingWinner(null)
    setDrawError(null)
    if (participants.length > 0) {
      setSelectedId(participants[0].id)
    }
  }

  const undoWinner = async () => {
    if (winners.length === 0) return
    const latestWinner = winners[0]
    try {
      await apiClient.delete(`/superadmin/lucky-draw/winners/${latestWinner.id}`)
      fetchData()
      if (participants.length > 0) {
        setSelectedId(participants[0].id)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const drawAgain = () => {
    setShowWinnerModal(false)
    setTimeout(() => {
      startDraw()
    }, 200)
  }

  return (
    <div className="w-full flex items-center justify-center p-0 text-left">
      {/* Main Container Card */}
      <div className="w-full rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden flex flex-col">
        
        {/* Mobile Sub-Nav Switcher */}
        <div className="md:hidden flex items-center justify-center p-2.5 border-b border-slate-200 bg-white">
          <div className="h-8 flex items-center bg-slate-100 p-0.5 rounded-lg text-[13px] gap-0.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white shadow-xs font-semibold text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <LayoutGrid size={13} /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === 'participants'
                  ? 'bg-white shadow-xs font-semibold text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <UserRound size={13} /> Participants
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white shadow-xs font-semibold text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <History size={13} /> History
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr_320px] h-auto md:h-[760px] bg-slate-50/30">
          
          {/* Left Column - Participants (sidebar) */}
          <div className={`flex flex-col bg-white border-r border-hairline h-[600px] md:h-full overflow-hidden ${
            activeTab === 'participants' ? 'flex' : 'hidden md:flex'
          }`}>
            <div className="p-4 border-b border-hairline flex items-center justify-between">
              <span className="text-[13px] font-semibold text-text-primary">Participants</span>
              <span className="text-[12px] text-text-secondary font-mono bg-slate-100 px-2 py-0.5 rounded">
                {participants.length}
              </span>
            </div>
            
            <div className="p-3 border-b border-hairline">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary/50" />
                <input
                  type="text"
                  placeholder="Search participants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-border-custom rounded-md text-xs placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton variant="circle" className="w-8 h-8 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <Skeleton variant="text" className="h-3 w-2/3" />
                      <Skeleton variant="text" className="h-2 w-1/2" />
                    </div>
                  </div>
                ))
              ) : filteredParticipants.length === 0 ? (
                <div className="text-center py-8 text-xs text-text-secondary/70">No candidates found</div>
              ) : (
                filteredParticipants.map((p) => {
                  const hasWon = winners.some(w => w.student_name === p.student_name)
                  const isCurrentSelection = selectedId === p.id
                  const colors = getParticipantColors(p.student_name)
                  
                  return (
                    <div
                      key={p.id}
                      onClick={() => !isDrawing && setSelectedId(p.id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                        isCurrentSelection
                          ? 'bg-slate-100 font-semibold'
                          : 'hover:bg-slate-50/80 text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-inner flex-shrink-0 uppercase"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {getInitials(p.student_name)}
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] text-text-primary truncate">{p.student_name}</div>
                        <div className="text-[11px] text-text-secondary font-mono truncate">{p.participant_number}</div>
                      </div>

                      {/* Status Glyphs */}
                      <div>
                        {hasWon ? (
                          <CheckCircle2 size={15} className="text-success" />
                        ) : isDrawing && isCurrentSelection ? (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                        ) : (
                          <Circle size={15} className="text-slate-300" />
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Center Column - Draw Stage */}
          <div className={`flex-1 flex flex-col items-center justify-center p-4 md:p-6 bg-slate-50/30 ${
            activeTab === 'dashboard' ? 'flex' : 'hidden md:flex'
          }`}>
            <div className="w-full max-w-[520px] rounded-2xl bg-white border border-border-custom p-6 md:p-10 shadow-card flex flex-col items-center text-center">
              
              {/* Eyebrow */}
              
              <span className="text-[13px] text-text-secondary mt-1 mb-8">
                Press Start to randomly select a winner.
              </span>

              {/* Showcase circle */}
              <div className="w-[184px] h-[184px] rounded-full border border-hairline bg-slate-50/50 flex items-center justify-center relative shadow-sm">
                
                {selectedParticipant ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedParticipant.id}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div
                        className="w-[144px] h-[144px] rounded-full flex items-center justify-center text-[44px] font-medium text-white shadow-md animate-lucky-blur"
                        style={{
                          backgroundColor: getParticipantColors(selectedParticipant.student_name).bg,
                          color: getParticipantColors(selectedParticipant.student_name).text
                        }}
                      >
                        {getInitials(selectedParticipant.student_name)}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="w-[144px] h-[144px] rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                    <Sparkles size={40} />
                  </div>
                )}
              </div>

              {/* Candidate Info Block */}
              {selectedParticipant ? (
                <div key={selectedParticipant.id} className="mt-6 flex flex-col items-center animate-lucky-blur">
                  <h3 className="text-[20px] font-semibold text-text-primary tracking-tight">
                    {selectedParticipant.student_name}
                  </h3>
                  <span className="text-[13px] text-text-secondary mt-1">
                    Stamp Pass Holder
                  </span>
                  <span className="text-[12px] text-text-secondary font-mono mt-0.5 tracking-wider">
                    {selectedParticipant.participant_number}
                  </span>
                </div>
              ) : (
                <div className="mt-6 flex flex-col items-center">
                  <h3 className="text-[20px] font-semibold text-text-secondary">No Candidates</h3>
                  <span className="text-xs text-text-secondary mt-1">Draw pool is empty</span>
                </div>
              )}

              {/* Status Pill */}
              

              {/* Settings Prize Input */}
              

              {/* Action Buttons Rows */}
              <div className="w-full mt-6 flex flex-col gap-3">
                <div className="flex gap-3 justify-center">
                  {!isDrawing ? (
                    <button
                      onClick={startDraw}
                      disabled={eligible.length === 0}
                      className="h-10 bg-primary hover:bg-primary-hover text-white px-6 rounded-lg font-semibold shadow-md shadow-primary/20 flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                    >
                      <Play size={14} fill="currentColor" /> Start Draw
                    </button>
                  ) : (
                    <button
                      onClick={stopDraw}
                      className="h-10 bg-slate-900 hover:bg-slate-800 text-white px-6 rounded-lg font-semibold flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <Square size={14} fill="currentColor" /> Stop
                    </button>
                  )}
                </div>

                <div className="flex gap-2 justify-center border-t border-slate-100 pt-3 mt-1">
                  <button
                    onClick={resetDraw}
                    disabled={isDrawing || participants.length === 0}
                    className="h-9 px-4 rounded-lg text-text-primary border border-border-custom bg-white hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer"
                  >
                    <RotateCcw size={13} /> Reset
                  </button>
                  
                  <button
                    onClick={undoWinner}
                    disabled={isDrawing || winners.length === 0}
                    className="h-9 px-4 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-100/85 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer"
                  >
                    <Undo2 size={13} /> Undo Winner
                  </button>
                </div>
              </div>

              {drawError && (
                <div className="mt-4 flex items-center gap-2 text-xs text-danger font-medium justify-center">
                  <AlertCircle size={14} />
                  <span>{drawError}</span>
                </div>
              )}

            </div>
          </div>

          {/* Right Column - Stats + History */}
          <div className={`flex flex-col bg-white border-l border-hairline h-[600px] md:h-full overflow-hidden ${
            activeTab === 'history' || activeTab === 'winners' ? 'flex' : 'hidden md:flex'
          }`}>
            
            {/* Statistics Area */}
            <div className="p-5 border-b border-hairline bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-semibold text-text-primary">Statistics</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-text-secondary font-medium font-mono">
                  Round {winners.length + 1}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Stat cell 1 */}
                <div className="rounded-lg border border-hairline p-3 bg-slate-50/50 flex flex-col">
                  <div className="flex items-center gap-1 text-[11px] text-text-secondary">
                    <Users size={12} /> Users
                  </div>
                  <span className="text-[22px] font-semibold text-text-primary font-mono mt-1 leading-none">
                    {totalCount}
                  </span>
                </div>
                {/* Stat cell 2 */}
                <div className="rounded-lg border border-hairline p-3 bg-slate-50/50 flex flex-col">
                  <div className="flex items-center gap-1 text-[11px] text-text-secondary">
                    <CheckCircle2 size={12} className="text-success" /> Eligible
                  </div>
                  <span className="text-[22px] font-semibold text-text-primary font-mono mt-1 leading-none">
                    {eligibleCount}
                  </span>
                </div>
                {/* Stat cell 3 */}
                <div className="rounded-lg border border-hairline p-3 bg-slate-50/50 flex flex-col">
                  <div className="flex items-center gap-1 text-[11px] text-text-secondary">
                    <Trophy size={12} className="text-amber-500" /> Won
                  </div>
                  <span className="text-[22px] font-semibold text-text-primary font-mono mt-1 leading-none">
                    {wonCount}
                  </span>
                </div>
                {/* Stat cell 4 */}
                <div className="rounded-lg border border-hairline p-3 bg-slate-50/50 flex flex-col">
                  <div className="flex items-center gap-1 text-[11px] text-text-secondary">
                    <Clock size={12} /> Remaining
                  </div>
                  <span className="text-[22px] font-semibold text-text-primary font-mono mt-1 leading-none">
                    {remainingCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Winner History Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-text-primary">Winner History</span>
                <button className="text-[12px] text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                  View all ›
                </button>
              </div>

              {winners.length === 0 ? (
                <div className="text-center py-12 text-xs text-text-secondary/70">No winners yet.</div>
              ) : (
                <div className="relative space-y-4">
                  {/* Vertical Timeline Hairline */}
                  <div className="absolute left-[12px] top-2 bottom-2 w-px bg-hairline" />

                  {winners.map((win, idx) => {
                    const isLatest = idx === 0
                    
                    return (
                      <div key={win.id} className="relative pl-9 flex items-start">
                        {/* Timeline Icon */}
                        <div className="absolute left-0 top-0.5 w-6 h-6 rounded-full border border-hairline bg-white flex items-center justify-center z-10 shadow-sm">
                          <Trophy size={11} className={isLatest ? 'text-amber-500' : 'text-slate-300'} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-text-primary truncate">{win.student_name}</div>
                          <div className="text-[11px] text-text-secondary mt-0.5">
                            {win.prize} · {new Date(win.drawn_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Most Recent Winner Box */}
              {winners.length > 0 && (
                <div className="rounded-xl border border-hairline p-4 bg-slate-50/50 mt-6">
                  <span className="text-[10px] tracking-[0.14em] uppercase text-text-secondary font-semibold block mb-3">
                    MOST RECENT
                  </span>
                  
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-inner uppercase"
                      style={{
                        backgroundColor: getParticipantColors(winners[0].student_name).bg,
                        color: getParticipantColors(winners[0].student_name).text
                      }}
                    >
                      {getInitials(winners[0].student_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-text-primary truncate">
                        {winners[0].student_name}
                      </div>
                      <div className="text-[11px] text-text-secondary truncate mt-0.5 font-mono">
                        {winners[0].prize} · {winners[0].participant_number}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Winner Modal */}
      <AnimatePresence>
        {showWinnerModal && selectedParticipant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWinnerModal(false)}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
              className="relative w-full max-w-[420px] rounded-2xl border border-border bg-white shadow-2xl p-8 flex flex-col items-center text-center overflow-hidden animate-lucky-in"
            >
              {/* Eyebrow */}
              <span className="text-[10px] tracking-[0.16em] uppercase text-primary font-bold mb-6">
                WINNER
              </span>

              {/* Giant Avatar */}
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-[32px] font-medium text-white shadow-lg mb-6 uppercase"
                style={{
                  backgroundColor: getParticipantColors(selectedParticipant.student_name).bg,
                  color: getParticipantColors(selectedParticipant.student_name).text
                }}
              >
                {getInitials(selectedParticipant.student_name)}
              </div>

              {/* Candidate Info */}
              <h2 className="text-[22px] font-bold text-text-primary tracking-tight">
                {selectedParticipant.student_name}
              </h2>
              <span className="text-[13px] text-text-secondary mt-1">
                {prizeName || 'Grand Prize'} Winner
              </span>
              <span className="text-[12px] text-text-secondary font-mono mt-0.5 tracking-wider">
                {selectedParticipant.participant_number}
              </span>

              <p className="text-[13px] text-text-secondary max-w-[280px] mt-4 mb-8 leading-relaxed">
                Congratulations. Please come to the stage to claim your prize.
              </p>

              {/* Actions Column */}
              <div className="w-full flex flex-col gap-2">
                <button
                  onClick={() => setShowWinnerModal(false)}
                  className="w-full h-10 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold active:scale-[0.98] transition-all text-sm flex items-center justify-center cursor-pointer shadow-sm"
                >
                  Confirm Winner
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={drawAgain}
                    className="h-10 rounded-lg text-text-primary border border-border-custom bg-white hover:bg-slate-50 font-semibold text-xs active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer"
                  >
                    Draw Again
                  </button>
                  <button
                    onClick={() => setShowWinnerModal(false)}
                    className="h-10 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-50 font-semibold text-xs active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
