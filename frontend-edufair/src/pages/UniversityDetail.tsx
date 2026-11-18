import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Globe, CheckCircle2, Circle } from 'lucide-react'
import { apiClient } from '../api/client'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'
import { motion } from 'framer-motion'

interface University {
  id: number
  name: string
  description: string
  logo: string
  logo_url?: string
  website: string
  location: string
  visited: boolean
}

export const UniversityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [university, setUniversity] = useState<University | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDetail()
  }, [id])

  const fetchDetail = async () => {
    try {
      const res = await apiClient.get(`/student/universities/${id}`)
      setUniversity(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton variant="text" className="w-12 h-6" />
        <Skeleton variant="circle" className="w-24 h-24 mx-auto" />
        <Skeleton variant="text" className="w-3/4 h-8 mx-auto" />
        <Skeleton variant="rect" className="h-40" />
      </div>
    )
  }

  if (!university) {
    return (
      <div className="flex flex-col gap-4 text-center py-10">
        <p className="text-text-secondary">University not found.</p>
        <Button onClick={() => navigate('/')} variant="outline" className="w-fit mx-auto">
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm font-semibold transition w-fit"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Main Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center text-center gap-4 bg-surface border border-border-custom rounded-2xl p-8 shadow-sm"
      >
        {/* Large Logo */}
        <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-border-custom overflow-hidden flex items-center justify-center p-3">
          {university.logo ? (
            <img 
              src={university.logo_url || `http://${window.location.hostname}:8000/storage/${university.logo}`} 
              alt={university.name} 
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : null}
        </div>

        {/* Name and Location */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-extrabold tracking-tight text-text-primary font-sans">{university.name}</h2>
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-text-secondary bg-slate-100 px-3.5 py-1.5 rounded-full border border-border-custom/50 w-fit mx-auto">
            <MapPin size={13} className="text-text-secondary" />
            {university.location || 'No location set'}
          </div>
        </div>

        {/* Stamp Status Display */}
        <div className="mt-4 w-full">
          {university.visited ? (
            <div className="flex flex-col items-center gap-2 p-5 bg-success/5 border border-success/15 rounded-2xl text-success">
              <CheckCircle2 size={36} strokeWidth={1.5} />
              <span className="text-sm font-extrabold tracking-tight">STAMP COLLECTED</span>
              <span className="text-[10px] text-success/70 font-medium">You have checked in at this university booth</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-5 bg-slate-50 border border-border-custom rounded-2xl text-text-secondary">
              <Circle size={36} strokeWidth={1.5} className="opacity-50" />
              <span className="text-sm font-extrabold tracking-tight">STAMP PENDING</span>
              <span className="text-[10px] text-text-secondary/70 font-medium">Visit this university booth and scan their QR Code</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Description */}
      {university.description && (
        <Card className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider text-left">About</h3>
          <p className="text-sm text-text-secondary leading-relaxed text-left">
            {university.description}
          </p>
        </Card>
      )}

      {/* External Website Action */}
      {university.website && (
        <a 
          href={university.website} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full text-current decoration-none"
        >
          <Card hoverable className="flex items-center justify-between py-4.5 px-6 border-primary/10 hover:border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Globe size={18} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-text-primary">Visit Official Website</span>
                <span className="text-[10px] text-text-secondary">{university.website}</span>
              </div>
            </div>
            <svg className="lucide lucide-chevron-right text-text-secondary/40" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </Card>
        </a>
      )}
    </div>
  )
}
