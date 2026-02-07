// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,

    // Image configuration
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'fptbkwagiqgwssmgkhqy.supabase.co',
                pathname: '/storage/v1/object/public/images/**',
            },
        ],
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
    },

    // Compiler optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production'
            ? { exclude: ['error', 'warn'] }
            : false,
    },

    // Experimental features (Next 16 compatible)
    experimental: {
        optimizePackageImports: [
            'lucide-react',
            '@supabase/supabase-js',
            'react-hot-toast',
            'framer-motion',
        ],
        optimizeCss: true,
    },

    // Turbopack config (NEW SYSTEM)
    turbopack: {
        rules: {
            '*.svg': {
                loaders: ['@svgr/webpack'],
                as: '*.js',
            },
        },
        // root: __dirname, // dùng nếu monorepo
    },

    // Headers for caching and security
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'X-DNS-Prefetch-Control', value: 'on' },
                    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
                ],
            },
            {
                source: '/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/_next/image/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
