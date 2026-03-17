"use client"

import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { API_BASE_URL } from "@/lib/api"

interface PhoneRequirementModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (phone: string) => void
}

export function PhoneRequirementModal({ isOpen, onClose, onSuccess }: PhoneRequirementModalProps) {
  const { token, updateUser } = useAuth()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("+57")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const countries = [
    { code: "+91", name: "IN", flag: "🇮🇳" },
    { code: "+57", name: "CO", flag: "🇨🇴" },
    { code: "+1", name: "US", flag: "🇺🇸" },
    { code: "+52", name: "MX", flag: "🇲🇽" },
    { code: "+34", name: "ES", flag: "🇪🇸" },
    { code: "+58", name: "VE", flag: "🇻🇪" },
    { code: "+593", name: "EC", flag: "🇪🇨" },
    { code: "+51", name: "PE", flag: "🇵🇪" },
    { code: "+56", name: "CL", flag: "🇨🇱" },
    { code: "+54", name: "AR", flag: "🇦🇷" },
  ]

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber.trim()) {
      setError("Por favor ingresa un número de teléfono")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const fullPhone = `${countryCode}${phoneNumber.replace(/\s+/g, "")}`
      const res = await fetch(`${API_BASE_URL}/auth/update-phone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: fullPhone }),
      })

      if (!res.ok) {
        throw new Error("Error al actualizar el teléfono")
      }

      const data = await res.json()
      updateUser(data.user)
      onSuccess(fullPhone)
    } catch (err: any) {
      console.error(err)
      setError(err?.message || "Error al actualizar el perfil")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Completa tu perfil</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Para agendar una cita, necesitamos un número de teléfono para enviarte la confirmación por WhatsApp.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número telefónico
            </label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-24 px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="314 780 1264"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !phoneNumber.trim()}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            Guardar y Continuar
          </button>
        </form>
      </div>
    </div>
  )
}
