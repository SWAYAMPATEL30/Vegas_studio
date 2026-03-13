"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

import { API_BASE_URL } from "@/lib/api"

/* ---------------- TYPES ---------------- */

type Service = {
  id: string
  name: string
  type: string
  price: number
  duration_minutes: number
}

type AppointmentService = {
  services: Service
}

type Appointment = {
  id: string
  appointment_date: string
  start_time: string
  end_time: string
  total_duration_minutes: number
  status: "pending" | "confirmed" | "cancelled" | "rejected" | "completed"
  rejection_reason: string | null
  created_at: string
  appointment_services: AppointmentService[]
}

/* ---------------- PAGE ---------------- */

export default function MyAppointmentsPage() {
  const router = useRouter()
  const { user, token } = useAuth()

  const [mounted, setMounted] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* ---------------- MOUNT GUARD ---------------- */

  useEffect(() => {
    setMounted(true)
  }, [])

  /* ---------------- AUTH GUARD ---------------- */

  useEffect(() => {
    if (!mounted) return

    const hasUser =
      user || localStorage.getItem("vegas_user")

    if (!hasUser) {
      router.push("/auth")
    }
  }, [mounted, user, router])

  /* ---------------- FETCH APPOINTMENTS ---------------- */

  useEffect(() => {
    if (!mounted || !token) return

    const fetchAppointments = async () => {
      try {
        setLoading(true)

        const res = await fetch(`${API_BASE_URL}/appointments/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || "Failed to fetch appointments")
        }

        const data = await res.json()
        setAppointments(data)
      } catch (err) {
        console.error("[appointments] fetch error:", err)
        setError("No se pudieron cargar tus citas")
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [mounted, token])

  /* ---------------- HELPERS ---------------- */

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })

  const formatTime = (time: string) => time.slice(0, 5)

  const statusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return "#FDB400"
      case "confirmed":
        return "#9AC138"
      case "completed":
        return "#4CAF50"
      case "cancelled":
      case "rejected":
        return "#99060D"
      default:
        return "#999"
    }
  }

  /* ---------------- PREVENT SSR RENDER ---------------- */

  if (!mounted) return null

  /* ---------------- RENDER ---------------- */

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold text-center mb-10">
            Mis Citas
          </h1>

          {/* LOADING */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* ERROR */}
          {error && !loading && (
            <p className="text-center text-red-500">{error}</p>
          )}

          {/* EMPTY */}
          {!loading && !error && appointments.length === 0 && (
            <p className="text-center text-muted-foreground">
              No tienes citas registradas todavía.
            </p>
          )}

          {/* LIST */}
          {!loading && appointments.length > 0 && (
            <div className="space-y-6">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="rounded-lg border p-6 bg-white shadow-sm"
                  style={{ color: "black" }}
                >
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <p className="font-semibold text-lg">
                        {formatDate(appt.appointment_date)}
                      </p>
                      {/* show raw date value as well for clarity */}
                      <p className="text-xs text-muted-foreground">
                        <em>{appt.appointment_date}</em>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(appt.start_time)} –{" "}
                        {formatTime(appt.end_time)}
                      </p>
                    </div>

                    <span
                      className="mt-2 md:mt-0 px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{
                        backgroundColor: statusColor(appt.status),
                      }}
                    >
                      {appt.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Services */}
                  <div className="space-y-2">
                    {appt.appointment_services.map((s) => (
                      <div
                        key={s.services.id}
                        className="flex justify-between text-sm"
                      >
                        <span>{s.services.name}</span>
                        <span>
                          $ {s.services.price.toLocaleString("es-CO")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t text-sm">
                    <span>
                      Duración total: {appt.total_duration_minutes} min
                    </span>

                    {appt.rejection_reason && (
                      <span className="text-red-600">
                        Motivo: {appt.rejection_reason}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
