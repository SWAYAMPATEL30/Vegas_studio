"use client"

import Image from "next/image"
import { Clock, Check } from "lucide-react"
import { formatPrice } from "@/lib/services-data"
import { getServiceIcon } from "@/lib/service-icons"
import { useState, useEffect } from "react"

interface ServiceSelectionProps {
  services: Array<{ id: string; name: string; price: number; duration_minutes: number; descriptions?: string[]; type: string }>
  selectedServices: string[]
  onServiceToggle: (serviceId: string) => void
  onContinue: () => void
}

function ServiceCard({
  service,
  isSelected,
  onToggle,
}: {
  service: { id: string; name: string; price: number; duration_minutes: number; descriptions?: string[]; type: string }
  isSelected: boolean
  onToggle: () => void
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className="agendar-service-card relative rounded-[10px] flex flex-col"
        style={{
          width: "330px",
          height: "200px",
          borderRadius: "10px",
          paddingTop: "28px",
          paddingRight: "20px",
          paddingBottom: "28px",
          paddingLeft: "26px",
          gap: "12px",
          background: 'linear-gradient(145deg, #1A2722 0%, #232F2A 100%)',
        }}
      >
        <div className="flex items-center justify-between w-full pr-8">
          <div className="flex items-center gap-[7px]">
            <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" />
            <div className="w-24 h-6 bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="w-16 h-8 bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="w-full h-12 bg-gray-700 rounded animate-pulse mt-2" />
        <div className="w-20 h-4 bg-gray-700 rounded animate-pulse mt-auto" />
      </div>
    )
  }

  return (
    <button
      onClick={onToggle}
      className="agendar-service-card relative rounded-[10px] text-left transition-all duration-300 flex flex-col cursor-pointer group"
      style={{
        width: "330px",
        height: "200px",
        borderRadius: "10px",
        paddingTop: "28px",
        paddingRight: "20px",
        paddingBottom: "28px",
        paddingLeft: "26px",
        gap: "12px",
        border: isSelected ? '2px solid #FDB400' : '1px solid transparent',
        boxShadow: isSelected ? '0 0 15px rgba(253, 180, 0, 0.3)' : 'none',
        background: isSelected
          ? 'linear-gradient(145deg, #1A2722 0%, #2A3732 100%)'
          : 'linear-gradient(145deg, #1A2722 0%, #232F2A 100%)',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {/* Selection Checkbox */}
      <div
        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 z-10"
        style={{
          background: isSelected ? '#FDB400' : 'rgba(255, 255, 255, 0.2)',
          border: isSelected ? '2px solid #FDB400' : '2px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        {isSelected && <Check className="w-4 h-4 text-[#1A2722]" strokeWidth={3} />}
      </div>

      {/* Row 1: icon + title on left, price badge on right */}
      <div className="flex items-center justify-between w-full pr-8">
        <div className="flex items-center gap-[7px]">
          <div className="relative">
            <Image
              src={getServiceIcon(service.id) || "/placeholder.svg"}
              alt=""
              width={32}
              height={32}
              className="w-8 h-8 flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
            />
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FDB400] rounded-full animate-pulse" />
            )}
          </div>
          <h3
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "24px",
              lineHeight: "24px",
              fontWeight: 600,
              color: isSelected ? "#FDB400" : "#FFFFFF",
            }}
          >
            {service.name}
          </h3>
        </div>
        <span
          className="rounded-[6px] flex items-center justify-center flex-shrink-0 transition-all duration-200"
          style={{
            padding: "7px 14px",
            border: isSelected ? "2px solid #FDB400" : "1px solid #9AC138",
            background: isSelected ? 'rgba(253, 180, 0, 0.1)' : 'transparent',
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: "16px",
              color: isSelected ? "#FDB400" : "#FFFFFF",
            }}
          >
            {formatPrice(service.price)}
          </span>
        </span>
      </div>

      {/* Row 2: Description */}
      <p
        className="w-full"
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "16px",
          fontWeight: 400,
          lineHeight: "24px",
          color: isSelected ? "#FFFFFF" : "#DFE1D5",
        }}
      >
        {service.descriptions ? service.descriptions.slice(0, 2).join(' • ') : ''}
        {service.descriptions && service.descriptions.length > 2 && ' ...'}
      </p>

      {/* Row 3: Duration with selected indicator */}
      <div className="flex items-center w-full mt-auto">
        <div className="flex items-center gap-[5px]">
          <Clock
            className="w-[14px] h-[14px] transition-colors duration-200"
            style={{ color: isSelected ? "#FDB400" : "#DFE1D5" }}
          />
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              lineHeight: "16px",
              color: isSelected ? "#FDB400" : "#DFE1D5",
            }}
          >
            {"Duración: "}
            {service.duration_minutes}
            {" min"}
          </span>
        </div>

        {/* Selection indicator text for larger screens */}
        {isSelected && (
          <span
            className="ml-auto text-[10px] font-medium px-2 py-1 rounded-full"
            style={{
              background: 'rgba(253, 180, 0, 0.2)',
              color: '#FDB400',
              border: '1px solid rgba(253, 180, 0, 0.3)'
            }}
          >
            Seleccionado
          </span>
        )}
      </div>

      {/* Selection highlight overlay */}
      {isSelected && (
        <div
          className="absolute inset-0 rounded-[10px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at top right, rgba(253, 180, 0, 0.15), transparent 70%)',
            border: '2px solid rgba(253, 180, 0, 0.3)',
          }}
        />
      )}
    </button>
  )
}

