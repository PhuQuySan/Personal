// src/contexts/NavigationContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface NavigationContextType {
    // Loading state
    isNavigating: boolean;

    // Prefetch state
    isPrefetchComplete: boolean;
    prefetchProgress: number;

    // Navigation functions
    navigateTo: (href: string) => void;

    // Current route
    currentPath: string;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
    children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [isNavigating, setIsNavigating] = useState(false);
    const [isPrefetchComplete, setIsPrefetchComplete] = useState(false);
    const [prefetchProgress, setPrefetchProgress] = useState(0);

    // Prefetch tất cả routes quan trọng
    useEffect(() => {
        const allRoutes = [
            '/',
            '/blog',
            '/login',
            '/signup',
            '/dashboard',
            '/dashboard/admin',
            '/dashboard/files',
        ];

        let prefetched = 0;
        const total = allRoutes.length;

        // Prefetch từng route và update progress
        const prefetchAll = () => {
            allRoutes.forEach((route, index) => {
                // Delay prefetch để không block UI
                setTimeout(() => {
                    router.prefetch(route);
                    prefetched++;

                    const progress = (prefetched / total) * 100;
                    setPrefetchProgress(progress);

                    if (prefetched >= total) {
                        setIsPrefetchComplete(true);

                        if (process.env.NODE_ENV === 'development') {
                            console.log('✅ All routes prefetched!');
                        }
                    }
                }, index * 50); // Stagger prefetch calls
            });
        };

        // Start prefetching
        if ('requestIdleCallback' in window) {
            requestIdleCallback(prefetchAll, { timeout: 1000 });
        } else {
            setTimeout(prefetchAll, 100);
        }
    }, [router]);

    // Navigate with loading state
    const navigateTo = useCallback((href: string) => {
        setIsNavigating(true);

        // Sử dụng View Transitions API nếu có
        if ('startViewTransition' in document) {
            // @ts-ignore
            document.startViewTransition(() => {
                router.push(href);
            });
        } else {
            router.push(href);
        }

        // Reset loading state
        setTimeout(() => {
            setIsNavigating(false);
        }, 300);
    }, [router]);

    // Reset loading state khi pathname thay đổi
    useEffect(() => {
        setIsNavigating(false);
    }, [pathname]);

    const value: NavigationContextType = {
        isNavigating,
        isPrefetchComplete,
        prefetchProgress,
        navigateTo,
        currentPath: pathname,
    };

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
}

// Hook để sử dụng NavigationContext
export function useNavigation() {
    const context = useContext(NavigationContext);

    if (context === undefined) {
        throw new Error('useNavigation must be used within NavigationProvider');
    }

    return context;
}

// Hook để track page views (optional)
export function usePageView() {
    const { currentPath } = useNavigation();

    useEffect(() => {
        // Track page view
        if (process.env.NODE_ENV === 'development') {
            console.log('📄 Page view:', currentPath);
        }

        // Example: Google Analytics
        if (typeof window !== 'undefined' && 'gtag' in window) {
            // @ts-ignore
            window.gtag('config', 'GA_MEASUREMENT_ID', {
                page_path: currentPath,
            });
        }
    }, [currentPath]);
}