"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function CartPage() {
  const router = useRouter()
  const { token, user } = useAuth()

  useEffect(() => {
    const hasToken = token || localStorage.getItem('vegas_token')
    const hasUser = user || localStorage.getItem('vegas_user')
    if (!hasToken && !hasUser) router.push('/auth')
  }, [token, user, router])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Carrito</h1>
        <p>Tu carrito está vacío (placeholder).</p>
      </main>
      <Footer />
    </div>
  )
}
