"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

type StoredUser = {
  name: string
  email: string
  phone?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuth()

  const [mounted, setMounted] = useState(false)
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null)

  /* ---------------- MOUNT GUARD ---------------- */

  useEffect(() => {
    setMounted(true)
  }, [])

  /* ---------------- AUTH GUARD ---------------- */

  useEffect(() => {
    if (!mounted) return

    const localUser = localStorage.getItem("vegas_user")
    const hasUser = user || localUser

    if (!hasUser) {
      router.push("/auth")
      return
    }

    if (!user && localUser) {
      setStoredUser(JSON.parse(localUser))
    } else if (user) {
      setStoredUser(user)
    }
  }, [mounted, user, router])

  if (!mounted) return null

  const initials =
    storedUser?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-10">
          Mi Perfil
        </h1>

        {/* CARD */}
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
          {!storedUser ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-black"
                  style={{
                    backgroundColor: "#FDB400",
                  }}
                >
                  {initials}
                </div>
              </div>

              {/* Name */}
              <h2 className="text-xl font-semibold text-center mb-6" style={{color:"black"}}>
                {storedUser.name}
              </h2>

              {/* Info rows */}
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Correo</span>
                  <span className="font-medium text-gray-900">
                    {storedUser.email}
                  </span>
                </div>

                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Teléfono</span>
                  <span className="font-medium text-gray-900">
                    {storedUser.phone || "—"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
