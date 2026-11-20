import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

// Helper to get currently logged-in user from localStorage
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user_info')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ----------------------------------------------------------------------
// Auth Service
// ----------------------------------------------------------------------
export const authService = {
  async register(name: string, password: string) {
    // 1. Check if username is taken
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('name', name)
      .maybeSingle()

    if (checkError) throw checkError
    if (existing) {
      const err: any = new Error('The name has already been taken.')
      err.response = { data: { message: 'The name has already been taken.' } }
      throw err
    }

    // 2. Hash password
    const hashedPassword = bcrypt.hashSync(password, 10)
    const now = new Date().toISOString()

    // 3. Create student user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([
        {
          name,
          password: hashedPassword,
          role: 'student',
          created_at: now,
          updated_at: now,
        },
      ])
      .select()
      .single()

    if (createError) throw createError

    return {
      user: newUser,
      token: `sb_token_${newUser.id}`,
      message: 'Registration successful.',
    }
  },

  async login(name: string, password: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('name', name)
      .maybeSingle()

    if (error || !user) {
      const err: any = new Error('Invalid credentials.')
      err.response = { data: { message: 'Invalid credentials.' } }
      throw err
    }

    // Verify bcrypt password (handling $2y$ prefix from PHP bcrypt)
    const normalizedHash = user.password.replace(/^\$2y\$/, '$2a$')
    let isMatch = false
    try {
      isMatch = bcrypt.compareSync(password, normalizedHash)
    } catch {
      isMatch = password === user.password
    }

    if (!isMatch) {
      const err: any = new Error('Invalid credentials.')
      err.response = { data: { message: 'Invalid credentials.' } }
      throw err
    }

    return {
      user,
      token: `sb_token_${user.id}`,
      message: 'Login successful.',
    }
  },

  async getCurrentProfile(userId: number) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('id', userId)
      .single()

    if (error || !user) throw error || new Error('User not found')

    const { count: totalUnis } = await supabase
      .from('universities')
      .select('id', { count: 'exact', head: true })

    const { count: visitedCount } = await supabase
      .from('student_visits')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', userId)

    const total = totalUnis || 0
    const visited = visitedCount || 0
    const percentage = total > 0 ? Math.round((visited / total) * 100) : 0

    const { data: participant } = await supabase
      .from('lucky_draw_participants')
      .select('participant_number, joined_at')
      .eq('student_id', userId)
      .maybeSingle()

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      progress: {
        visited_count: visited,
        total_count: total,
        percentage,
      },
      lucky_draw: participant
        ? {
            joined: true,
            participant_number: participant.participant_number,
            joined_at: participant.joined_at,
          }
        : {
            joined: false,
          },
    }
  },
}

