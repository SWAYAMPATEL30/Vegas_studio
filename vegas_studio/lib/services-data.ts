export interface Service {
  id: string
  name: string
  price: number
  description: string
  duration: number
  features?: string[]
  type: "package" | "individual"
}

export const services: Service[] = [
  // Packages
  {
    id: "clasico",
    name: "Clásico",
    price: 35000,
    description: "El corte de siempre, bien hecho. Rápido, limpio y efectivo.",
    duration: 40,
    features: [
      "Lavado completo",
      "Corte de cabello",
      "Arreglo de barba (si aplica)",
      "Mascarilla negra",
      "Exfoliación express con vapor ozono",
    ],
    type: "package",
  },
  {
    id: "vegas-pro",
    name: "Vegas Pro",
    price: 45000,
    description: "El servicio de la casa. Más detalle, más tiempo y mejor experiencia.",
    duration: 60,
    features: [
      "Lavado completo",
      "Corte de cabello",
      "Perfilado de barba con tónicos",
      "Toalla caliente",
      "Limpieza facial Pro (vaporización, exfoliación, mascarilla y crema hidratante)",
    ],
    type: "package",
  },
  {
    id: "premium",
    name: "Premium",
    price: 60000,
    description: "Todo el cuidado completo. Tiempo, técnica y atención al máximo nivel.",
    duration: 90,
    features: [
      "Lavado completo",
      "Corte de cabello",
      "Perfilado de barba con tónicos",
      "Toalla caliente",
      "Limpieza facial Premium (vaporización, exfoliación, mascarilla, extracción de puntos negros, tratamiento con lámpara UV y crema hidratante)",
    ],
    type: "package",
  },
  // Individual services
  {
    id: "corte",
    name: "Corte",
    price: 25000,
    description: "Corte sencillo",
    duration: 30,
    type: "individual",
  },
  {
    id: "barba",
    name: "Barba",
    price: 15000,
    description: "Perfildo de barba con tónicos",
    duration: 20,
    type: "individual",
  },
  {
    id: "depilacion",
    name: "Depilación",
    price: 20000,
    description: "Depilación de nariz y orejas",
    duration: 20,
    type: "individual",
  },
  {
    id: "limpieza-facial",
    name: "Limpieza facial",
    price: 35000,
    description: "vaporización, exfoliación, mascarilla, extracción de puntos negros, tratamiento con lámpara UV y crema hidratante",
    duration: 25,
    type: "individual",
  },
  {
    id: "cejas",
    name: "Cejas",
    price: 6000,
    description: "Perfilado de cejas",
    duration: 5,
    type: "individual",
  },
]

export const getServiceById = (id: string) => services.find((s) => s.id === id)

export const formatPrice = (price: number) => {
  return `$ ${price.toLocaleString("es-CO")}`
}
