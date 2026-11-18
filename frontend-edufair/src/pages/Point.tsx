import React, { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { apiClient } from '../api/client'
import { useNavigate } from 'react-router-dom'

interface LeaderboardEntry {
  id: number
  name: string
  logo: string | null
  points_avg_score: number | null
  points_count: number
}

export const Point: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchLeaderboard = async () => {
    try {
      const response = await apiClient.get('/student/leaderboard')
      setLeaderboard(response.data)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
    
    // Auto-refresh every 5 seconds for "realtime" feel
    const intervalId = setInterval(() => {
      fetchLeaderboard()
    }, 5000)

    return () => clearInterval(intervalId)
  }, [])

  const top3 = leaderboard.slice(0, 3)
  const rank1 = top3[0]
  const rank2 = top3[1]
  const rank3 = top3[2]

  return (
    <div className="bg-white min-h-screen flex flex-col relative w-full">
      {/* Top Blue Section */}
      <div className="bg-blue-600 flex flex-col relative overflow-hidden w-full pt-4 pb-10 px-7">
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-96 bg-blue-500 opacity-20" style={{ background: 'radial-gradient(circle at top, rgba(255,255,255,0.3) 0%, transparent 60%)' }}></div>

        {/* Header */}
        <div className="flex items-center justify-between text-white relative z-20 mb-10">
           <div className="flex items-center gap-3">
             <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-full transition -ml-1">
               <ArrowLeft size={24} />
             </button>
             <div className="flex flex-col">
               <h1 className="text-lg font-bold leading-tight">Leaderboard Universitas</h1>
               <span className="text-xs text-blue-100">EduFair 2027</span>
             </div>
           </div>
        </div>

        {loading && leaderboard.length === 0 ? (
          <div className="text-center py-20 text-white font-medium relative z-20">Memuat data...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20 text-white font-medium relative z-20">Belum ada peringkat.</div>
        ) : (
          /* Podium Section */
          <div className="flex items-end justify-center h-60 mt-0 relative z-10 max-w-sm mx-auto w-full">
            
            {/* Rank 2 */}
            <div className="w-[30%] flex flex-col items-center justify-end relative z-20">
                <span className="text-white font-bold text-[10px] text-center uppercase mb-1 line-clamp-1 px-1">
                  {rank2?.name || '-'}
                </span>
                {rank2?.logo ? (
                  <div className="w-12 h-12 bg-white rounded-full p-1 z-30 mb-[-10px] relative flex items-center justify-center overflow-hidden">
                    <img src={`http://${window.location.hostname}:8000/storage/${rank2.logo}`} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-slate-200 rounded-full z-30 mb-[-10px] relative flex items-center justify-center">
                    <span className="text-slate-400 font-bold text-xs">{rank2?.name?.charAt(0)}</span>
                  </div>
                )}
                <div className="bg-yellow-400 text-slate-900 text-[9px] font-bold px-2 py-0.5 rounded-full z-40 mb-[-8px] text-center whitespace-nowrap relative">
                  {rank2?.points_avg_score ? Number(rank2.points_avg_score).toFixed(1) : '0'} pts
                </div>
                <div className="w-full h-32 bg-gradient-to-r from-blue-500 to-blue-600 flex justify-center items-start pt-5 shadow-lg relative z-10 rounded-tl-lg">
                  <span className="text-white font-black text-3xl drop-shadow-md opacity-90">2</span>
                </div>
            </div>

            {/* Rank 1 */}
            <div className="w-[40%] flex flex-col items-center justify-end relative z-30">
                <span className="text-white font-black text-[11px] sm:text-xs text-center uppercase mb-1 line-clamp-1 px-1">
                  {rank1?.name || '-'}
                </span>
                {rank1?.logo ? (
                  <div className="w-16 h-16 bg-white rounded-full p-1 z-30 mb-[-12px] relative flex items-center justify-center overflow-hidden">
                    <img src={`http://${window.location.hostname}:8000/storage/${rank1.logo}`} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-slate-200 rounded-full z-30 mb-[-12px] relative flex items-center justify-center">
                    <span className="text-slate-400 font-bold text-lg">{rank1?.name?.charAt(0)}</span>
                  </div>
                )}
                <div className="bg-yellow-400 text-slate-900 text-[11px] font-black px-3 py-1 rounded-full z-40 mb-[-12px] text-center whitespace-nowrap relative">
                  {rank1?.points_avg_score ? Number(rank1.points_avg_score).toFixed(1) : '0'} pts
                </div>
                <div className="w-full h-40 bg-gradient-to-r from-blue-400 to-blue-500 rounded-t-lg flex justify-center items-start pt-7 shadow-xl relative z-10">
                  <span className="text-white font-black text-5xl drop-shadow-lg opacity-95">1</span>
                </div>
            </div>

            {/* Rank 3 */}
            <div className="w-[30%] flex flex-col items-center justify-end relative z-10">
                <span className="text-white font-bold text-[10px] text-center uppercase mb-1 line-clamp-1 px-1">
                  {rank3?.name || '-'}
                </span>
                {rank3?.logo ? (
                  <div className="w-12 h-12 bg-white rounded-full p-1 z-30 mb-[-10px] relative flex items-center justify-center overflow-hidden">
                    <img src={`http://${window.location.hostname}:8000/storage/${rank3.logo}`} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-slate-200 rounded-full z-30 mb-[-10px] relative flex items-center justify-center">
                    <span className="text-slate-400 font-bold text-xs">{rank3?.name?.charAt(0)}</span>
                  </div>
                )}
                <div className="bg-yellow-400 text-slate-900 text-[9px] font-bold px-2 py-0.5 rounded-full z-40 mb-[-8px] text-center whitespace-nowrap relative">
                  {rank3?.points_avg_score ? Number(rank3.points_avg_score).toFixed(1) : '0'} pts
                </div>
                <div className="w-full h-24 bg-gradient-to-r from-blue-600 to-blue-700 flex justify-center items-start pt-4 shadow-lg relative z-10 rounded-tr-lg">
                  <span className="text-white font-black text-3xl drop-shadow-md opacity-90">3</span>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* List Section */}
      {!loading && leaderboard.length > 0 && (
        <div className="flex-1 bg-white rounded-t-[2.5rem] px-5 py-6 pb-32 z-40 -mt-10 shadow-[0_-12px_30px_rgba(0,0,0,0.12)] flex flex-col relative w-full">
          {/* Notch */}
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>

          <div className="flex justify-between items-center px-2 mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Universitas</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rata-Rata Skor</span>
          </div>

          <div className="flex flex-col gap-1">
            {leaderboard.map((uni, idx) => (
              <div key={uni.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition px-2 rounded-xl">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-slate-400 font-black w-5 text-left text-sm">{idx + 1}.</span>
                  
                  {/* University Logo */}
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
                    {uni.logo ? (
                      <img
                        src={`http://${window.location.hostname}:8000/storage/${uni.logo}`}
                        alt={uni.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                        {uni.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-extrabold text-slate-800 text-sm truncate uppercase leading-snug">{uni.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium leading-none mt-1">{uni.points_count} penilai</span>
                  </div>
                </div>
                <div className="bg-yellow-50/80 text-yellow-600 font-bold text-xs px-3 py-1.5 rounded-lg ml-2 flex-shrink-0 flex items-center gap-1">
                  {uni.points_avg_score ? Number(uni.points_avg_score).toFixed(1) : '0.0'} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

