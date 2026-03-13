"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from 'next/navigation'
import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore"
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
  const { items: cartItems, addItem, removeItem } = useCart()

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

  useEffect(() => {
    if (selectedDate && currentStep === 2) {
      const fetchBookedSlots = async () => {
        try {
          const appointmentDate = selectedDate.toISOString().split('T')[0]
          const q = query(collection(db, 'appointments'), where('appointment_date', '==', appointmentDate))
          const snapshot = await getDocs(q)
          const slots: string[] = []
          snapshot.forEach(doc => {
            const data = doc.data()
            if (data.start_time_label) {
              slots.push(data.start_time_label)
            }
          })
          setBookedSlots(slots)
        } catch (err) {
          console.error("Error fetching booked slots from firebase", err)
        }
      }
      fetchBookedSlots()
    }
  }, [selectedDate, currentStep])

  // Fetch services on mount
  useEffect(() => {
    fetchServices()
  }, [])

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
      setCurrentStep(1)
    } else {
      setIsLoggedIn(false)
      setCurrentStep(0)
    }
  }, [token, user])

  const fetchServices = async () => {
    try {
      // Use local static services data instead of an offline backend
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
    } catch (error) {
      console.error('[v0] Error fetching services:', error)
      setError('Error al cargar los servicios')
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
    setCurrentStep(1)
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
      // Format date and time for API
      const appointmentDate = selectedDate.toISOString().split('T')[0]

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

      // Write directly to Firebase
      const appointmentObj = {
        appointment_date: appointmentDate,
        start_time_label: selectedTime,
        start_time: startTime,
        end_time: endTime,
        total_duration_minutes: totalMinutes,
        services: selectedServices.map(id => getServiceName(id)),
        userEmail: userInfo.email || 'usuario@gmail.com',
        userName: userInfo.name || 'Usuario',
        timestamp: Timestamp.now()
      }

      await addDoc(collection(db, 'appointments'), appointmentObj);

      // set appointment details to show in confirmation modal
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
      <section className="bg-white w-full" style={{ height: "244px" }}>
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

          {currentStep === 1 && isLoggedIn && (
            <ServiceSelection
              services={services}
              selectedServices={selectedServices}
              onServiceToggle={handleServiceToggle}
              onContinue={handleContinueToDateTime}
            />
          )}

          {currentStep === 2 && isLoggedIn && (
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
          )}
        </div>
      </section>

      <Footer />

      {/* Modals */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={handleLoginSuccess} />
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => {
          setIsConfirmationOpen(false)
          router.push('/')
        }}
        services={selectedServices.map(id => getServiceName(id))}
        date={formatDate(selectedDate)}
        time={formatTime(selectedTime)}
        appointmentDetails={appointmentDetails}
        price={totalPrice}
      />
    </div>
  )
}