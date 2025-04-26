const { i18n } = require('./next-i18next.config');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    emotion: true,
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // API isteklerini backend'e yönlendirmek için proxy ayarları
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://web-production-9f41e.up.railway.app/api/:path*',
      },
    ];
  },
  
  // SEO optimizations
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable gzip compression
  
  // Image optimization with more aggressive settings
  images: {
    domains: ['web-production-9f41e.up.railway.app', 'cekfisi.fra1.cdn.digitaloceanspaces.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24 hours cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // HTTP Headers with cache optimizations
  async headers() {
    // Determine if we're in production
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Define headers based on environment
    const securityHeaders = isProduction ? [
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      }
    ] : [];
    
    return [
      {
        source: '/:path*',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      // WebSocket sayfaları için önbellekleme devre dışı bırakılır
      {
        source: '/templates/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          }
        ],
      },
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
          {
            key: 'Priority',
            value: 'critical'
          },
          {
            key: 'x-nextjs-page',
            value: '/'
          }
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=31536000',
          }
        ],
      },
      {
        source: '/:path*.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        source: '/:path*.css',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        source: '/:path*.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        source: '/images/hero-image.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Priority',
            value: 'highest'
          }
        ],
      },
    ];
  },
  
  // Webpack optimizasyonları
  webpack: (config, { dev, isServer, webpack }) => {
    // Only run in production client-side build
    if (!dev && !isServer) {
      // Disable source maps in production for better performance
      config.devtool = false;

      // JavaScript yüklemesini hızlandırmak için
      config.optimization.moduleIds = 'deterministic';
      
      // Agresif tree shaking ve LCP/TTI optimizasyonları
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.__NEXT_OPTIMIZE_CSS': JSON.stringify(true),
        })
      );
    } else if (dev) {
      // Development'ta daha hafif bir source map kullan
      config.devtool = 'cheap-module-source-map';
    }
    
    return config;
  },
  
  // Performance optimizations for Next.js 14.1.3
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material' 
    ],
  },
  
  // Disable source maps in production for better performance
  productionBrowserSourceMaps: false,
  generateEtags: true, // Enable ETag generation
};

module.exports = withBundleAnalyzer(nextConfig);