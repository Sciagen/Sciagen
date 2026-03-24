/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.cloudfront.net' },
      { protocol: 'https', hostname: 'pub.mdpi-res.com' },
      { protocol: 'https', hostname: 'media.nature.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(self), geolocation=()',
        },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.firebaseapp.com *.googleapis.com",
            "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
            "font-src 'self' fonts.gstatic.com",
            "img-src 'self' data: blob: cdn.sanity.io *.unsplash.com *.cloudfront.net *.wikipedia.org",
            "connect-src 'self' *.firebaseio.com *.googleapis.com *.sanity.io *.newsapi.org api.dictionaryapi.dev",
            "frame-ancestors 'none'",
          ].join('; '),
        },
      ],
    },
  ],
  rewrites: async () => [
    {
      source: '/api/news/:path*',
      destination: `${process.env.CLOUDFLARE_WORKER_URL}/news/:path*`,
    },
    {
      source: '/api/ai/:path*',
      destination: `${process.env.CLOUDFLARE_WORKER_URL}/ai/:path*`,
    },
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  },
};

module.exports = nextConfig;
