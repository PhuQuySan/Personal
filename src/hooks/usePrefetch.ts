// src/hooks/usePrefetch.ts
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useCallback } from 'react';

interface PrefetchOptions {
    routes: string[];
    eager?: boolean; // Prefetch immediately on mount
    onHover?: boolean; // Prefetch on hover
    priority?: 'high' | 'low'; // Prefetch priority
}

/**
 * Hook để prefetch routes một cách thông minh
 * - Eager: Prefetch ngay khi component mount
 * - On Hover: Prefetch khi user hover vào link
 * - Priority: Ưu tiên prefetch các route quan trọng
 */
export function usePrefetch({
                                routes,
                                eager = true,
                                onHover = true,
                                priority = 'low'
                            }: PrefetchOptions) {
    const router = useRouter();
    const prefetchedRef = useRef(new Set<string>());
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);



    // Hàm prefetch một route
    const prefetchRoute = useCallback((route: string) => {
        if (prefetchedRef.current.has(route)) return;

        try {
            router.prefetch(route);
            prefetchedRef.current.add(route);
        } catch (error) {
            console.error(`Failed to prefetch route: ${route}`, error);
        }
    }, [router]);

    // Prefetch tất cả routes
    const prefetchAll = useCallback(() => {
        routes.forEach(route => {
            prefetchRoute(route);
        });
    }, [routes, prefetchRoute]);

    // Prefetch eager (ngay lập tức)
    useEffect(() => {
        if (!eager) return;

        // Cleanup timeout nếu component unmount
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!eager) return;

        // Sử dụng requestIdleCallback để prefetch khi browser rảnh
        // Giúp không block UI
        const prefetchWhenIdle = () => {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    if (priority === 'high') {
                        // High priority: prefetch ngay lập tức
                        prefetchAll();
                    } else {
                        // Low priority: delay một chút để ưu tiên render
                        timeoutRef.current = setTimeout(prefetchAll, 100);
                    }
                }, { timeout: priority === 'high' ? 500 : 2000 });
            } else {
                // Fallback cho browsers không support requestIdleCallback
                timeoutRef.current = setTimeout(
                    prefetchAll,
                    priority === 'high' ? 100 : 500
                );
            }
        };

        prefetchWhenIdle();
    }, [eager, priority, prefetchAll]);

    // Hàm để prefetch on hover
    const prefetchOnHover = useCallback((route: string) => {
        if (!onHover || prefetchedRef.current.has(route)) return;
        prefetchRoute(route);
    }, [onHover, prefetchRoute]);

    // Hàm để check xem route đã được prefetch chưa
    const isPrefetched = useCallback((route: string) => {
        return prefetchedRef.current.has(route);
    }, []);

    return {
        prefetchOnHover,
        isPrefetched,
        prefetchRoute,
        prefetchAll
    };
}

/**
 * Hook để tạo optimistic navigation với smooth transitions
 * Sử dụng View Transitions API nếu browser hỗ trợ
 */
export function useOptimisticNavigation() {
    const router = useRouter();

    const navigateWithTransition = useCallback((href: string) => {
        // Check nếu browser hỗ trợ View Transitions API
        if ('startViewTransition' in document) {
            // @ts-ignore - View Transitions API
            document.startViewTransition(() => {
                router.push(href);
            });
        } else {
            // Fallback: navigation bình thường
            router.push(href);
        }
    }, [router]);

    return { navigateWithTransition };
}

/**
 * Hook để prefetch routes dựa trên viewport
 * Chỉ prefetch khi link xuất hiện trong viewport
 */
export function useIntersectionPrefetch(routes: string[]) {
    const router = useRouter();
    const prefetchedRef = useRef(new Set<string>());

    useEffect(() => {
        // Tạo IntersectionObserver
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const href = entry.target.getAttribute('href');
                        if (href && routes.includes(href) && !prefetchedRef.current.has(href)) {
                            router.prefetch(href);
                            prefetchedRef.current.add(href);
                        }
                    }
                });
            },
            {
                rootMargin: '50px', // Prefetch 50px trước khi link vào viewport
                threshold: 0.1,
            }
        );

        // Observe tất cả links
        const links = document.querySelectorAll('a[href^="/"]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && routes.includes(href)) {
                observer.observe(link);
            }
        });

        // Cleanup
        return () => {
            observer.disconnect();
        };
    }, [routes, router]);
}

/**
 * Hook để track prefetch status
 */
export function usePrefetchStatus() {
    const statusRef = useRef({
        total: 0,
        prefetched: 0,
        failed: 0,
    });

    const updateStatus = useCallback((type: 'prefetched' | 'failed') => {
        statusRef.current[type]++;
    }, []);

    const getStatus = useCallback(() => {
        return {
            ...statusRef.current,
            percentage: statusRef.current.total > 0
                ? (statusRef.current.prefetched / statusRef.current.total) * 100
                : 0,
        };
    }, []);

    return { updateStatus, getStatus };
}