import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import { Skeleton } from './ui/Skeleton'

const Loader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-bg">
    <Skeleton variant="circle" className="mb-4" />
    <Skeleton variant="text" className="w-1/3 mb-2" />
    <Skeleton variant="text" className="w-1/4" />
  </div>
)

export const StudentRoute: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'student') {
    return <Navigate to={user.role === 'superadmin' ? "/superadmin" : "/university-admin"} replace />
  }

  return <Outlet />
}

export const SuperAdminRoute: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) return <Loader />
  if (!user) return <Navigate to="/admin/login" replace />
  if (user.role !== 'superadmin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export const UniversityAdminRoute: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) return <Loader />
  if (!user) return <Navigate to="/admin/login" replace />
  if (user.role !== 'university_admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export const PublicRoute: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) return <Loader />
  
  if (user) {
    if (user.role === 'superadmin') return <Navigate to="/superadmin" replace />
    if (user.role === 'university_admin') return <Navigate to="/university-admin" replace />
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
