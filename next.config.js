/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  
  images: {
    // domains deprecated hai Next 16 me
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    deviceSizes: [320, 480, 640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
  },

  compress: true,
  generateEtags: true,
  reactStrictMode: true,
  poweredByHeader: false,
  
  // optimizeCss ab stable hai Next 16 me
  experimental: {
    optimizeCss: true,
  },

  transpilePackages: [
    '@supabase/ssr',
    '@supabase/supabase-js',
    'next-cloudinary',
  ],

  // webpack hata diya - Turbopack use ho raha hai
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['app', 'components', 'hooks', 'lib'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  staticPageGenerationTimeout: 120,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/images/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
    ];
  },

  async rewrites() {
    return [
      { source: '/api/:path*', destination: '/api/:path*' },
    ];
  },
};

module.exports = nextConfig;
