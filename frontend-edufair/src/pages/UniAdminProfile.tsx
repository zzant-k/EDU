import React, { useState, useEffect, useRef } from 'react'
import { apiClient } from '../api/client'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Printer } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export const UniAdminProfile: React.FC = () => {
  const [booth, setBooth] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const printAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchBooth()
  }, [])

  const fetchBooth = async () => {
    try {
      const res = await apiClient.get('/university-admin/booth')
      setBooth(res.data)
      setDescription(res.data.description || '')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData()
    formData.append('description', description)

    try {
      await apiClient.post('/university-admin/booth', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('Profile updated!')
      fetchBooth()
    } catch (err) {
      console.error(err)
      alert('Failed to update')
    } finally {
      setSaving(false)
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
          .card { border: 2px dashed #cbd5e1; padding: 40px; border-radius: 24px; max-width: 500px; width: 100%; display: flex; flex-direction: column; align-items: center; }
          .title { font-size: 32px; font-weight: 800; margin: 10px 0; color: #1e293b; }
          .header { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; font-weight: bold; }
          .location { font-size: 18px; font-weight: 600; color: #3b82f6; margin-bottom: 30px; }
          .qr { margin: 20px 0; padding: 20px; background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
          .footer { font-size: 14px; color: #64748b; margin-top: 20px; max-width: 80%; line-height: 1.5; }
        `)
        win.document.write('</style></head><body>')
        win.document.write(printContent)
        win.document.write('</body></html>')
        win.document.close()
        win.focus()
        setTimeout(() => {
          win.print()
          win.close()
        }, 500)
      }
    }
  }

  if (loading) return <div>Loading...</div>
  if (!booth) return <div>No booth assigned</div>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary mb-1">Booth Profile</h1>
        <p className="text-text-secondary">Update your university information and access your QR Code.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-border-custom rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                rows={5}
              />
            </div>
            <Button type="submit" isLoading={saving} className="self-end px-6 mt-2">Save Changes</Button>
          </form>
        </Card>

        <Card className="p-6 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-4 self-start">QR Code</h2>
          <div ref={printAreaRef} className="p-2 border border-border-custom rounded-2xl bg-white mb-6 w-full max-w-sm mx-auto">
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
              <span className="header" style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Digital Stamp Pass</span>
              <h3 className="title" style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{booth.name}</h3>
              <span className="location" style={{ fontSize: '1rem', color: '#3b82f6', marginBottom: '1rem' }}>📍 {booth.location || 'Fair Floor'}</span>
              <div className="qr" style={{ padding: '1rem', background: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <QRCodeSVG value={booth.qr_token} size={200} level="H" includeMargin={false} />
              </div>
            </div>
          </div>
          <Button onClick={handlePrint} className="flex items-center gap-2"><Printer size={16} /> Print QR Code</Button>
        </Card>
      </div>
    </div>
  )
}
