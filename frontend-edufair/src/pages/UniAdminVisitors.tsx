import React, { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import { Card } from '../components/ui/Card'
import { Users } from 'lucide-react'

export const UniAdminVisitors: React.FC = () => {
  const [visitors, setVisitors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/university-admin/visitors')
      .then(res => setVisitors(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary">
          <Users size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Visitors Log</h2>
          <p className="text-xs text-slate-500">Daftar siswa yang telah memindai stempel booth Anda</p>
        </div>
      </div>

      <Card className="overflow-hidden p-0 border border-slate-200/90 shadow-xs rounded-2xl bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-3.5 font-semibold text-xs text-slate-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3.5 font-semibold text-xs text-slate-500 uppercase tracking-wider">Time Visited</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visitors.map((v, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{v.student_name}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{new Date(v.visited_at).toLocaleString()}</td>
                </tr>
              ))}
              {visitors.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-slate-500 text-sm">Belum ada pengunjung yang scan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
