// src/hooks/usePrefetch.ts (v3.0 - Smart & Fast)
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useCallback } from 'react';

interface PrefetchOptions {
    routes: string[];
    eager?: boolean;
    priority?: 'critical' | 'high' | 'low';
}

/**
 * Ultra-optimized prefetch hook
 * - Instant prefetch for critical routes
 * - Smart batching for non-critical routes
 * - No loading states (zero overhead)
 */
export function usePrefetch({
                                routes,
                                eager = true,
                                priority = 'high',
                            }: PrefetchOptions) {
    const router = useRouter();
    const prefetchedRef = useRef(new Set<string>());
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Prefetch single route (memoized)
    const prefetchRoute = useCallback((route: string) => {
        if (prefetchedRef.current.has(route)) return;

        prefetchedRef.current.add(route);
        router.prefetch(route);

        if (process.env.NODE_ENV === 'development') {
            console.log(`⚡ Prefetched: ${route}`);
        }
    }, [router]);

    // Prefetch all routes immediately (for critical)
    const prefetchAll = useCallback(() => {
        routes.forEach(route => prefetchRoute(route));
    }, [routes, prefetchRoute]);

    // Prefetch in small batches (for low priority)
    const prefetchInBatches = useCallback(() => {
        let index = 0;
        const batchSize = 2;

        const processBatch = () => {
            const batch = routes.slice(index, index + batchSize);
            batch.forEach(route => prefetchRoute(route));

            index += batchSize;

            if (index < routes.length) {
                timeoutRef.current = setTimeout(processBatch, 100);
            }
        };

        processBatch();
    }, [routes, prefetchRoute]);

    // Eager prefetch on mount
    useEffect(() => {
        if (!eager) return;

        const startPrefetch = () => {
            if (priority === 'critical') {
                // INSTANT - No delay for critical routes
                prefetchAll();
            } else if (priority === 'high') {
                // Fast prefetch with requestIdleCallback
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(() => prefetchAll(), { timeout: 500 });
                } else {
                    timeoutRef.current = setTimeout(prefetchAll, 50);
                }
            } else {
                // Batched prefetch for low priority
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(() => prefetchInBatches(), { timeout: 2000 });
                } else {
                    timeoutRef.current = setTimeout(prefetchInBatches, 500);
                }
            }
        };

        startPrefetch();

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [eager, priority, prefetchAll, prefetchInBatches]);

    // Simple hover prefetch (no checks needed - router handles dedupe)
    const prefetchOnHover = useCallback((route: string) => {
        prefetchRoute(route);
    }, [prefetchRoute]);

    const isPrefetched = useCallback((route: string) => {
        return prefetchedRef.current.has(route);
    }, []);

    return {
        prefetchOnHover,
        prefetchRoute,
        isPrefetched,
    };
}

/**
 * Prefetch critical routes immediately on app start
 */
export function usePrefetchCritical(routes: string[]) {
    const router = useRouter();
    const prefetchedRef = useRef(false);

    useEffect(() => {
        if (prefetchedRef.current) return;
        prefetchedRef.current = true;

        // Prefetch IMMEDIATELY - no waiting
        routes.forEach(route => {
            router.prefetch(route);
        });

        if (process.env.NODE_ENV === 'development') {
            console.log('🚀 Critical routes prefetched:', routes);
        }
    }, [routes, router]);
}