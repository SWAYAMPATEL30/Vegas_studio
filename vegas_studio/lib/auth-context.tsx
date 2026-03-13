"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { API_BASE_URL } from "@/lib/api"

// Admin login email (and identifier) can be configured via environment variable
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@vegas.com'

type User = {
  id: string
  name: string
  email: string
  phone?: string
}

type AuthState = {
  user: User | null
  token: string | null
  role: string | null
}

type AuthContextType = AuthState & {
  register: (payload: any) => Promise<void>
  login: (payload: any) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // load from localStorage
    try {
      const savedRole = localStorage.getItem('vegas_role')
      const savedToken = localStorage.getItem('vegas_token')
      const savedUser = localStorage.getItem('vegas_user')

      if (savedRole) setRole(savedRole)
      if (savedToken) setToken(savedToken)
      if (savedUser) setUser(JSON.parse(savedUser))
    } catch (e) {
      console.warn('[auth] failed to load from localStorage', e)
    }
  }, [])

  const persist = (data: { role?: string; token?: string; user?: any }) => {
    if (data.role) {
      localStorage.setItem('vegas_role', data.role)
      setRole(data.role)
    }

    // per requirement: if role is admin save only the role details
    if (data.role === 'admin') {
      localStorage.removeItem('vegas_token')
      localStorage.removeItem('vegas_user')
      setToken(null)
      setUser(null)
      return
    }

    if (data.token) {
      localStorage.setItem('vegas_token', data.token)
      setToken(data.token)
    }

    if (data.user) {
      localStorage.setItem('vegas_user', JSON.stringify(data.user))
      setUser(data.user)
    }
  }

  const register = async (payload: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Registration failed')
    }

    const data = await res.json()
    // assume registration returns token+user+role similar to login; if not, just redirect
    if (data.role === 'admin') {
      persist({ role: 'admin' })
    } else {
      persist({ role: data.role || 'client', token: data.token, user: data.user || null })
    }

    router.push('/')
  }

  const login = async (payload: any) => {
    // determine if credentials correspond to the admin account
    const identifier = payload.identifier || payload.email
    const isAdmin = identifier === ADMIN_EMAIL

    let url: string, bodyData: any

    if (isAdmin) {
      // For admin login, use the admin login endpoint with email and password
      url = `${API_BASE_URL}/auth/admin/login`
      bodyData = {
        email: identifier,
        password: payload.password,
      }
    } else {
      // For regular login
      url = `${API_BASE_URL}/auth/login`
      bodyData = payload
    }

    // log payload for debugging
    console.log('[auth] login request to', url, 'body:', bodyData)

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Login failed')
    }

    const data = await res.json()

    if (data.role === 'admin') {
      // Store both token and role for admin
      localStorage.setItem('vegas_role', data.role)
      localStorage.setItem('vegas_token', data.token)
      setRole(data.role)
      setToken(data.token)
      setUser(null)
    } else {
      persist({ role: data.role || 'client', token: data.token, user: data.user || data })
    }

    router.push('/')
  }

  const logout = () => {
    localStorage.removeItem('vegas_token')
    localStorage.removeItem('vegas_user')
    localStorage.removeItem('vegas_role')
    setUser(null)
    setToken(null)
    setRole(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, token, role, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext