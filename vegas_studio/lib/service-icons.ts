// Maps service IDs to their custom SVG icon paths
export const serviceIconMap: Record<string, string> = {
  // Packages
  "clasico": "/icons/Scissors.svg",
  "vegas-pro": "/icons/Thunder.svg",
  "premium": "/icons/Diamond.svg",
  // Individual services
  "corte": "/icons/Scissors.svg",
  "barba": "/icons/beard.svg",
  "depilacion": "/icons/tweezers.svg",
  "limpieza-facial": "/icons/facial-mask.svg",
  "cejas": "/icons/razor-blade.svg",
}

export function getServiceIcon(serviceId: string): string {
  return serviceIconMap[serviceId] || "/icons/Scissors.svg"
}
