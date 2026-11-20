import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, CheckCircle2, ChevronRight, Scan, Clock, Lock } from 'lucide-react'
import { apiClient } from '../api/client'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { motion } from 'framer-motion'
import { getLogoUrl } from '../utils/image'
import { StudentFeedbackModal } from '../components/StudentFeedbackModal'

interface University {
  id: number
  name: string
  description: string
  logo: string
  logo_url?: string
  location: string
  visited: boolean
  voted?: boolean
  points_count?: number
}

interface DashboardData {
  student_name: string
  total_universities: number
  visited_count: number
  remaining_count: number
  percentage: number
  universities: University[]
  lucky_draw: {
    joined: boolean
    participant_number?: string
    joined_at?: string
  }
  last_visited: string | null
}

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'visited' | 'remaining' | 'map'>('all')
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await apiClient.get('/student/dashboard')
      setData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinDraw = async () => {
    try {
      await apiClient.post('/student/join-lucky-draw')
      await fetchDashboard()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton variant="rect" className="h-44" />
        <Skeleton variant="text" className="w-1/2 h-6" />
        <div className="flex gap-2">
          <Skeleton variant="rect" className="w-20 h-10 rounded-xl" />
          <Skeleton variant="rect" className="w-20 h-10 rounded-xl" />
          <Skeleton variant="rect" className="w-20 h-10 rounded-xl" />
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton variant="rect" className="h-24" />
          <Skeleton variant="rect" className="h-24" />
          <Skeleton variant="rect" className="h-24" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const filteredUniversities = data.universities.filter((uni) => {
    const matchesSearch = uni.name.toLowerCase().includes(search.toLowerCase()) ||
      (uni.description && uni.description.toLowerCase().includes(search.toLowerCase()))

    if (filter === 'visited') return matchesSearch && uni.visited
    if (filter === 'remaining') return matchesSearch && !uni.visited
    return matchesSearch
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
  }

  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* Welcome Card & Progress */}
      <Card className="bg-surface border border-border-custom shadow-sm p-6 rounded-2xl flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 text-left">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Paspor Mahasiswa</span>
            <h2 className="text-2xl font-black text-text-primary tracking-tight font-sans">Halo, {data.student_name}</h2>
            <p className="text-xs text-text-secondary leading-relaxed mt-1 max-w-[280px]">
              {data.remaining_count === 0 
                ? "Selamat! Anda telah membuka tiket Undian." 
                : `Kunjungi ${data.remaining_count} stan universitas lagi untuk mengikuti Undian.`}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Kemajuan</span>
            <span className="text-2xl font-black text-primary leading-none">{data.percentage}%</span>
          </div>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full flex flex-col gap-1.5">
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${data.percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-semibold text-text-secondary">
            <span>{data.universities.filter(u => u.visited).length} Dikunjungi</span>
            <span>{data.remaining_count} Tersisa</span>
          </div>
        </div>

        {/* Action Button for Scanner */}
        <Button
          onClick={() => navigate('/scan')}
          className="w-full sm:w-auto sm:px-12 sm:self-center py-3.5 h-auto flex items-center justify-center gap-2 font-bold text-xs shadow-sm rounded-xl"
        >
          <Scan size={14} />
          Pindai QR Code Universitas
        </Button>
      </Card>

      

      {/* Interactive Lucky Draw Ticket */}
      {data.percentage === 100 ? (
        <Card className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-900 border border-amber-300 p-5 rounded-2xl flex flex-col gap-4 shadow-md">
          {/* Decorative ticket cutout circles */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 rounded-full bg-slate-50 border-r border-amber-200 z-10"></div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 rounded-full bg-slate-50 border-l border-amber-200 z-10"></div>
          
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-900/60">Kupon Resmi</span>
              <h4 className="text-base font-black tracking-tight leading-none text-slate-950">LUCKY DRAW TICKET</h4>
            </div>
          </div>

          <div className="w-full border-t border-dashed border-amber-900/20 my-1"></div>

          {data.lucky_draw.joined ? (
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[10px] font-bold text-slate-700/80">Nomor Undian Anda:</span>
              <span className="font-mono text-2xl font-black tracking-[0.2em] text-slate-950">{data.lucky_draw.participant_number}</span>
              <span className="text-[9px] text-slate-700 font-semibold mt-1">Anda sudah terdaftar. Tunggu hasil pengumuman di panggung!</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-800">Semua stan telah dikunjungi! Segera tukarkan kupon Anda untuk mendapatkan nomor undian.</p>
              </div>
              <Button
                onClick={handleJoinDraw}
                className="w-full bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs py-3 rounded-xl shadow-md border-0"
              >
                Klaim Tiket Undian Sekarang
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Card className="relative overflow-hidden bg-slate-50 border border-dashed border-slate-300 p-5 rounded-2xl flex flex-col gap-4 shadow-sm bg-opacity-50">
          {/* Decorative ticket cutout circles */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 rounded-full bg-slate-50 border-r border-slate-200 z-10"></div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 rounded-full bg-slate-50 border-l border-slate-200 z-10"></div>
          
          <div className="flex justify-between items-start opacity-50">
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Kupon Terkunci</span>
              <h4 className="text-base font-black tracking-tight leading-none text-slate-400">LUCKY DRAW TICKET</h4>
            </div>
            <Lock size={16} className="text-slate-400" />
          </div>

          <div className="w-full border-t border-dashed border-slate-300 my-1"></div>

          <div className="text-left opacity-60">
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
              Tiket Undian Anda masih terkunci. Silakan kunjungi {data.remaining_count} stan lagi untuk mengklaim kupon undian berhadiah menarik!
            </p>
          </div>
        </Card>
      )}

      {/* Universities Header & Search */}
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-bold text-text-primary">Booths Passport</h3>

        {/* Search */}
        {filter !== 'map' && (
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50" size={16} />
            <input
              type="text"
              placeholder="Search university..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-custom rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>
        )}

        {/* Filter Badges */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl border transition whitespace-nowrap flex-shrink-0 ${filter === 'all'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface text-text-secondary border-border-custom hover:bg-slate-100'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('visited')}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl border transition whitespace-nowrap flex-shrink-0 ${filter === 'visited'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface text-text-secondary border-border-custom hover:bg-slate-100'
              }`}
          >
            Stamped
          </button>
          <button
            onClick={() => setFilter('remaining')}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl border transition whitespace-nowrap flex-shrink-0 ${filter === 'remaining'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface text-text-secondary border-border-custom hover:bg-slate-100'
              }`}
          >
            Remaining
          </button>
          <button
            onClick={() => setFilter('map')}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl border transition whitespace-nowrap flex-shrink-0 ${filter === 'map'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface text-text-secondary border-border-custom hover:bg-slate-100'
              }`}
          >
            Maps
          </button>
        </div>
      </div>

      {/* University list / Map */}
      {filter === 'map' ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          <Card className="p-4 border border-border-custom bg-surface rounded-2xl flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-bold text-text-primary">EduFair Floor Plan</h4>
              <p className="text-[11px] text-text-secondary">Navigate and find booth locations from A1 to D2</p>
            </div>

            <div className="w-full bg-slate-50 rounded-xl overflow-hidden border border-border-custom p-1 aspect-square sm:aspect-video flex items-center justify-center">
              <img
                src="/edufair_floor_plan.png"
                alt="EduFair Floor Plan Map"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </Card>
        </motion.div>
      ) : filteredUniversities.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No booths found"
          description="Try adjusting your search terms or filter constraints to see results."
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-5"
        >
          {filteredUniversities.map((uni) => (
            <motion.div key={uni.id} variants={itemVariants}>
              <Card
                hoverable
                onClick={() => navigate(`/universities/${uni.id}`)}
                className="flex items-center justify-between p-3 sm:p-4 border border-border-custom hover:border-primary/10 gap-2"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* University Logo frame */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 border border-border-custom overflow-hidden flex items-center justify-center p-1.5 flex-shrink-0">
                    {uni.logo ? (
                      <img
                        src={getLogoUrl(uni.logo)}
                        alt={uni.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-0.5 sm:gap-1 flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-text-primary truncate">{uni.name}</h4>
                    <div className="flex items-center gap-1 text-[11px] text-text-secondary truncate">
                      <MapPin size={11} className="flex-shrink-0" />
                      <span className="truncate">{uni.location || 'No location set'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
                  {/* Star button has been removed from here */}
                  {uni.visited ? (
                    <CheckCircle2 size={20} className="text-success" />
                  ) : (
                    <Clock size={20} className="text-text-secondary/40" />
                  )}
                  <ChevronRight size={18} className="text-text-secondary/30 hidden sm:block" />
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Floating Feedback Bubble */}
      <StudentFeedbackModal />
    </div>
  )
}
