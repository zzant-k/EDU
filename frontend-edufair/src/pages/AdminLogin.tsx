import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '../store/AuthContext'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

const adminLoginSchema = z.object({
  name: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
})

type AdminLoginForm = z.infer<typeof adminLoginSchema>

export const AdminLogin: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
  })

  const onSubmit = async (data: AdminLoginForm) => {
    setErrorMsg(null)
    setLoading(true)
    try {
      const user = await login(data.name, data.password, 'admin')
      if (user.role === 'superadmin') {
        navigate('/superadmin')
      } else {
        navigate('/university-admin')
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ===== LEFT PANEL — Branding ===== */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden"
           style={{ background: 'linear-gradient(145deg, #0f2b4a 0%, #163557 40%, #1a5276 100%)' }}>
        {/* Decorative arcs */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 600 800" fill="none">
          <circle cx="450" cy="400" r="300" stroke="white" strokeWidth="1" />
          <circle cx="480" cy="420" r="400" stroke="white" strokeWidth="0.8" />
          <circle cx="500" cy="440" r="500" stroke="white" strokeWidth="0.6" />
        </svg>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <h1 className="text-white text-4xl font-bold leading-tight mb-4">
              Admin<br />Dashboard
            </h1>
            <p className="text-white/70 text-base leading-relaxed">
              Kelola data universitas, mahasiswa, dan kegiatan Smanis Edu Fair 
              dari satu panel kontrol terpusat.
            </p>
          </div>

          {/* Footer */}
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Smanis Edu Fair. All rights reserved.
          </p>
        </div>
      </div>

      {/* ===== RIGHT PANEL — Login Form ===== */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo (hidden on desktop) */}
          <div className="flex items-center gap-3 mb-8 lg:mb-0">
            <img src="/logo-edufair.jpeg" alt="Smanis Edu Fair" className="w-10 h-10 object-contain lg:hidden" />
            <span className="text-gray-800 font-semibold text-lg lg:hidden">SMANIS EDUFAIR</span>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:flex items-center gap-3 mb-10">
            <img src="/logo-edufair.jpeg" alt="Smanis Edu Fair" className="w-9 h-9 object-contain" />
            <span className="text-gray-800 font-semibold">SMANIS EDUFAIR</span>
          </div>

          <h2 className="text-gray-900 text-2xl font-bold mb-1">Admin Login</h2>
          <p className="text-gray-500 text-sm mb-8">
            Masukkan kredensial admin untuk mengakses dashboard
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {errorMsg && (
              <div className="flex items-start gap-2 px-3.5 py-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <span className="text-red-600 text-sm">{errorMsg}</span>
              </div>
            )}

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700 text-sm font-medium">Username</label>
              <input
                type="text"
                placeholder="Masukkan username"
                autoComplete="username"
                className={`w-full h-11 px-3.5 bg-white border rounded-lg text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-colors duration-150 ${
                  errors.name
                    ? 'border-red-300 focus:border-red-400'
                    : 'border-gray-300 hover:border-gray-400 focus:border-[#1a5276]'
                }`}
                {...register('name')}
              />
              {errors.name?.message && (
                <span className="text-red-500 text-xs">{errors.name.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700 text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  className={`w-full h-11 px-3.5 pr-10 bg-white border rounded-lg text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-colors duration-150 ${
                    errors.password
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-gray-300 hover:border-gray-400 focus:border-[#1a5276]'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password?.message && (
                <span className="text-red-500 text-xs">{errors.password.message}</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-1 flex items-center justify-center gap-2 bg-[#0f2b4a] hover:bg-[#0a1f36] text-white text-sm font-semibold rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-xs mt-10">
            <Link to="/login" className="hover:text-gray-600 transition-colors">
              Kembali ke halaman siswa
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
