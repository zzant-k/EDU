import React, { useState, useEffect } from 'react'
import {
  MessageSquareQuote,
  X,
  Star,
  Send,
  CheckCircle2,
  Clock,
  Lock,
  MessageSquareHeart,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiClient } from '../api/client'

interface FeedbackItem {
  id: number
  user_id: number
  student_name: string
  category: string
  rating: number
  content: string
  created_at: string
}

const CATEGORIES = [
  'Acara & Suasana',
  'Stan Universitas',
  'Aplikasi Passport',
  'Fasilitas & Tempat',
  'Lainnya',
]

const RATING_LABELS: Record<number, string> = {
  1: 'Sangat Kurang 😞',
  2: 'Kurang 🙁',
  3: 'Cukup Bagus 🙂',
  4: 'Bagus & Seru! 😊',
  5: 'Sangat Luar Biasa! 🤩',
}

export const StudentFeedbackModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  // Form states
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [category, setCategory] = useState<string>('Acara & Suasana')
  const [content, setContent] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // History state (feedback yang hanya bisa dilihat diri sendiri)
  const [myFeedbacks, setMyFeedbacks] = useState<FeedbackItem[]>([])

  // Fetch my feedbacks when modal opens
  const fetchMyFeedbacks = async () => {
    try {
      const res = await apiClient.get('/student/feedbacks')
      setMyFeedbacks(res.data || [])
    } catch (err) {
      console.error('Failed to load my feedbacks:', err)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchMyFeedbacks()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      setErrorMessage('Silakan tuliskan masukan atau feedback kamu.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const res = await apiClient.post('/student/feedbacks', {
        rating,
        category,
        content: content.trim(),
      })

      setSuccessMessage(res.data.message || 'Feedback berhasil dikirim!')
      setContent('')
      setRating(5)
      await fetchMyFeedbacks()

      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Gagal mengirim feedback.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* ===== Floating Blue Action Bubble Button ===== */}
      <div className="fixed bottom-24 right-5 sm:bottom-24 sm:right-6 lg:bottom-8 lg:right-8 z-40 select-none">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-blue-500/40 border-2 border-white transition-all cursor-pointer ring-4 ring-blue-500/20"
          title="Beri Feedback / Ulasan Acara"
        >
          {/* Subtle pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-blue-400 opacity-30 group-hover:animate-ping pointer-events-none" />

          <MessageSquareQuote size={24} className="relative z-10 transition-transform group-hover:scale-110" />

          {/* Floating Badge / Dot */}
          <span className="absolute top-1 right-1 w-3 h-3 bg-amber-400 border-2 border-white rounded-full shadow-xs" />

          {/* Hover Tooltip on Desktop */}
          <span className="absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md hidden sm:inline-block">
            Feedback Acara
          </span>
        </motion.button>
      </div>

      {/* ===== Feedback Modal Drawer ===== */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh] text-left"
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <MessageSquareHeart size={24} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      Feedback EduFair
                    </h3>
                    <p className="text-xs text-slate-500">
                      Beri masukan, kesan, & saran untuk acara ini
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] flex flex-col gap-6">
                {/* Form Input Feedback */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Star Rating Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Bagaimana penilaianmu secara umum?
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = (hoverRating || rating) >= star
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 text-slate-200 hover:scale-125 transition-transform cursor-pointer"
                          >
                            <Star
                              size={28}
                              className={
                                active
                                  ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                                  : 'text-slate-200'
                              }
                            />
                          </button>
                        )
                      })}
                      <span className="text-xs font-bold text-amber-600 ml-2">
                        {RATING_LABELS[hoverRating || rating]}
                      </span>
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-700">
                      Kategori Feedback
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            category === cat
                              ? 'bg-slate-900 text-white shadow-xs font-semibold'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content Textarea */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Pesan, Kesan, atau Saran
                    </label>
                    <textarea
                      rows={4}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Tuliskan pengalamanmu berkunjung ke EduFair, masukan untuk stan universitas, atau saran perbaikan acara..."
                      className="w-full p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none bg-slate-50/50"
                    />
                  </div>

                  {/* Status Messages */}
                  {successMessage && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                      {errorMessage}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !content.trim()}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    {isSubmitting ? (
                      <span>Mengirimkan...</span>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Kirim Feedback Sekarang</span>
                      </>
                    )}
                  </button>
                </form>

                {/* My Feedback Card (Privat - Tidak mempublikasikan isi pesan) */}
                {myFeedbacks.length > 0 && (
                  <div className="flex flex-col gap-3 pt-5 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Lock size={13} className="text-slate-400" />
                        <span>My Feedback</span>
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {myFeedbacks.map((fb) => (
                        <div
                          key={fb.id}
                          className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex flex-col gap-2.5 transition-all"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-white shadow-xs">
                              {fb.category}
                            </span>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: fb.rating }).map((_, idx) => (
                                <Star
                                  key={idx}
                                  size={12}
                                  className="fill-amber-400 text-amber-400"
                                />
                              ))}
                              <span className="text-[11px] font-bold text-slate-700 ml-1">
                                {fb.rating}/5
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                            <span className="text-slate-600 font-medium flex items-center gap-1">
                              <CheckCircle2 size={12} className="text-emerald-500" />
                              <span>Feedback berhasil diterima panitia</span>
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <Clock size={11} />
                              <span>{new Date(fb.created_at).toLocaleString('id-ID')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
