import React, { useState, useEffect } from 'react'
import {
  MessageSquareQuote,
  Download,
  Printer,
  Search,
  Star,
  Trash2,
  RefreshCw,
  Clock,
  Filter,
  CheckCircle2,
  X,
  User,
} from 'lucide-react'
import { apiClient } from '../api/client'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'

interface FeedbackItem {
  id: number
  user_id: number
  student_name: string
  category: string
  rating: number
  content: string
  created_at: string
}

export const AdminFeedbackManagement: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRating, setSelectedRating] = useState<string>('all')

  // Delete modal state
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const fetchFeedbacks = async () => {
    try {
      const res = await apiClient.get('/superadmin/feedbacks')
      setFeedbacks(res.data || [])
    } catch (err) {
      console.error('Failed to fetch feedbacks:', err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchFeedbacks()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await apiClient.delete(`/superadmin/feedbacks/${deleteId}`)
      setToastMessage('Feedback berhasil dihapus.')
      setDeleteId(null)
      await fetchFeedbacks()
      setTimeout(() => setToastMessage(null), 3000)
    } catch (err) {
      console.error('Failed to delete feedback:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  // Tarik Data: Export to CSV (Excel Compatible)
  const handleExportCSV = () => {
    if (feedbacks.length === 0) {
      alert('Tidak ada data feedback untuk ditarik.')
      return
    }

    const headers = ['No', 'ID Feedback', 'Nama Siswa', 'Kategori', 'Rating (Bintang)', 'Isi Feedback', 'Tanggal & Waktu']
    const rows = filteredFeedbacks.map((fb, index) => [
      index + 1,
      fb.id,
      `"${fb.student_name.replace(/"/g, '""')}"`,
      `"${fb.category.replace(/"/g, '""')}"`,
      fb.rating,
      `"${fb.content.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${new Date(fb.created_at).toLocaleString('id-ID')}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `edufair_feedbacks_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Tarik Data: Print / PDF
  const handlePrint = () => {
    window.print()
  }

  // Filters
  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesSearch =
      fb.student_name.toLowerCase().includes(search.toLowerCase()) ||
      fb.content.toLowerCase().includes(search.toLowerCase()) ||
      fb.category.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || fb.category === selectedCategory
    const matchesRating = selectedRating === 'all' || fb.rating === Number(selectedRating)

    return matchesSearch && matchesCategory && matchesRating
  })

  // Summary KPIs
  const totalCount = feedbacks.length
  const avgRating = totalCount > 0 ? (feedbacks.reduce((acc, curr) => acc + (curr.rating || 5), 0) / totalCount).toFixed(1) : '0.0'
  const highRatingCount = feedbacks.filter((f) => f.rating >= 4).length

  return (
    <div className="flex flex-col gap-6 pb-12 w-full text-left font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-xl text-xs font-semibold animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header + Export Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-left">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <MessageSquareQuote className="text-blue-600" size={26} />
            <span>Student Feedbacks</span>
          </h2>
          <p className="text-xs text-slate-500">
            Kelola, analisis, dan tarik seluruh data masukan serta ulasan dari siswa peserta EduFair.
          </p>
        </div>

        {/* Action Buttons: Tarik Data (CSV / Print) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Print Data Laporan"
          >
            <Printer size={14} />
            <span>Cetak / PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            title="Download CSV untuk Excel / Spreadsheet"
          >
            <Download size={15} />
            <span>Tarik Data (CSV)</span>
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col justify-between p-5 border border-slate-200/90 bg-white rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Feedback</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-slate-900">{totalCount}</span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Siswa</span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-5 border border-slate-200/90 bg-white rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rata-rata Rating</span>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">{avgRating}</span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star size={18} className="fill-amber-400" />
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-5 border border-slate-200/90 bg-white rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kepuasan Positif</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-emerald-600">{highRatingCount}</span>
            <span className="text-xs text-slate-500 font-medium">Bintang 4 & 5</span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-5 border border-slate-200/90 bg-white rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hasil Filter</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-slate-900">{filteredFeedbacks.length}</span>
            <span className="text-xs text-slate-400">ditampilkan</span>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari siswa atau kata kunci..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-600">
            <Filter size={13} className="text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-slate-700 outline-none cursor-pointer pr-1"
            >
              <option value="all">Semua Kategori</option>
              <option value="Acara & Suasana">Acara & Suasana</option>
              <option value="Stan Universitas">Stan Universitas</option>
              <option value="Aplikasi Passport">Aplikasi Passport</option>
              <option value="Fasilitas & Tempat">Fasilitas & Tempat</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          {/* Rating Filter */}
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Semua Rating</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Bintang)</option>
            <option value="4">⭐⭐⭐⭐ (4 Bintang)</option>
            <option value="3">⭐⭐⭐ (3 Bintang)</option>
            <option value="2">⭐⭐ (2 Bintang)</option>
            <option value="1">⭐ (1 Bintang)</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="overflow-hidden p-0 border border-slate-200/90 shadow-xs rounded-2xl bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5 w-12 text-center">No</th>
                <th className="px-5 py-3.5">Nama Siswa</th>
                <th className="px-5 py-3.5">Kategori</th>
                <th className="px-5 py-3.5">Rating</th>
                <th className="px-6 py-3.5 min-w-[280px]">Isi Feedback</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Waktu</th>
                <th className="px-5 py-3.5 text-right w-16">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-5 py-4">
                      <Skeleton variant="text" className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <MessageSquareQuote size={28} className="text-slate-300" />
                      <span className="font-semibold text-slate-600">Tidak ada feedback ditemukan</span>
                      <span className="text-[11px] text-slate-400">
                        Belum ada masukan dari siswa atau sesuaikan kata kunci pencarian.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((fb, idx) => (
                  <tr key={fb.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 text-center font-mono text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200/80 flex items-center justify-center font-bold text-xs text-blue-700 uppercase flex-shrink-0">
                          {fb.student_name ? fb.student_name.slice(0, 2).toUpperCase() : <User size={14} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-xs">{fb.student_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">ID #{fb.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {fb.category}
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: fb.rating }).map((_, i) => (
                          <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-[11px] font-bold text-slate-700 ml-1">
                          {fb.rating}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-slate-800 text-xs leading-relaxed font-normal whitespace-pre-wrap max-w-xl">
                        {fb.content}
                      </p>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-slate-500 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" />
                        <span>{new Date(fb.created_at).toLocaleString('id-ID')}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setDeleteId(fb.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus Feedback"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6 flex flex-col gap-4 text-left animate-scale-up">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900">Hapus Feedback?</h4>
              <button
                onClick={() => setDeleteId(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus feedback ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

