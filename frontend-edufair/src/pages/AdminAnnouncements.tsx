import React, { useState, useEffect } from 'react'
import {
  Bell,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  X,
  Radio,
} from 'lucide-react'
import { apiClient } from '../api/client'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'

interface Announcement {
  id: number
  title?: string
  message: string
  type: 'info' | 'urgent' | 'event'
  is_active: boolean
  created_at: string
}

export const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [formType, setFormType] = useState<'info' | 'urgent' | 'event'>('info')
  const [formActive, setFormActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const fetchAnnouncements = async () => {
    try {
      const res = await apiClient.get('/superadmin/announcements')
      setAnnouncements(res.data || [])
    } catch (err) {
      console.error('Failed to fetch announcements:', err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const handleToggle = async (id: number) => {
    try {
      await apiClient.put(`/superadmin/announcements/${id}/toggle`)
      showToast('Status pengumuman berhasil diubah')
      fetchAnnouncements()
    } catch {
      showToast('Gagal mengubah status pengumuman')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus pengumuman ini?')) return
    try {
      await apiClient.delete(`/superadmin/announcements/${id}`)
      showToast('Pengumuman berhasil dihapus')
      fetchAnnouncements()
    } catch {
      showToast('Gagal menghapus pengumuman')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formMessage.trim()) return

    setIsSubmitting(true)
    try {
      await apiClient.post('/superadmin/announcements', {
        title: formTitle.trim() || null,
        message: formMessage.trim(),
        type: formType,
        is_active: formActive,
      })
      showToast('Pengumuman baru berhasil di-broadcast!')
      setIsModalOpen(false)
      setFormTitle('')
      setFormMessage('')
      setFormType('info')
      setFormActive(true)
      fetchAnnouncements()
    } catch (err: any) {
      console.error('Error submitting announcement:', err)
      showToast(err.response?.data?.message || err.message || 'Gagal mengirim pengumuman')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
            <AlertTriangle size={12} />
            Urgent / Penting
          </span>
        )
      case 'event':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Calendar size={12} />
            Jadwal Acara
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
            <Bell size={12} />
            Info Umum
          </span>
        )
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-text-primary tracking-tight font-sans">
            Broadcast & Pengumuman
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Kirim pesan langsung ke banner aplikasi seluruh siswa secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsRefreshing(true)
              fetchAnnouncements()
            }}
            className="p-2.5 text-text-secondary hover:text-text-primary bg-surface border border-border-custom rounded-xl transition"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <Plus size={16} />
            <span>Buat Broadcast Baru</span>
          </button>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton variant="rect" className="h-24 rounded-2xl" />
          <Skeleton variant="rect" className="h-24 rounded-2xl" />
          <Skeleton variant="rect" className="h-24 rounded-2xl" />
        </div>
      ) : announcements.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center gap-3 bg-surface border border-border-custom rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-text-secondary">
            <Radio size={24} />
          </div>
          <h3 className="text-base font-bold text-text-primary">Belum ada pengumuman</h3>
          <p className="text-xs text-text-secondary max-w-sm">
            Klik tombol &quot;Buat Broadcast Baru&quot; untuk mengirimkan pengumuman pertama Anda ke layar seluruh siswa.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map((item) => (
            <Card
              key={item.id}
              className={`p-4 sm:p-5 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                item.is_active
                  ? 'bg-surface border-border-custom shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {getTypeBadge(item.type)}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      item.is_active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {item.is_active ? '● Aktif Tayang' : '○ Dinonaktifkan'}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-text-secondary ml-auto">
                    <Clock size={12} />
                    <span>{new Date(item.created_at).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {item.title && (
                  <h4 className="text-sm font-bold text-text-primary">
                    {item.title}
                  </h4>
                )}
                <p className="text-xs text-text-secondary leading-relaxed">
                  {item.message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-border-custom w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleToggle(item.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                    item.is_active
                      ? 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100'
                      : 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  {item.is_active ? 'Tarik / Matikan' : 'Aktifkan Kembali'}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-custom">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Radio size={16} />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  Buat Broadcast Panitia
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-text-secondary hover:text-text-primary rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-text-primary mb-1 block">
                  Judul Singkat (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Info Panggung Utama"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-border-custom rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-primary mb-1 block">
                  Isi Pesan Pengumuman *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tulis pengumuman yang akan langsung tampil di banner atas HP siswa..."
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-border-custom rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-primary mb-1.5 block">
                  Kategori Pengumuman
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'info', label: 'Info Umum', icon: Bell, border: 'border-blue-400 bg-blue-50/50' },
                    { key: 'urgent', label: 'Urgent / Penting', icon: AlertTriangle, border: 'border-rose-400 bg-rose-50/50' },
                    { key: 'event', label: 'Jadwal Acara', icon: Calendar, border: 'border-amber-400 bg-amber-50/50' },
                  ].map((t) => {
                    const Icon = t.icon
                    const selected = formType === t.key
                    return (
                      <button
                        type="button"
                        key={t.key}
                        onClick={() => setFormType(t.key as any)}
                        className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition cursor-pointer ${
                          selected
                            ? `${t.border} ring-2 ring-primary/20 font-bold`
                            : 'border-border-custom hover:bg-slate-50 text-text-secondary'
                        }`}
                      >
                        <Icon size={14} />
                        <span className="text-[11px] leading-tight">{t.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formActive"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-border-custom focus:ring-primary/20"
                />
                <label htmlFor="formActive" className="text-xs font-semibold text-text-primary cursor-pointer">
                  Langsung aktifkan dan tayangkan ke seluruh siswa sekarang
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-custom">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-text-secondary hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formMessage.trim()}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Mengirim...' : 'Siarkan Pengumuman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

