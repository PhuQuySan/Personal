// src/hooks/useCachedData.ts (v4.0 - Fixed Auth Invalidation)
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

interface CacheConfig {
    ttl?: number;
    staleWhileRevalidate?: boolean;
    aggressive?: boolean;
}

const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes

class CacheManager {
    private cache = new Map<string, CacheEntry<any>>();
    private pendingRequests = new Map<string, Promise<any>>();
    private revalidating = new Set<string>();
    private listeners = new Map<string, Set<() => void>>();

    get<T>(key: string): CacheEntry<T> | null {
        const entry = this.cache.get(key);
        if (!entry) return null;
        return entry as CacheEntry<T>;
    }

    set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttl,
        });

        // Notify listeners
        this.notifyListeners(key);
    }

    delete(key: string): void {
        this.cache.delete(key);
        this.notifyListeners(key);
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

    // Subscribe to cache changes
    subscribe(key: string, callback: () => void): () => void {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key)!.add(callback);

        return () => {
            const listeners = this.listeners.get(key);
            if (listeners) {
                listeners.delete(callback);
                if (listeners.size === 0) {
                    this.listeners.delete(key);
                }
            }
        };
    }

    private notifyListeners(key: string): void {
        const listeners = this.listeners.get(key);
        if (listeners) {
            listeners.forEach(callback => callback());
        }
    }

    clear(): void {
        this.cache.clear();
        this.pendingRequests.clear();
        this.revalidating.clear();

        // Notify all listeners
        this.listeners.forEach((listeners) => {
            listeners.forEach(callback => callback());
        });
    }

    clearExpired(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt + DEFAULT_TTL) {
                this.cache.delete(key);
            }
        }
    }
}

const globalCache = new CacheManager();

// Cleanup very old entries
if (typeof window !== 'undefined') {
    setInterval(() => {
        globalCache.clearExpired();
    }, 5 * 60 * 1000);
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
            if (!forceRefresh) {
                const cached = globalCache.get<T>(key);

                if (cached) {
                    const expired = globalCache.isExpired(key);
                    const stale = globalCache.isStale(key, 60 * 1000);

                    updateState(cached.data, expired || stale);

                    if (aggressive && (expired || stale) && staleWhileRevalidate) {
                        void fetchFreshData(true);
                        return;
                    }

                    if (!expired) return;
                }

                const pending = globalCache.getPendingRequest<T>(key);
                if (pending) {
                    const result = await pending;
                    updateState(result, false);
                    return;
                }
            }

            await fetchFreshData(false);
        } catch (err) {
            if (isMountedRef.current) {
                setError(err instanceof Error ? err : new Error('Unknown error'));
                setLoading(false);
            }
        }
    }, [key, aggressive, staleWhileRevalidate, updateState, fetchFreshData]);

    // ✅ Subscribe to cache changes
    useEffect(() => {
        const unsubscribe = globalCache.subscribe(key, () => {
            const cached = globalCache.get<T>(key);
            if (cached && isMountedRef.current) {
                updateState(cached.data, false);
            }
        });

        return unsubscribe;
    }, [key, updateState]);

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
 * Hook for caching user profile with auto-invalidation on auth change
 */
export function useCachedUserProfile() {
    const { data, loading, error, isStale, refetch } = useCachedData(
        'user-profile',
        async () => {
            const { fetchUserProfile } = await import('@/lib/fetchUserProfile');
            return fetchUserProfile();
        },
        {
            ttl: 10 * 60 * 1000,
            staleWhileRevalidate: true,
            aggressive: true,
        }
    );

    // ✅ Listen to auth changes and force refetch
    useEffect(() => {
        const supabase = createClient();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'SIGNED_IN') {
                console.log('🔐 User signed in - clearing cache and refetching');
                globalCache.delete('user-profile');
                await refetch();
            } else if (event === 'SIGNED_OUT') {
                console.log('🔐 User signed out - clearing cache');
                globalCache.delete('user-profile');
                // Set null immediately
                globalCache.set('user-profile', null);
            }
        });

        return () => subscription.unsubscribe();
    }, [refetch]);

    return { data, loading, error, isStale, refetch };
}

export function clearAllCache() {
    globalCache.clear();
}

export const cacheManager = {
    get: <T>(key: string) => globalCache.get<T>(key),
    set: <T>(key: string, data: T, ttl?: number) => globalCache.set(key, data, ttl),
    delete: (key: string) => globalCache.delete(key),
    clear: () => globalCache.clear(),
};