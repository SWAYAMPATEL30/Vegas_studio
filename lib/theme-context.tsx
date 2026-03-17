"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { API_BASE_URL } from './api'

interface Theme {
  primary: string
  secondary: string
  background: string
  foreground: string
  accent: string
  headerBg: string
  footerBg: string
  cardBg: string
  buttonText: string
  headingColor: string
}

interface ThemeContextType {
  theme: Theme | null
  updateTheme: (newTheme: Theme) => Promise<void>
  refreshTheme: () => Promise<void>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme | null>(null)

  const fetchTheme = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/theme`)
      if (res.ok) {
        const data = await res.json()
        setTheme(data)
        applyTheme(data)
      }
    } catch (error) {
      console.error('[Theme] Failed to fetch theme:', error)
    }
  }

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement
    
    // Helper to convert hex to HSL for shadcn compatibility if needed
    // But for simplicity and maximum control, we'll use direct hex/rgb where possible
    // or just set the variables that the CSS uses.
    
    root.style.setProperty('--primary-custom', theme.primary)
    root.style.setProperty('--secondary-custom', theme.secondary)
    root.style.setProperty('--background-custom', theme.background)
    root.style.setProperty('--foreground-custom', theme.foreground)
    root.style.setProperty('--accent-custom', theme.accent)
    root.style.setProperty('--header-bg', theme.headerBg)
    root.style.setProperty('--footer-bg', theme.footerBg)
    root.style.setProperty('--card-bg', theme.cardBg)
    root.style.setProperty('--button-text', theme.buttonText)
    root.style.setProperty('--heading-color', theme.headingColor)
  }

  const updateTheme = async (newTheme: Theme) => {
    const token = localStorage.getItem('vegas_token')
    try {
      const res = await fetch(`${API_BASE_URL}/admin/theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTheme)
      })
      if (res.ok) {
        setTheme(newTheme)
        applyTheme(newTheme)
      }
    } catch (error) {
      console.error('[Theme] Failed to update theme:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchTheme()
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, refreshTheme: fetchTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
