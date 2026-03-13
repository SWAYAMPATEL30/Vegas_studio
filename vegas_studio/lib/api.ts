// central place to retrieve backend base URL
// ensures every module uses the same environment variable

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  // default to localhost for development if not specified
  "http://localhost:5000";