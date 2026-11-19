import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { apiClient } from '../api/client'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'

export const AdminUserManagement: React.FC = () => {
  const [admins, setAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const res = await apiClient.get('/superadmin/university-admins')
      setAdmins(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenNew = () => {
    setEditId(null)
    setName('')
    setPassword('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (admin: any) => {
    setEditId(admin.id)
    setName(admin.name)
    setPassword('') // Don't fetch password
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editId) {
        await apiClient.put(`/superadmin/university-admins/${editId}`, {
          name,
          password: password ? password : undefined
        })
      } else {
        await apiClient.post('/superadmin/university-admins', {
          name,
          password
        })
      }
      setIsModalOpen(false)
      fetchAdmins()
    } catch (err) {
      console.error(err)
      alert('Failed to save admin user')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this admin? They will be unassigned from their booth.')) return
    try {
      await apiClient.delete(`/superadmin/university-admins/${id}`)
      fetchAdmins()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">University Admins</h2>
          <p className="text-xs text-slate-500">Kelola akun dan kredensial admin untuk booth universitas</p>
        </div>
        <Button onClick={handleOpenNew} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-xs w-full sm:w-auto">
          <Plus size={16} /> Add Admin
        </Button>
      </div>

      <Card className="overflow-hidden p-0 border border-slate-200/90 shadow-xs rounded-2xl bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-4 sm:px-6 py-3 sm:py-3.5 font-semibold text-xs text-slate-500 uppercase tracking-wider">Username</th>
                <th className="px-4 sm:px-6 py-3 sm:py-3.5 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.map((admin) => (
                <tr key={admin.id} className="border-b border-border-custom last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <span className="font-semibold text-text-primary text-sm sm:text-base">{admin.name}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex justify-end gap-1.5 sm:gap-2">
                      <button onClick={() => handleOpenEdit(admin)} className="p-1.5 sm:p-2 text-text-secondary hover:text-primary transition-colors bg-white rounded-lg border border-border-custom shadow-sm hover:shadow">
                        <Pencil size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button onClick={() => handleDelete(admin.id)} className="p-1.5 sm:p-2 text-red-400 hover:text-red-600 transition-colors bg-white rounded-lg border border-border-custom shadow-sm hover:shadow">
                        <Trash2 size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-text-secondary">
                    No university admins found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? 'Edit Admin' : 'Add Admin'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">Username</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-border-custom rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Password {editId && <span className="font-normal text-xs">(Leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              required={!editId}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-border-custom rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>
          <div className="flex gap-3 justify-end mt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
