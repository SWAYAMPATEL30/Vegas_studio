import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/lib/theme-context"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Vegas Estudio - Barbería",
  description: "El lugar exclusivo para ti. Corte y barba con atención personalizada.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning translate="no">
        <AuthProvider>
          <ThemeProvider>
            <CartProvider>{children}</CartProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
