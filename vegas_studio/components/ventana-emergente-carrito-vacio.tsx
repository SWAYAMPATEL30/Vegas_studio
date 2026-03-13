"use client"

import { X } from "lucide-react"
import Link from "next/link"

interface VentanaEmergentaCarritoVacioProps {
  isOpen: boolean
  onClose: () => void
}

export function VentanaEmergentaCarritoVacio({ isOpen, onClose }: VentanaEmergentaCarritoVacioProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative bg-white rounded-[10px] shadow-xl p-[25px] text-popover-foreground flex flex-col gap-[27px]"
        style={{ width: "380px", height: "224px" }}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold" style={{ color: "#9AC138" }}>
            Tu carrito
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 text-sm flex-1">
          Tu carrito de compras está vacío. Reserva tu cita y vuelve aquí.
        </p>

        <Link
          href="/agendar"
          onClick={onClose}
          className="inline-block px-4 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium text-center w-full"
          style={{ backgroundColor: "#FDB400", color: "#1A2722" }}
        >
          Reservar cita
        </Link>
      </div>
    </div>
  )
}
