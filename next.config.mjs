/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TODO: Remove once all pre-existing implicit-any issues are resolved
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
}

export default nextConfig
