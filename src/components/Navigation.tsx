// src/components/Navigation.tsx (v4.0 - Glass Morphism + Zero Lag)
'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    LogIn, LayoutDashboard, BookOpen, LogOut, Shield, Lock, Zap,
    User, ChevronDown, Menu, X, Home, Moon, Sun, Columns, Rows
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserRole, NavLink } from '@/types';
import { usePrefetch, usePrefetchCritical } from '@/hooks/usePrefetch';
import { useCachedUserProfile, clearAllCache } from '@/hooks/useCachedData';

type LayoutMode = 'vertical' | 'horizontal';

export const Navigation: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // ✅ INSTANT DATA - Always serve cached data immediately
    const { data: userProfile, isStale } = useCachedUserProfile();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // ✅ Safe initial value - matches server
        if (typeof window === 'undefined') return false;
        return false; // Will be updated in useEffect
    });
    const [layoutMode, setLayoutMode] = useState<LayoutMode>('vertical');
    const [isMounted, setIsMounted] = useState(false);

    const isAuthenticated = !!userProfile;
    const userRole = userProfile?.user_role || 'normal';

    // Memoize navigation links
    const navLinks: NavLink[] = useMemo(() => [
        { name: 'Trang Chủ', href: '/', icon: <Home className="w-5 h-5" /> },
        { name: 'Thư Viện Blog', href: '/blog', icon: <BookOpen className="w-5 h-5" /> },
        {
            name: 'Dashboard', href: '/dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />,
            requiredRoles: ['demo', 'normal', 'elite', 'super_elite'],
        },
        {
            name: 'Tệp & Bí mật', href: '/dashboard/files',
            icon: <Lock className="w-5 h-5" />,
            requiredRoles: ['elite', 'super_elite'],
        },
    ], []);

    const adminLinks: NavLink[] = useMemo(() => [
        {
            name: 'Admin Panel', href: '/dashboard/admin',
            icon: <Shield className="w-5 h-5" />,
            requiredRoles: ['super_elite']
        },
    ], []);

    // ✅ CRITICAL ROUTES - Prefetch immediately
    const criticalRoutes = useMemo(() => ['/', '/blog', '/login'], []);
    usePrefetchCritical(criticalRoutes);

    // ✅ USER ROUTES - Prefetch based on auth
    const userRoutes = useMemo(() => {
        const routes: string[] = [];
        if (isAuthenticated) {
            routes.push('/dashboard');
            if (userRole === 'elite' || userRole === 'super_elite') {
                routes.push('/dashboard/files');
            }
            if (userRole === 'super_elite') {
                routes.push('/dashboard/admin');
            }
        } else {
            routes.push('/signup');
        }
        return routes;
    }, [isAuthenticated, userRole]);

    const { prefetchOnHover, isPrefetched } = usePrefetch({
        routes: userRoutes,
        eager: true,
        priority: 'high',
    });

    // ✅ INSTANT MOUNT - No loading state needed
    useEffect(() => {
        // Set mounted first
        setIsMounted(true);

        // Then update theme from actual DOM state (already set by inline script)
        const isDark = document.documentElement.classList.contains('dark');
        setIsDarkMode(isDark);

        // Initialize layout
        const savedLayout = localStorage.getItem('nav-layout') as LayoutMode;
        setLayoutMode(savedLayout || 'vertical');
    }, []);

    // ✅ Auth state changes - only refetch, no re-render needed
    useEffect(() => {
        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                // Data will update automatically via cache
                console.log('🔐 Auth changed:', event);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    // ✅ INSTANT SIGN OUT
    const handleSignOut = useCallback(async () => {
        startTransition(async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            document.cookie = 'demo-auth-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            clearAllCache();
            setIsDropdownOpen(false);
            router.push('/');
        });
    }, [router]);

    // ✅ INSTANT THEME TOGGLE - No lag
    const toggleDarkMode = useCallback(() => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);

        // Update DOM instantly
        document.documentElement.classList.toggle('dark', newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    }, [isDarkMode]);

    // ✅ INSTANT LAYOUT TOGGLE
    const toggleLayoutMode = useCallback(() => {
        const newMode: LayoutMode = layoutMode === 'vertical' ? 'horizontal' : 'vertical';
        setLayoutMode(newMode);
        localStorage.setItem('nav-layout', newMode);
        document.body.classList.toggle('vertical-layout', newMode === 'vertical');
    }, [layoutMode]);

    const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

    // ✅ Memoized NavItem
    const NavItem = useCallback(({ link, onClick }: { link: NavLink; onClick?: () => void }) => {
        const isActive = pathname === link.href;
        const shouldShow = !link.requiredRoles || link.requiredRoles.includes(userRole);

        if (!shouldShow) return null;

        return (
            <Link
                href={link.href}
                onClick={onClick}
                onMouseEnter={() => prefetchOnHover(link.href)}
                className={`
                    group relative flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-colors duration-200
                    ${isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/5'
                }
                `}
            >
                {/* Glass morphism background */}
                <div className={`
                    absolute inset-0 rounded-xl backdrop-blur-sm
                    ${isActive ? 'bg-white/40 dark:bg-white/5' : 'bg-transparent group-hover:bg-white/30 dark:group-hover:bg-white/5'}
                    transition-colors duration-200
                `} />

                <span className="relative z-10">
                    {link.icon}
                </span>
                <span className="relative z-10 font-medium">{link.name}</span>

                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full" />
                )}
            </Link>
        );
    }, [pathname, userRole, prefetchOnHover]);

    // ✅ NO LOADING STATE - Prevent hydration mismatch
    if (!isMounted) {
        // Return minimal structure that matches initial render
        return null;
    }

    const allLinks = [...navLinks, ...adminLinks];

    // ================== HORIZONTAL LAYOUT ==================
    if (layoutMode === 'horizontal') {
        return (
            <>
                <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            {/* Logo */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all"
                                >
                                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </button>

                                <Link href="/" className="flex items-center gap-2 group" onMouseEnter={() => prefetchOnHover('/')}>
                                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                        Elite Blog
                                    </span>
                                </Link>
                            </div>

                            {/* Desktop Nav */}
                            <nav className="hidden lg:flex items-center gap-2">
                                {allLinks.map((link) => (
                                    <NavItem key={link.href} link={link} />
                                ))}
                            </nav>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                {/* Layout Toggle */}
                                <button
                                    onClick={toggleLayoutMode}
                                    className="hidden lg:flex p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all"
                                    title="Switch to Vertical"
                                >
                                    <Rows className="w-5 h-5" />
                                </button>

                                {/* Theme Toggle */}
                                <button
                                    onClick={toggleDarkMode}
                                    className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all"
                                >
                                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                </button>

                                {/* User Menu */}
                                {!isAuthenticated ? (
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30 transition-colors"
                                        onMouseEnter={() => prefetchOnHover('/login')}
                                    >
                                        <LogIn className="w-4 h-4 inline mr-2" />
                                        <span className="hidden sm:inline">Đăng nhập</span>
                                    </Link>
                                ) : (
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center relative overflow-hidden shadow-lg">
                                                {userProfile?.avatar_url ? (
                                                    <Image src={userProfile.avatar_url} alt={userProfile.full_name || 'User'} fill className="object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-white" />
                                                )}
                                            </div>
                                            <span className="hidden md:inline text-sm font-medium">{userProfile?.full_name}</span>
                                            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                                                <div className="absolute right-0 mt-2 w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden">
                                                    <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                                                        <p className="text-sm font-semibold truncate">{userProfile?.full_name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">
                                                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                                                            {userRole}
                                                            {isStale && <span className="text-yellow-500 ml-2">(updating...)</span>}
                                                        </p>
                                                    </div>
                                                    <div className="py-2">
                                                        <Link
                                                            href="/dashboard"
                                                            className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                            onMouseEnter={() => prefetchOnHover('/dashboard')}
                                                        >
                                                            <LayoutDashboard className="w-4 h-4" />
                                                            Dashboard
                                                        </Link>
                                                    </div>
                                                    <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-2">
                                                        <button
                                                            onClick={() => void handleSignOut()}
                                                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-all"
                                                            disabled={isPending}
                                                        >
                                                            <LogOut className="w-4 h-4" />
                                                            {isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <MobileSidebar
                    isSidebarOpen={isSidebarOpen}
                    closeSidebar={closeSidebar}
                    allLinks={allLinks}
                    NavItem={NavItem}
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                    isAuthenticated={isAuthenticated}
                    userProfile={userProfile}
                    userRole={userRole}
                    handleSignOut={handleSignOut}
                    prefetchOnHover={prefetchOnHover}
                    isPending={isPending}
                />
            </>
        );
    }

    // ================== VERTICAL LAYOUT ==================
    return (
        <>
            {/* Vertical Sidebar - Glass Morphism */}
            <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 flex-col z-40 shadow-lg">
                {/* Logo */}
                <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50">
                    <Link href="/" className="flex items-center gap-3 group" onMouseEnter={() => prefetchOnHover('/')}>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            Elite Blog
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                    {allLinks.map((link) => (
                        <NavItem key={link.href} link={link} />
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50 space-y-3">
                    <button
                        onClick={toggleLayoutMode}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all"
                    >
                        <Columns className="w-5 h-5" />
                        <span className="text-sm font-medium">Horizontal Mode</span>
                    </button>

                    <button
                        onClick={toggleDarkMode}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        <span className="text-sm font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>

                    {/* User Section */}
                    {!isAuthenticated ? (
                        <Link
                            href="/login"
                            className="w-full px-4 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg transition-colors flex items-center justify-center gap-2"
                            onMouseEnter={() => prefetchOnHover('/login')}
                        >
                            <LogIn className="w-4 h-4" />
                            Đăng nhập
                        </Link>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 px-3 py-2 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center relative overflow-hidden">
                                    {userProfile?.avatar_url ? (
                                        <Image src={userProfile.avatar_url} alt={userProfile.full_name || 'User'} fill className="object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-white" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{userProfile?.full_name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => void handleSignOut()}
                                disabled={isPending}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-50"
                            >
                                <LogOut className="w-4 h-4" />
                                {isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
                <div className="px-4 h-16 flex items-center justify-between">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all">
                        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            Elite Blog
                        </span>
                    </Link>

                    <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all">
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </header>

            <MobileSidebar
                isSidebarOpen={isSidebarOpen}
                closeSidebar={closeSidebar}
                allLinks={allLinks}
                NavItem={NavItem}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                isAuthenticated={isAuthenticated}
                userProfile={userProfile}
                userRole={userRole}
                handleSignOut={handleSignOut}
                prefetchOnHover={prefetchOnHover}
                isPending={isPending}
            />
        </>
    );
};

// Mobile Sidebar with Glass Morphism
const MobileSidebar = ({ isSidebarOpen, closeSidebar, allLinks, NavItem, isDarkMode, toggleDarkMode, isAuthenticated, userProfile, userRole, handleSignOut, prefetchOnHover, isPending }: any) => (
    <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeSidebar} />
        <div className={`absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-800/50">
                    <Link href="/" className="flex items-center gap-2" onClick={closeSidebar}>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold">Elite Blog</span>
                    </Link>
                    <button onClick={closeSidebar} className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                    {allLinks.map((link: any) => (
                        <NavItem key={link.href} link={link} onClick={closeSidebar} />
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                        <button
                            onClick={toggleDarkMode}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all"
                        >
                            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            <span className="text-sm">{isDarkMode ? 'Light' : 'Dark'}</span>
                        </button>
                    </div>

                    {!isAuthenticated ? (
                        <Link
                            href="/login"
                            className="w-full px-4 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg transition-colors flex items-center justify-center gap-2"
                            onClick={closeSidebar}
                            onMouseEnter={() => prefetchOnHover('/login')}
                        >
                            <LogIn className="w-4 h-4" />
                            Đăng nhập
                        </Link>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 px-3 py-2 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center relative overflow-hidden">
                                    {userProfile?.avatar_url ? (
                                        <Image src={userProfile.avatar_url} alt={userProfile.full_name || 'User'} fill className="object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-white" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{userProfile?.full_name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { closeSidebar(); void handleSignOut(); }}
                                disabled={isPending}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-50"
                            >
                                <LogOut className="w-4 h-4" />
                                {isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
);