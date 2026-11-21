import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './store/AuthContext'
import { StudentRoute, SuperAdminRoute, UniversityAdminRoute, PublicRoute } from './components/ProtectedRoute'
import { StudentLayout } from './layouts/StudentLayout'
import { AdminLayout } from './layouts/AdminLayout'

// Pages
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { AdminLogin } from './pages/AdminLogin'
import { Dashboard } from './pages/Dashboard'
import { UniversityDetail } from './pages/UniversityDetail'
import { QRScanner } from './pages/QRScanner'
import { ScanSuccess } from './pages/ScanSuccess'
import { LuckyDraw } from './pages/LuckyDraw'
import { Profile } from './pages/Profile'
import { Point } from './pages/Point'

// Super Admin Pages
import { SuperAdminDashboard } from './pages/SuperAdminDashboard'
import { UniversityManagement } from './pages/UniversityManagement'
import { StudentManagement } from './pages/StudentManagement'
import { AdminLuckyDraw } from './pages/AdminLuckyDraw'
import { AdminUserManagement } from './pages/AdminUserManagement'
import { AdminLeaderboard } from './pages/AdminLeaderboard'
import { AdminFeedbackManagement } from './pages/AdminFeedbackManagement'
import { AdminAnnouncements } from './pages/AdminAnnouncements'

// University Admin Pages
import { UniAdminDashboard } from './pages/UniAdminDashboard'
import { UniAdminProfile } from './pages/UniAdminProfile'
import { UniAdminVisitors } from './pages/UniAdminVisitors'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<AdminLogin />} />
          </Route>

          {/* Student Protected Routes */}
          <Route element={<StudentRoute />}>
            <Route element={<StudentLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/universities/:id" element={<UniversityDetail />} />
              <Route path="/point" element={<Point />} />
              <Route path="/scan" element={<QRScanner />} />
              <Route path="/scan-success" element={<ScanSuccess />} />
              <Route path="/lucky-draw" element={<LuckyDraw />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Super Admin Protected Routes */}
          <Route element={<SuperAdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/superadmin" element={<SuperAdminDashboard />} />
              <Route path="/superadmin/users" element={<AdminUserManagement />} />
              <Route path="/superadmin/universities" element={<UniversityManagement />} />
              <Route path="/superadmin/students" element={<StudentManagement />} />
              <Route path="/superadmin/feedbacks" element={<AdminFeedbackManagement />} />
              <Route path="/superadmin/announcements" element={<AdminAnnouncements />} />
              <Route path="/superadmin/lucky-draw" element={<AdminLuckyDraw />} />
              <Route path="/superadmin/leaderboard" element={<AdminLeaderboard />} />
            </Route>
          </Route>

          {/* University Admin Protected Routes */}
          <Route element={<UniversityAdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/university-admin" element={<UniAdminDashboard />} />
              <Route path="/university-admin/profile" element={<UniAdminProfile />} />
              <Route path="/university-admin/visitors" element={<UniAdminVisitors />} />
              <Route path="/university-admin/leaderboard" element={<AdminLeaderboard />} />
            </Route>
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
