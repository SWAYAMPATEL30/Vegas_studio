"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from 'next/navigation'
import { AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase-admin"
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartModal } from "@/components/cart-modal"
import { LoginModal } from "@/components/login-modal"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { StepIndicator } from "@/components/step-indicator"
import { ServiceSelection } from "@/components/service-selection"
import { DateTimeSelection } from "@/components/date-time-selection"
import { PhoneRequirementModal } from "@/components/phone-requirement-modal"
import FullScreenLoader from "@/components/fullscreen-loader"


import { API_BASE_URL } from "@/lib/api"
import { services as localServices } from "@/lib/services-data"

interface Service {
  id: string
  name: string
  duration_minutes: number
  price: number
  descriptions: string[]
  type: 'individual' | 'combo'
  is_active: boolean
  created_at: string
  image: string | null
}

export default function AgendarPage() {
  const router = useRouter()
  const { token, user } = useAuth()
  const { items: cartItems, addItem, removeItem, clearCart } = useCart()

  useEffect(() => {
    // if not logged in (no token or user), redirect to auth
    const hasToken = token || localStorage.getItem('vegas_token')
    const hasUser = user || localStorage.getItem('vegas_user')
    if (!hasToken && !hasUser) {
      router.push('/auth')
    }
  }, [token, user, router])

  const [serviceToggleLoading, setServiceToggleLoading] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isPhoneRequiredOpen, setIsPhoneRequiredOpen] = useState(false)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [services, setServices] = useState<Service[]>([])
  // const [selectedServices, setSelectedServices] = useState<string[]>([])
  const selectedServices = cartItems.map((item) => item.id)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null)
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [isBookingEnabled, setIsBookingEnabled] = useState(true)
  const [adminBlockedSlots, setAdminBlockedSlots] = useState<any[]>([])

  useEffect(() => {
    if (selectedDate && currentStep === 2) {
      const fetchBookedSlots = async () => {
        try {
          if (!token) {
            console.log('[agendar] Deferring fetchBookedSlots: token not ready')
            return
          }

          const yyyy = selectedDate.getFullYear()
          const mm = String(selectedDate.getMonth() + 1).padStart(2, '0')
          const dd = String(selectedDate.getDate()).padStart(2, '0')
          const appointmentDate = `${yyyy}-${mm}-${dd}`

          const res = await fetch(`${API_BASE_URL}/appointments/booked?date=${appointmentDate}`, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
          })

          if (!res.ok) throw new Error('Failed to fetch booked slots');
          const appointments = await res.json()
          
          const existingIntervals: { start: number, end: number }[] = []
          appointments?.forEach((data: any) => {
            if (data.status !== 'cancelled' && data.status !== 'rejected') {
              let startMinutes = 0
              let duration = data.total_duration_minutes || 15
              
              if (data.start_time) {
                 const [h, m] = data.start_time.split(':').map(Number)
                 startMinutes = h * 60 + m
              } else if (data.start_time_label) {
                 const [time, modifier] = data.start_time_label.split(' ')
                 let [h, m] = time.split(':').map(Number)
                 if (modifier === 'PM' && h < 12) h += 12
                 if (modifier === 'AM' && h === 12) h = 0
                 startMinutes = h * 60 + (m || 0)
              }
              if (startMinutes > 0) {
                 existingIntervals.push({ start: startMinutes, end: startMinutes + duration })
              }
            }
          })

          // Add admin blocked slots
          const dateAdminBlocks = adminBlockedSlots.filter(s => s.block_date === appointmentDate || s.slot_date === appointmentDate)
          for (const block of dateAdminBlocks) {
            if (block.is_full_day) {
               existingIntervals.push({ start: 0, end: 24 * 60 })
            } else if (block.start_time && block.end_time) {
               const [sh, sm] = block.start_time.split(':').map(Number)
               const [eh, em] = block.end_time.split(':').map(Number)
               existingIntervals.push({ start: sh * 60 + sm, end: eh * 60 + em })
            }
          }

          const currentlySelectedDuration = getTotalDuration() || 15
          const timeSlots = [
            "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
            "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
            "6:00 PM", "7:00 PM", "8:00 PM"
          ]

          const slots: string[] = []
          for (const label of timeSlots) {
             const [time, modifier] = label.split(' ')
             let [h, m] = time.split(':').map(Number)
             if (modifier === 'PM' && h < 12) h += 12
             if (modifier === 'AM' && h === 12) h = 0
             const testStart = h * 60 + (m || 0)
             const testEnd = testStart + currentlySelectedDuration

             const overlap = existingIntervals.some(inv => testStart < inv.end && testEnd > inv.start)
             if (overlap) {
                slots.push(label)
             }
          }
          setBookedSlots(slots)
        } catch (err: any) {
          console.error("Error fetching booked slots from Supabase", err.message || err)
        }
      }
      fetchBookedSlots()
    }
  }, [selectedDate, currentStep, cartItems, services, token]) // Dependencies to recalculate when cart items duration change

  // Fetch services, booking status, and blocked slots on mount
  useEffect(() => {
    fetchServices()
    fetchBookingStatus()
    fetchAdminBlockedSlots()
  }, [])

  const fetchAdminBlockedSlots = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/block-slots`, { cache: 'no-store' })
      if (res.ok) {
        setAdminBlockedSlots(await res.json())
      }
    } catch (err) { }
  }

  const fetchBookingStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/booking-status`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setIsBookingEnabled(data.enabled)
      }
    } catch (err) {
      console.warn("Could not fetch booking status", err)
    }
  }

  // Fetch cart items (preselect services) when token/user available
  // useEffect(() => {
  //   const fetchCart = async () => {
  //     try {
  //       const tokenValue = token || localStorage.getItem('vegas_token')
  //       if (!tokenValue) return
  //       const res = await fetch(`${API_BASE_URL}/cart`, {
  //         headers: { Authorization: `Bearer ${tokenValue}` },
  //       })
  //       if (!res.ok) return
  //       const data = await res.json()
  //       // data is expected to be array of cart items with services object
  //       const ids = data.map((item: any) => item.services?.id).filter(Boolean)
  //       setSelectedServices(ids)
  //     } catch (err) {
  //       console.error('Error fetching cart:', err)
  //     }
  //   }

  //   fetchCart()
  // }, [token])

  // Check login status and set step
  useEffect(() => {
    const hasToken = token || localStorage.getItem('vegas_token')
    const hasUser = user || localStorage.getItem('vegas_user')

    if (hasToken && hasUser) {
      setIsLoggedIn(true)
      const parsedUser = typeof hasUser === 'string' ? JSON.parse(hasUser) : hasUser
      if (!parsedUser.phone) {
        setIsPhoneRequiredOpen(true)
        setCurrentStep(0)
      } else {
        setCurrentStep(1)
      }
    } else {
      setIsLoggedIn(false)
      setCurrentStep(0)
    }
  }, [token, user])

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/services`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setServices(data)
        return
      }
      throw new Error("Backend failed to fetch services")
    } catch (error) {
      console.warn('[v0] Error fetching live services, falling back to local static data:', error)
      const mappedServices = localServices.map(s => ({
        id: s.id,
        name: s.name,
        price: s.price,
        duration_minutes: s.duration,
        type: s.type === "package" ? "combo" as const : "individual" as const,
        descriptions: s.features || [s.description],
        is_active: true,
        created_at: new Date().toISOString(),
        image: null
      }))
      setServices(mappedServices)
    }
  }

  const handleServiceToggle = async (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    if (!service) return

    const existsInCart = cartItems.some((item) => item.id === serviceId)

    try {
      setServiceToggleLoading(true)

      if (existsInCart) {
        await removeItem(serviceId)
      } else {
        await addItem({
          id: service.id,
          name: service.name,
          price: service.price,
          duration_minutes: service.duration_minutes,
          type: service.type,
        })
      }
    } catch (err) {
      console.error("Failed to toggle service:", err)
    } finally {
      setServiceToggleLoading(false)
    }
  }


  const handleContinueToDateTime = () => {
    if (selectedServices.length > 0) {
      setCurrentStep(2)
    }
  }

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    setIsLoginOpen(false)
    // The useEffect will handle redirecting to Step 1 or showing PhoneRequirementModal
  }

  const handleBack = () => {
    setCurrentStep(1)
  }

  const handleConfirm = async () => {
    const tokenValue = token || localStorage.getItem('vegas_token')
    if (!selectedDate || !selectedTime || !tokenValue) return

    setBookingLoading(true)
    setError(null)

    try {
      const yyyy = selectedDate.getFullYear()
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const dd = String(selectedDate.getDate()).padStart(2, '0')
      const appointmentDate = `${yyyy}-${mm}-${dd}`

      // ========== COLLISION CHECK ==========
      const collisionCheckPromise = (async () => {
        const res = await fetch(`${API_BASE_URL}/appointments/booked?date=${appointmentDate}`, {
          headers: {
            'Authorization': `Bearer ${tokenValue}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch booked slots');
        const appointments = await res.json();

        let testStart = 0
        const currentlySelectedDuration = getTotalDuration() || 15

        if (selectedTime.includes('AM') || selectedTime.includes('PM')) {
          const [time, modifier] = selectedTime.split(' ')
          let [hours, minutes] = time.split(':')
          let hoursNum = parseInt(hours)
          if (modifier === 'PM' && hoursNum < 12) hoursNum += 12
          if (modifier === 'AM' && hoursNum === 12) hoursNum = 0
          testStart = hoursNum * 60 + parseInt(minutes || '0')
        }
        const testEnd = testStart + currentlySelectedDuration

        // Client-side overlap filter 
        const conflict = appointments?.some(data => {
          if (data.status === 'cancelled' || data.status === 'rejected') return false
          
          let startMinutes = 0
          let duration = data.total_duration_minutes || 15
          
          if (data.start_time) {
             const [h, m] = data.start_time.split(':').map(Number)
             startMinutes = h * 60 + m
          } else if (data.start_time_label) {
             const [time, modifier] = data.start_time_label.split(' ')
             let [h, m] = time.split(':').map(Number)
             if (modifier === 'PM' && h < 12) h += 12
             if (modifier === 'AM' && h === 12) h = 0
             startMinutes = h * 60 + (m || 0)
          }

          if (startMinutes > 0) {
             const existingEnd = startMinutes + duration
             return testStart < existingEnd && testEnd > startMinutes
          }
          return false
        })

        if (conflict) return { conflict, snapshot: appointments }

        // Admin Block Filter Check
        const dateAdminBlocks = adminBlockedSlots.filter(s => s.block_date === appointmentDate || s.slot_date === appointmentDate)
        const blockConflict = dateAdminBlocks.some(block => {
          if (block.is_full_day) return true;
          if (block.start_time && block.end_time) {
             const [sh, sm] = block.start_time.split(':').map(Number)
             const [eh, em] = block.end_time.split(':').map(Number)
             const blockStart = sh * 60 + sm
             const blockEnd = eh * 60 + em
             return testStart < blockEnd && testEnd > blockStart
          }
          return false
        })

        return { conflict: blockConflict, snapshot: appointments }
      })()

      // Add 5-second timeout to prevent infinite hang
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      )

      let conflict = false
      try {
        const result = await Promise.race([collisionCheckPromise, timeoutPromise])
        conflict = result.conflict

        if (conflict) {
          setSelectedTime("")
          setBookingLoading(false)
          setError('¡Este horario se superpone con una reserva existente! Por favor selecciona otro.')
          return
        }
      } catch (checkErr) {
        console.warn('[booking] Collision check failed, proceeding:', checkErr)
      }
      // ========== END COLLISION CHECK ==========

      // Parse time (assuming format like "2:00 PM" or "14:00")
      let startTime = selectedTime
      if (selectedTime.includes('AM') || selectedTime.includes('PM')) {
        // Convert 12-hour format to 24-hour format
        const [time, modifier] = selectedTime.split(' ')
        let [hours, minutes] = time.split(':')
        let hoursNum = parseInt(hours)

        if (modifier === 'PM' && hoursNum < 12) hoursNum += 12
        if (modifier === 'AM' && hoursNum === 12) hoursNum = 0

        startTime = `${hoursNum.toString().padStart(2, '0')}:${minutes || '00'}`
      }

      // Calculate end time based on total duration
      const totalMinutes = getTotalDuration()
      const [startHour, startMinute] = startTime.split(':').map(Number)
      const endDate = new Date()
      endDate.setHours(startHour, startMinute + totalMinutes, 0)
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`

      const userJSON = localStorage.getItem('vegas_user')
      const userInfo = userJSON ? JSON.parse(userJSON) : {}

      const res = await fetch(`${API_BASE_URL}/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenValue}`
        },
        body: JSON.stringify({
          appointment_date: appointmentDate,
          start_time: startTime,
          end_time: endTime
        })
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Failed to book appointment')
      }

      await clearCart();
      
      const appointmentObj = {
        appointment_date: appointmentDate,
        start_time_label: selectedTime,
        start_time: startTime,
        end_time: endTime,
        total_duration_minutes: totalMinutes,
        services: selectedServices.map(id => getServiceName(id)),
        userEmail: userInfo.email || 'usuario@gmail.com',
        userName: userInfo.name || 'Usuario',
        userPhone: userInfo.phone || userInfo.telefono || '',
        status: 'pending',
        total_price: totalPrice
      }

      setAppointmentDetails(appointmentObj)
      setCurrentStep(3)
      setIsConfirmationOpen(true)

    } catch (error) {
      console.error('[v0] Error booking appointment:', error)
      setError('Error al reservar la cita. Por favor intenta de nuevo.')
    } finally {
      setBookingLoading(false)
    }
  }

  const getTotalDuration = () => {
    return selectedServices.reduce((sum, id) => {
      const service = services.find((s) => s.id === id)
      return sum + (service?.duration_minutes || 0)
    }, 0)
  }

  const getServiceName = (id: string) => {
    return services.find((s) => s.id === id)?.name || id
  }

  const totalPrice = selectedServices.reduce((sum, id) => {
    const service = services.find((s) => s.id === id)
    return sum + (service?.price || 0)
  }, 0)

  const formatDate = (date: Date | null) => {
    if (!date) return ""
    return date.toLocaleDateString("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  const formatTime = (time: string) => {
    // Convert 24-hour format to 12-hour format for display
    if (!time) return ""
    if (time.includes('AM') || time.includes('PM')) return time

    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header
          onCartClick={() => setIsCartOpen(true)}
          onLoginClick={() => setIsLoginOpen(true)}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => setError(null)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
        <Footer />
        <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={handleLoginSuccess} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {serviceToggleLoading && <FullScreenLoader />}
      <Header
        onCartClick={() => setIsCartOpen(true)}
        onLoginClick={() => setIsLoginOpen(true)}
      />

      {/* Step Indicator Section */}
      <section className="bg-white w-full border-b border-gray-100 min-h-[160px] md:h-[244px] py-8 md:py-0">
        <div className="container mx-auto max-w-6xl h-full flex items-center justify-center">
          <StepIndicator currentStep={currentStep} />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          {currentStep === 0 && (
            <div className="text-center py-12">
              <h2 className="text-3xl font-bold mb-4">
                Inicia sesión para agendar tu cita
              </h2>
              <p className="text-muted-foreground mb-8">
                Necesitas estar autenticado para reservar tu cita
              </p>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all duration-300 text-black"
                style={{
                  background: "#FDB400",
                  border: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(180deg, #7B9A2D -72.56%, #1A2722 100%)"
                  e.currentTarget.style.color = "white"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#FDB400"
                  e.currentTarget.style.color = "black"
                }}
              >
                Inicia sesión
              </button>
            </div>
          )}

          {currentStep === 1 && isLoggedIn && !isBookingEnabled && (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm border p-8 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-[#FDB400]" />
              </div>
              <h2 className="text-2xl font-bold mb-4">
                Agenda Cerrada Temporalmente
              </h2>
              <p className="text-muted-foreground">
                Por el momento, no estamos aceptando nuevas reservas online. 
                Por favor, inténtalo de nuevo más tarde o contáctanos directamente.
              </p>
            </div>
          )}

          {currentStep === 1 && isLoggedIn && isBookingEnabled && (
            <ServiceSelection
              services={services}
              selectedServices={selectedServices}
              onServiceToggle={handleServiceToggle}
              onContinue={handleContinueToDateTime}
            />
          )}

          {currentStep === 2 && isLoggedIn && (
            <div className="w-full">
              <DateTimeSelection
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                selectedServices={selectedServices.map(id => getServiceName(id))}
                totalDuration={getTotalDuration()}
                onDateChange={setSelectedDate}
                onTimeChange={setSelectedTime}
                onBack={handleBack}
                onConfirm={handleConfirm}
                loading={bookingLoading}
                bookedSlots={bookedSlots}
              />
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* Modals */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={handleLoginSuccess} />
      <PhoneRequirementModal 
        isOpen={isPhoneRequiredOpen} 
        onClose={() => {
          setIsPhoneRequiredOpen(false)
          if (!user?.phone) {
             // If they skip, they stay in Step 0 and can't proceed
          }
        }} 
        onSuccess={() => {
          setIsPhoneRequiredOpen(false)
          setCurrentStep(1)
        }} 
      />
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => {
          setIsConfirmationOpen(false)
          router.push('/')
        }}
        services={appointmentDetails?.services || selectedServices.map(id => getServiceName(id))}
        date={formatDate(selectedDate)}
        time={formatTime(selectedTime)}
        appointmentDetails={appointmentDetails}
        price={appointmentDetails?.total_price || totalPrice}
      />
    </div>
  )
}
