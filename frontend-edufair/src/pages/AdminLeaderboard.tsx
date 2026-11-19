import React, { useEffect, useState } from 'react'
import { Trophy, Medal, Star } from 'lucide-react'
import { apiClient } from '../api/client'
import { Card } from '../components/ui/Card'
import { useAuth } from '../store/AuthContext'

import { getLogoUrl } from '../utils/image'

interface LeaderboardEntry {
  id: number
  name: string
  logo: string | null
  points_avg_score: number | null
  points_count: number
}

export const AdminLeaderboard: React.FC = () => {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeaderboard = async () => {
    try {
      const prefix = user?.role === 'superadmin' ? 'superadmin' : 'university-admin'
      const response = await apiClient.get(`/${prefix}/leaderboard`)
      setLeaderboard(response.data)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
    
    const intervalId = setInterval(() => {
      fetchLeaderboard()
    }, 5000)

    return () => clearInterval(intervalId)
  }, [user?.role])

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="text-amber-500" size={24} /> Leaderboard
          </h2>
          <p className="text-xs text-slate-500">Peringkat poin universitas secara real-time berdasarkan voting siswa</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 sm:px-6 py-3 sm:py-3.5 w-16 sm:w-20">Rank</th>
                <th className="px-4 sm:px-6 py-3 sm:py-3.5">Universitas</th>
                <th className="px-4 sm:px-6 py-3 sm:py-3.5 text-right">Poin / Vote</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-text-secondary font-medium">
                    Memuat data...
                  </td>
                </tr>
              ) : leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-text-secondary font-medium">
                    Belum ada data poin yang masuk.
                  </td>
                </tr>
              ) : (
                leaderboard.map((uni, index) => (
                  <tr key={uni.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      {index === 0 ? <Medal className="text-amber-500 w-5 h-5 sm:w-6 sm:h-6" /> :
                       index === 1 ? <Medal className="text-slate-400 w-5 h-5 sm:w-6 sm:h-6" /> :
                       index === 2 ? <Medal className="text-orange-400 w-5 h-5 sm:w-6 sm:h-6" /> :
                       <span className="font-bold text-gray-500 ml-1 sm:ml-2 text-sm sm:text-base">{index + 1}</span>}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg border border-border-custom p-0.5 sm:p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {uni.logo ? (
                            <img src={getLogoUrl(uni.logo)} alt={uni.name} className="w-full h-full object-contain" />
                          ) : (
                            <div className="text-slate-300 font-bold text-xs sm:text-base">{uni.name.charAt(0)}</div>
                          )}
                        </div>
                        <span className="font-bold text-text-primary text-xs sm:text-base leading-tight break-words line-clamp-2">{uni.name}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                      <div className="flex flex-col items-end gap-0.5 sm:gap-1">
                        <span className="inline-flex items-center gap-1 sm:gap-1.5 font-bold text-sm sm:text-lg text-amber-600 bg-amber-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-amber-200">
                          {uni.points_avg_score ? Number(uni.points_avg_score).toFixed(1) : '0.0'} <Star className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" />
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-text-secondary font-semibold">
                          dari {uni.points_count} penilai
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
