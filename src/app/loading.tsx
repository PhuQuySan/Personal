// src/app/loading.tsx (OPTIMIZED VERSION)

'use client';

import { useEffect, useState } from 'react';

// ✅ Reusable loading skeleton components
export function NavigationSkeleton() {
    return (
        <div className="h-16 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                    <div className="w-32 h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
                <div className="flex gap-2">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                    <div className="w-24 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                </div>
            </div>
        </div>
    );
}

export function ContentSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            {/* Header skeleton */}
            <div className="space-y-3">
                <div className="h-10 w-2/3 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>

            {/* Content blocks */}
            <div className="grid gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-6 space-y-4 border border-gray-200 dark:border-gray-800">
                        <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                            <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                            <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ✅ Main loading component với progressive reveal
export default function Loading() {
    const [loadingStage, setLoadingStage] = useState<'instant' | 'fast' | 'slow'>('instant');
    const [showSpinner, setShowSpinner] = useState(false);

    useEffect(() => {
        // Stage 1: Instant (0-100ms) - Nothing shown (prefetch should handle this)
        const fastTimer = setTimeout(() => {
            setLoadingStage('fast');
        }, 100);

        // Stage 2: Fast (100-300ms) - Show minimal skeleton
        const slowTimer = setTimeout(() => {
            setLoadingStage('slow');
            setShowSpinner(true);
        }, 300);

        // Cleanup
        return () => {
            clearTimeout(fastTimer);
            clearTimeout(slowTimer);
        };
    }, []);

    // ✅ Don't show anything for instant loads (< 100ms)
    // Prefetch + cache should make most navigation instant
    if (loadingStage === 'instant') {
        return null;
    }

    // ✅ Fast loads (100-300ms) - Show simple skeleton without spinner
    if (loadingStage === 'fast') {
        return (
            <div className="animate-fade-in">
                <NavigationSkeleton />
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    // ✅ Slow loads (> 300ms) - Full skeleton with spinner
    return (
        <div className="animate-fade-in">
            <NavigationSkeleton />
            <ContentSkeleton />

            {/* Floating spinner overlay */}
            {showSpinner && (
                <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
                    <div className="bg-white dark:bg-gray-900 rounded-full p-4 shadow-2xl border border-gray-200 dark:border-gray-800">
                        <div className="relative">
                            <div className="w-8 h-8 border-3 border-gray-200 dark:border-gray-700 rounded-full" />
                            <div className="absolute top-0 left-0 w-8 h-8 border-3 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ✅ Optional: Loading indicator component for manual use
export function LoadingIndicator({
                                     size = 'md',
                                     message
                                 }: {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
}) {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div className="flex flex-col items-center space-y-3">
            <div className="relative">
                <div className={`${sizeClasses[size]} border-gray-200 dark:border-gray-700 rounded-full`} />
                <div className={`absolute top-0 left-0 ${sizeClasses[size]} border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin`} />
            </div>
            {message && (
                <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );
}