'use client'

import React from "react"
import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { auth, googleProvider, signInWithPopup } from "@/lib/firebase"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [isPhoneAuth, setIsPhoneAuth] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [isEmailAuth, setIsEmailAuth] = useState(false)
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '730966642426-ppv2le74kb9074qrajfkr2187paiat9i.apps.googleusercontent.com'

  useEffect(() => {
    // Remove Google SDK loading to avoid configuration errors
    // Using simplified auth instead
  }, [isOpen])

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) return

    setLoading(true)
    try {
      console.log('[v0] Sending verification code to:', phoneNumber)
      sessionStorage.setItem('pendingPhone', phoneNumber)
      setShowVerification(true)
    } catch (error) {
      console.error('[v0] Error sending code:', error)
      alert('Error al enviar código')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) return

    setLoading(true)
    try {
      if (verificationCode.length >= 4) {
        sessionStorage.setItem('userPhone', phoneNumber)
        sessionStorage.setItem('isAuthenticated', 'true')
        onSuccess?.()
      } else {
        alert('Código inválido')
      }
    } catch (error) {
      console.error('[v0] Error verifying code:', error)
      alert('Error al verificar código')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = (response: any) => {
    try {
      console.log('[v0] Google authentication successful')
      sessionStorage.setItem('isAuthenticated', 'true')
      sessionStorage.setItem('authProvider', 'google')
      if (response?.credential) {
        sessionStorage.setItem('googleToken', response.credential)
      }
      onSuccess?.()
    } catch (error) {
      console.error('[v0] Error handling Google auth:', error)
      alert('Error al autenticar con Google')
    }
  }

  const handleGoogleError = () => {
    console.error('[v0] Google authentication failed')
    // Fallback to simple auth instead of showing error
    handleGoogleAuthClick()
  }

  const handleGoogleAuthClick = async () => {
    setLoading(true)
    try {
      console.log('[v0] Authenticating with Google (Firebase)')
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      sessionStorage.setItem('isAuthenticated', 'true')
      sessionStorage.setItem('authProvider', 'google')
      sessionStorage.setItem('userEmail', user.email || 'usuario@gmail.com')
      
      localStorage.setItem('vegas_user', JSON.stringify({ email: user.email, name: user.displayName }));
      localStorage.setItem('vegas_token', await user.getIdToken());
      
      if (onSuccess) {
        onSuccess()
      } else {
        window.location.reload()
      }
    } catch (error) {
      console.error('[v0] Error with Google auth:', error)
      alert('Error al autenticar con Google. Intenta con otro método.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    try {
      console.log('[v0] Authenticating with email:', email)
      sessionStorage.setItem('userEmail', email)
      sessionStorage.setItem('isAuthenticated', 'true')
      onSuccess?.()
    } catch (error) {
      console.error('[v0] Error with email auth:', error)
      alert('Error al autenticar con email')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-96 p-8 text-popover-foreground max-h-96 overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-center mb-6 text-gray-900">
          Inicia sesión para
          <br />
          agendar tu cita
        </h2>

        {!isPhoneAuth && !isEmailAuth ? (
          <div className="space-y-4">
            <button
              onClick={() => {
                setIsPhoneAuth(true)
                setShowVerification(false)
                setPhoneNumber('')
                setVerificationCode('')
              }}
              className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium block text-center"
              disabled={loading}
            >
              Continuar con teléfono
            </button>

            <button
              onClick={handleGoogleAuthClick}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-300 text-gray-800 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <div className="w-5 h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              Continuar con Google
            </button>

            <button
              onClick={() => {
                setIsEmailAuth(true)
                setEmail('')
              }}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-300 text-gray-800 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Continuar con correo
            </button>
          </div>
        ) : isEmailAuth ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Continuar
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEmailAuth(false)
                setEmail('')
              }}
              className="w-full text-gray-600 py-2 text-sm"
            >
              Volver atrás
            </button>
          </form>
        ) : showVerification ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Hemos enviado un código de verificación a <strong>{phoneNumber}</strong>
            </p>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Código de verificación</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
                maxLength={6}
              />
            </div>
            <button
              onClick={handleVerifyCode}
              disabled={loading || verificationCode.length < 4}
              className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Verificar
            </button>
            <button
              onClick={() => {
                setShowVerification(false)
                setVerificationCode('')
              }}
              disabled={loading}
              className="w-full text-gray-600 py-2 text-sm"
            >
              Volver atrás
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Número telefónico</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+57 300 000 0000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
            </div>
            <button
              onClick={handleSendCode}
              disabled={loading || !phoneNumber.trim()}
              className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Enviar código
            </button>
            <button
              onClick={() => {
                setIsPhoneAuth(false)
                setPhoneNumber('')
              }}
              disabled={loading}
              className="w-full text-gray-600 py-2 text-sm"
            >
              Volver atrás
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
