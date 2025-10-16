import type { NextConfig } from "next";

const nextConfig = {
    images: {
        domains: [
            'fptbkwagiqgwssmgkhqy.supabase.co',
            // Thêm các domain khác nếu cần
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'fptbkwagiqgwssmgkhqy.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/images/**',
            },
        ],
    },
}

export default nextConfig;