export function ServiceSelection({
  services,
  selectedServices,
  onServiceToggle,
  onContinue,
}: ServiceSelectionProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const packages = services.filter((s) => s.type === "combo")
  const individualServices = services.filter((s) => s.type === "individual")

  // Don't render anything until mounted on client
  if (!mounted) {
    return (
      <div>
        <h2 className="text-3xl font-bold text-center mb-12">
          Elige tus servicios
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 mb-6 justify-items-center" style={{ gap: "13rem" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="agendar-service-card rounded-[10px]"
              style={{
                width: "330px",
                height: "200px",
                background: 'linear-gradient(145deg, #1A2722 0%, #232F2A 100%)',
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FDB400]"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-12">
        Elige tus servicios
      </h2>

      {/* Package Services - Top Row */}
      {packages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 mb-6 justify-items-center" style={{ gap: "13rem" }}>
          {packages.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isSelected={selectedServices.includes(service.id)}
              onToggle={() => onServiceToggle(service.id)}
            />
          ))}
        </div>
      )}

      {/* Individual Services - Middle Row */}
      {individualServices.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 mb-6 justify-items-center" style={{ gap: "13rem" }}>
            {individualServices.slice(0, 3).map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={selectedServices.includes(service.id)}
                onToggle={() => onServiceToggle(service.id)}
              />
            ))}
          </div>

          {/* Bottom Row - 2 cards */}
          {individualServices.length > 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto mb-12 justify-items-center" style={{ gap: "13rem" }}>
              {individualServices.slice(3).map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isSelected={selectedServices.includes(service.id)}
                  onToggle={() => onServiceToggle(service.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Selected Count and Continue Button */}
      <div className="text-center">
        {selectedServices.length > 0 && (
          <p
            className="text-sm mb-2 transition-opacity duration-200"
            style={{
              color: '#FDB400',
              opacity: selectedServices.length > 0 ? 1 : 0,
              height: selectedServices.length > 0 ? 'auto' : 0,
              overflow: 'hidden',
            }}
          >
            {selectedServices.length} servicio
            {selectedServices.length !== 1 ? 's' : ''} seleccionado
            {selectedServices.length !== 1 ? 's' : ''}
          </p>

        )}
        <button
          onClick={onContinue}
          disabled={selectedServices.length === 0}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all duration-300 text-black disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "#FDB400",
            border: "none",
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.background =
                "linear-gradient(180deg, #7B9A2D -72.56%, #1A2722 100%)"
              e.currentTarget.style.color = "white"
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.background = "#FDB400"
              e.currentTarget.style.color = "black"
            }
          }}
        >
          Continuar
          <span className="text-lg">{"→"}</span>
        </button>
      </div>
    </div>
  )
}