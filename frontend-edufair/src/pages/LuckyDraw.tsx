import React, { useState, useEffect } from 'react'
import { Ticket, Lock } from 'lucide-react'
import { apiClient } from '../api/client'
import { useAuth } from '../store/AuthContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { motion } from 'framer-motion'

interface ParticipantInfo {
  id: number
  participant_number: string
  joined_at: string
}

export const LuckyDraw: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const [participant, setParticipant] = useState<ParticipantInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      await refreshUser()
      const res = await apiClient.get('/student/participant')
      if (res.data.participant) {
        setParticipant(res.data.participant)
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
        <div className="w-full max-w-sm flex flex-col items-center">
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
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-full flex flex-col gap-6"
            >
              <div className="text-center mb-2">
                <h2 className="text-xl font-extrabold text-text-primary tracking-tight font-sans">Your Entry Ticket</h2>
                <p className="text-xs text-text-secondary mt-1">Keep this ticket for the winner announcement</p>
              </div>

              <div className="w-full bg-gradient-to-b from-primary to-blue-700 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col border border-primary/20">
                <div className="absolute -right-16 -top-16 w-44 h-44 rounded-full bg-white/10 blur-2xl"></div>
                <div className="absolute -left-16 -bottom-16 w-44 h-44 rounded-full bg-secondary/20 blur-2xl"></div>

                <div className="p-6 pb-4 border-b-2 border-dashed border-white/20 flex items-center justify-between relative">
                  <div className="flex flex-col text-left gap-0.5">
                    <span className="text-[10px] font-bold text-blue-100 tracking-wider uppercase">Event Passport</span>
                    <span className="text-sm font-extrabold tracking-tight">Lucky Draw Entry</span>
                  </div>
                  <Ticket size={24} className="text-blue-100 opacity-80" />

                  <div className="absolute left-0 bottom-0 -translate-x-1/2 translate-y-1/2 w-5 h-5 rounded-full bg-slate-50 border-r border-border-custom"></div>
                  <div className="absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 w-5 h-5 rounded-full bg-slate-50 border-l border-border-custom"></div>
                </div>

                <div className="p-6 pt-6 flex flex-col gap-6 text-left relative">
                  <div className="flex flex-col gap-1 items-center justify-center py-4 bg-white/10 rounded-2xl border border-white/15">
                    <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Ticket Code</span>
                    <span className="text-3xl font-black tracking-widest font-mono select-all">
                      {participant.participant_number}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-blue-200 uppercase">Participant</span>
                      <span className="text-xs font-bold truncate">{user?.name}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-blue-200 uppercase">Registered At</span>
                      <span className="text-xs font-bold truncate">
                        {new Date(participant.joined_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
