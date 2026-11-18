import React from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut } from 'lucide-react'
import { useAuth } from '../store/AuthContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { motion } from 'framer-motion'

export const Profile: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error(err)
    }
  }

  const visitedCount = user?.progress?.visited_count || 0
  const totalCount = user?.progress?.total_count || 0
  const percentage = user?.progress?.percentage || 0

  return (
    <div className="flex flex-col gap-6 pb-6 items-center">
      {/* Profile Header card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex flex-col items-center text-center p-6 bg-surface border border-border-custom rounded-3xl shadow-sm relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>

        <div className="w-16 h-16 rounded-full bg-slate-100 border border-border-custom flex items-center justify-center text-text-primary mb-3">
          <User size={28} strokeWidth={2} />
        </div>
        <h2 className="text-lg font-extrabold tracking-tight text-text-primary font-sans">{user?.name}</h2>
        <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase mt-0.5">Student Account</span>
      </motion.div>

      {/* Progress Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full"
      >
        <Card className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider text-left">Your Progress</h3>
          
          <div className="flex items-center justify-between text-sm py-1 border-b border-border-custom/50">
            <span className="text-text-secondary">Passport Status</span>
            {percentage === 100 ? (
              <Badge variant="success">Complete</Badge>
            ) : (
              <Badge variant="neutral">In Progress</Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-sm py-1 border-b border-border-custom/50">
            <span className="text-text-secondary">Visited Booths</span>
            <span className="font-bold text-text-primary">{visitedCount} / {totalCount}</span>
          </div>

          {user?.lucky_draw?.joined && (
            <div className="flex items-center justify-between text-sm py-1 border-b border-border-custom/50">
              <span className="text-text-secondary">Lucky Draw Ticket</span>
              <span className="font-mono font-bold text-primary">{user.lucky_draw.participant_number}</span>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Logout Action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full mt-4"
      >
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-none font-bold"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </Button>
      </motion.div>
    </div>
  )
}
