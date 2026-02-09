// src/contexts/NavigationContext.tsx (v2.0 - Simplified & Fast)
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { usePrefetchCritical } from '@/hooks/usePrefetch';

interface NavigationContextType {
    // Context is now minimal - prefetching handled by hooks
    version: string;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
    children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
    // ✅ Prefetch critical routes globally on app start
    usePrefetchCritical(['/', '/blog', '/login', '/dashboard']);

    const value: NavigationContextType = {
        version: '2.0',
    };

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation() {
    const context = useContext(NavigationContext);

    if (context === undefined) {
        throw new Error('useNavigation must be used within NavigationProvider');
    }

    return context;
}