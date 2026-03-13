export async function fetchServices() {
  try {
    const response = await fetch('/api/services')
    if (!response.ok) throw new Error('Failed to fetch services')
    return await response.json()
  } catch (error) {
    console.error('[v0] Error fetching services:', error)
    return []
  }
}
