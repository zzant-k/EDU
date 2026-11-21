import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  Gift,
  LogOut,
  UserCog,
  X,
  Trophy,
  Bell,
  MessageSquareQuote,
} from 'lucide-react'
import { useAuth } from '../store/AuthContext'
import { AnimatePresence, motion } from 'framer-motion'

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Default sidebar is CLOSED (tidak diadakan dulu)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const isSuper = user?.role === 'superadmin'

  // Listen to custom toggle event (e.g. from LuckyDraw's traffic light dots)
  useEffect(() => {
    const handleToggle = () => setIsSidebarOpen((prev) => !prev)
    window.addEventListener('toggle-admin-sidebar', handleToggle)
    return () => window.removeEventListener('toggle-admin-sidebar', handleToggle)
  }, [])

  // Close sidebar on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSidebarOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/admin/login')
    } catch (err) {
      console.error(err)
    }
  }

  // Dynamic window title based on current path
  const getWindowTitle = () => {
    const path = location.pathname
    if (path === '/superadmin') return 'EduFair Admin • Dashboard'
    if (path.startsWith('/superadmin/users')) return 'EduFair Admin • Admin Users'
    if (path.startsWith('/superadmin/universities')) return 'EduFair Admin • Universities'
    if (path.startsWith('/superadmin/students')) return 'EduFair Admin • Students Progress'
    if (path.startsWith('/superadmin/feedbacks')) return 'EduFair Admin • Student Feedbacks'
    if (path.startsWith('/superadmin/announcements')) return 'EduFair Admin • Broadcast & Pengumuman'
    if (path.startsWith('/superadmin/lucky-draw')) return 'EduFair Admin • Lucky Draw'
    if (path.startsWith('/superadmin/leaderboard')) return 'EduFair Admin • Leaderboard'

    if (path === '/university-admin') return 'Booth Admin • Dashboard'
    if (path.startsWith('/university-admin/profile')) return 'Booth Admin • Booth Profile'
    if (path.startsWith('/university-admin/visitors')) return 'Booth Admin • Visitors'
    if (path.startsWith('/university-admin/leaderboard')) return 'Booth Admin • Leaderboard'

    return isSuper ? 'EduFair Admin Console' : 'Booth Admin Console'
  }

  // Get user initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return isSuper ? 'SU' : 'BA'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  // Navigation Links
  const superNavItems = [
    { to: '/superadmin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/superadmin/users', label: 'Admin Users', icon: UserCog },
    { to: '/superadmin/universities', label: 'Universities', icon: Building2 },
    { to: '/superadmin/students', label: 'Students', icon: Users },
    { to: '/superadmin/feedbacks', label: 'Feedbacks', icon: MessageSquareQuote },
    { to: '/superadmin/announcements', label: 'Broadcast', icon: Bell },
    { to: '/superadmin/lucky-draw', label: 'Lucky Draw', icon: Gift },
    { to: '/superadmin/leaderboard', label: 'Leaderboard', icon: Trophy },
  ]

  const uniNavItems = [
    { to: '/university-admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/university-admin/profile', label: 'Booth Profile', icon: Building2 },
    { to: '/university-admin/visitors', label: 'Visitors', icon: Users },
    { to: '/university-admin/leaderboard', label: 'Leaderboard', icon: Trophy },
  ]

  const navItems = isSuper ? superNavItems : uniNavItems

  const LogoBrand = () => (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 bg-white shadow-xs">
        <img src="/logo-edufair.jpeg" alt="EduFair Logo" className="w-full h-full object-contain" />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-[10px] font-bold text-primary tracking-wider uppercase">
          Console
        </span>
        <span className="text-sm font-bold text-text-primary">
          {isSuper ? 'EduFair Admin' : 'Booth Admin'}
        </span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col w-full text-left font-sans select-none antialiased">
      {/* ===== 1. macOS Style Title Bar ===== */}
      <header className="h-11 border-b border-slate-200/90 bg-white flex items-center justify-between px-4 sm:px-6 relative z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        {/* Left: 3 macOS Traffic Light Dots (Click any to toggle sidebar) */}
        <div
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="flex items-center gap-2 cursor-pointer group py-1.5 px-2 -ml-2 rounded-lg hover:bg-slate-100/80 transition-all"
          title="Klik titik ini untuk membuka Sidebar Menu"
        >
          <span className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]/50 group-hover:scale-110 transition-transform shadow-xs" />
          <span className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#DEA123]/50 group-hover:scale-110 transition-transform shadow-xs" />
          <span className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]/50 group-hover:scale-110 transition-transform shadow-xs" />
        </div>

        {/* Center: Window Title */}
        <div className="text-[13px] font-semibold text-text-secondary absolute left-1/2 -translate-x-1/2 truncate max-w-[35%] pointer-events-none hidden sm:block">
          {getWindowTitle()}
        </div>

        {/* Right: Notifications + Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Notifikasi"
          >
            <Bell size={15} />
          </button>

          <div
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 cursor-pointer group py-1 px-1.5 rounded-lg hover:bg-slate-100/80 transition-all"
            title="Klik untuk membuka profil / menu"
          >
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center font-bold text-xs text-blue-700 uppercase border border-blue-200 shadow-2xs group-hover:ring-2 group-hover:ring-primary/20 transition-all">
              {getInitials(user?.name)}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {user?.name || 'Admin'}
              </span>
              <span className="text-[10px] text-slate-500 leading-tight capitalize">
                {isSuper ? 'Super Admin' : 'Booth Admin'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ===== 2. Apple / Linear Style Segmented Navigation Bar (Pills Tengah Bersih - Sembunyi di HP) ===== */}
      <nav className="hidden md:flex h-13 border-b border-slate-200/90 bg-white px-4 sm:px-6 items-center justify-center z-20 shadow-xs relative">
        {/* Center: Nav Pills (Tepat di Tengah) */}
        <div className="flex items-center justify-center overflow-x-auto no-scrollbar py-1 w-full">
          <div className="h-9 flex items-center bg-slate-100/90 p-0.5 rounded-xl text-[13px] gap-1 flex-shrink-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all font-medium whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-white text-text-primary shadow-xs font-semibold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-slate-200/50'
                    }`
                  }
                >
                  <Icon size={14} className="opacity-80" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </div>
        </div>
      </nav>

      {/* ===== 3. Slide-in Drawer Sidebar (Hidden by default, triggered by 3 dots or button) ===== */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40"
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-2xl flex flex-col justify-between p-5 select-none"
            >
              <div className="flex flex-col gap-6">
                {/* Header inside drawer */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  {/* Traffic lights */}
                  <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center gap-2 cursor-pointer group py-1"
                    title="Tutup Menu"
                  >
                    <span className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]/50 group-hover:opacity-80" />
                    <span className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#DEA123]/50 group-hover:opacity-80" />
                    <span className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]/50 group-hover:opacity-80" />
                  </div>

                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Logo Brand */}
                <div className="px-1">
                  <LogoBrand />
                </div>

                {/* Vertical Navigation Items */}
                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
                    Navigation Menu
                  </span>
                  {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setIsSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`
                        }
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              </div>

              {/* Drawer Footer: User Profile & Logout */}
              <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-sm text-blue-700 uppercase border border-blue-200">
                    {getInitials(user?.name)}
                  </div>
                  <div className="flex flex-col overflow-hidden text-left">
                    <span className="text-xs font-bold text-text-primary truncate">
                      {user?.name || 'Administrator'}
                    </span>
                    <span className="text-[11px] text-text-secondary capitalize">
                      {isSuper ? 'Super Administrator' : 'University Admin'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                >
                  <LogOut size={15} /> Sign Out Console
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===== 4. Full Width Main Content View ===== */}
      <main className="w-full flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50/40">
        <Outlet />
      </main>
    </div>
  )
}
