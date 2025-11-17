import type { NextConfig } from "next";

// Portal Klaus Drift Brasil - Configuração Next.js Produção AWS
// Suporta deploy em Vercel e AWS (EC2/ECS/Fargate)
const nextConfig: NextConfig = {
  // Standalone output para Docker/AWS
  output: 'standalone',

  // Desabilitar geração estática temporariamente para debug
  // output: 'export' desabilita SSR completamente - não usar

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingRoot: __dirname,

  // Server actions e otimizações
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'portal.klaus-driftbrasil.com.br',
        '*.vercel.app',
        '*.amazonaws.com',
        '*.cloudfront.net'
      ],
      bodySizeLimit: '500mb', // Permitir upload de vídeos grandes
    },
    optimizeCss: true,
    optimizePackageImports: [
      'react-hot-toast',
      'framer-motion',
      'lucide-react',
      '@headlessui/react'
    ]
  },

  // Configuração de imagens (suporta S3 + CloudFront)
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
      },
      // Imagens hospedadas no próprio domínio (produção)
      {
        protocol: 'https',
        hostname: 'portal.klaus-driftbrasil.com.br',
      },
      // Desenvolvimento local
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      }
    ],
  },

  // Configuração de cache
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Compressão
  compress: true,

  // Headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Portal-Klaus-Drift',
            value: 'v2.0.0-Production',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
    ];
  },

  // Rewrites para SEO
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ];
  },
};

export default nextConfig;
