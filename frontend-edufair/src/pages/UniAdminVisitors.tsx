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
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Users size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary">Visitors Log</h1>
          <p className="text-text-secondary">All students who have scanned your booth.</p>
        </div>
      </div>

      <Card className="overflow-hidden p-0 border border-border-custom shadow-sm rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-border-custom">
                <th className="px-6 py-4 font-bold text-sm text-text-secondary uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 font-bold text-sm text-text-secondary uppercase tracking-wider">Time Visited</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v, i) => (
                <tr key={i} className="border-b border-border-custom last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-text-primary">{v.student_name}</td>
                  <td className="px-6 py-4 text-text-secondary">{new Date(v.visited_at).toLocaleString()}</td>
                </tr>
              ))}
              {visitors.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-text-secondary">No visitors yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
