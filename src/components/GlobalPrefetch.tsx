// src/components/GlobalPrefetch.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Component để prefetch toàn bộ routes ở app level
 * Không cần gắn vào từng component/page
 */
export function GlobalPrefetch() {
    const router = useRouter();

    useEffect(() => {
        // Danh sách tất cả routes cần prefetch
        const criticalRoutes = [
            '/',
            '/blog',
            '/login',
            '/signup',
        ];

        const authenticatedRoutes = [
            '/dashboard',
            '/dashboard/admin',
            '/dashboard/files',
        ];

        // Prefetch critical routes ngay lập tức
        const prefetchCritical = () => {
            criticalRoutes.forEach(route => {
                router.prefetch(route);
            });
        };

        // Prefetch authenticated routes sau một chút
        const prefetchAuthenticated = () => {
            authenticatedRoutes.forEach(route => {
                router.prefetch(route);
            });
        };

        // Strategy: Prefetch critical routes ngay, authenticated routes sau
        if ('requestIdleCallback' in window) {
            // Prefetch critical routes ngay khi browser rảnh
            requestIdleCallback(prefetchCritical, { timeout: 500 });

            // Prefetch authenticated routes sau khi critical routes xong
            requestIdleCallback(prefetchAuthenticated, { timeout: 2000 });
        } else {
            // Fallback cho browsers không support requestIdleCallback
            setTimeout(prefetchCritical, 100);
            setTimeout(prefetchAuthenticated, 1000);
        }

        // Debug log (chỉ trong development)
        if (process.env.NODE_ENV === 'development') {
            console.log('🌍 GlobalPrefetch: Initialized');
            console.log('📦 Critical routes:', criticalRoutes);
            console.log('🔐 Auth routes:', authenticatedRoutes);
        }
    }, [router]);

    // Component này không render gì cả
    return null;
}