import React, { useState, useEffect } from 'react'
import { Search, Download, Users, Eye } from 'lucide-react'
import { apiClient } from '../api/client'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Skeleton } from '../components/ui/Skeleton'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Student {
  id: number
  name: string
  visited_count: number
  total_universities: number
  percentage: number
  created_at: string
  lucky_draw_joined: boolean
}

interface StudentDetailProgress {
  student: {
    id: number
    name: string
  }
  progress: {
    visited_count: number
    total_count: number
    percentage: number
  }
  stamp_history: {
    id: number
    name: string
    location: string
    visited: boolean
    visited_at: string | null
  }[]
}

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all')
  
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailProgress, setDetailProgress] = useState<StudentDetailProgress | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [filterStatus])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/superadmin/students', {
        params: {
          search: search || undefined,
          status: filterStatus === 'all' ? undefined : filterStatus
        }
      })
      setStudents(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchStudents()
    }
  }

  const openDetailModal = async (studentId: number) => {
    setDetailLoading(true)
    setDetailModalOpen(true)
    setDetailProgress(null)
    try {
      const res = await apiClient.get(`/superadmin/students/${studentId}/progress`)
      setDetailProgress(res.data)
    } catch (err) {
      console.error(err)
      setDetailModalOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleExportPDF = () => {
    if (students.length === 0) return

    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('EduFair Student Passport Data', 14, 15)
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22)

    const headers = [['Student ID', 'Student Name', 'Stamps', 'Total', 'Progress %', 'Lucky Draw', 'Registration']]
    const data = students.map((s) => [
      s.id,
      s.name,
      s.visited_count,
      s.total_universities,
      `${s.percentage}%`,
      s.lucky_draw_joined ? 'YES' : 'NO',
      new Date(s.created_at).toLocaleDateString()
    ])

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    })

    doc.save(`EduFair_Student_Passport_Data_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <div className="flex flex-col gap-8 pb-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-text-primary font-sans">Students Passport Progress</h2>
          <p className="text-xs text-text-secondary">View passport check-ins, search student details, and export event data</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50" size={16} />
          <input
            type="text"
            placeholder="Search student name... (Press Enter)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyPress}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-custom rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setFilterStatus('all') }}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${
              filterStatus === 'all'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface text-text-secondary border-border-custom hover:bg-slate-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setFilterStatus('completed') }}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${
              filterStatus === 'completed'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface text-text-secondary border-border-custom hover:bg-slate-100'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => { setFilterStatus('pending') }}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${
              filterStatus === 'pending'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface text-text-secondary border-border-custom hover:bg-slate-100'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton variant="rect" className="h-14" />
          <Skeleton variant="rect" className="h-14" />
          <Skeleton variant="rect" className="h-14" />
        </div>
      ) : students.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-border-custom bg-surface">
          <Users size={40} className="text-text-secondary/30 mb-3" />
          <span className="text-sm font-bold text-text-primary">No students matching criteria</span>
          <span className="text-xs text-text-secondary mt-1">Try resetting search query or filter tags.</span>
        </Card>
      ) : (
        <Card className="p-0 border border-border-custom bg-surface overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-border-custom text-xs font-bold text-text-secondary uppercase">
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">Stamps Collected</th>
                  <th className="py-4 px-6">Progress %</th>
                  <th className="py-4 px-6">Lucky Draw status</th>
                  <th className="py-4 px-6">Register Date</th>
                  <th className="py-4 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom/50 text-sm">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-bold text-text-primary">
                      {student.name}
                    </td>
                    <td className="py-4 px-6 text-text-secondary font-semibold">
                      {student.visited_count} / {student.total_universities}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-border-custom/30">
                          <div className="h-full bg-primary" style={{ width: `${student.percentage}%` }} />
                        </div>
                        <span className="font-bold text-xs">{student.percentage}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {student.lucky_draw_joined ? (
                        <Badge variant="primary">Registered</Badge>
                      ) : (
                        <Badge variant="neutral">Not Registered</Badge>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-text-secondary font-semibold">
                      {new Date(student.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openDetailModal(student.id)}
                        className="p-2 hover:bg-slate-100 text-text-secondary hover:text-text-primary rounded-lg transition"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={detailProgress ? `${detailProgress.student.name}'s Passport Stamps` : 'Loading details...'}
      >
        {detailLoading && (
          <div className="flex flex-col gap-3 py-6">
            <Skeleton variant="rect" className="h-10" />
            <Skeleton variant="rect" className="h-10" />
            <Skeleton variant="rect" className="h-10" />
          </div>
        )}

        {detailProgress && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-border-custom rounded-2xl">
              <div className="flex flex-col text-left gap-0.5">
                <span className="text-[10px] font-bold text-text-secondary uppercase">Stamps Count</span>
                <span className="text-lg font-black text-text-primary">
                  {detailProgress.progress.visited_count} / {detailProgress.progress.total_count}
                </span>
              </div>
              <div className="flex flex-col text-left gap-0.5">
                <span className="text-[10px] font-bold text-text-secondary uppercase">Completion Status</span>
                <span className="text-lg font-black text-primary">
                  {detailProgress.progress.percentage}%
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto no-scrollbar">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Stamps Logs</span>
              {detailProgress.stamp_history.map((uni) => (
                <div key={uni.id} className="flex items-center justify-between p-3 border border-border-custom/50 rounded-xl bg-surface">
                  <div className="flex flex-col text-left gap-0.5">
                    <span className="text-sm font-bold text-text-primary">{uni.name}</span>
                    <span className="text-[10px] text-text-secondary">{uni.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {uni.visited ? (
                      <div className="flex flex-col items-end gap-0.5">
                        <Badge variant="success" className="h-6">
                          Stamped
                        </Badge>
                        {uni.visited_at && (
                          <span className="text-[9px] text-text-secondary font-semibold">
                            {new Date(uni.visited_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    ) : (
                      <Badge variant="neutral" className="h-6">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-border-custom">
              <Button
                variant="outline"
                onClick={() => setDetailModalOpen(false)}
                className="py-2 px-4 text-xs font-bold"
              >
                Close Logs
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
