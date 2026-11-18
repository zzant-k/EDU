import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Check, Trophy, ArrowRight, Star } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { motion } from 'framer-motion'
import { apiClient } from '../api/client'

export const ScanSuccess: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as { university?: { id: number, name: string, location: string, logo?: string, logo_url?: string }, all_completed?: boolean } | null

  if (!state || !state.university) {
    return (
      <div className="flex flex-col gap-4 text-center py-10">
        <p className="text-text-secondary">No visit check-in context found.</p>
        <Button onClick={() => navigate('/')} className="mx-auto">
          Back to Dashboard
        </Button>
      </div>
    )
  }

  const { university, all_completed } = state
  const [rating, setRating] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [hasRated, setHasRated] = React.useState(false)

  const handleRate = async (score: number) => {
    if (isSubmitting || hasRated || !university?.id) return
    
    setRating(score)
    setIsSubmitting(true)
    
    try {
      await apiClient.post(`/student/universities/${university.id}/point`, { score })
      setHasRated(true)
    } catch (error) {
      console.error('Failed to submit rating', error)
      setRating(0)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[80svh] flex flex-col items-center justify-center gap-6 py-6 text-center">
      {all_completed ? (
        <motion.div
          initial={{ scale: 0.3, rotate: -45, opacity: 0 }}
          animate={{ scale: [0.3, 1.1, 1], rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 border-4 border-white mb-2"
        >
          <Trophy size={48} className="animate-pulse" />
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1.1, 1], opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="w-24 h-24 rounded-full bg-success text-white flex items-center justify-center shadow-lg shadow-success/20 border-4 border-white mb-2"
        >
          <Check size={48} strokeWidth={3} />
        </motion.div>
      )}

      {/* Success Messages */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-1 w-full px-4"
      >
        <span className="text-[11px] font-bold text-primary tracking-widest uppercase">Check-In Successful</span>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight font-sans">
          {all_completed ? 'Passport Complete!' : 'Stamp Collected!'}
        </h1>
        <p className="text-sm text-text-secondary leading-normal">
          {all_completed
            ? 'Awesome! You have successfully visited every single university booth in the fair.'
            : <span>You checked in at the <strong className="text-slate-700">{university.name}</strong> booth.</span>}
        </p>
      </motion.div>

      {/* University Card Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm mt-2"
      >
        <Card className="flex flex-col items-center gap-4 p-5 bg-white border border-border-custom text-left">
          <div className="flex items-center gap-4 w-full">
            <div className="w-14 h-14 rounded-xl bg-slate-50 border border-border-custom overflow-hidden flex items-center justify-center p-2 flex-shrink-0">
              {university.logo ? (
                <img
                  src={university.logo_url || `http://${window.location.hostname}:8000/storage/${university.logo}`}
                  alt={university.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : null}
            </div>
            <div className="flex flex-col gap-0.5 overflow-hidden">
              <span className="text-[10px] font-bold text-text-secondary uppercase">Stamped Booth</span>
              <span className="text-sm font-extrabold text-text-primary truncate">{university.name}</span>
              <span className="text-[10px] text-text-secondary truncate">{university.location}</span>
            </div>
          </div>
          
          {/* 5-Star Rating System */}
          <div className="w-full flex flex-col items-center gap-3 border-t border-border-custom pt-4 mt-1">
            <div className="text-sm font-bold text-text-primary">
              {hasRated ? 'Terima kasih atas penilaian Anda!' : 'Berikan rating stand ini'}
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  disabled={hasRated || isSubmitting}
                  className={`p-1.5 transition-all ${
                    hasRated || isSubmitting ? 'cursor-default' : 'hover:scale-110 cursor-pointer'
                  }`}
                >
                  <Star 
                    size={28} 
                    fill={star <= rating ? '#f59e0b' : 'none'} 
                    className={`${star <= rating ? 'text-amber-500' : 'text-slate-300'}`} 
                  />
                </button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Final Action Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm mt-4"
      >
        {all_completed ? (
          <Button
            onClick={() => navigate('/lucky-draw')}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md flex items-center justify-center gap-2"
          >
            Claim Lucky Draw Ticket
            <ArrowRight size={18} />
          </Button>
        ) : (
          <Button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2"
          >
            Continue Stamp Hunt
            <ArrowRight size={18} />
          </Button>
        )}
      </motion.div>
    </div>
  )
}
