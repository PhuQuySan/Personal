// src/hooks/useCachedData.ts (v3.0 - Ultra Optimized)
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

interface CacheConfig {
    ttl?: number;
    staleWhileRevalidate?: boolean;
    aggressive?: boolean; // Serve stale data immediately, revalidate silently
}

const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes (increased from 5)

class CacheManager {
    private cache = new Map<string, CacheEntry<any>>();
    private pendingRequests = new Map<string, Promise<any>>();
    private revalidating = new Set<string>();

    get<T>(key: string): CacheEntry<T> | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // ✅ AGGRESSIVE MODE: Return stale data even if expired
        // We'll revalidate in background
        return entry as CacheEntry<T>;
    }

    set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttl,
        });
    }

    isExpired(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) return true;
        return Date.now() > entry.expiresAt;
    }

    isStale(key: string, maxAge: number = 60 * 1000): boolean {
        const entry = this.cache.get(key);
        if (!entry) return true;
        return Date.now() - entry.timestamp > maxAge;
    }

    getPendingRequest<T>(key: string): Promise<T> | null {
        return this.pendingRequests.get(key) || null;
    }

    setPendingRequest(key: string, promise: Promise<any>): void {
        this.pendingRequests.set(key, promise);
        promise.finally(() => {
            this.pendingRequests.delete(key);
        });
    }

    isRevalidating(key: string): boolean {
        return this.revalidating.has(key);
    }

    setRevalidating(key: string, state: boolean): void {
        if (state) {
            this.revalidating.add(key);
        } else {
            this.revalidating.delete(key);
        }
    }

    clear(): void {
        this.cache.clear();
        this.pendingRequests.clear();
        this.revalidating.clear();
    }

    clearExpired(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            // Only clear if VERY old (2x TTL)
            if (now > entry.expiresAt + DEFAULT_TTL) {
                this.cache.delete(key);
            }
        }
    }
}

const globalCache = new CacheManager();

// Cleanup very old entries only
if (typeof window !== 'undefined') {
    setInterval(() => {
        globalCache.clearExpired();
    }, 5 * 60 * 1000); // Every 5 minutes
}

export function useCachedData<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig = {}
) {
    const {
        ttl = DEFAULT_TTL,
        staleWhileRevalidate = true,
        aggressive = true
    } = config;

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isStale, setIsStale] = useState(false);

    const fetcherRef = useRef(fetcher);
    const isMountedRef = useRef(true);
    fetcherRef.current = fetcher;

    const updateState = useCallback((newData: T, isStaleData: boolean = false) => {
        if (!isMountedRef.current) return;
        setData(newData);
        setLoading(false);
        setError(null);
        setIsStale(isStaleData);
    }, []);

    const fetchFreshData = useCallback(async (silent: boolean = false) => {
        if (globalCache.isRevalidating(key)) return;

        try {
            globalCache.setRevalidating(key, true);

            const fetchPromise = fetcherRef.current();
            if (!silent) {
                globalCache.setPendingRequest(key, fetchPromise);
            }

            const result = await fetchPromise;

            globalCache.set(key, result, ttl);

            if (isMountedRef.current) {
                updateState(result, false);
            }
        } catch (err) {
            console.error(`[Cache] Revalidation failed for ${key}:`, err);
            if (!silent && isMountedRef.current) {
                setError(err instanceof Error ? err : new Error('Unknown error'));
            }
        } finally {
            globalCache.setRevalidating(key, false);
        }
    }, [key, ttl, updateState]);

    const fetchData = useCallback(async (forceRefresh = false) => {
        try {
            // ✅ STEP 1: Check cache FIRST (even if expired in aggressive mode)
            if (!forceRefresh) {
                const cached = globalCache.get<T>(key);

                if (cached) {
                    const expired = globalCache.isExpired(key);
                    const stale = globalCache.isStale(key, 60 * 1000);

                    // ✅ ALWAYS serve cached data immediately
                    updateState(cached.data, expired || stale);

                    // ✅ Revalidate in background if needed
                    if (aggressive && (expired || stale) && staleWhileRevalidate) {
                        void fetchFreshData(true); // Silent revalidation
                        return;
                    }

                    if (!expired) return;
                }

                // ✅ STEP 2: Check pending requests (dedupe)
                const pending = globalCache.getPendingRequest<T>(key);
                if (pending) {
                    const result = await pending;
                    updateState(result, false);
                    return;
                }
            }

            // ✅ STEP 3: Fetch fresh data
            await fetchFreshData(false);
        } catch (err) {
            if (isMountedRef.current) {
                setError(err instanceof Error ? err : new Error('Unknown error'));
                setLoading(false);
            }
        }
    }, [key, aggressive, staleWhileRevalidate, updateState, fetchFreshData]);

    useEffect(() => {
        isMountedRef.current = true;
        void fetchData();

        return () => {
            isMountedRef.current = false;
        };
    }, [key]);

    const refetch = useCallback(() => fetchData(true), [fetchData]);

    return {
        data,
        loading,
        error,
        isStale,
        refetch,
    };
}

/**
 * Hook for caching user profile with ULTRA aggressive mode
 */
export function useCachedUserProfile() {
    return useCachedData(
        'user-profile',
        async () => {
            const { fetchUserProfile } = await import('@/lib/fetchUserProfile');
            return fetchUserProfile();
        },
        {
            ttl: 10 * 60 * 1000, // 10 minutes
            staleWhileRevalidate: true,
            aggressive: true, // ✅ Always serve cached data instantly
        }
    );
}

export function clearAllCache() {
    globalCache.clear();
}

export const cacheManager = {
    get: <T>(key: string) => globalCache.get<T>(key),
    set: <T>(key: string, data: T, ttl?: number) => globalCache.set(key, data, ttl),
    clear: () => globalCache.clear(),
    clearKey: (key: string) => {
        const entry = globalCache.get(key);
        if (entry) globalCache.clear();
    },
};