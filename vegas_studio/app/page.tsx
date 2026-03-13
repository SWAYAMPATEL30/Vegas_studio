"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Clock, Plus } from "lucide-react"
import { getServiceIcon } from "@/lib/service-icons"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartModal } from "@/components/cart-modal"
import { LoginModal } from "@/components/login-modal"
import { useCart } from "@/lib/cart-context"
import { services, formatPrice } from "@/lib/services-data"

export default function HomePage() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const { addItem } = useCart()
  const packages = services.filter((s) => s.type === "package")

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        onCartClick={() => setIsCartOpen(true)}
        onLoginClick={() => setIsLoginOpen(true)}
      />

      {/* Hero Section */}
      <section
        className="relative flex items-center justify-center"
        style={{ width: "100%", maxWidth: "1440px", height: "525px", margin: "0 auto", padding: "44px 80px" }}
      >
        <div className="absolute inset-0">
          <Image src="/images/IMG-HOME-1.png" alt="Vegas Estudio barbershop" fill className="object-cover" style={{ objectPosition: "center 20%" }} priority />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 uppercase tracking-wider" style={{ fontFamily: "serif" }}>
            El lugar exclusivo<br />para ti.
          </h1>
          <p className="text-xl text-white mb-8">{"Corte y barba con atenci\u00f3n personalizada."}</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/agendar" className="hero-agendar-btn flex items-center justify-center gap-[6px] rounded-[10px] transition-all duration-300 font-medium whitespace-nowrap" style={{ minWidth: "132.5px", height: "40px", padding: "10px", fontSize: "14px", lineHeight: "20px", fontFamily: "Inter, sans-serif" }}>
                  <Image src="/icons/CALENDAR.svg" alt="" width={20} height={20} className="flex-shrink-0" style={{ width: "20px", height: "20px" }} />
              <span className="whitespace-nowrap">Agendar cita</span>
            </Link>
            <Link href="/servicios" className="hero-servicios-btn flex items-center justify-center transition-all duration-300 font-medium whitespace-nowrap" style={{ width: "82px", height: "40px", padding: "10px", fontSize: "14px", lineHeight: "20px", fontFamily: "Inter, sans-serif" }}>
              Servicios
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">Nuestros servicios</h2>
          <p className="text-center text-muted-foreground mb-12">Servicios pensados para distintas necesidades.<br />Elige el que mejor vaya contigo y agenda tu espacio.</p>

          {/* Service Cards - 344x441 with padding 28/26/40/26 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[19px] mb-8 justify-items-center items-start">
            {packages.map((service) => (
              <div key={service.id} className="home-service-card group relative rounded-[10px] cursor-pointer flex flex-col" style={{ width: "344px", height: "441px", paddingTop: "28px", paddingRight: "26px", paddingBottom: "40px", paddingLeft: "26px", borderRadius: "10px" }}>
                <div style={{ flex: "0 0 60px" }} />
                <div className="flex items-center gap-[7px] flex-wrap justify-start">
                  <Image src={getServiceIcon(service.id) || "/placeholder.svg"} alt="" width={32} height={32} className="w-8 h-8 flex-shrink-0" />
                  <h3 className="font-semibold text-white flex-shrink-0" style={{ fontFamily: "Inter, sans-serif", fontSize: "24px", lineHeight: "32px", fontWeight: 600 }}>{service.name}</h3>
                  <span className="duration-badge-default inline-flex items-center justify-center whitespace-nowrap flex-shrink-0">
                    <Clock className="w-[10px] h-[10px] text-white" />
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 500, lineHeight: "16px", color: "#FFFFFF" }}>{"Duraci\u00f3n: "}{service.duration}{" min"}</span>
                  </span>
                </div>
                <div className="flex-1 mt-[19px]" style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 400, lineHeight: "20px", color: "#FFFFFF" }}>
                  <ul className="space-y-1">
                    {service.features?.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="flex-shrink-0 mt-0.5">{"\u2022"}</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="rounded-[6px] flex items-center justify-center" style={{ border: "1px solid #9AC138", padding: "6px 14px" }}>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 500, color: "#FFFFFF", whiteSpace: "nowrap" }}>{formatPrice(service.price)}</span>
                  </span>
                  <button
                    onClick={(e) => { e.preventDefault(); addItem({ id: service.id, name: service.name, price: service.price }) }}
                    className="plus-btn w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0"
                    style={{ background: "linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), #9AC138", padding: "9px" }}
                  >
                    <Plus className="plus-btn-icon w-[16px] h-[16px] text-white transition-colors duration-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/servicios" className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all duration-300 text-black" style={{ background: "#FDB400", border: "none" }} onMouseEnter={(e) => { e.currentTarget.style.background = "linear-gradient(180deg, #7B9A2D -72.56%, #1A2722 100%)"; e.currentTarget.style.color = "white" }} onMouseLeave={(e) => { e.currentTarget.style.background = "#FDB400"; e.currentTarget.style.color = "black" }}>
              {"Ver m\u00e1s servicios"}<span className="text-lg">{"\u2192"}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="ubicacion" className="py-16 px-4 relative overflow-hidden" style={{ backgroundColor: "#D9D9D9", backgroundImage: "url(/images/ubicacion-fondo.png)", backgroundSize: "cover", backgroundPosition: "center top", backgroundRepeat: "no-repeat" }}>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="rounded-lg overflow-hidden relative" style={{ width: "100%", maxWidth: "933px", height: "539px" }}>
              <Image src="/images/IMG-UBICACION-2.png" alt="Vegas Estudio location" fill className="object-cover" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2 text-[#1A2722]">{"Ca\u00e9 al estudio cuando"}<br />lo necesites.</h2>
              <p className="text-orange-500 mb-6">{"\u00a1Aqu\u00ed te esperamos!"}</p>
              <div className="mb-6"><span className="inline-block bg-[#1A2722] text-white px-4 py-2 rounded-md text-sm">Calle 76 #63-58</span></div>
              <div className="h-48 bg-white rounded-lg mb-6 flex items-center justify-center border border-gray-300"><span className="text-gray-400 text-sm">Map Placeholder</span></div>
              <Link href="/agendar" className="ubicacion-agendar-btn inline-flex items-center justify-center gap-[6px] rounded-[10px] transition-all duration-300 font-medium" style={{ width: "132.5px", height: "40px", padding: "10px", backgroundColor: "#FDB400", color: "#1A2722", fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 500, lineHeight: "20px" }}>
            <Image src="/icons/CALENDAR.svg" alt="" width={20} height={20} className="flex-shrink-0" style={{ width: "20px", height: "20px" }} />
                <span className="whitespace-nowrap">Agendar cita</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  )
}
