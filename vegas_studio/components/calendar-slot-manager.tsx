'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react'

interface CalendarSlotManagerProps {
  onSelectDates: (selectedDates: string[]) => void
  loading: boolean
}

export function CalendarSlotManager({ onSelectDates, loading }: CalendarSlotManagerProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set())
  const [showTimeRange, setShowTimeRange] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [isFullDay, setIsFullDay] = useState(true)
  const [reason, setReason] = useState('')

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const toggleDate = (dateStr: string) => {
    const newSet = new Set(selectedDates)
    if (newSet.has(dateStr)) {
      newSet.delete(dateStr)
    } else {
      newSet.add(dateStr)
    }
    setSelectedDates(newSet)
  }

  const openTimeRange = (dateStr: string) => {
    setSelectedDate(dateStr)
    setShowTimeRange(true)
  }

  const handleAddTimeBlock = () => {
    if (!selectedDate) return
    // Here you would add logic to save the time block
    console.log('[v0] Adding time block for', selectedDate, 'from', startTime, 'to', endTime, 'reason:', reason)
    setShowTimeRange(false)
    resetTimeForm()
  }

  const resetTimeForm = () => {
    setStartTime('09:00')
    setEndTime('17:00')
    setIsFullDay(true)
    setReason('')
    setSelectedDate(null)
  }

  const handleSubmit = () => {
    onSelectDates(Array.from(selectedDates))
  }

  const days = ['D', 'L', 'M', 'M2', 'J', 'V', 'S']
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold mb-4" style={{ color: '#1A2722' }}>
          Selecciona fechas para cerrar
        </h3>

        <div className="inline-block border-2 border-blue-500 rounded-lg p-4" style={{ borderColor: '#0096FF' }}>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() =>
                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
              }
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h4 className="text-lg font-semibold capitalize text-center min-w-40">
              {monthName}
            </h4>
            <button
              onClick={() =>
                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
              }
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {days.map((day) => (
              <div key={day} className="w-10 h-10 flex items-center justify-center font-semibold">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="w-10 h-10" />
              }

              const dateStr = formatDate(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                day
              )
              const isSelected = selectedDates.has(dateStr)
              const isPast =
                new Date(dateStr) < new Date(new Date().toISOString().split('T')[0])

              return (
                <button
                  key={day}
                  onClick={() => !isPast && toggleDate(dateStr)}
                  disabled={isPast}
                  className={`w-10 h-10 rounded flex items-center justify-center font-semibold transition-all ${
                    isPast ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                  style={{
                    background: isSelected ? '#9AC138' : '#F3F4F6',
                    color: isSelected ? 'white' : '#1F2937',
                    border: isSelected ? '2px solid #7B8A1F' : 'none',
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Time Range Indicators */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: '#9AC138' }} />
                <span>Disponibles</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: '#E5E7EB' }} />
                <span>Abierto</span>
              </div>
            </div>
          </div>
        </div>

        {selectedDates.size > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">
              {selectedDates.size} fecha(s) seleccionada(s)
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedDates)
                .sort()
                .map((date) => (
                  <span
                    key={date}
                    className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                    style={{ background: '#9AC138', color: 'white' }}
                  >
                    {new Date(date + 'T00:00:00').toLocaleDateString('es-CO')}
                    <button
                      onClick={() => {
                        const newSet = new Set(selectedDates)
                        newSet.delete(date)
                        setSelectedDates(newSet)
                      }}
                      className="hover:opacity-75"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={selectedDates.size === 0 || loading}
            className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: '#9AC138' }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '0.9'
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '1'
            }}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Aplicar cambios
          </button>
        </div>
      </div>
    </div>
  )
}
