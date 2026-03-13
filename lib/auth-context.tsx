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
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        let errorMessage = 'Error al registrar'
        try {
          const json = JSON.parse(text)
          errorMessage = json.message || errorMessage
        } catch (e) {
          errorMessage = text || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data = await res.json()
      if (data.role === 'admin') {
        persist({ role: 'admin' })
      } else {
        persist({ role: data.role || 'client', token: data.token, user: data.user || null })
      }

      router.push('/')
    } catch (err: any) {
      if (err?.message?.includes('Failed to fetch') || err?.name === 'TypeError') {
        throw new Error('El servidor backend no está disponible. Por favor usa "Continuar con Google" para registrarte.')
      }
      throw err
    }
  }

  const login = async (payload: any) => {
    // determine if credentials correspond to the admin account
    const identifier = payload.identifier || payload.email
    const isAdmin = identifier === ADMIN_EMAIL

    // Handle admin login
    if (isAdmin) {
      try {
        const url = `${API_BASE_URL}/auth/admin/login`
        const bodyData = { email: identifier, password: payload.password }
        console.log('[auth] admin login request to', url)

        let res: Response
        try {
          res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData),
          })
        } catch (networkErr) {
          // ONLY network errors (backend truly offline) → local fallback
          console.warn('[auth] Backend unreachable, using local admin auth')
          localStorage.setItem('vegas_role', 'admin')
          localStorage.setItem('vegas_token', 'local-admin-token')
          setRole('admin')
          setToken('local-admin-token')
          setUser(null)
          router.push('/admin')
          return
        }

        if (!res.ok) {
          // Backend responded but rejected credentials
          const text = await res.text()
          let errorMessage = 'Error en credenciales de administrador'
          try {
            const json = JSON.parse(text)
            errorMessage = json.message || errorMessage
          } catch (e) {
            errorMessage = text || errorMessage
          }
          throw new Error(errorMessage)
        }

        const data = await res.json()
        localStorage.setItem('vegas_role', data.role)
        localStorage.setItem('vegas_token', data.token)
        setRole(data.role)
        setToken(data.token)
        setUser(null)
        router.push('/admin')
        return
      } catch (err: any) {
        // If it's a credential error, propagate it; don't use fallback
        throw err
      }
    }

    // Regular user login
    try {
      const url = `${API_BASE_URL}/auth/login`
      console.log('[auth] login request to', url, 'body:', payload)

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        let errorMessage = 'Error al iniciar sesión'
        try {
          const json = JSON.parse(text)
          errorMessage = json.message || errorMessage
        } catch (e) {
          errorMessage = text || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data = await res.json()
      persist({ role: data.role || 'client', token: data.token, user: data.user || data })
      router.push('/')
    } catch (err: any) {
      if (err?.message?.includes('Failed to fetch') || err?.name === 'TypeError') {
        throw new Error('El servidor backend no está disponible. Por favor usa "Continuar con Google" para iniciar sesión, o contacta al administrador.')
      }
      throw err
    }
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