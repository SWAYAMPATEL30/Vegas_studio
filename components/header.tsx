"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { User } from "lucide-react"
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
    <header className="border-b border-border/30" style={{ background: 'var(--header-bg, var(--background-custom))' }}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/horizontal-negativo.svg"
            alt="Vegas Estudio"
            width={160}
            height={89}
            className="w-32 md:w-[160px] h-auto object-contain"
            priority
          />
        </Link>

        {/* Navigation */}
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
              mis citas
            </Link>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <button
            onClick={onCartClick}
            className="relative flex items-center justify-center transition-all duration-300"
            style={{ width: '55px', height: '22px', padding: '2px' }}
          >
            <Image
              src="/icons/Shopping.svg"
              alt="Carrito"
              width={55}
              height={70}
              style={{ width: '55px', height: 'auto' }}
            />
            <span
              className="absolute flex items-center justify-center text-white font-medium"
              style={{
                width: '18px',
                height: '19px',
                right: '5px',
                top: '-5px',
                borderRadius: '50%',
                fontSize: '12px',
                backgroundColor: '#99060D',
              }}
            >
              {itemCount}
            </span>
          </button>

          {/* AUTH SECTION */}
          {!isLoggedIn ? (
            // LOGIN BUTTON
            <Link
              href="/auth"
              className="flex items-center justify-center whitespace-nowrap transition-all duration-300"
              style={{
                padding: '10px',
                borderRadius: '10px',
                fontSize: '14px',
              }}
            >
              Iniciar sesión
            </Link>
          ) : (
            // PROFILE DROPDOWN
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition"
              >
                <User className="w-5 h-5 text-gray-700" />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
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
            className="header-agendar-btn flex items-center gap-[6px] rounded-[10px] transition-all duration-300 font-medium whitespace-nowrap px-4 h-10 text-sm"
          >
            <Image src="/icons/CALENDAR.svg" alt="" width={20} height={20} className="header-calendar-icon" />
            <span className="hidden sm:inline">Agendar cita</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
