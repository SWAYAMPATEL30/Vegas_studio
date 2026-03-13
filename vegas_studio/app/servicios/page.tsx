"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Clock, Plus } from "lucide-react"
import { getServiceIcon } from "@/lib/service-icons"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartModal } from "@/components/cart-modal"
import { LoginModal } from "@/components/login-modal"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { API_BASE_URL } from "@/lib/api"

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

// Dummy images for combo services
const comboImages = [
  "/images/IMAGEN.png",
  "/images/IMAGEN-1.png",
  "/images/IMAGEN-2.png",
]

export default function ServiciosPage() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  
  const { addItem } = useCart()
  const { token } = useAuth()

  // Fetch services on mount
  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/services`)
      if (!response.ok) throw new Error('Failed to fetch services')
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error('[v0] Error fetching services:', error)
      setError('Error al cargar los servicios')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (service: Service) => {
    if (!token) {
      setIsLoginOpen(true)
      return
    }

    try {
      setAddingToCart(service.id)
      
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceId: service.id
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to add to cart')
      }

      // Add to local cart state
      addItem({
        id: service.id,
        name: service.name,
        price: service.price,
      })

    } catch (error) {
      console.error('[v0] Error adding to cart:', error)
      alert('Error al agregar al carrito')
    } finally {
      setAddingToCart(null)
    }
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Filter services by type
  const comboPackages = services.filter(s => s.type === 'combo' && s.is_active)
  const individualServices = services.filter(s => s.type === 'individual' && s.is_active)

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header
          onCartClick={() => setIsCartOpen(true)}
          onLoginClick={() => setIsLoginOpen(true)}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    )
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
              onClick={fetchServices}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        onCartClick={() => setIsCartOpen(true)}
        onLoginClick={() => setIsLoginOpen(true)}
      />

      {/* Hero Section */}
      <section
        className="relative flex items-center justify-center"
        style={{
          width: '100%',
          maxWidth: '1440px',
          height: '525px',
          margin: '0 auto',
          padding: '44px 80px',
        }}
      >
        <div className="absolute inset-0">
          <Image
            src="/images/IMG-SERVICIOS-1.png"
            alt="Vegas Estudio servicios"
            fill
            className="object-cover"
            style={{ objectPosition: 'center 20%' }}
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'serif' }}>
            Nuestros servicios
          </h1>
        </div>
      </section>

      {/* Package Services */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {comboPackages.map((combo, index) => (
            <div 
              key={combo.id}
              className="grid grid-cols-1 md:grid-cols-2 mb-16 items-center" 
              style={{ gap: '0rem' }}
            >
              {/* Image - alternates left/right based on index */}
              <div className={`${index % 2 === 1 ? 'md:order-2' : ''} aspect-square rounded-2xl overflow-hidden relative w-full max-w-[400px] ${index % 2 === 1 ? 'md:ml-auto' : ''}`}>
                <Image
                  src={comboImages[index % comboImages.length]}
                  alt={combo.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Content */}
              <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src={getServiceIcon(combo.id) || "/placeholder.svg"}
                    alt=""
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                  <h2 className="text-2xl font-bold">{combo.name}</h2>
                  <span className="border border-border px-3 py-1 rounded text-sm">
                    Duración: {combo.duration_minutes} min
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">
                  {combo.descriptions[0]}
                  {combo.descriptions.length > 1 && (
                    <>
                      <br />
                      {combo.descriptions.slice(1).join(', ')}
                    </>
                  )}
                </p>
                <ul className="text-sm space-y-1 mb-4">
                  {combo.descriptions.map((desc, idx) => (
                    <li key={idx}>• {desc}</li>
                  ))}
                </ul>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(combo.price)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(combo)}
                    disabled={addingToCart === combo.id}
                    className="plus-btn w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50"
                    style={{ background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), #9AC138', padding: '9px' }}
                  >
                    {addingToCart === combo.id ? (
                      <div className="w-[14px] h-[14px] border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus className="plus-btn-icon w-[14px] h-[14px] text-white transition-colors duration-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {comboPackages.length === 0 && (
            <p className="text-center text-muted-foreground">No hay paquetes disponibles</p>
          )}
        </div>
      </section>

      {/* Individual Services */}
      <section className="py-16" style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', paddingRight: '50px', paddingLeft: '50px' }}>
        <h2 className="text-3xl font-bold text-center mb-12">Servicios individuales</h2>

        {/* All cards in a single grid: 3 columns, gap 55px */}
        <div className="grid grid-cols-1 md:grid-cols-3 mb-10 justify-items-center" style={{ gap: "55px", alignContent: "flex-start", alignItems: "start" }}>
          {individualServices.map((service) => (
            <div
              key={service.id}
              className="service-card cursor-pointer flex flex-col bg-card overflow-hidden"
              style={{
                width: '344px',
                height: '260px',
                borderRadius: '10px',
                border: '1px solid #7B9A2D',
                padding: '39px',
              }}
            >
              {/* Top row: icon + name + price badge */}
              <div className="flex items-center gap-3 w-full">
                <Image
                  src={getServiceIcon(service.id) || "/placeholder.svg"}
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8 flex-shrink-0"
                />
                <span className="font-bold text-white whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif', fontSize: '22px', lineHeight: '28px' }}>{service.name}</span>
                <span className="rounded-[6px] flex items-center justify-center flex-shrink-0 ml-auto" style={{ border: '1px solid #9AC138', padding: '6px 14px' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                    {formatPrice(service.price)}
                  </span>
                </span>
              </div>

              {/* Description */}
              <p className="mt-4" style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 400, lineHeight: '22px', color: '#DFE1D5' }}>
                {service.descriptions[0]}
              </p>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Bottom row: duration + plus button */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#DFE1D5' }}>
                    {"Duración: "}{service.duration_minutes}{" min"}
                  </span>
                </span>
                <button
                  onClick={() => handleAddToCart(service)}
                  disabled={addingToCart === service.id}
                  className="plus-btn w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 disabled:opacity-50"
                  style={{ background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), #9AC138', padding: '9px' }}
                >
                  {addingToCart === service.id ? (
                    <div className="w-[16px] h-[16px] border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="plus-btn-icon w-[16px] h-[16px] text-white transition-colors duration-300" />
                  )}
                </button>
              </div>
            </div>
          ))}

          {individualServices.length === 0 && (
            <p className="text-center text-muted-foreground col-span-full">
              No hay servicios individuales disponibles
            </p>
          )}
        </div>

        {/* Continue button */}
        <div className="text-center mt-12">
          <Link
            href="/agendar"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Continuar
            <span className="text-lg">{"→"}</span>
          </Link>
        </div>
      </section>

      <Footer />

      {/* Modals */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  )
}