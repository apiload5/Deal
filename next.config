/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  sw: 'service-worker.js',
  disable: process.env.NODE_ENV === 'development',
})

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'api.zameen.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  experimental: {
    typedRoutes: true
  },
  env: {
    NEXT_PUBLIC_CURRENCY: 'Rs',
  },
  webpack: (config, { isServer }) => {
    return config
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
  redirects: async () => {
    return [
      {
        source: '/agent',
        destination: '/agent/dashboard',
        permanent: false,
      },
      {
        source: '/admin',
        destination: '/admin-panel/dashboard',
        permanent: false,
      },
    ]
  },
}

module.exports = withPWA(nextConfig)
