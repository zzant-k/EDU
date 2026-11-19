import React, { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, Printer, Upload, Link as LinkIcon, MapPin, Building2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { getLogoUrl } from '../utils/image'
import { apiClient } from '../api/client'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Skeleton } from '../components/ui/Skeleton'

interface University {
  id: number
  name: string
  description: string
  logo: string
  logo_url?: string
  website: string
  location: string
  qr_token: string
  admin_id?: number
}

export const UniversityManagement: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([])
  const [admins, setAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [selectedUni, setSelectedUni] = useState<University | null>(null)
  
  const [editId, setEditId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [description, setDescription] = useState('')
  const [adminId, setAdminId] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const printAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchUniversities()
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const res = await apiClient.get('/superadmin/university-admins')
      setAdmins(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchUniversities = async () => {
    try {
      const res = await apiClient.get('/superadmin/universities')
      setUniversities(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditId(null)
    setName('')
    setLocation('')
    setWebsite('')
    setDescription('')
    setAdminId('')
    setLogoFile(null)
    setFormError(null)
    setFormModalOpen(true)
  }

  const openEditModal = (uni: University) => {
    setEditId(uni.id)
    setName(uni.name)
    setLocation(uni.location || '')
    setWebsite(uni.website || '')
    setDescription(uni.description || '')
    setAdminId(uni.admin_id ? uni.admin_id.toString() : '')
    setLogoFile(null)
    setFormError(null)
    setFormModalOpen(true)
  }

  const openPrintModal = (uni: University) => {
    setSelectedUni(uni)
    setPrintModalOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setFormLoading(true)
    setFormError(null)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('location', location)
    formData.append('website', website)
    formData.append('description', description)
    if (adminId) {
      formData.append('admin_id', adminId)
    }
    if (logoFile) {
      formData.append('logo', logoFile)
    }

    try {
      if (editId) {
        await apiClient.post(`/superadmin/universities/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await apiClient.post('/superadmin/universities', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      setFormModalOpen(false)
      fetchUniversities()
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Saving failed')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete university "${name}"? All student visits associated with it will be deleted permanently.`)) {
      return
    }

    try {
      await apiClient.delete(`/superadmin/universities/${id}`)
      fetchUniversities()
    } catch (err) {
      console.error(err)
      alert('Delete failed')
    }
  }

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML
    if (printContent) {
      const win = window.open('', '', 'height=600,width=800')
      if (win) {
        win.document.write('<html><head><title>Print QR Code</title>')
        win.document.write('<style>')
        win.document.write(`
          body { font-family: -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .card { border: 2px solid #000; border-radius: 24px; padding: 40px; width: 400px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
          .header { font-size: 14px; font-weight: bold; color: #666; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 5px; }
          .title { font-size: 28px; font-weight: 800; color: #000; margin: 0 0 10px; }
          .location { font-size: 14px; color: #666; display: flex; align-items: center; gap: 5px; margin-bottom: 30px; }
          .qr { border: 1px solid #eee; padding: 15px; border-radius: 16px; margin-bottom: 30px; }
          .footer { font-size: 11px; color: #888; font-weight: 500; }
        `)
        win.document.write('</style></head><body>')
        win.document.write(printContent)
        win.document.write('</body></html>')
        win.document.close()
        
        setTimeout(() => {
          win.print()
          win.close()
        }, 300)
      }
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-6 text-left w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">University Booths</h2>
          <p className="text-xs text-slate-500">Kelola stan universitas, lokasi booth, dan cetak QR Code passport</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl w-full sm:w-auto">
          <Plus size={16} />
          Add University
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton variant="rect" className="h-14" />
          <Skeleton variant="rect" className="h-14" />
          <Skeleton variant="rect" className="h-14" />
        </div>
      ) : universities.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-border-custom bg-surface">
          <Building2 size={40} className="text-text-secondary/30 mb-3" />
          <span className="text-sm font-bold text-text-primary">No university booths registered yet</span>
          <span className="text-xs text-text-secondary mt-1">Click "Add University" to set up your first event booth.</span>
        </Card>
      ) : (
        <Card className="p-0 border border-border-custom bg-surface overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-border-custom text-xs font-bold text-text-secondary uppercase">
                  <th className="py-4 px-6">University</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Website</th>
                  <th className="py-4 px-6">QR Code Token</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom/50 text-sm">
                {universities.map((uni) => (
                  <tr key={uni.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-bold text-text-primary">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 border border-border-custom flex items-center justify-center overflow-hidden p-1">
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
                        <span className="truncate max-w-[200px]">{uni.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-text-secondary font-semibold">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-text-secondary/50" />
                        <span>{uni.location || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-primary">
                      {uni.website ? (
                        <a href={uni.website} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                          <LinkIcon size={12} />
                          Visit Link
                        </a>
                      ) : (
                        <span className="text-text-secondary/40 font-normal">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-text-secondary/70 truncate max-w-[150px]" title={uni.qr_token}>
                      {uni.qr_token}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openPrintModal(uni)}
                          className="p-2 hover:bg-primary/10 text-text-secondary hover:text-primary rounded-lg transition"
                          title="Print QR Code"
                        >
                          <Printer size={15} />
                        </button>
                        <button
                          onClick={() => openEditModal(uni)}
                          className="p-2 hover:bg-slate-100 text-text-secondary hover:text-text-primary rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(uni.id, uni.name)}
                          className="p-2 hover:bg-red-50 text-text-secondary hover:text-red-600 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editId ? 'Edit University Booth' : 'Register New University Booth'}
      >
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
          {formError && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-xs font-semibold">
              {formError}
            </div>
          )}

          <Input
            label="University Name"
            placeholder="e.g. Binus University"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Location / Booth Area"
            placeholder="e.g. Main Hall - Booth A1"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <Input
            label="Official Website Link"
            placeholder="https://example.edu"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary tracking-wide uppercase px-1">Booth Admin</label>
            <select
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-border-custom rounded-2xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
            >
              <option value="">-- No Admin Assigned --</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary tracking-wide uppercase px-1">Description</label>
            <textarea
              className="w-full px-4 py-3 bg-surface border border-border-custom rounded-2xl text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition min-h-[100px] text-sm leading-relaxed"
              placeholder="Provide a brief university overview..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary tracking-wide uppercase px-1">University Logo</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-border-custom rounded-xl hover:bg-slate-100 cursor-pointer text-xs font-bold text-text-secondary transition select-none">
                <Upload size={14} />
                Upload Logo Image File
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              {logoFile && (
                <span className="text-xs text-text-primary font-bold truncate max-w-[200px]">
                  {logoFile.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-border-custom">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormModalOpen(false)}
              className="py-2.5 text-xs font-bold px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={formLoading}
              className="py-2.5 text-xs font-bold px-5"
            >
              Save Booth
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        title="Print QR Stamp Ticket"
      >
        {selectedUni && (
          <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
            <div ref={printAreaRef} className="w-full relative bg-white border border-slate-200 rounded-[1.5rem] shadow-sm overflow-hidden p-6 text-center">
              {/* Ticket Top */}
              <div className="flex flex-col items-center justify-center border-b-2 border-dashed border-slate-200 pb-5 mb-5">
                <span className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Digital Stamp Pass</span>
                <h3 className="text-2xl font-black text-slate-800 leading-tight">{selectedUni.name}</h3>
                <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-semibold">📍 {selectedUni.location || 'Fair Floor'}</span>
              </div>
              
              {/* Ticket Body / QR */}
              <div className="flex flex-col items-center justify-center bg-white p-2 rounded-xl mx-auto w-fit border-4 border-slate-50">
                <QRCodeSVG value={selectedUni.qr_token} size={200} level="H" includeMargin={false} className="w-full h-auto max-w-[200px]" />
              </div>
              
              {/* Ticket Footer */}
              <div className="mt-5 pt-4">
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-[240px] mx-auto">
                  Scan with your smartphone camera to check in and collect stamp.
                </p>
              </div>
              
              {/* Decorative side cutouts for ticket look */}
              <div className="absolute top-[102px] -left-3 w-6 h-6 bg-white border-r-2 border-slate-200 rounded-full"></div>
              <div className="absolute top-[102px] -right-3 w-6 h-6 bg-white border-l-2 border-slate-200 rounded-full"></div>
            </div>

            <div className="flex justify-end gap-2 w-full pt-4 border-t border-border-custom">
              <Button
                variant="outline"
                onClick={() => setPrintModalOpen(false)}
                className="py-2 px-4 text-xs font-bold"
              >
                Close
              </Button>
              <Button
                onClick={handlePrint}
                className="flex items-center gap-2 py-2 px-5 text-xs font-bold"
              >
                <Printer size={14} />
                Print Stamp Banner
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
