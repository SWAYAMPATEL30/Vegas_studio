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
        // Network error — keep local cart as-is
        console.warn("[cart] network error, keeping local cart:", err)
        return
      }

      if (!res.ok) {
        // 401/403 = invalid token (Google/local login) — keep local cart
        console.warn("[cart] Backend returned", res.status, "— keeping local cart")
        return
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
      console.warn("[cart] fetch error, keeping local cart:", err)
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
        // If backend rejects (401, 500, etc.), fall back to local cart
        console.warn("[cart] Backend cart failed, using local cart")
        setItems(prev => [...prev, item])
        return
      }

      await refreshCart()
    } catch (err) {
      // Network error — fall back to local cart
      console.warn("[cart] Network error, using local cart:", err)
      setItems(prev => [...prev, item])
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
        // Fallback to local removal
        console.warn("[cart] Backend remove failed, removing locally")
        setItems(prev => prev.filter(item => item.id !== serviceId))
        return
      }

      await refreshCart()
    } catch (err) {
      // Network error — remove locally
      console.warn("[cart] Network error on remove, removing locally:", err)
      setItems(prev => prev.filter(item => item.id !== serviceId))
    } finally {
      setLoading(false)
    }
  }

  /* --------------------------------------------------
     CLEAR CART
  -------------------------------------------------- */
  const clearCart = async () => {
    // Save current items
    const currentItems = [...items]
    
    // Instantly clear UI
    setItems([])
    
    // Clear backend if there are any items
    if (token && !token.startsWith('local-')) {
      for (const item of currentItems) {
        try {
           await fetch(`${API_BASE_URL}/cart/remove/${item.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          })
        } catch (e) {
          console.warn('Failed to clear item from backend cart:', item.id)
        }
      }
    }
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
