import React, { useState, useEffect } from 'react'
import { Users, Building2, CheckCircle2, Ticket, TrendingUp } from 'lucide-react'
import { apiClient } from '../api/client'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'

interface ChartItem {
  date: string
  count: number
}

interface StatsData {
  total_students: number
  total_universities: number
  completed_students: number
  remaining_students: number
  lucky_draw_participants: number
  analytics: {
    daily_checkins: ChartItem[]
    daily_registrations: ChartItem[]
  }
}

export const SuperAdminDashboard: React.FC = () => {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/superadmin/stats')
      setData(res.data)
    } catch (err) {
      console.error('Failed to fetch dashboard statistics:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton variant="rect" className="h-28" />
          <Skeleton variant="rect" className="h-28" />
          <Skeleton variant="rect" className="h-28" />
          <Skeleton variant="rect" className="h-28" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton variant="rect" className="h-80" />
          <Skeleton variant="rect" className="h-80" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const renderBarChart = (items: ChartItem[], colorClass: string, label: string) => {
    const maxVal = Math.max(...items.map((i) => i.count), 5)
    
    return (
      <Card className="flex flex-col gap-4 border border-slate-200/90 bg-white p-6 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
            <span className="text-base font-bold text-slate-900">Last 7 Days</span>
          </div>
          <TrendingUp className="text-slate-400" size={18} />
        </div>

        <div className="relative w-full h-[180px] mt-2 flex flex-col justify-end">
          <div className="flex items-end justify-between h-[150px] w-full px-2">
            {items.map((item, idx) => {
              const pct = (item.count / maxVal) * 100
              const barHeight = Math.max(pct, 4)

              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg -translate-y-12 shadow pointer-events-none z-10">
                    {item.count} count
                  </div>

                  <div
                    className={`w-8 rounded-t-lg transition-all duration-500 origin-bottom ${colorClass}`}
                    style={{ height: `${barHeight}%` }}
                  />

                  <span className="text-[10px] text-slate-500 font-medium truncate w-12 text-center">
                    {item.date.split(',')[0]}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-slate-200 px-2 h-[150px] pb-6">
            <div className="w-full border-t border-dashed border-slate-100"></div>
            <div className="w-full border-t border-dashed border-slate-100"></div>
            <div className="w-full border-t border-dashed border-slate-100"></div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-6 w-full">
      <div className="flex flex-col gap-1 text-left">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h2>
        <p className="text-xs text-slate-500">Statistik kehadiran siswa, booth universitas, dan aktivitas undian</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="flex flex-col justify-between p-5 border border-slate-200/90 bg-white rounded-2xl relative overflow-hidden shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Students</span>
              <span className="text-2xl font-bold text-slate-900">{data.total_students}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary">
              <Users size={16} />
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-5 border border-slate-200/90 bg-white rounded-2xl relative overflow-hidden shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Completed Students</span>
              <span className="text-2xl font-bold text-emerald-600">{data.completed_students}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-5 border border-slate-200/90 bg-white rounded-2xl relative overflow-hidden shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Students</span>
              <span className="text-2xl font-bold text-slate-700">{data.remaining_students}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-600">
              <Users size={16} className="opacity-70" />
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-5 border border-slate-200/90 bg-white rounded-2xl relative overflow-hidden shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Universities</span>
              <span className="text-2xl font-bold text-slate-900">{data.total_universities}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Building2 size={16} />
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-5 border border-slate-200/90 bg-white rounded-2xl relative overflow-hidden shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Draw Participants</span>
              <span className="text-2xl font-bold text-amber-500">{data.lucky_draw_participants}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
              <Ticket size={16} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-2">
        {renderBarChart(data.analytics.daily_checkins, 'bg-primary hover:bg-primary-hover', 'Daily Stamp Check-Ins')}
        {renderBarChart(data.analytics.daily_registrations, 'bg-sky-500 hover:bg-sky-600', 'Daily Student Registrations')}
      </div>
    </div>
  )
}
