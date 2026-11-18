import React, { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import { Card } from '../components/ui/Card'
import { Users, ScanLine, Clock } from 'lucide-react'

export const UniAdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/university-admin/dashboard')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>
  if (!data) return <div>Failed to load dashboard</div>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary mb-1">Booth Dashboard</h1>
        <p className="text-text-secondary">Overview for {data.university_name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 p-6 border border-border-custom rounded-2xl shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
            <ScanLine size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Total Scans</p>
            <h3 className="text-3xl font-extrabold text-text-primary">{data.total_scans}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-6 border border-border-custom rounded-2xl shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Today's Visitors</p>
            <h3 className="text-3xl font-extrabold text-text-primary">{data.today_scans}</h3>
          </div>
        </Card>
      </div>

      <Card className="p-6 border border-border-custom shadow-sm rounded-2xl">
        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <Clock size={20} className="text-primary" />
          Recent Visitors
        </h3>
        {data.recent_visitors.length > 0 ? (
          <div className="flex flex-col gap-3">
            {data.recent_visitors.map((visitor: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-border-custom last:border-0">
                <span className="font-semibold text-text-primary">{visitor.student_name}</span>
                <span className="text-sm text-text-secondary">{new Date(visitor.visited_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-center py-4">No recent visitors.</p>
        )}
      </Card>
    </div>
  )
}
