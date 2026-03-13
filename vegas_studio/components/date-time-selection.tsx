"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import Image from "next/image"

interface DateTimeSelectionProps {
  selectedDate: Date | null
  selectedTime: string
  selectedServices: string[]
  totalDuration: number
  onDateChange: (date: Date) => void
  onTimeChange: (time: string) => void
  onBack: () => void
  onConfirm: () => Promise<void>
  loading?: boolean
  bookedSlots?: string[]
}

// Available date ranges (green in calendar image: 4-8 and 20-24)
const availableDateRanges = [
  { start: 4, end: 8 },
  { start: 20, end: 24 },
]

// Available time slots in 1-hour increments
const timeSlots = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM"
]

export function DateTimeSelection({
  selectedDate,
  selectedTime,
  selectedServices,
  totalDuration,
  onDateChange,
  onTimeChange,
  onBack,
  onConfirm,
  loading = false,
  bookedSlots = [],
}: DateTimeSelectionProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const daysOfWeek = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"]
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: (number | null)[] = []
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  // Convert a time like "8:00 AM" or "14:00" to {hour, minute} in 24h numbers
  const parseTimeTo24 = (time: string) => {
    if (!time) return { hour: 8, minute: 0 }
    if (time.includes('AM') || time.includes('PM')) {
      const [t, modifier] = time.split(' ')
      const [h, m] = t.split(':')
      let hour = parseInt(h, 10)
      const minute = parseInt(m || '0', 10)
      if (modifier === 'PM' && hour < 12) hour += 12
      if (modifier === 'AM' && hour === 12) hour = 0
      return { hour, minute }
    }
    const [h, m] = time.split(':')
    return { hour: parseInt(h || '0', 10), minute: parseInt(m || '0', 10) }
  }

  const format24To12 = (hour: number, minute: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    const mm = minute.toString().padStart(2, '0')
    return `${hour12}:${mm} ${ampm}`
  }

  const computeEndTime = (startTime: string, durationMinutes: number) => {
    const { hour, minute } = parseTimeTo24(startTime)
    const start = new Date()
    start.setHours(hour, minute, 0, 0)
    const end = new Date(start.getTime() + durationMinutes * 60000)
    return format24To12(end.getHours(), end.getMinutes())
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateClick = (day: number) => {
    if (isDateAvailable(day)) {
      const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      onDateChange(newDate)
    }
  }

  // Only allow dates within the next 7 days (including today)
  const isDateAvailable = (day: number | null) => {
    if (!day) return false
    const candidate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const today = new Date()
    today.setHours(0,0,0,0)
    const max = new Date(today)
    max.setDate(max.getDate() + 6)
    return candidate >= today && candidate <= max
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className="w-full" style={{ background: "#1A2722", padding: "59px 0", minHeight: "881.33px" }}>
      <div className="flex flex-col items-center gap-11">
        {/* Title */}
        <h2 className="text-4xl font-bold text-center text-white" style={{ fontSize: "32px", fontWeight: 700 }}>
          Selecciona fecha y hora
        </h2>

        {/* Calendar with Time slot */}
        <div className="flex items-start gap-12 justify-center w-full px-8" style={{ maxWidth: '1000px' }}>
          
          {/* LEFT: Calendar */}
          <div className="flex flex-col gap-6">
            <div
              className="bg-white rounded-[10px] flex flex-col shadow-lg flex-shrink-0"
              style={{ width: "420px", height: "403.33px", padding: "10px", overflowY: "auto" }}
            >
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button onClick={handlePrevMonth} className="p-1 hover:opacity-70 transition-opacity" style={{ color: '#1A2722' }}>
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <span className="font-semibold text-lg text-[#1A2722]">
                  {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button onClick={handleNextMonth} className="p-1 hover:opacity-70 transition-opacity" style={{ color: '#1A2722' }}>
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 mb-2">
                {daysOfWeek.map((day, i) => (
                  <div key={`${day}-${i}`} className="text-center font-medium text-xs" style={{ color: '#9AC138', lineHeight: '20px' }}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="flex flex-col gap-1">
                {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => {
                  const weekDays = days.slice(weekIndex * 7, (weekIndex + 1) * 7)

                  return (
                    <div key={weekIndex} className="grid grid-cols-7">
                      {weekDays.map((day, dayIndex) => {
                        const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear()
                        const isAvailable = isDateAvailable(day)
                        
                        return (
                          <div key={`${weekIndex}-${dayIndex}`} className="flex items-center justify-center" style={{ height: '32px' }}>
                            {day ? (
                              <button
                                onClick={() => handleDateClick(day)}
                                disabled={!isAvailable}
                                className="w-7 h-7 flex items-center justify-center rounded transition-all font-medium text-sm"
                                style={{
                                  color: isSelected ? '#FFFFFF' : isAvailable ? '#9AC138' : '#B0B0B0',
                                  background: isSelected ? '#9AC138' : 'transparent',
                                  cursor: isAvailable ? 'pointer' : 'default',
                                  fontWeight: isSelected || isAvailable ? 600 : 400,
                                  opacity: !isAvailable ? 0.5 : 1,
                                }}
                              >
                                {day}
                              </button>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>

              {/* Time selector dropdown */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <label className="text-sm text-[#1A2722] font-medium">Hora</label>
                  <div className="flex items-center gap-3">
                    <select 
                      value={selectedTime || ''} 
                      onChange={(e) => onTimeChange(e.target.value)}
                      className="px-3 py-2 rounded text-sm text-center font-medium"
                      style={{ background: '#E8E8E0', color: '#1A2722', border: 'none', width: '120px', cursor: 'pointer' }}
                    >
                      <option value="" disabled>Selecciona Hora</option>
                      {timeSlots.map((time) => {
                        const isBooked = bookedSlots.includes(time);
                        return (
                          <option key={time} value={time} disabled={isBooked}>
                            {time} {isBooked ? '(Reservado)' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <div className="text-xs text-[#1A2722]">
                      Fin: {computeEndTime(selectedTime || timeSlots[0], totalDuration)}
                    </div>
                  </div>
              </div>
            </div>

            {/* Legend below calendar */}
            <div className="flex items-center justify-center gap-16">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: "#9AC138" }} />
                <span className="text-sm" style={{ color: '#9AC138' }}>Disponibles</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: "#4A5E4A" }} />
                <span className="text-sm" style={{ color: '#808080' }}>No disponibles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Selected Services */}
        <div className="w-full text-white" style={{ width: '1440px', paddingLeft: '550px', paddingRight: '550px', gap: '9px' }}>
          {/* Selected Services */}
          <div className="text-center">
            <p className="mb-4 text-base font-medium">Servicios solicitados</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {selectedServices.map((service) => (
                <div key={service} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold" style={{ background: '#FDB400', color: '#1A2722' }}>
                    ✓
                  </div>
                  <span className="text-sm font-medium">{service}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">Duración total: {totalDuration} minutos</p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-center gap-8 pt-8">
          <button
            onClick={onBack}
            disabled={loading}
            className="px-8 py-3 rounded font-medium transition-all hover:opacity-80 flex items-center gap-2 disabled:opacity-50"
            style={{ background: '#D4D5CD', color: '#9AC138', border: 'none' }}
          >
            <span>{"←"}</span>
            Regresar
          </button>
          <button
            onClick={onConfirm}
            disabled={!selectedDate || !selectedTime || loading}
            className="inline-flex items-center gap-2 px-8 py-3 rounded font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#FDB400', color: '#1A2722', border: 'none' }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = '#E8A500'
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = '#FDB400'
              }
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                Confirmar
                <span>{"→"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}