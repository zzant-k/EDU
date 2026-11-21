import React, { useState, useEffect } from 'react'
import { Ticket, Lock, Trophy, Gift, CheckCircle2 } from 'lucide-react'
import { apiClient } from '../api/client'
import { useAuth } from '../store/AuthContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { motion } from 'framer-motion'
import { TicketCard } from '../components/TicketCard'

interface ParticipantInfo {
  id: number
  participant_number: string
  joined_at: string
}

interface WinnerInfo {
  id: number
  prize: string
  drawn_at: string
}

export const LuckyDraw: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const [participant, setParticipant] = useState<ParticipantInfo | null>(null)
  const [winnerInfo, setWinnerInfo] = useState<WinnerInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      await refreshUser()
      const [partRes, winRes] = await Promise.all([
        apiClient.get('/student/participant'),
        apiClient.get('/student/winner-status'),
      ])
      if (partRes.data.participant) {
        setParticipant(partRes.data.participant)
      }
      if (winRes.data?.won && winRes.data?.winner) {
        setWinnerInfo(winRes.data.winner)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    setJoining(true)
    try {
      const res = await apiClient.post('/student/join-lucky-draw')
      setParticipant(res.data.participant)
      await refreshUser()
    } catch (err) {
      console.error(err)
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton variant="rect" className="h-64" />
      </div>
    )
  }

  const isLocked = (user?.progress ? user.progress.percentage < 100 : true) && !participant
  const visitedCount = user?.progress?.visited_count || 0
  const totalCount = user?.progress?.total_count || 0

  return (
    <div className="flex flex-col gap-6 pb-6 items-center justify-center min-h-[70svh]">
      {isLocked ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-center flex flex-col items-center gap-4 py-8"
        >
          <div className="w-16 h-16 rounded-full bg-slate-100 border border-border-custom flex items-center justify-center text-text-secondary mb-2">
            <Lock size={28} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-extrabold text-text-primary tracking-tight font-sans">Lucky Draw Locked</h2>
          <p className="text-sm text-text-secondary max-w-xs leading-relaxed">
            You have visited <span className="font-bold text-primary">{visitedCount}</span> out of{' '}
            <span className="font-bold text-primary">{totalCount}</span> university booths. Complete your digital stamp passport to unlock the ticket entry!
          </p>

          <Card className="w-full max-w-sm mt-4 p-5 flex flex-col gap-3 text-left border border-border-custom bg-surface">
            <div className="flex justify-between items-center text-xs font-bold text-text-secondary uppercase">
              <span>Stamp Progress</span>
              <span className="text-primary">{visitedCount} / {totalCount} Visited</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-border-custom/50">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(visitedCount / (totalCount || 1)) * 100}%` }}
              />
            </div>
          </Card>
        </motion.div>
      ) : (
        <div className="w-full max-w-sm sm:max-w-2xl flex flex-col items-center">
          {!participant ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center flex flex-col items-center gap-4 py-8"
            >
              <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center mb-2 animate-bounce">
                <Ticket size={28} strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-extrabold text-text-primary tracking-tight font-sans">Ticket Unlocked!</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Great job! You have collected all stamps. Claim your entry ticket below to register for the Lucky Draw.
              </p>

              <Button
                onClick={handleJoin}
                isLoading={joining}
                className="w-full mt-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 font-bold"
              >
                Claim Entry Ticket
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 18 }}
              className="w-full flex flex-col items-center gap-4"
            >
              {/* If student won a doorprize, show official winner certificate / keterangan */}
              {winnerInfo && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full bg-blue-600 rounded-3xl p-5 sm:p-6 flex flex-col gap-3.5 shadow-xl text-white"
                >
                  <div className="flex items-center justify-between border-b border-white/20 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white text-blue-600 flex items-center justify-center font-bold shadow-xs">
                        <Trophy size={18} />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">
                          HASIL UNDIAN RESMI
                        </span>
                        <span className="text-xs font-bold text-white">
                          Selamat, Anda Pemenang!
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black bg-white text-blue-700 px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                      Terpilih
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-[11px] text-blue-100 font-medium flex items-center gap-1.5">
                      <Gift size={13} className="text-blue-200" /> Hadiah yang dimenangkan:
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {winnerInfo.prize}
                    </h3>
                  </div>

                  <div className="p-3.5 bg-blue-700/80 rounded-2xl flex items-start gap-2.5 text-left text-white border border-blue-400/30">
                    <p className="text-xs text-white leading-relaxed">
                      Silakan tunjukkan <strong className="font-bold underline">Tiket Digital #{participant.participant_number}</strong> di bawah ini ke panitia di <strong>Panggung Utama</strong> untuk klaim dan pengambilan hadiah.
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="text-center mb-1">
                <h2 className="text-xl font-extrabold text-text-primary tracking-tight font-sans">
                  Your Entry Ticket
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Simpan tiket ini untuk pengundian hadiah doorprize di panggung
                </p>
              </div>

              <TicketCard
                participantNumber={participant.participant_number}
                studentName={user?.name}
                joinedAt={participant.joined_at}
              />
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
