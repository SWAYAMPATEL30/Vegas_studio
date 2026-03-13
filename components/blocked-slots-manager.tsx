'use client'

import React from "react"

import { useState } from 'react'
import { X, Plus, Calendar, Clock, Trash2 } from 'lucide-react'

interface BlockedSlot {
  id: string
  slot_date: string
  block_date?: string
  start_time: string | null
  end_time: string | null
  reason: string
  is_full_day: boolean
}

interface BlockedSlotsManagerProps {
  blockedSlots: BlockedSlot[]
  onAddSlot: (date: string, startTime: string | null, endTime: string | null, reason: string, isFullDay: boolean) => void
  onDeleteSlot: (slotId: string) => void
  loading?: boolean
}

export function BlockedSlotsManager({
  blockedSlots,
  onAddSlot,
  onDeleteSlot,
  loading = false,
}: BlockedSlotsManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [isFullDay, setIsFullDay] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    reason: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.date) return

    onAddSlot(
      formData.date,
      isFullDay ? null : formData.startTime,
      isFullDay ? null : formData.endTime,
      formData.reason,
      isFullDay
    )

    setFormData({ date: '', startTime: '', endTime: '', reason: '' })
    setIsFullDay(false)
    setShowForm(false)
  }

  const sortedSlots = [...blockedSlots].sort((a, b) => new Date(a.block_date || a.slot_date).getTime() - new Date(b.block_date || b.slot_date).getTime())

  const timeOptions = [
    { label: "8:00 AM", value: "08:00" },
    { label: "9:00 AM", value: "09:00" },
    { label: "10:00 AM", value: "10:00" },
    { label: "11:00 AM", value: "11:00" },
    { label: "12:00 PM", value: "12:00" },
    { label: "1:00 PM", value: "13:00" },
    { label: "2:00 PM", value: "14:00" },
    { label: "3:00 PM", value: "15:00" },
    { label: "4:00 PM", value: "16:00" },
    { label: "5:00 PM", value: "17:00" },
    { label: "6:00 PM", value: "18:00" },
    { label: "7:00 PM", value: "19:00" },
    { label: "8:00 PM", value: "20:00" },
    { label: "9:00 PM", value: "21:00" }
  ]

  return (
    <div className="space-y-6">
      {/* Add New Blocked Slot */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: '#1A2722' }}>
            Gestionar horarios cerrados
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: '#FDB400', color: '#1A2722' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            <Plus className="w-4 h-4" />
            Agregar bloqueo
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ color: "black" }}
                />
              </div>

              {/* Full Day Toggle */}
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFullDay}
                    onChange={(e) => setIsFullDay(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                    style={{ color: "black" }}
                  />
                  <span className="text-sm font-medium text-gray-700">¿Día completo cerrado?</span>
                </label>
              </div>
            </div>

            {/* Time Range - Only show if not full day */}
            {!isFullDay && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora de inicio</label>
                  <select
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required={!isFullDay}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    style={{ color: "black" }}
                  >
                    <option value="" disabled>Selecciona inicio...</option>
                    {timeOptions.slice(0, -1).map((t) => (
                      <option key={`start-${t.value}`} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora de fin</label>
                  <select
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required={!isFullDay}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    style={{ color: "black" }}
                  >
                    <option value="" disabled>Selecciona fin...</option>
                    {timeOptions.map((t) => (
                      <option key={`end-${t.value}`} value={t.value} disabled={formData.startTime ? t.value <= formData.startTime : false}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivo (opcional)</label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Ej: Mantenimiento, Capacitación"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ color: "black" }}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all"
                style={{ background: '#9AC138' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                {loading ? 'Guardando...' : 'Guardar bloqueo'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Blocked Slots List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold" style={{ color: '#1A2722' }}>
            Horarios bloqueados activos ({sortedSlots.length})
          </h3>
        </div>

        {sortedSlots.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No hay horarios bloqueados. Los clientes pueden agendar normalmente.
          </div>
        ) : (
          <div className="divide-y">
            {sortedSlots.map((slot) => {
              const slotDate = new Date(slot.block_date || slot.slot_date)
              const formattedDate = slotDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })

              return (
                <div key={slot.id} className="p-4 hover:bg-gray-50 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5" style={{ color: '#FDB400' }} />
                      <span className="font-semibold text-gray-900 capitalize">{formattedDate}</span>
                      {slot.is_full_day && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">Día completo</span>
                      )}
                    </div>

                    {!slot.is_full_day && (
                      <div className="flex items-center gap-3 ml-8 text-sm text-gray-600 mb-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {(() => {
                            const formatTime = (t: string | null) => {
                              if (!t) return ''
                              const [h, m] = t.split(':')
                              let hours = parseInt(h)
                              const ampm = hours >= 12 ? 'PM' : 'AM'
                              hours = hours % 12 || 12
                              return `${hours}:${m} ${ampm}`
                            }
                            return `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`
                          })()}
                        </span>
                      </div>
                    )}

                    {slot.reason && (
                      <div className="ml-8 text-sm text-gray-600">
                        <span className="font-medium">Razón:</span> {slot.reason}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteSlot(slot.id)}
                    disabled={loading}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar bloqueo"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
