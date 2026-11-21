import React, { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Home, Scan, User, Ticket, Star } from 'lucide-react'
import { BroadcastBanner } from '../components/BroadcastBanner'

export const StudentLayout: React.FC = () => {
  const [showNav, setShowNav] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)
  const location = useLocation()
  const isPointPage = location.pathname === '/point'

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          const diff = currentScrollY - lastScrollY.current

          // Threshold 15px scroll untuk cegah micro-jitter & re-render beruntun saat scrolling
          if (Math.abs(diff) > 15) {
            if (currentScrollY > lastScrollY.current && currentScrollY > 70) {
              setShowNav((prev) => (prev ? false : prev))
            } else if (currentScrollY < lastScrollY.current) {
              setShowNav((prev) => (!prev ? true : prev))
            }
            lastScrollY.current = currentScrollY
          }
          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-bg flex justify-center w-full">
      <div className="w-full max-w-md lg:max-w-full bg-slate-50 min-h-screen flex flex-col lg:flex-row relative shadow-lg border-x lg:border-x-0 border-border-custom bg-opacity-70 transition-all duration-300">

        {/* Desktop Sidebar / Mobile Bottom Nav */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[360px] bg-surface/90 backdrop-blur-md border border-border-custom/80 shadow-lg rounded-3xl py-2 px-3 z-50 grid grid-cols-5 items-center justify-items-center will-change-transform transition-transform duration-200
          lg:static lg:translate-x-0 lg:w-64 lg:max-w-[256px] lg:h-screen lg:flex lg:flex-col lg:justify-start lg:gap-2 lg:rounded-none lg:border-r lg:border-y-0 lg:border-l-0 lg:shadow-none lg:pt-8 lg:px-4 lg:bg-surface">

          {/* Logo only visible on Desktop */}
          <div className="hidden lg:flex items-center gap-3 mb-8 px-4">
            <img src="/logo-edufair.jpeg" alt="Smanis Edu Fair" className="w-10 h-10 object-contain rounded-lg" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-text-secondary tracking-wider uppercase">EduFair</span>
              <span className="text-lg font-bold text-text-primary leading-tight">Digital Passport</span>
            </div>
          </div>

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col lg:flex-row items-center lg:justify-start gap-1 lg:gap-3 py-1 lg:py-3 px-3 lg:px-4 lg:w-full rounded-2xl lg:rounded-xl transition-all duration-200 ${isActive ? 'text-primary lg:bg-primary/10' : 'text-text-secondary hover:text-text-primary lg:hover:bg-slate-100'
              }`
            }
          >
            <Home size={20} strokeWidth={2} className="lg:w-5 lg:h-5" />
            <span className="text-[10px] lg:text-sm font-semibold">Home</span>
          </NavLink>

          <NavLink
            to="/point"
            className={({ isActive }) =>
              `flex flex-col lg:flex-row items-center lg:justify-start gap-1 lg:gap-3 py-1 lg:py-3 px-3 lg:px-4 lg:w-full rounded-2xl lg:rounded-xl transition-all duration-200 ${isActive ? 'text-primary lg:bg-primary/10' : 'text-text-secondary hover:text-text-primary lg:hover:bg-slate-100'
              }`
            }
          >
            <Star size={20} strokeWidth={2} className="lg:w-5 lg:h-5" />
            <span className="text-[10px] lg:text-sm font-semibold">Point</span>
          </NavLink>

          <div className="relative w-full h-full flex items-center justify-center lg:contents">
            <NavLink
              to="/scan"
              className={({ isActive }) =>
                `flex flex-col lg:flex-row items-center lg:justify-start gap-1 lg:gap-3 lg:w-full transition-all duration-200 
                justify-center absolute -top-1 w-14 h-14 rounded-full bg-primary text-white shadow-md hover:bg-primary-hover hover:scale-105 lg:hover:scale-100 active:scale-95 border-4 border-slate-50 
                lg:static lg:h-auto lg:py-3 lg:px-4 lg:rounded-xl lg:bg-transparent lg:text-text-secondary lg:shadow-none lg:hover:bg-slate-100 lg:border-none
                ${isActive ? 'ring-4 ring-primary/20 lg:ring-0 lg:text-primary lg:bg-primary/10 lg:hover:bg-primary/10' : 'lg:hover:text-text-primary'}`
              }
            >
              <Scan size={24} strokeWidth={2} className="lg:w-5 lg:h-5" />
              <span className="hidden lg:block text-sm font-semibold">Scan QR Code</span>
            </NavLink>
          </div>

          <NavLink
            to="/lucky-draw"
            className={({ isActive }) =>
              `flex flex-col lg:flex-row items-center lg:justify-start gap-1 lg:gap-3 py-1 lg:py-3 px-3 lg:px-4 lg:w-full rounded-2xl lg:rounded-xl transition-all duration-200 ${isActive ? 'text-primary lg:bg-primary/10' : 'text-text-secondary hover:text-text-primary lg:hover:bg-slate-100'
              }`
            }
          >
            <Ticket size={20} strokeWidth={2} className="lg:w-5 lg:h-5" />
            <span className="text-[10px] lg:text-sm font-semibold">Ticket</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col lg:flex-row items-center lg:justify-start gap-1 lg:gap-3 py-1 lg:py-3 px-3 lg:px-4 lg:w-full rounded-2xl lg:rounded-xl transition-all duration-200 ${isActive ? 'text-primary lg:bg-primary/10' : 'text-text-secondary hover:text-text-primary lg:hover:bg-slate-100'
              }`
            }
          >
            <User size={20} strokeWidth={2} className="lg:w-5 lg:h-5" />
            <span className="text-[10px] lg:text-sm font-semibold">Profile</span>
          </NavLink>
        </nav>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen w-full lg:max-w-[calc(100vw-256px)]">
          {/* Live Panitia Broadcast Banner */}
          <BroadcastBanner />

          {/* Header bar (Mobile only now since Desktop has sidebar logo) */}
          {!isPointPage && (
            <header className={`lg:hidden bg-surface sticky top-0 z-40 border-b border-border-custom px-6 py-4 flex items-center justify-between transition-all duration-300 ${showNav ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
              <div className="flex items-center gap-3">
                <img src="/logo-edufair.jpeg" alt="Smanis Edu Fair" className="w-9 h-9 object-contain rounded-lg" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-text-secondary tracking-wider uppercase">EduFair</span>
                  <span className="text-base font-bold text-text-primary leading-tight">Digital Passport</span>
                </div>
              </div>
            </header>
          )}

          <main className={`flex-1 overflow-y-auto pb-28 lg:pb-10 max-w-7xl mx-auto w-full ${isPointPage ? 'p-0' : 'px-5 lg:px-10 pt-6'}`}>
            <Outlet />
          </main>
        </div>

      </div>
    </div>
  )
}
