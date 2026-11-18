import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Building2, Users, Gift, LogOut, ShieldCheck, UserCog, Menu, X, Trophy } from 'lucide-react'
import { useAuth } from '../store/AuthContext'

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const isSuper = user?.role === 'superadmin'

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/admin/login')
    } catch (err) {
      console.error(err)
    }
  }

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive
      ? 'bg-primary/10 text-primary'
      : 'text-text-secondary hover:text-text-primary hover:bg-slate-50'
    }`

  const LogoBrand = () => (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden border border-border-custom bg-white">
        <img src="/logo-edufair.jpeg" alt="EduFair Logo" className="w-full h-full object-contain" />
      </div>
      <div className="flex flex-col">
        <span className={`text-[10px] font-bold ${isSuper ? 'text-primary' : 'text-blue-600'} tracking-wider uppercase`}>
          Console
        </span>
        <span className="text-sm font-extrabold text-text-primary">
          {isSuper ? 'EduFair Admin' : 'Booth Admin'}
        </span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row relative">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-surface border-b border-border-custom sticky top-0 z-20 shadow-sm">
        <LogoBrand />
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-text-secondary bg-slate-50 rounded-lg border border-border-custom"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-surface border-r border-border-custom flex flex-col justify-between px-4 py-6 transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between px-2">
            <LogoBrand />
            <button
              className="md:hidden p-1.5 text-text-secondary bg-slate-50 rounded-lg border border-border-custom"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          <nav className="flex flex-col gap-1" onClick={() => setIsSidebarOpen(false)}>
            {isSuper ? (
              <>
                <NavLink to="/superadmin" end className={navItemClass}>
                  <LayoutDashboard size={18} /> Dashboard
                </NavLink>
                <NavLink to="/superadmin/users" className={navItemClass}>
                  <UserCog size={18} /> Admin Users
                </NavLink>
                <NavLink to="/superadmin/universities" className={navItemClass}>
                  <Building2 size={18} /> Universities
                </NavLink>
                <NavLink to="/superadmin/students" className={navItemClass}>
                  <Users size={18} /> Students
                </NavLink>
                <NavLink to="/superadmin/lucky-draw" className={navItemClass}>
                  <Gift size={18} /> Lucky Draw
                </NavLink>
                <NavLink to="/superadmin/leaderboard" className={navItemClass}>
                  <Trophy size={18} /> Leaderboard
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/university-admin" end className={navItemClass}>
                  <LayoutDashboard size={18} /> Dashboard
                </NavLink>
                <NavLink to="/university-admin/profile" className={navItemClass}>
                  <Building2 size={18} /> Booth Profile
                </NavLink>
                <NavLink to="/university-admin/visitors" className={navItemClass}>
                  <Users size={18} /> Visitors
                </NavLink>
                <NavLink to="/university-admin/leaderboard" className={navItemClass}>
                  <Trophy size={18} /> Leaderboard
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t border-border-custom pt-4 px-2 mt-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex-shrink-0 rounded-full bg-slate-100 border border-border-custom flex items-center justify-center font-bold text-sm text-text-primary uppercase">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-text-primary truncate">{user?.name || 'Administrator'}</span>
              <span className="text-[10px] text-text-secondary">
                {isSuper ? 'System Admin' : 'University Admin'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50/50 transition-all text-left"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-h-screen overflow-x-hidden px-4 py-6 md:px-10 md:py-8 bg-slate-50/50 w-full">
        <Outlet />
      </main>
    </div>
  )
}
