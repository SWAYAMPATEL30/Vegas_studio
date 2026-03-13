"use client"

import { X } from "lucide-react"
import Link from "next/link"

interface EmergentneIniciarSesionProps {
  isOpen: boolean
  onClose: () => void
}

export function EmergentIniciarnSesion({ isOpen, onClose }: EmergentneIniciarSesionProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative bg-white rounded-[10px] shadow-xl p-[25px] text-popover-foreground flex flex-col gap-[17px]"
        style={{ width: "305px", height: "308px" }}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold">
            No iniciaste sesión
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 text-sm flex-1">
          Inicia sesión para disfrutar de la mejor experiencia
        </p>

        <div className="space-y-3">
          <Link
            href="/auth"
            className="w-full text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors font-medium block text-center text-sm"
            style={{ backgroundColor: "#FDB400", color: "#1A2722" }}
          >
            Continuar con el número telefónico
          </Link>

          <button className="w-full bg-white border border-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2 text-sm">
            {/* Google icon */}
            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4">
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
        </div>
      </div>
    </div>
  )
}
