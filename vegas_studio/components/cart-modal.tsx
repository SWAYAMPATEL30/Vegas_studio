"use client"

import { X } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import Link from "next/link"

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, total, removeItem } = useCart()

  if (!isOpen) return null

  const formatPrice = (price: number) => {
    return `$ ${price.toLocaleString("es-CO")}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-20 pr-4">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-80 p-6 text-popover-foreground">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: "#9AC138" }}
        >
          Tu carrito
        </h2>

        {items.length === 0 ? (
          <>
            <p className="text-gray-600 mb-4">
              Tu carrito de compras está vacío. Reserva tu cita y vuelve aquí.
            </p>
            <Link
              href="/agendar"
              onClick={onClose}
              className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Reservar cita
            </Link>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-4">
              ¡Mantendremos tu carrito listo para ti!
            </p>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center gap-2"
                >
                  <span
                    className="font-medium"
                    style={{ color: "#9AC138" }}
                  >
                    {item.name}
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded text-sm"
                      style={{
                        border: "1px solid #9AC138",
                        color: "#9AC138",
                      }}
                    >
                      {formatPrice(item.price)}
                    </span>

                    {/* Remove from cart */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <span
                className="font-medium px-4 py-2 rounded-md"
                style={{ backgroundColor: "#DFE1D5", color: "#1A2722" }}
              >
                Total: {formatPrice(total)}
              </span>
              <Link
                href="/agendar"
                onClick={onClose}
                className="px-4 py-2 rounded-md transition-colors font-medium"
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
