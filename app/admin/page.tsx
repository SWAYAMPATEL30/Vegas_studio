'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Calendar, Clock, Users, ToggleLeft, ToggleRight, Filter, Download, Plus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { BlockedSlotsManager } from '@/components/blocked-slots-manager'
import { ServicesManager } from '@/components/services-manager'
import { CalendarSlotManager } from '@/components/calendar-slot-manager'
import { db } from '@/lib/firebase'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { services as localServicesData } from '@/lib/services-data'

interface AdminSettings {
  id: number
  booking_enabled: boolean
}

interface Appointment {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  appointment_date: string
  start_time: string
  end_time: string
  total_duration_minutes: number
  status: string
  rejection_reason: string | null
  created_at: string
  appointment_services: Array<{
    services: {
      id: string
      name: string
      type: string
      price: number
      duration_minutes: number
    }
  }>
}

interface BlockedSlot {
  id: string
  block_date: string
  start_time: string | null
  end_time: string | null
  reason: string
  is_full_day: boolean
  created_at: string
}

interface Service {
  id: string
  name: string
  price: number
  descriptions: string[]
  duration_minutes: number
  type: 'individual' | 'combo'
  is_active: boolean
  created_at: string
}

import { API_BASE_URL } from "@/lib/api"

export default function AdminPage() {
  const router = useRouter()
  const { role, token } = useAuth()

  useEffect(() => {
    // redirect if not admin
    if (typeof window !== 'undefined') {
      const storedRole = role || localStorage.getItem('vegas_role')
      if (storedRole !== 'admin') {
        router.push('/')
      }
    }
  }, [role, router])

  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [servicesLoading, setServicesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null)
  const [confirmMessage, setConfirmMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'appointments' | 'slots' | 'services' | 'calendar'>('appointments')

  // Get auth token for API calls
  const getAuthToken = () => {
    return token || localStorage.getItem('vegas_token')
  }

  // Fetch all data on mount and interval
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const fetchData = async (isInitial = true) => {
      try {
        if (isInitial) {
          setLoading(true)
          setError(null)
        }

        // Run fetches concurrently for speed
        await Promise.allSettled([
          fetchAppointments(),
          fetchBlockedSlots(),
          fetchServices(),
          fetchBookingSettings()
        ])
        
      } catch (error) {
        console.error('[v0] Error fetching data:', error)
        if (isInitial) setError('Error al cargar los datos')
      } finally {
        if (isInitial) setLoading(false)
      }
    }

    if (role === 'admin') {
      fetchData(true)
      
      // Auto-refresh every 15 seconds in background
      intervalId = setInterval(() => {
        fetchData(false)
      }, 15000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [role])

  // Fetch appointments — fetch from both backend and Firebase and merge
  const fetchAppointments = async () => {
    try {
      let backendAppointments: Appointment[] = []
      let firebaseAppointments: Appointment[] = []

      // 1. Try fetching from Backend (PostgreSQL)
      try {
        const token = getAuthToken()
        const response = await fetch(`${API_BASE_URL}/admin/appointments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          cache: 'no-store'
        })

        if (response.ok) {
          backendAppointments = await response.json()
        }
      } catch (backendErr) {
        console.warn('[admin] Backend appointments failed:', backendErr)
      }

      // 2. ALWAYS fetch from Firebase (new bookings go here)
      try {
        let liveServices: any[] = localServicesData
        try {
           const svRes = await fetch(`${API_BASE_URL}/services`, { cache: 'no-store' })
           if (svRes.ok) liveServices = await svRes.json()
        } catch (e) { }

        const snapshot = await getDocs(collection(db, 'appointments'))
        firebaseAppointments = snapshot.docs.map(doc => {
          const d = doc.data()
          return {
            id: doc.id,
            customer_name: d.userName || 'N/A',
            customer_email: d.userEmail || '',
            customer_phone: d.userPhone || '',
            appointment_date: d.appointment_date || '',
            start_time: d.start_time || '',
            end_time: d.end_time || '',
            total_duration_minutes: d.total_duration_minutes || 0,
            status: d.status || 'pending',
            rejection_reason: d.rejection_reason || null,
            created_at: d.timestamp?.toDate?.()?.toISOString?.() || '',
            appointment_services: (d.services || []).map((name: string) => {
              const sData = liveServices.find(s => s.name === name)
              return {
                services: { 
                  id: name, 
                  name, 
                  type: sData?.type === 'package' ? 'combo' : 'individual', 
                  price: sData?.price || 0, 
                  duration_minutes: sData?.duration_minutes || sData?.duration || 0 
                }
              }
            })
          }
        })
      } catch (fbErr) {
        console.error('[admin] Firebase appointments failed:', fbErr)
      }

      // 3. Merge and Sort
      const merged = [...backendAppointments, ...firebaseAppointments]
      
      // Sort newest to oldest as default view or by appointment_date
      merged.sort((a, b) => {
         const dateA = new Date(`${a.appointment_date}T${a.start_time || '00:00:00'}`).getTime()
         const dateB = new Date(`${b.appointment_date}T${b.start_time || '00:00:00'}`).getTime()
         // If dates are invalid, fall back to created_at
         if (isNaN(dateA) || isNaN(dateB)) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
         }
         return dateB - dateA
      })

      setAppointments(merged)
      if (merged.length === 0) {
         // Optionally you could set an error if BOTH failed, but usually empty implies no bookings.
      }
    } catch (error) {
      console.error('[v0] Fatal error fetching appointments:', error)
      setError('Error al cargar las citas')
    }
  }

  // Fetch blocked slots
  const fetchBlockedSlots = async () => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE_URL}/admin/block-slots`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      })

      if (!response.ok) throw new Error('Failed to fetch blocked slots')
      const data = await response.json()
      setBlockedSlots(data)
    } catch (error) {
      console.warn('[admin] Could not fetch blocked slots:', error)
      // Non-critical — just leave empty
    }
  }

  // Fetch services — try backend, fallback to local data
  const fetchServices = async () => {
    try {
      setServicesLoading(services.length === 0)
      const response = await fetch(`${API_BASE_URL}/services`, { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch services')
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.warn('[admin] Backend services failed, using local data:', error)
      const mapped: Service[] = localServicesData.map(s => ({
        id: s.id,
        name: s.name,
        price: s.price,
        duration_minutes: s.duration,
        type: s.type === 'package' ? 'combo' : 'individual',
        descriptions: s.features || [s.description],
        is_active: true,
        created_at: new Date().toISOString(),
      }))
      setServices(mapped)
    } finally {
      setServicesLoading(false)
    }
  }

  // Fetch booking settings
  const fetchBookingSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/booking-status`, { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch booking status')
      const bookingStatus = await response.json()
      setSettings({ id: 1, booking_enabled: typeof bookingStatus === 'boolean' ? bookingStatus : (bookingStatus.enabled ?? bookingStatus.booking_enabled ?? true) })
    } catch (error) {
      console.warn('[admin] Using local settings fallback:', error)
      setSettings({ id: 1, booking_enabled: true })
    }
  }

  // Add new service
  const handleAddService = async (serviceData: Omit<Service, 'id' | 'is_active' | 'created_at'>) => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE_URL}/admin/services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: serviceData.name,
          duration_minutes: serviceData.duration_minutes,
          price: serviceData.price,
          descriptions: serviceData.descriptions,
          type: serviceData.type
        }),
      })

      if (!response.ok) throw new Error('Failed to create service')
      const newService = await response.json()
      setServices([...services, newService])
    } catch (error) {
      console.error('[v0] Error adding service:', error)
      setError('Error al agregar servicio')
    }
  }

  // Update service
  const handleUpdateService = async (id: string, updates: Partial<Service>) => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE_URL}/admin/services/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          price: updates.price,
          duration_minutes: updates.duration_minutes
        }),
      })

      if (!response.ok) throw new Error('Failed to update service')
      const updated = await response.json()
      setServices(services.map((s) => (s.id === id ? updated : s)))
    } catch (error) {
      console.error('[v0] Error updating service:', error)
      setError('Error al actualizar servicio')
    }
  }

  // Delete service
  const handleDeleteService = async (id: string) => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE_URL}/admin/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to delete service')
      setServices(services.filter((s) => s.id !== id))
    } catch (error) {
      console.error('[v0] Error deleting service:', error)
      setError('Error al eliminar servicio')
    }
  }

  // Add blocked slot
  const handleAddBlockedSlot = async (date: string, startTime: string | null, endTime: string | null, reason: string, isFullDay: boolean) => {
    setSlotsLoading(true)
    try {
      const token = getAuthToken()

      // Format times for API
      const formattedStartTime = startTime ? `${startTime}:00` : '01:00'
      const formattedEndTime = endTime ? `${endTime}:00` : '24:00'

      const response = await fetch(`${API_BASE_URL}/admin/block-slot`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          block_date: date,
          start_time: isFullDay ? '00:00:00' : formattedStartTime,
          end_time: isFullDay ? '23:59:59' : formattedEndTime,
          is_full_day: isFullDay,
          reason: reason
        }),
      })

      if (!response.ok) throw new Error('Failed to add blocked slot')

      const newSlot = await response.json()
      setBlockedSlots([...blockedSlots, newSlot])
    } catch (err) {
      console.error('[v0] Error adding blocked slot:', err)
      setError('Error al agregar bloqueo de horario')
    } finally {
      setSlotsLoading(false)
    }
  }

  // Delete blocked slot
  const handleDeleteBlockedSlot = async (slotId: string) => {
    setSlotsLoading(true)
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_BASE_URL}/admin/block-slot/${slotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to delete blocked slot')

      setBlockedSlots(blockedSlots.filter((slot) => slot.id !== slotId))
    } catch (err) {
      console.error('[v0] Error deleting blocked slot:', err)
      setError('Error al eliminar bloqueo de horario')
    } finally {
      setSlotsLoading(false)
    }
  }

  // Toggle booking status
  const handleToggleBooking = () => {
    if (!settings) return

    setConfirmMessage(`¿Deseas ${settings.booking_enabled ? 'cerrar' : 'abrir'} las reservas?`)
    setConfirmAction(() => async () => {
      try {
        const token = getAuthToken()
        const response = await fetch(`${API_BASE_URL}/admin/booking-toggle`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            enabled: !settings.booking_enabled
          })
        })

        if (!response.ok) throw new Error('Failed to update booking status')

        const updated = await response.json()
        setSettings({ id: settings.id, booking_enabled: updated.booking_enabled })
        setShowConfirmation(false)
      } catch (err) {
        console.error('[v0] Error updating booking status:', err)
        setError('Error al actualizar estado de reservas')
      }
    })
    setShowConfirmation(true)
  }

  // Update appointment status
  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const token = getAuthToken()
      
      let isBackendSuccess = false;
      let updatedStatus = newStatus;

      try {
        const response = await fetch(`${API_BASE_URL}/admin/appointments/${appointmentId}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: newStatus
          })
        })

        if (response.ok) {
           isBackendSuccess = true;
           const result = await response.json()
           updatedStatus = result.appointment.status;
        }
      } catch (e) {
         console.warn('[admin] Backend status update failed or unavailable, relying on Firebase');
      }

      // If backend failed (or it was a Firebase document ID which Postgres doesn't recognize), update Firebase
      if (!isBackendSuccess) {
         const appointmentRef = doc(db, 'appointments', appointmentId);
         await updateDoc(appointmentRef, { status: newStatus });
      }

      // Update local state with the updated appointment
      setAppointments(
        appointments.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: updatedStatus } : apt
        )
      )
    } catch (err) {
      console.error('[v0] Error updating appointment:', err)
      setError('Error al actualizar cita')
    }
  }



  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (filterStatus !== 'all' && apt.status !== filterStatus) return false
    if (filterDate && apt.appointment_date !== filterDate) return false
    return true
  })

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Servicios', 'Fecha', 'Hora Inicio', 'Hora Fin', 'Duración', 'Estado']
    const rows = filteredAppointments.map((apt) => [
      apt.customer_name,
      apt.customer_email,
      apt.customer_phone,
      apt.appointment_services?.map(s => s.services.name).join(', ') || '',
      apt.appointment_date,
      apt.start_time,
      apt.end_time,
      `${apt.total_duration_minutes} min`,
      apt.status,
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f5f5f5' }}>
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#1A2722' }}>
              Panel Administrativo
            </h1>
            <p className="text-muted-foreground">Gestiona reservas y disponibilidad</p>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="mb-8 flex gap-4 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'appointments'
                  ? 'border-yellow-500'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              style={{ color: activeTab === 'appointments' ? '#FDB400' : undefined }}
            >
              <span className="inline-flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Citas programadas
              </span>
            </button>
            <button
              onClick={() => setActiveTab('slots')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'slots'
                  ? 'border-yellow-500'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              style={{ color: activeTab === 'slots' ? '#FDB400' : undefined }}
            >
              <span className="inline-flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horarios cerrados
              </span>
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'services'
                  ? 'border-yellow-500'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              style={{ color: activeTab === 'services' ? '#FDB400' : undefined }}
            >
              <span className="inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Servicios
              </span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'calendar'
                  ? 'border-yellow-500'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              style={{ color: activeTab === 'calendar' ? '#FDB400' : undefined }}
            >
              <span className="inline-flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Calendario
              </span>
            </button>
          </div>

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <ServicesManager
                  services={services}
                  onAddService={handleAddService}
                  onUpdateService={handleUpdateService}
                  onDeleteService={handleDeleteService}
                  loading={servicesLoading}
                />
              </div>
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <CalendarSlotManager
                  onSelectDates={(dates) => {
                    console.log('[v0] Selected dates for blocking:', dates)
                    setSlotsLoading(false)
                  }}
                  loading={slotsLoading}
                />
              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <>
              {/* Stats and Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Booking Status */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Estado de reservas</p>
                      <p className="text-3xl font-bold mt-2" style={{ color: settings?.booking_enabled ? '#9AC138' : '#DC2626' }}>
                        {settings?.booking_enabled ? 'Abierto' : 'Cerrado'}
                      </p>
                    </div>
                    <button
                      onClick={handleToggleBooking}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {settings?.booking_enabled ? (
                        <ToggleRight className="w-6 h-6" style={{ color: '#9AC138' }} />
                      ) : (
                        <ToggleLeft className="w-6 h-6" style={{ color: '#DC2626' }} />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={handleToggleBooking}
                    className="mt-4 w-full py-2 px-3 rounded-md text-sm font-medium transition-all"
                    style={{
                      background: settings?.booking_enabled ? '#FDB400' : '#9AC138',
                      color: '#1A2722',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    {settings?.booking_enabled ? 'Cerrar reservas' : 'Abrir reservas'}
                  </button>
                </div>

                {/* Total Appointments */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total de citas</p>
                      <p className="text-3xl font-bold mt-2" style={{ color: '#1A2722' }}>
                        {appointments.length}
                      </p>
                    </div>
                    <Calendar className="w-6 h-6 text-muted-foreground" />
                  </div>
                </div>

                {/* Confirmed */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Confirmadas</p>
                      <p className="text-3xl font-bold mt-2" style={{ color: '#9AC138' }}>
                        {appointments.filter((a) => a.status === 'confirmed').length}
                      </p>
                    </div>
                    <CheckCircle className="w-6 h-6" style={{ color: '#9AC138' }} />
                  </div>
                </div>

                {/* Pending */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                      <p className="text-3xl font-bold mt-2" style={{ color: '#FDB400' }}>
                        {appointments.filter((a) => a.status === 'pending').length}
                      </p>
                    </div>
                    <Clock className="w-6 h-6" style={{ color: '#FDB400' }} />
                  </div>
                </div>
              </div>

              {/* Appointments Section */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <h2 className="text-2xl font-bold" style={{ color: '#1A2722' }}>
                      Próximas citas
                    </h2>
                    <div className="flex items-center gap-3">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        style={{ color: "black" }}
                      >
                        <option value="all">Todos los estados</option>
                        <option value="confirmed">Confirmadas</option>
                        <option value="pending">Pendientes</option>
                        <option value="completed">Completadas</option>
                        <option value="cancelled">Canceladas</option>
                      </select>
                      <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        style={{ color: "black" }}
                      />
                      <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{ background: '#FDB400', color: '#1A2722' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.9'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1'
                        }}
                      >
                        <Download className="w-4 h-4" />
                        Exportar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Appointments Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Cliente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Contacto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Servicios</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Hora</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Duración</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                            No hay citas para mostrar
                          </td>
                        </tr>
                      ) : (
                        filteredAppointments.map((appointment) => (
                          <tr key={appointment.id} style={{ borderBottom: '1px solid #e5e7eb' }} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <p className="font-medium" style={{ color: '#1A2722' }}>
                                {appointment.customer_name}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-muted-foreground">{appointment.customer_email}</p>
                              <p className="text-sm text-muted-foreground">{appointment.customer_phone}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-2">
                                {appointment.appointment_services?.map((item) => (
                                  <span key={item.services.id} className="px-2 py-1 rounded text-xs font-medium" style={{ background: '#FDB400', color: '#1A2722' }}>
                                    {item.services.name}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-medium" style={{color:"black"}}>{appointment.appointment_date}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-muted-foreground">{appointment.start_time} - {appointment.end_time}</p>
                            </td>
                            <td className="px-6 py-4 text-sm" style={{color:"black"}}>{appointment.total_duration_minutes} min</td>
                            <td className="px-6 py-4">
                              <select
                                value={appointment.status}
                                onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                                className="px-3 py-1 rounded text-xs font-medium border-0 cursor-pointer focus:outline-none"
                                style={{
                                  background:
                                    appointment.status === 'confirmed'
                                      ? '#D1FAE5'
                                      : appointment.status === 'pending'
                                        ? '#FEF3C7'
                                        : appointment.status === 'completed'
                                          ? '#E0E7FF'
                                          : '#FEE2E2',
                                  color: appointment.status === 'confirmed' ? '#065F46' : appointment.status === 'pending' ? '#92400E' : '#1F2937',
                                }}
                              >
                                <option value="pending">Pendiente</option>
                                <option value="confirmed">Confirmada</option>
                                <option value="completed">Completada</option>
                                <option value="cancelled">Cancelada</option>
                                <option value="rejected">Rechazada</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Blocked Slots Tab */}
          {activeTab === 'slots' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold" style={{ color: '#1A2722' }}>
                  Horarios cerrados
                </h2>
              </div>
              <div className="p-6">
                <BlockedSlotsManager
                  blockedSlots={blockedSlots.map(slot => ({
                    id: slot.id,
                    slot_date: slot.block_date,
                    start_time: slot.start_time,
                    end_time: slot.end_time,
                    reason: slot.reason,
                    is_full_day: slot.is_full_day
                  }))}
                  onAddSlot={handleAddBlockedSlot}
                  onDeleteSlot={handleDeleteBlockedSlot}
                  loading={slotsLoading}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#1A2722' }}>
              Confirmar acción
            </h3>
            <p className="text-muted-foreground mb-6">{confirmMessage}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  confirmAction?.()
                }}
                className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all"
                style={{ background: '#FDB400', color: '#1A2722' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}