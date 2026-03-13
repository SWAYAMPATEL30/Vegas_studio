"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"
import { API_BASE_URL } from "./api"

export interface CartItem {
  id: string
  name: string
  price: number
  duration_minutes?: number
  type?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => Promise<void>
  removeItem: (id: string) => Promise<void>
  clearCart: () => void
  total: number
  loading: boolean
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)


export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()

  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  /* --------------------------------------------------
     FETCH CART WHEN TOKEN CHANGES
  -------------------------------------------------- */
  useEffect(() => {
    if (!token) {
      setItems([])
      return
    }

    refreshCart()
  }, [token])

  /* --------------------------------------------------
     FETCH CART
  -------------------------------------------------- */
  const refreshCart = async () => {
    if (!token || typeof window === "undefined") return

    try {
      setLoading(true)

      let res
      try {
        res = await fetch(`${API_BASE_URL}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } catch (err) {
        console.error("[cart] network error:", err)
        return
      }

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Failed to fetch cart")
      }

      const data = await res.json()

      const uniqueMap = new Map()
      data.forEach((item: any) => {
        uniqueMap.set(item.services.id, {
          id: item.services.id,
          name: item.services.name,
          price: item.services.price,
          duration_minutes: item.services.duration_minutes,
          type: item.services.type,
        })
      })

      setItems([...uniqueMap.values()])
    } catch (err) {
      console.error("[cart] fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  /* --------------------------------------------------
     ADD ITEM
  -------------------------------------------------- */
  const addItem = async (item: CartItem) => {
    if (!token) {
      throw new Error("Please login to add items to cart")
    }

    if (items.some((i) => i.id === item.id)) return

    try {
      setLoading(true)

      const res = await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ serviceId: item.id }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Failed to add item")
      }

      await refreshCart()
    } finally {
      setLoading(false)
    }
  }

  /* --------------------------------------------------
     REMOVE ITEM
  -------------------------------------------------- */
  const removeItem = async (serviceId: string) => {
    if (!token) return

    try {
      setLoading(true)

      const res = await fetch(
        `${API_BASE_URL}/cart/remove/${serviceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Failed to remove item")
      }

      await refreshCart()
    } catch (err) {
      console.error("[cart] remove error:", err)
    } finally {
      setLoading(false)
    }
  }

  /* --------------------------------------------------
     CLEAR CART (LOCAL ONLY)
  -------------------------------------------------- */
  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        total,
        loading,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return ctx
}
