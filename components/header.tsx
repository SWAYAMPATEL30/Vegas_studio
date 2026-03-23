"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { User, Menu, X } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"

interface HeaderProps {
  onCartClick?: () => void
  onLoginClick?: () => void
}

export function Header({ onCartClick }: HeaderProps) {
  const { items } = useCart()
  const { user, role, logout } = useAuth()
  const itemCount = items.length

  const isLoggedIn = Boolean(user || role === 'admin')

  const [open, setOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <header className="border-b border-border/30 relative" style={{ background: 'var(--header-bg, var(--background-custom))' }}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Left side: Logo */}
        <div className="flex items-center gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/horizontal-negativo.svg"
              alt="Vegas Estudio"
              width={160}
              height={89}
              className="w-28 md:w-[160px] h-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/servicios" className="text-foreground hover:text-primary transition-colors">
            Servicios
          </Link>
          <Link href="/#ubicacion" className="text-foreground hover:text-primary transition-colors">
            Ubicación
          </Link>
          {isLoggedIn && (
            <Link href="/myappointments" className="text-foreground hover:text-primary transition-colors">
              Mis citas
            </Link>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Cart */}
          <button
            onClick={onCartClick}
            className="relative flex items-center justify-center transition-all duration-300 mr-2 md:mr-0"
            style={{ width: '45px', height: '22px', padding: '2px' }}
          >
            <Image
              src="/icons/Shopping.svg"
              alt="Carrito"
              width={55}
              height={70}
              className="w-[45px] md:w-[55px] h-auto"
            />
            <span
              className="absolute flex items-center justify-center text-white font-medium"
              style={{
                width: '18px',
                height: '19px',
                right: '0px',
                top: '-5px',
                borderRadius: '50%',
                fontSize: '11px',
                backgroundColor: '#99060D',
              }}
            >
              {itemCount}
            </span>
          </button>

          {/* AUTH SECTION (Desktop Only text, Mobile User icon) */}
          {!isLoggedIn ? (
            // LOGIN BUTTON
            <Link
              href="/auth"
              className="flex items-center justify-center whitespace-nowrap transition-all duration-300 md:ml-0 rounded-[10px]"
              style={{ padding: '8px' }}
            >
              <span className="hidden md:inline font-medium text-sm">Iniciar sesión</span>
              <User className="w-5 h-5 md:hidden" style={{ color: '#FDB400' }} />
            </Link>
          ) : (
            // PROFILE DROPDOWN
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition"
              >
                <User className="w-5 h-5" style={{ color: '#FDB400' }} />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setOpen(false)}
                    >
                      Panel de Control
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setOpen(false)}
                  >
                    Perfil
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false)
                      logout()
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CTA Button */}
          <Link
            href="/agendar"
            className="flex items-center gap-[6px] rounded-[10px] transition-all duration-300 font-medium whitespace-nowrap px-3 h-10 text-sm ml-1"
            style={{ backgroundColor: '#FDB400', color: '#1A2722' }}
          >
            <Image src="/icons/CALENDAR.svg" alt="" width={20} height={20} className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden md:inline">Agendar cita</span>
          </Link>

          {/* Mobile Hamburger */}
          <button 
            className="md:hidden p-1 ml-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-7 h-7" style={{ color: '#FDB400' }} /> : <Menu className="w-7 h-7" style={{ color: '#FDB400' }} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-md z-50 flex flex-col py-2">
          <Link 
            href="/" 
            className="px-6 py-3 text-gray-800 hover:bg-gray-50 border-b border-gray-100 font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/servicios" 
            className="px-6 py-3 text-gray-800 hover:bg-gray-50 border-b border-gray-100 font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Servicios
          </Link>
          <Link 
            href="/#ubicacion" 
            className="px-6 py-3 text-gray-800 hover:bg-gray-50 border-b border-gray-100 font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Ubicación
          </Link>
          {isLoggedIn && (
            <Link 
              href="/myappointments" 
              className="px-6 py-3 text-gray-800 hover:bg-gray-50 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Mis citas
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
