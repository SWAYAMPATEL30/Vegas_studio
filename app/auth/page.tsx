"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from '@/lib/auth-context'
import Image from "next/image"
import { User, Mail, Lock } from "lucide-react"
import { auth, googleProvider, signInWithPopup } from "@/lib/firebase"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [isClient, setIsClient] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    password: "",
    confirmPassword: "",
    telefono: "",
  })
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  const authContext = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (activeTab === 'register') {
      if (!formData.password || !formData.confirmPassword) {
        alert("Por favor ingresa y confirma tu contraseña")
        return
      }
      if (formData.password !== formData.confirmPassword) {
        alert("Las contraseñas no coinciden")
        return
      }
      if (!formData.nombre || !formData.correo) {
        alert("Por favor completa todos los campos obligatorios")
        return
      }
    }

    setLoading(true)
    ;(async () => {
      try {
        if (activeTab === 'register') {
          await authContext.register({
            name: formData.nombre,
            email: formData.correo,
            phone: formData.telefono,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
          })
        } else {
          // login
          const payload: any = {}
          // allow identifier (email) or phone
          payload.identifier = formData.correo || formData.telefono
          payload.password = formData.password
          await authContext.login(payload)
        }
      } catch (err: any) {
        console.error(err)
        alert(err?.message || 'Error durante la autenticación')
      } finally {
        setLoading(false)
      }
    })()
  }

  const handlePhoneLogin = async () => {
    setLoading(true)
    try {
      console.log("[v0] Phone login initiated")
      // Phone authentication can be implemented with Firebase, Twilio, or similar services
      // For now, this redirects to a phone verification page
      const phoneNumber = formData.telefono || ""
      
      if (!phoneNumber && activeTab === "login") {
        alert("Por favor ingresa un número telefónico válido")
        setLoading(false)
        return
      }
      
      // In production, integrate with phone OTP service
      console.log("[v0] Phone login for:", phoneNumber)
      alert("Redireccionar a verificación de número telefónico - Sistema de OTP")
      setLoading(false)
    } catch (error) {
      console.error("[v0] Phone login error:", error)
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
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
      localStorage.setItem('vegas_role', 'client');
      
      window.location.href = '/'
    } catch (error: any) {
      console.error('[v0] Error with Google auth:', error)
      
      let errorMessage = 'Error desconocido al autenticar con Google.';
      if (error?.code === 'auth/popup-closed-by-user') {
        errorMessage = 'El proceso fue cancelado. Por favor, intenta de nuevo y no cierres la ventana.';
      } else if (error?.code === 'auth/operation-not-allowed') {
        errorMessage = 'El inicio de sesión con Google no está habilitado en Firebase. Ve a Firebase Console -> Authentication -> Sign-in method y habilita Google.';
      } else if (error?.code === 'auth/configuration-not-found') {
        errorMessage = 'Error de configuración de Firebase (auth/configuration-not-found). Por favor, verifica que las llaves en tu archivo .env sean las correctas y que el proyecto exista en Firebase.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false)
    }
  }

  if (!isClient) return null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Main Content - White Background Section */}
      <main className="flex-1 bg-[#f5f5f0] py-16">
        <div className="max-w-md mx-auto px-4">
          {/* Logo Avatar */}
          <div className="flex justify-center mb-6">
            <Image
              src="/images/ISOTIPO-negativo.svg"
              alt="Vegas Estudio"
              width={96}
              height={96}
              className="w-24 h-24"
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Bienvenido
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Regístrate para reservar tus citas
          </p>

          {/* Tab Switcher - 365x52 outer, 113x34 active tab */}
          <div className="flex items-center justify-center mx-auto mb-8 w-[365px] h-[52px] rounded-[10px] gap-[15px] px-[30px] py-[9px]" style={{ background: '#e8e8e0' }}>
            <button
              onClick={() => setActiveTab("login")}
              className={`w-[113px] h-[34px] rounded-[10px] px-[10px] py-[5px] gap-[10px] flex items-center justify-center font-medium text-sm transition-all ${
                activeTab === "login"
                  ? "bg-white text-[#1A2722] shadow-sm"
                  : "bg-transparent text-[#6B7280]"
              }`}
            >
              Inicia sesión
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`w-[113px] h-[34px] rounded-[10px] px-[10px] py-[5px] gap-[10px] flex items-center justify-center font-medium text-sm transition-all ${
                activeTab === "register"
                  ? "bg-white text-[#1A2722] shadow-sm"
                  : "bg-transparent text-[#6B7280]"
              }`}
            >
              Regístrate
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "register" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Jhon Doe"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="correo"
                  placeholder="tu@ejemplo.com"
                  value={formData.correo}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="****************"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {activeTab === "register" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="****************"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="+57 314 780 1264"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>
              </>
            )}
            
            {activeTab === "login" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono (opcional para OTP)
                </label>
                <input
                  type="tel"
                  name="telefono"
                  placeholder="+57 314 780 1264"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium mt-6 disabled:opacity-50"
            >
              {loading ? "Cargando..." : activeTab === "register" ? "Regístrate" : "Inicia sesión"}
            </button>

            {/* Alternative Login Methods */}
            <button
              type="button"
              onClick={handlePhoneLogin}
              disabled={loading}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Continuar con el número telefónico"}
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-3 disabled:opacity-50"
            >
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
              {loading ? "Cargando..." : "Continuar con Google"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}