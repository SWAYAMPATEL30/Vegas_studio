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
  
  const { addItem, items } = useCart()
  const itemCount = items.length
  const { token } = useAuth()

  // Fetch services on mount
  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/services`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setServices(data)
        return
      }
      throw new Error("Backend failed to list services")
    } catch (error) {
      console.warn('[v0] Error fetching live services:', error)
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
      
      // Use cart context's addItem which handles backend fallback
      await addItem({
        id: service.id,
        name: service.name,
        price: service.price,
      })

      // Show floating notification
      showCartNotification()

    } catch (error) {
      console.error('[v0] Error adding to cart:', error)
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

  // Filter services by type and priority
  const priorityNames = ["Clásico", "Vegas Pro", "Premium"]
  const priorityCombos = services.filter(s => s.type === 'combo' && s.is_active && priorityNames.includes(s.name))
  // All other active services (including non-priority combos)
  const gridServices = services.filter(s => s.is_active && !priorityCombos.some(pc => pc.id === s.id))

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
          {priorityCombos.map((combo, index) => (
            <div 
              key={combo.id}
              className="grid grid-cols-1 md:grid-cols-2 mb-16 items-center" 
              style={{ gap: '2rem' }}
            >
              {/* Image - alternates left/right based on index */}
              <div className={`${index % 2 === 1 ? 'md:order-2' : ''} aspect-square rounded-2xl overflow-hidden relative w-full max-w-[400px] ${index % 2 === 1 ? 'md:ml-auto' : ''}`}>
                <Image
                  src={combo.image || comboImages[index % comboImages.length]}
                  alt={combo.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Content */}
              <div className={`${index % 2 === 1 ? 'md:order-1' : ''} p-4 md:p-8`}>
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src={getServiceIcon(combo.id) || "/placeholder.svg"}
                    alt=""
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                  <h2 className="text-2xl font-bold">{combo.name}</h2>
                  <span className="border border-border px-3 py-1 rounded text-xs opacity-80">
                    {combo.duration_minutes} min
                  </span>
                </div>
                
                {/* Fixed Description Repeats and Truncation */}
                <div className="mb-6">
                  <ul className="text-sm space-y-2 text-muted-foreground uppercase tracking-tight">
                    {combo.descriptions.map((desc, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="w-[5px] h-[5px] rounded-full bg-primary mt-[9px] flex-shrink-0" />
                        <span>{desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(combo.price)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(combo)}
                    disabled={addingToCart === combo.id}
                    className="plus-btn w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50"
                    style={{ background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), #9AC138', padding: '9px' }}
                  >
                    {addingToCart === combo.id ? (
                      <div className="w-[18px] h-[18px] border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus className="plus-btn-icon w-[18px] h-[18px] text-white transition-colors duration-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {priorityCombos.length === 0 && (
            <p className="text-center text-muted-foreground">No hay paquetes disponibles</p>
          )}
        </div>
      </section>

      {/* Individual Services */}
      <section className="py-16" style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', paddingRight: '50px', paddingLeft: '50px' }}>
        <h2 className="text-3xl font-bold text-center mb-12">Otros servicios</h2>

        {/* All cards in a single grid: 3 columns, gap 55px */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-10 justify-items-center" style={{ gap: "40px 55px", alignContent: "flex-start", alignItems: "stretch" }}>
          {gridServices.map((service) => (
            <div
              key={service.id}
              className="service-card cursor-pointer flex flex-col bg-card overflow-hidden group"
              style={{
                width: '100%',
                maxWidth: '360px',
                minHeight: '280px',
                borderRadius: '12px',
                border: '1px solid #7B9A2D',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Optional Image */}
              {service.image && (
                <div className="relative w-full h-40 overflow-hidden border-b border-[#7B9A2D]">
                  <Image 
                    src={service.image} 
                    alt={service.name} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                </div>
              )}

              <div className="flex flex-col flex-1 p-6 relative">
                {/* Top row: icon + name + price badge */}
                <div className="flex items-start justify-between gap-3 w-full mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
                      <Image
                        src={getServiceIcon(service.id) || "/icons/Scissors.svg"}
                        alt=""
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                    <span className="font-bold text-white break-words line-clamp-1 capitalize" style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', lineHeight: '24px' }}>
                      {service.name}
                    </span>
                  </div>
                </div>

                <span className="inline-block rounded-full w-fit mb-4" style={{ background: 'rgba(154, 193, 56, 0.1)', border: '1px solid #9AC138', padding: '4px 12px' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#9AC138' }}>
                    {formatPrice(service.price)}
                  </span>
                </span>

                {/* Description handling Long items */}
                <div className="text-sm space-y-2 mb-6 text-[#DFE1D5] overflow-hidden flex-1">
                    <ul className="space-y-1">
                      {service.descriptions.map((desc, idx) => (
                        <li 
                          key={idx} 
                          className={`flex items-start gap-2 ${idx > 1 ? 'hidden group-hover:flex' : 'flex'}`}
                        >
                          <div className="w-[5px] h-[5px] rounded-full bg-primary mt-[9px] flex-shrink-0" />
                          <span className="line-clamp-2">{desc}</span>
                        </li>
                      ))}
                    </ul>
                   {service.descriptions.length > 2 && (
                     <div className="text-[10px] text-primary/80 group-hover:hidden mt-2 ml-5">Ver más...</div>
                   )}
                </div>

                {/* Spacer */}
                <div className="mt-auto" />

                {/* Bottom row: duration + plus button */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#9AC138]" />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#DFE1D5' }}>
                      {service.duration_minutes}{" min"}
                    </span>
                  </span>
                  <button
                    onClick={() => handleAddToCart(service)}
                    disabled={addingToCart === service.id}
                    className="plus-btn w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 disabled:opacity-50 hover:scale-110 active:scale-95"
                    style={{ background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), #9AC138' }}
                  >
                    {addingToCart === service.id ? (
                      <div className="w-[16px] h-[16px] border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus className="plus-btn-icon w-[16px] h-[16px] text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {gridServices.length === 0 && (
            <p className="text-center text-muted-foreground col-span-full py-12">
              No hay servicios disponibles
            </p>
          )}
        </div>

        {/* Continue button */}
        <div className="text-center mt-12">
          <Link
            href="/agendar"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl hover:bg-primary/90 transition-all font-bold shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
          >
            Continuar con la reserva
            <span className="text-lg">{"→"}</span>
          </Link>
        </div>
      </section>

      {/* Floating Success Notification */}
      <div 
        id="cart-notification"
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 opacity-0 translate-y-10"
      >
        <div className="bg-[#9AC138] text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-1">
             <Plus className="w-4 h-4" />
          </div>
          <span className="font-medium">¡Servicio agregado al carrito!</span>
        </div>
      </div>

      {/* Mobile Floating Cart Preview */}
      <div 
        className="fixed bottom-6 right-6 z-40 md:hidden"
        onClick={() => setIsCartOpen(true)}
      >
        <button className="bg-primary text-black w-14 h-14 rounded-full shadow-2xl flex items-center justify-center relative">
           <Image src="/icons/Shopping.svg" width={24} height={24} alt="Cart" />
           <span className="absolute -top-1 -right-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-background">
             {itemCount}
           </span>
        </button>
      </div>

      <Footer />

      {/* Modals */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      {/* Success Notification Trigger script hack (for demo) */}
      <style jsx>{`
        .notification-active {
          opacity: 1 !important;
          transform: translateY(0) translateX(-50%) !important;
        }
      `}</style>
    </div>
  )
}

// Logic extension for the notification
const showCartNotification = () => {
  const el = document.getElementById('cart-notification');
  if (!el) return;
  el.classList.add('notification-active');
  setTimeout(() => el.classList.remove('notification-active'), 3000);
}