// ----------------------------------------------------------------------
// Student Service
// ----------------------------------------------------------------------
export const studentService = {
  async getDashboard(studentId: number) {
    const { data: student } = await supabase
      .from('users')
      .select('name')
      .eq('id', studentId)
      .single()

    const { data: universities } = await supabase
      .from('universities')
      .select('*')
      .order('id', { ascending: true })

    const { data: visits } = await supabase
      .from('student_visits')
      .select('university_id, visited_at')
      .eq('student_id', studentId)
      .order('visited_at', { ascending: false })

    const visitedUniIds = new Set((visits || []).map((v) => v.university_id))
    const totalUnis = (universities || []).length
    const visitedCount = visitedUniIds.size
    const remainingCount = totalUnis - visitedCount
    const percentage = totalUnis > 0 ? Math.round((visitedCount / totalUnis) * 100) : 0

    const mappedUnis = (universities || []).map((u) => ({
      ...u,
      visited: visitedUniIds.has(u.id),
    }))

    const { data: participant } = await supabase
      .from('lucky_draw_participants')
      .select('participant_number, joined_at')
      .eq('student_id', studentId)
      .maybeSingle()

    const lastVisit = visits && visits.length > 0 ? visits[0].visited_at : null

    return {
      student_name: student?.name || '',
      total_universities: totalUnis,
      visited_count: visitedCount,
      remaining_count: remainingCount,
      percentage,
      universities: mappedUnis,
      lucky_draw: participant
        ? {
            joined: true,
            participant_number: participant.participant_number,
            joined_at: participant.joined_at,
          }
        : {
            joined: false,
          },
      last_visited: lastVisit,
    }
  },

  async getUniversityDetail(studentId: number, universityId: number) {
    const { data: university, error } = await supabase
      .from('universities')
      .select('*')
      .eq('id', universityId)
      .single()

    if (error || !university) {
      const err: any = new Error('University not found.')
      err.response = { data: { message: 'University not found.' } }
      throw err
    }

    const { data: visit } = await supabase
      .from('student_visits')
      .select('id')
      .eq('student_id', studentId)
      .eq('university_id', universityId)
      .maybeSingle()

    return {
      ...university,
      visited: !!visit,
    }
  },

  async scanQR(studentId: number, qrToken: string) {
    const { data: university, error } = await supabase
      .from('universities')
      .select('*')
      .eq('qr_token', qrToken)
      .maybeSingle()

    if (error || !university) {
      const err: any = new Error('Invalid QR Code. This university booth does not exist.')
      err.response = { data: { message: 'Invalid QR Code. This university booth does not exist.' } }
      throw err
    }

    const { data: existingVisit } = await supabase
      .from('student_visits')
      .select('id')
      .eq('student_id', studentId)
      .eq('university_id', university.id)
      .maybeSingle()

    if (existingVisit) {
      const err: any = new Error(`Stamp already collected. You have already visited ${university.name}.`)
      err.response = {
        data: {
          message: `Stamp already collected. You have already visited ${university.name}.`,
          university,
        },
      }
      throw err
    }

    const { data: visit, error: insertError } = await supabase
      .from('student_visits')
      .insert([
        {
          student_id: studentId,
          university_id: university.id,
          visited_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (insertError) throw insertError

    const { count: totalUnis } = await supabase
      .from('universities')
      .select('id', { count: 'exact', head: true })

    const { count: visitedCount } = await supabase
      .from('student_visits')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId)

    const total = totalUnis || 0
    const count = visitedCount || 0
    const allCompleted = count === total

    return {
      message: 'Stamp successfully collected!',
      university,
      visit,
      progress: {
        visited_count: count,
        total_count: total,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      },
      all_completed: allCompleted,
    }
  },

  async rateUniversity(studentId: number, universityId: number, score: number) {
    const { data: visit } = await supabase
      .from('student_visits')
      .select('id')
      .eq('student_id', studentId)
      .eq('university_id', universityId)
      .maybeSingle()

    if (!visit) {
      const err: any = new Error('You must visit (scan) this stand before you can rate it.')
      err.response = { data: { message: 'You must visit (scan) this stand before you can rate it.' } }
      throw err
    }

    const { data: existingPoint } = await supabase
      .from('university_points')
      .select('id')
      .eq('student_id', studentId)
      .eq('university_id', universityId)
      .maybeSingle()

    const now = new Date().toISOString()
    let message = ''

    if (existingPoint) {
      await supabase
        .from('university_points')
        .update({ score, updated_at: now })
        .eq('id', existingPoint.id)
      message = 'Rating updated successfully.'
    } else {
      await supabase.from('university_points').insert([
        {
          student_id: studentId,
          university_id: universityId,
          score,
          created_at: now,
          updated_at: now,
        },
      ])
      message = 'Rating submitted successfully.'
    }

    const { data: allPoints } = await supabase
      .from('university_points')
      .select('score')
      .eq('university_id', universityId)

    const avg =
      allPoints && allPoints.length > 0
        ? Number((allPoints.reduce((acc, p) => acc + p.score, 0) / allPoints.length).toFixed(1))
        : score

    return {
      message,
      points_avg: avg,
    }
  },

  async joinLuckyDraw(studentId: number) {
    const { count: totalUnis } = await supabase
      .from('universities')
      .select('id', { count: 'exact', head: true })

    const { count: visitedCount } = await supabase
      .from('student_visits')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId)

    const total = totalUnis || 0
    const count = visitedCount || 0

    if (count < total || total === 0) {
      const err: any = new Error('Locked. You must collect all university stamps before joining the Lucky Draw.')
      err.response = {
        data: {
          message: 'Locked. You must collect all university stamps before joining the Lucky Draw.',
        },
      }
      throw err
    }

    const { data: existing } = await supabase
      .from('lucky_draw_participants')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle()

    if (existing) {
      return {
        message: 'You have already joined the Lucky Draw.',
        participant: existing,
      }
    }

    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
    const participant_number = `EDUP-${randomSuffix}`

    const { data: participant, error } = await supabase
      .from('lucky_draw_participants')
      .insert([
        {
          student_id: studentId,
          participant_number,
          joined_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error

    return {
      message: 'Congratulations! You have successfully registered for the Lucky Draw.',
      participant,
    }
  },

  async getParticipant(studentId: number) {
    const { data: participant } = await supabase
      .from('lucky_draw_participants')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle()

    return { participant: participant || null }
  },

  async getLeaderboard() {
    const { data: unis } = await supabase.from('universities').select('id, name, logo')
    const { data: points } = await supabase.from('university_points').select('university_id, score')

    const statsMap: Record<number, { count: number; sum: number }> = {}
    ;(points || []).forEach((p) => {
      if (!statsMap[p.university_id]) statsMap[p.university_id] = { count: 0, sum: 0 }
      statsMap[p.university_id].count++
      statsMap[p.university_id].sum += p.score
    })

    const leaderboard = (unis || []).map((u) => {
      const s = statsMap[u.id] || { count: 0, sum: 0 }
      const avg = s.count > 0 ? Number((s.sum / s.count).toFixed(2)) : 0
      return {
        id: u.id,
        name: u.name,
        logo: u.logo,
        points_count: s.count,
        points_avg_score: avg,
      }
    })

    leaderboard.sort((a, b) => {
      if (b.points_avg_score !== a.points_avg_score) {
        return b.points_avg_score - a.points_avg_score
      }
      if (b.points_count !== a.points_count) {
        return b.points_count - a.points_count
      }
      return a.name.localeCompare(b.name)
    })

    return leaderboard
  },
}

// ----------------------------------------------------------------------
// SuperAdmin Service
// ----------------------------------------------------------------------
export const superAdminService = {
  async getStats() {
    const { count: totalStudents } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'student')

    const { count: totalUnis } = await supabase
      .from('universities')
      .select('id', { count: 'exact', head: true })

    const { data: visits } = await supabase.from('student_visits').select('student_id')
    const visitCounts: Record<number, number> = {}
    ;(visits || []).forEach((v) => {
      visitCounts[v.student_id] = (visitCounts[v.student_id] || 0) + 1
    })

    const totalU = totalUnis || 0
    let completedStudents = 0
    if (totalU > 0) {
      Object.values(visitCounts).forEach((c) => {
        if (c >= totalU) completedStudents++
      })
    }

    const { count: luckyDrawCount } = await supabase
      .from('lucky_draw_participants')
      .select('id', { count: 'exact', head: true })

    // Analytics: check-ins & registrations last 7 days
    const dailyCheckins = []
    const dailyRegistrations = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

      dailyCheckins.push({ date: label, count: 0 })
      dailyRegistrations.push({ date: label, count: 0 })
    }

    return {
      total_students: totalStudents || 0,
      total_universities: totalUnis || 0,
      completed_students: completedStudents,
      remaining_students: Math.max(0, (totalStudents || 0) - completedStudents),
      lucky_draw_participants: luckyDrawCount || 0,
      analytics: {
        daily_checkins: dailyCheckins,
        daily_registrations: dailyRegistrations,
      },
    }
  },

  async listUniversities() {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error
    return data || []
  },

  async storeUniversity(formData: any) {
    const now = new Date().toISOString()
    let logoUrl = null

    // Upload logo to storage if File
    if (formData instanceof FormData) {
      const file = formData.get('logo') as File | null
      const name = formData.get('name') as string
      const description = (formData.get('description') as string) || null
      const website = (formData.get('website') as string) || null
      const location = (formData.get('location') as string) || null
      const admin_id = formData.get('admin_id') ? Number(formData.get('admin_id')) : null

      if (file && file.size > 0) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, file)

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName)
          logoUrl = publicUrlData.publicUrl
        }
      }

      const qr_token = `booth-token-${Math.random().toString(36).substring(2, 10)}`

      const { data, error } = await supabase
        .from('universities')
        .insert([
          {
            name,
            description,
            website,
            location,
            logo: logoUrl,
            admin_id,
            qr_token,
            created_at: now,
            updated_at: now,
          },
        ])
        .select()
        .single()

      if (error) throw error
      return { message: 'University booth created successfully.', university: data }
    }

    return { message: 'Failed to process request.' }
  },

  async updateUniversity(id: number, formData: any) {
    const now = new Date().toISOString()
    const updatePayload: any = { updated_at: now }

    if (formData instanceof FormData) {
      const name = formData.get('name')
      const description = formData.get('description')
      const website = formData.get('website')
      const location = formData.get('location')
      const admin_id = formData.get('admin_id')
      const file = formData.get('logo') as File | null

      if (name) updatePayload.name = name
      if (description !== null) updatePayload.description = description
      if (website !== null) updatePayload.website = website
      if (location !== null) updatePayload.location = location
      if (admin_id !== undefined) updatePayload.admin_id = admin_id ? Number(admin_id) : null

      if (file && typeof file === 'object' && file.size > 0) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, file)

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName)
          updatePayload.logo = publicUrlData.publicUrl
        }
      }
    } else if (typeof formData === 'object') {
      Object.assign(updatePayload, formData)
    }

    const { data, error } = await supabase
      .from('universities')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { message: 'University updated successfully.', university: data }
  },

  async destroyUniversity(id: number) {
    const { error } = await supabase.from('universities').delete().eq('id', id)
    if (error) throw error
    return { message: 'University deleted successfully.' }
  },

  async listUniversityAdmins() {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, role, created_at')
      .eq('role', 'university_admin')
      .order('id', { ascending: true })

    if (error) throw error
    return data || []
  },

  async storeUniversityAdmin(payload: { name: string; password: string }) {
    const hashedPassword = bcrypt.hashSync(payload.password, 10)
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name: payload.name,
          password: hashedPassword,
          role: 'university_admin',
          created_at: now,
          updated_at: now,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return { message: 'University Admin created successfully.', admin: data }
  },

  async updateUniversityAdmin(id: number, payload: { name: string; password?: string }) {
    const now = new Date().toISOString()
    const updateData: any = { name: payload.name, updated_at: now }

    if (payload.password) {
      updateData.password = bcrypt.hashSync(payload.password, 10)
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { message: 'University Admin updated successfully.', admin: data }
  },

  async destroyUniversityAdmin(id: number) {
    // Unassign admin_id from universities
    await supabase.from('universities').update({ admin_id: null }).eq('admin_id', id)

    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) throw error
    return { message: 'University Admin deleted successfully.' }
  },

  async listStudents(search?: string, status?: string) {
    const { count: totalUnis } = await supabase
      .from('universities')
      .select('id', { count: 'exact', head: true })

    let query = supabase.from('users').select('*').eq('role', 'student').order('id', { ascending: true })
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data: students, error } = await query
    if (error) throw error

    const { data: visits } = await supabase.from('student_visits').select('student_id')
    const visitCounts: Record<number, number> = {}
    ;(visits || []).forEach((v) => {
      visitCounts[v.student_id] = (visitCounts[v.student_id] || 0) + 1
    })

    const { data: participants } = await supabase.from('lucky_draw_participants').select('student_id')
    const joinedSet = new Set((participants || []).map((p) => p.student_id))

    const total = totalUnis || 0
    let studentData = (students || []).map((s) => {
      const vCount = visitCounts[s.id] || 0
      const percentage = total > 0 ? Math.round((vCount / total) * 100) : 0
      return {
        id: s.id,
        name: s.name,
        visited_count: vCount,
        total_universities: total,
        percentage,
        created_at: s.created_at,
        lucky_draw_joined: joinedSet.has(s.id),
      }
    })

    if (status === 'completed') {
      studentData = studentData.filter((s) => s.visited_count === total)
    } else if (status === 'pending') {
      studentData = studentData.filter((s) => s.visited_count < total)
    }

    return studentData
  },

  async getStudentProgress(studentId: number) {
    const { data: student, error } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', studentId)
      .single()

    if (error || !student) {
      const err: any = new Error('Student not found.')
      err.response = { data: { message: 'Student not found.' } }
      throw err
    }

    const { data: universities } = await supabase
      .from('universities')
      .select('id, name, location')
      .order('id', { ascending: true })

    const { data: visits } = await supabase
      .from('student_visits')
      .select('university_id, visited_at')
      .eq('student_id', studentId)

    const visitMap: Record<number, string> = {}
    ;(visits || []).forEach((v) => {
      visitMap[v.university_id] = v.visited_at
    })

    const stamp_history = (universities || []).map((u) => ({
      id: u.id,
      name: u.name,
      location: u.location,
      visited: !!visitMap[u.id],
      visited_at: visitMap[u.id] || null,
    }))

    const total = (universities || []).length
    const visitedCount = Object.keys(visitMap).length

    return {
      student: {
        id: student.id,
        name: student.name,
      },
      progress: {
        visited_count: visitedCount,
        total_count: total,
        percentage: total > 0 ? Math.round((visitedCount / total) * 100) : 0,
      },
      stamp_history,
    }
  },

  async listParticipants() {
    const { data, error } = await supabase
      .from('lucky_draw_participants')
      .select('id, student_id, participant_number, joined_at, student:users(name)')
      .order('id', { ascending: true })

    if (error) throw error

    return (data || []).map((p: any) => ({
      id: p.id,
      student_id: p.student_id,
      student_name: p.student?.name || 'Unknown Student',
      participant_number: p.participant_number,
      joined_at: p.joined_at,
    }))
  },

  async spinLuckyDraw(prizeName?: string) {
    const { data: winners } = await supabase.from('winners').select('student_id')
    const wonStudentIds = (winners || []).map((w) => w.student_id)

    let query = supabase.from('lucky_draw_participants').select('id, student_id, participant_number, student:users(name)')
    if (wonStudentIds.length > 0) {
      query = query.not('student_id', 'in', `(${wonStudentIds.join(',')})`)
    }

    const { data: eligible } = await query

    if (!eligible || eligible.length === 0) {
      const err: any = new Error(
        'No eligible participants found. Either all participants have won, or no one has registered for the lucky draw.'
      )
      err.response = {
        data: {
          message:
            'No eligible participants found. Either all participants have won, or no one has registered for the lucky draw.',
        },
      }
      throw err
    }

    const randomIndex = Math.floor(Math.random() * eligible.length)
    const winnerParticipant: any = eligible[randomIndex]
    const prize = prizeName || 'Door Prize'
    const now = new Date().toISOString()

    const { data: newWinner, error: insertError } = await supabase
      .from('winners')
      .insert([
        {
          student_id: winnerParticipant.student_id,
          prize,
          created_at: now,
        },
      ])
      .select()
      .single()

    if (insertError) throw insertError

    return {
      message: 'Winner selected successfully!',
      winner: {
        id: newWinner.id,
        student_name: winnerParticipant.student?.name || 'Winner',
        participant_number: winnerParticipant.participant_number,
        prize,
        drawn_at: newWinner.created_at,
      },
    }
  },

  async getWinners() {
    const { data, error } = await supabase
      .from('winners')
      .select('id, prize, created_at, student:users(name, lucky_draw_participants(participant_number))')
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map((w: any) => ({
      id: w.id,
      student_name: w.student?.name || 'Unknown Student',
      participant_number: w.student?.lucky_draw_participants?.[0]?.participant_number || 'N/A',
      prize: w.prize,
      drawn_at: w.created_at,
    }))
  },

  async destroyWinner(id: number) {
    const { error } = await supabase.from('winners').delete().eq('id', id)
    if (error) throw error
    return { message: 'Winner deleted/undone successfully.' }
  },
}

