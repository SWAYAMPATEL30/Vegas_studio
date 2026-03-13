"use client"

import Link from "next/link"
import { CheckCircle, Calendar, Clock, Tag, ArrowRight } from "lucide-react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  services: string[]
  date: string
  time: string
  price: number
  appointmentDetails?: any
}

export function ConfirmationModal({
  isOpen,
  onClose,
  services,
  date,
  time,
  price,
  appointmentDetails,
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const formatPrice = (p: number) => {
    return `$ ${p.toLocaleString("es-CO")} COP`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal */}
      <div 
        className="relative rounded-2xl shadow-2xl text-white overflow-hidden animate-in fade-in zoom-in duration-300"
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'linear-gradient(135deg, #7B9A2D -50%, #1A2722 100%)',
        }}
      >
        {/* Success Icon */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FDB400] to-[#9AC138]" />
        
        <div className="p-8">
          {/* Header with Icon */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4 border-2 border-[#FDB400]">
              <CheckCircle className="w-12 h-12 text-[#FDB400]" />
            </div>
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-[#FDB400] to-white bg-clip-text text-transparent">
              ¡Cita confirmada!
            </h2>
            <p className="text-white/70 text-sm mt-1">
              Hemos registrado tu reserva exitosamente
            </p>
          </div>

          {/* Appointment Details */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-5 mb-6 space-y-3">
            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-[#FDB400] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-white/70">Servicios</p>
                <p className="font-medium">{services.join(", ")}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#FDB400] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-white/70">Fecha</p>
                <p className="font-medium">{date}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#FDB400] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-white/70">Hora</p>
                <p className="font-medium">{time}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 pt-2 border-t border-white/20">
              <span className="text-sm text-white/70">Total:</span>
              <span className="text-xl font-bold text-[#FDB400] ml-auto">
                {formatPrice(price)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="group w-full bg-[#FDB400] hover:bg-[#E8A500] text-[#1A2722] font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              onClick={onClose}
            >
              <span>Volver al inicio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <button
              onClick={onClose}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 border border-white/20"
            >
              Ver detalles de mi cita
            </button>
          </div>

          {/* Reference Number (if available) */}
          {appointmentDetails?.id && (
            <p className="text-center text-xs text-white/50 mt-4">
              Ref: {appointmentDetails.id.slice(0, 8).toUpperCase()}
            </p>
          )}
          {appointmentDetails && (
            <div className="text-white/70 text-sm mt-3 p-3 bg-white/5 rounded-md">
              <p className="font-medium">Detalle de la cita</p>
              <p className="text-xs">Fecha: {appointmentDetails.appointment_date || date}</p>
              <p className="text-xs">Hora inicio: {appointmentDetails.start_time ? appointmentDetails.start_time.replace(':00', '') : time}</p>
              <p className="text-xs">Hora fin: {appointmentDetails.end_time ? appointmentDetails.end_time.replace(':00', '') : ''}</p>
              <p className="text-xs">Estado: {appointmentDetails.status || 'pending'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}