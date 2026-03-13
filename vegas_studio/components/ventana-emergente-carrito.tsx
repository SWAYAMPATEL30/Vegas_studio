"use client"

import { X } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import Link from "next/link"

interface VentanaEmergentaCarritoProps {
  isOpen: boolean
  onClose: () => void
}

export function VentanaEmergentaCarrito({ isOpen, onClose }: VentanaEmergentaCarritoProps) {
  const { items, total } = useCart()

  if (!isOpen) return null

  const formatPrice = (price: number) => {
    return `$ ${price.toLocaleString("es-CO")}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative bg-white rounded-[10px] shadow-xl p-[25px] text-popover-foreground flex flex-col gap-[14px]"
        style={{ width: "397px", height: "278px" }}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold" style={{ color: "#9AC138" }}>
            Tu carrito
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 text-sm">
          ¡Mantendremos tu carrito listo para ti!
        </p>

        {items.length > 0 && (
          <>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="font-medium text-sm" style={{ color: "#9AC138" }}>
                    {item.name}
                  </span>
                  <span className="px-3 py-1 rounded text-xs" style={{ border: "1px solid #9AC138", color: "#9AC138" }}>
                    {formatPrice(item.price)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="font-medium text-xs px-3 py-2 rounded" style={{ backgroundColor: "#DFE1D5", color: "#1A2722" }}>
                Total: {formatPrice(total)}
              </span>
              <Link
                href="/agendar"
                onClick={onClose}
                className="px-4 py-2 rounded text-sm transition-colors font-medium"
                style={{ backgroundColor: "#FDB400", color: "#1A2722" }}
              >
                Continuar
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
