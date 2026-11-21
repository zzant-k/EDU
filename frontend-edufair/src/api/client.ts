import {
  authService,
  studentService,
  superAdminService,
  universityAdminService,
  feedbackService,
  announcementService,
  getStoredUser,
} from './supabaseService'

// Helper to simulate Axios response object
const wrapResponse = <T>(data: any): { data: T; status: number; statusText: string; headers: any; config: any } => ({
  data: data as T,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
})

export const apiClient = {
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },

  async get<T = any>(url: string, config?: any): Promise<{ data: T }> {
    const user = getStoredUser()
    const cleanUrl = url.split('?')[0]

    // 1. Auth & Profile
    if (cleanUrl === '/user' || cleanUrl === '/student/profile') {
      if (!user) throw new Error('Unauthenticated')
      const profile = await authService.getCurrentProfile(user.id)
      return wrapResponse(profile)
    }

    // 2. Student Routes
    if (cleanUrl === '/student/dashboard') {
      if (!user) throw new Error('Unauthenticated')
      const data = await studentService.getDashboard(user.id)
      return wrapResponse(data)
    }

    if (cleanUrl.startsWith('/student/universities/')) {
      if (!user) throw new Error('Unauthenticated')
      const id = Number(cleanUrl.replace('/student/universities/', ''))
      const data = await studentService.getUniversityDetail(user.id, id)
      return wrapResponse(data)
    }

    if (cleanUrl === '/student/participant') {
      if (!user) throw new Error('Unauthenticated')
      const data = await studentService.getParticipant(user.id)
      return wrapResponse(data)
    }

    if (cleanUrl === '/student/feedbacks') {
      if (!user) throw new Error('Unauthenticated')
      const data = await feedbackService.getMyFeedbacks(user.id)
      return wrapResponse(data)
    }

    if (cleanUrl === '/superadmin/feedbacks') {
      const data = await feedbackService.getAllFeedbacks()
      return wrapResponse(data)
    }

    if (cleanUrl === '/student/announcements') {
      const data = await announcementService.getActiveAnnouncements()
      return wrapResponse(data)
    }

    if (cleanUrl === '/superadmin/announcements') {
      const data = await announcementService.getAllAnnouncements()
      return wrapResponse(data)
    }

    if (
      cleanUrl === '/student/leaderboard' ||
      cleanUrl === '/superadmin/leaderboard' ||
      cleanUrl === '/university-admin/leaderboard'
    ) {
      const data = await studentService.getLeaderboard()
      return wrapResponse(data)
    }

    // 3. SuperAdmin Routes
    if (cleanUrl === '/superadmin/stats') {
      const data = await superAdminService.getStats()
      return wrapResponse(data)
    }

    if (cleanUrl === '/superadmin/universities') {
      const data = await superAdminService.listUniversities()
      return wrapResponse(data)
    }

    if (cleanUrl === '/superadmin/university-admins') {
      const data = await superAdminService.listUniversityAdmins()
      return wrapResponse(data)
    }

    if (cleanUrl === '/superadmin/students') {
      const params = config?.params || {}
      const data = await superAdminService.listStudents(params.search, params.status)
      return wrapResponse(data)
    }

    if (cleanUrl.startsWith('/superadmin/students/') && cleanUrl.endsWith('/progress')) {
      const parts = cleanUrl.split('/')
      const studentId = Number(parts[3])
      const data = await superAdminService.getStudentProgress(studentId)
      return wrapResponse(data)
    }

    if (cleanUrl === '/superadmin/lucky-draw/participants') {
      const data = await superAdminService.listParticipants()
      return wrapResponse(data)
    }

    if (cleanUrl === '/superadmin/lucky-draw/winners' || cleanUrl === '/student/lucky-draw/winners') {
      const data = await superAdminService.getWinners()
      return wrapResponse(data)
    }

    // 4. University Admin Routes
    if (cleanUrl === '/university-admin/dashboard') {
      if (!user) throw new Error('Unauthenticated')
      const data = await universityAdminService.getDashboard(user.id)
      return wrapResponse(data)
    }

    if (cleanUrl === '/university-admin/booth') {
      if (!user) throw new Error('Unauthenticated')
      const data = await universityAdminService.getBooth(user.id)
      return wrapResponse(data)
    }

    if (cleanUrl === '/university-admin/visitors') {
      if (!user) throw new Error('Unauthenticated')
      const data = await universityAdminService.getVisitors(user.id)
      return wrapResponse(data)
    }

    throw new Error(`Unhandled GET route: ${url}`)
  },

  async post<T = any>(url: string, data?: any, _config?: any): Promise<{ data: T }> {
    const user = getStoredUser()
    const cleanUrl = url.split('?')[0]

    // 1. Public Auth
    if (cleanUrl === '/register') {
      const res = await authService.register(data.name, data.password)
      return wrapResponse(res)
    }

    if (cleanUrl === '/login') {
      const res = await authService.login(data.name, data.password)
      return wrapResponse(res)
    }

    if (cleanUrl === '/logout') {
      return wrapResponse({ message: 'Logout successful.' })
    }

    // 2. Student Actions
    if (cleanUrl === '/student/scan') {
      if (!user) throw new Error('Unauthenticated')
      const res = await studentService.scanQR(user.id, data.qr_token)
      return wrapResponse(res)
    }

    if (cleanUrl.startsWith('/student/universities/') && cleanUrl.endsWith('/point')) {
      if (!user) throw new Error('Unauthenticated')
      const parts = cleanUrl.split('/')
      const uniId = Number(parts[3])
      const res = await studentService.rateUniversity(user.id, uniId, data.score)
      return wrapResponse(res)
    }

    if (cleanUrl === '/student/join-lucky-draw') {
      if (!user) throw new Error('Unauthenticated')
      const res = await studentService.joinLuckyDraw(user.id)
      return wrapResponse(res)
    }

    if (cleanUrl === '/student/feedbacks') {
      if (!user) throw new Error('Unauthenticated')
      const res = await feedbackService.submitFeedback(user.id, user.name || 'Siswa', data)
      return wrapResponse(res)
    }

    // 3. SuperAdmin Actions
    if (cleanUrl === '/superadmin/university-admins') {
      const res = await superAdminService.storeUniversityAdmin(data)
      return wrapResponse(res)
    }

    if (cleanUrl.startsWith('/superadmin/universities/') && cleanUrl !== '/superadmin/universities') {
      const id = Number(cleanUrl.replace('/superadmin/universities/', ''))
      const res = await superAdminService.updateUniversity(id, data)
      return wrapResponse(res)
    }

    if (cleanUrl === '/superadmin/universities') {
      const res = await superAdminService.storeUniversity(data)
      return wrapResponse(res)
    }

    if (cleanUrl === '/superadmin/lucky-draw/spin') {
      const res = await superAdminService.spinLuckyDraw(data?.prize)
      return wrapResponse(res)
    }

    if (cleanUrl === '/superadmin/announcements') {
      const res = await announcementService.createAnnouncement(data)
      return wrapResponse(res)
    }

    // 4. University Admin Actions
    if (cleanUrl === '/university-admin/booth') {
      if (!user) throw new Error('Unauthenticated')
      const res = await universityAdminService.updateBooth(user.id, data)
      return wrapResponse(res)
    }

    throw new Error(`Unhandled POST route: ${url}`)
  },

  async put<T = any>(url: string, data?: any): Promise<{ data: T }> {
    const cleanUrl = url.split('?')[0]

    if (cleanUrl.startsWith('/superadmin/university-admins/')) {
      const id = Number(cleanUrl.replace('/superadmin/university-admins/', ''))
      const res = await superAdminService.updateUniversityAdmin(id, data)
      return wrapResponse<T>(res)
    }

    if (cleanUrl.startsWith('/superadmin/announcements/') && cleanUrl.endsWith('/toggle')) {
      const parts = cleanUrl.split('/')
      const id = Number(parts[3])
      const res = await announcementService.toggleAnnouncement(id)
      return wrapResponse<T>(res)
    }

    throw new Error(`Unhandled PUT route: ${url}`)
  },

  async delete<T = any>(url: string): Promise<{ data: T }> {
    const cleanUrl = url.split('?')[0]

    if (cleanUrl.startsWith('/superadmin/university-admins/')) {
      const id = Number(cleanUrl.replace('/superadmin/university-admins/', ''))
      const res = await superAdminService.destroyUniversityAdmin(id)
      return wrapResponse(res)
    }

    if (cleanUrl.startsWith('/superadmin/universities/')) {
      const id = Number(cleanUrl.replace('/superadmin/universities/', ''))
      const res = await superAdminService.destroyUniversity(id)
      return wrapResponse(res)
    }

    if (cleanUrl.startsWith('/superadmin/lucky-draw/winners/')) {
      const id = Number(cleanUrl.replace('/superadmin/lucky-draw/winners/', ''))
      const res = await superAdminService.destroyWinner(id)
      return wrapResponse(res)
    }

    if (cleanUrl.startsWith('/superadmin/feedbacks/')) {
      const id = Number(cleanUrl.replace('/superadmin/feedbacks/', ''))
      const res = await feedbackService.deleteFeedback(id)
      return wrapResponse(res)
    }

    if (cleanUrl.startsWith('/superadmin/announcements/')) {
      const id = Number(cleanUrl.replace('/superadmin/announcements/', ''))
      const res = await announcementService.deleteAnnouncement(id)
      return wrapResponse(res)
    }

    throw new Error(`Unhandled DELETE route: ${url}`)
  },
}
