import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiClient } from '../api/client'

interface User {
  id: number
  name: string
  role: string
  progress?: {
    visited_count: number
    total_count: number
    percentage: number
  }
  lucky_draw?: {
    joined: boolean
    participant_number?: string
    joined_at?: string
  }
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (name: string, password: string, panelType?: 'student' | 'admin') => Promise<User>
  register: (name: string, password: string) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user_info')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      
      // Fetch latest profile state in background
      apiClient.get('/user')
        .then((response) => {
          const latestUser = response.data
          setUser(latestUser)
          localStorage.setItem('user_info', JSON.stringify(latestUser))
        })
        .catch(() => {
          logoutState()
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const logoutState = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
  }

  const login = async (name: string, password: string, panelType: 'student' | 'admin' = 'student') => {
    const response = await apiClient.post('/login', { name, password })
    const { user: loggedInUser, token: authToken } = response.data

    if (panelType === 'admin' && loggedInUser.role === 'student') {
      throw new Error('Access denied. Admin role required.')
    }
    if (panelType === 'student' && loggedInUser.role !== 'student') {
      throw new Error('Please login through the Admin Panel.')
    }

    setToken(authToken)
    setUser(loggedInUser)
    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('user_info', JSON.stringify(loggedInUser))

    return loggedInUser
  }

  const register = async (name: string, password: string) => {
    const response = await apiClient.post('/register', {
      name,
      password,
      password_confirmation: password,
    })
    const { user: registeredUser, token: authToken } = response.data

    setToken(authToken)
    setUser(registeredUser)
    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('user_info', JSON.stringify(registeredUser))

    return registeredUser
  }

  const logout = async () => {
    try {
      await apiClient.post('/logout')
    } catch (err) {
      console.error('Logout request failed:', err)
    } finally {
      logoutState()
    }
  }

  const refreshUser = async () => {
    try {
      const response = await apiClient.get('/user')
      setUser(response.data)
      localStorage.setItem('user_info', JSON.stringify(response.data))
    } catch (err) {
      console.error('Failed to refresh user:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