// ----------------------------------------------------------------------
// University Admin Service
// ----------------------------------------------------------------------
export const universityAdminService = {
  async getDashboard(adminId: number) {
    const { data: uni } = await supabase
      .from('universities')
      .select('*')
      .eq('admin_id', adminId)
      .maybeSingle()

    if (!uni) {
      const err: any = new Error('No university assigned to this admin.')
      err.response = { data: { message: 'No university assigned to this admin.' } }
      throw err
    }

    const { count: totalScans } = await supabase
      .from('student_visits')
      .select('id', { count: 'exact', head: true })
      .eq('university_id', uni.id)

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { count: todayScans } = await supabase
      .from('student_visits')
      .select('id', { count: 'exact', head: true })
      .eq('university_id', uni.id)
      .gte('visited_at', todayStart.toISOString())

    const { data: recentVisits } = await supabase
      .from('student_visits')
      .select('visited_at, student:users(name)')
      .eq('university_id', uni.id)
      .order('visited_at', { ascending: false })
      .limit(5)

    const recentVisitors = (recentVisits || []).map((v: any) => ({
      student_name: v.student?.name || 'Unknown',
      visited_at: v.visited_at,
    }))

    return {
      university_name: uni.name,
      total_scans: totalScans || 0,
      today_scans: todayScans || 0,
      recent_visitors: recentVisitors,
    }
  },

  async getBooth(adminId: number) {
    const { data: uni, error } = await supabase
      .from('universities')
      .select('*')
      .eq('admin_id', adminId)
      .maybeSingle()

    if (error || !uni) {
      const err: any = new Error('No university assigned.')
      err.response = { data: { message: 'No university assigned.' } }
      throw err
    }

    return uni
  },

  async updateBooth(adminId: number, formData: any) {
    const { data: uni } = await supabase
      .from('universities')
      .select('id, logo')
      .eq('admin_id', adminId)
      .maybeSingle()

    if (!uni) {
      const err: any = new Error('No university assigned.')
      err.response = { data: { message: 'No university assigned.' } }
      throw err
    }

    let logoUrl = uni.logo
    let description = ''

    if (formData instanceof FormData) {
      description = (formData.get('description') as string) || ''
      const file = formData.get('logo') as File | null
      if (file && typeof file === 'object' && file.size > 0) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, file)

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName)
          logoUrl = publicUrlData.publicUrl
        }
      }
    }

    const { data: updatedUni, error } = await supabase
      .from('universities')
      .update({
        description,
        logo: logoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', uni.id)
      .select()
      .single()

    if (error) throw error

    return {
      message: 'Booth profile updated successfully.',
      university: updatedUni,
    }
  },

  async getVisitors(adminId: number) {
    const { data: uni } = await supabase
      .from('universities')
      .select('id')
      .eq('admin_id', adminId)
      .maybeSingle()

    if (!uni) {
      const err: any = new Error('No university assigned.')
      err.response = { data: { message: 'No university assigned.' } }
      throw err
    }

    const { data: visits } = await supabase
      .from('student_visits')
      .select('visited_at, student:users(name)')
      .eq('university_id', uni.id)
      .order('visited_at', { ascending: false })

    return (visits || []).map((v: any) => ({
      student_name: v.student?.name || 'Unknown',
      visited_at: v.visited_at,
    }))
  },
}

// ----------------------------------------------------------------------
// Feedback Service
// ----------------------------------------------------------------------
export const feedbackService = {
  async submitFeedback(
    userId: number,
    studentName: string,
    data: { content: string; rating?: number; category?: string }
  ) {
    if (!data.content || !data.content.trim()) {
      const err: any = new Error('Isi feedback tidak boleh kosong.')
      err.response = { data: { message: 'Isi feedback tidak boleh kosong.' } }
      throw err
    }

    const { data: feedback, error } = await supabase
      .from('feedbacks')
      .insert([
        {
          user_id: userId,
          student_name: studentName,
          category: data.category || 'Umum',
          rating: data.rating || 5,
          content: data.content.trim(),
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error
    return {
      message: 'Feedback berhasil dikirim. Terima kasih atas masukanmu!',
      feedback,
    }
  },

  async getMyFeedbacks(userId: number) {
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getAllFeedbacks() {
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async deleteFeedback(id: number) {
    const { error } = await supabase
      .from('feedbacks')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { message: 'Feedback berhasil dihapus.' }
  },
}

