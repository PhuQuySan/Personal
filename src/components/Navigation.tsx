// src/components/Navigation.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    LogIn, LayoutDashboard, BookOpen, LogOut, Shield, Lock, Zap,
    User, ChevronDown, Menu, X, Home, Moon, Sun
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserRole, UserProfile, NavLink } from '@/types';
import { usePrefetch } from '@/hooks/usePrefetch';


async function fetchUserProfile(): Promise<UserProfile | null> {
    if (typeof window === 'undefined') return null;

    const demoUID = 'demo-user-al-elite-leader-uid';
    const demoSessionCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('demo-auth-session='))
        ?.split('=')[1];

    if (demoSessionCookie === demoUID) {
        return {
            full_name: "Elite Leader Demo",
            avatar_url: null,
            user_role: 'demo'
        };
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, user_role')
        .eq('id', user.id)
        .single();

    return {
        full_name: profile?.full_name || user.email || 'Người dùng',
        avatar_url: profile?.avatar_url || null,
        user_role: (profile?.user_role || 'normal') as UserRole
    };
}

export const Navigation: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const isAuthenticated = !!userProfile;
    const userRole = userProfile?.user_role || 'normal';

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

    // Tạo danh sách tất cả routes để prefetch
    const allRoutes = useMemo(() => {
        const routes = [
            '/',
            '/blog',
            '/login',
            '/signup',
        ];

        // Thêm routes dựa vào authentication và role
        if (isAuthenticated) {
            routes.push('/dashboard');

            if (userRole === 'elite' || userRole === 'super_elite') {
                routes.push('/dashboard/files');
            }

            if (userRole === 'super_elite') {
                routes.push('/dashboard/admin');
            }
        }

        return routes;
    }, [isAuthenticated, userRole]);

    // Prefetch routes với hook
    const { prefetchOnHover, isPrefetched } = usePrefetch({
        routes: allRoutes,
        eager: true,
        priority: 'high',
    });

    // Initialize component và prefetch manual routes
    useEffect(() => {
        setIsMounted(true);

        // Manual prefetch cho các navigation links (backup)
        const allLinks = [...navLinks, ...adminLinks];
        allLinks.forEach(link => {
            router.prefetch(link.href);
        });

        // Initialize dark mode từ localStorage
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

        setIsDarkMode(shouldBeDark);
        if (shouldBeDark) {
            document.documentElement.classList.add('dark');
        }

        // Debug log (chỉ trong development)
        if (process.env.NODE_ENV === 'development') {
            console.log('🚀 Navigation initialized');
            console.log('📦 Routes to prefetch:', allRoutes);
        }
    }, [router, navLinks, adminLinks, allRoutes]);

    // Load user profile
    useEffect(() => {
        const loadUserProfile = async () => {
            const profile = await fetchUserProfile();
            setUserProfile(profile);
            setIsLoading(false);
        };

        void loadUserProfile();

        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            void loadUserProfile();
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
            document.cookie = 'demo-auth-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            setIsDropdownOpen(false);
            setUserProfile(null);
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Signout error:', error);
            router.push('/');
        }
    };

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);

        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const closeSidebar = () => setIsSidebarOpen(false);

    const NavItem = ({ link, onClick }: { link: NavLink; onClick?: () => void }) => {
        const isActive = pathname === link.href;
        const shouldShow = !link.requiredRoles || link.requiredRoles.includes(userRole);

        if (!shouldShow) return null;

        return (
            <Link
                href={link.href}
                onClick={onClick}
                onMouseEnter={() => {
                    // Prefetch on hover nếu chưa được prefetch
                    if (!isPrefetched(link.href)) {
                        prefetchOnHover(link.href);
                    }
                }}
                className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg 
                    transition-all duration-200 group relative overflow-hidden
                    ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
                `}
            >
                <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {link.icon}
                </span>
                <span className="font-medium">{link.name}</span>
                {isActive && (
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                )}
            </Link>
        );
    };

    if (!isMounted || isLoading) {
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

    const allLinks = [...navLinks, ...adminLinks];

    return (
        <>
            {/* Top Navigation Bar */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo & Mobile Menu Button */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                aria-label="Toggle menu"
                            >
                                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>

                            <Link
                                href="/"
                                className="flex items-center gap-2 group"
                                onMouseEnter={() => prefetchOnHover('/')}
                            >
                                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                    Elite Blog
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-2">
                            {allLinks.map((link) => (
                                <NavItem key={link.href} link={link} />
                            ))}
                        </nav>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-3">
                            {/* Dark Mode Toggle */}
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                                aria-label="Toggle dark mode"
                            >
                                {isDarkMode ? (
                                    <Sun className="w-5 h-5" />
                                ) : (
                                    <Moon className="w-5 h-5" />
                                )}
                            </button>

                            {/* User Menu */}
                            {!isAuthenticated ? (
                                <Link
                                    href="/login"
                                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30 transition-all duration-300 flex items-center gap-2 hover:scale-105"
                                    onMouseEnter={() => prefetchOnHover('/login')}
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span className="hidden sm:inline">Đăng nhập</span>
                                </Link>
                            ) : (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center relative overflow-hidden shadow-lg">
                                            {userProfile?.avatar_url ? (
                                                <Image
                                                    src={userProfile.avatar_url}
                                                    alt={userProfile.full_name || 'User'}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <User className="w-5 h-5 text-white" />
                                            )}
                                        </div>
                                        <span className="hidden md:inline-block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {userProfile?.full_name}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isDropdownOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setIsDropdownOpen(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl py-2 z-50 border border-gray-200 dark:border-gray-700 animate-slide-down">
                                                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                        {userProfile?.full_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1 flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                        {userRole}
                                                    </p>
                                                </div>
                                                <div className="py-2">
                                                    <Link
                                                        href="/dashboard"
                                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                        onMouseEnter={() => prefetchOnHover('/dashboard')}
                                                    >
                                                        <LayoutDashboard className="w-4 h-4" />
                                                        Dashboard
                                                    </Link>
                                                </div>
                                                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                                                    <button
                                                        onClick={() => void handleSignOut()}
                                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Đăng xuất
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

            {/* Mobile Sidebar */}
            <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={closeSidebar}
                />

                {/* Sidebar */}
                <div className={`absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex flex-col h-full">
                        {/* Sidebar Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                            <Link
                                href="/"
                                className="flex items-center gap-2 group"
                                onClick={closeSidebar}
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xl font-bold text-gray-900 dark:text-white">
                                    Elite Blog
                                </span>
                            </Link>
                            <button
                                onClick={closeSidebar}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {allLinks.map((link) => (
                                <NavItem
                                    key={link.href}
                                    link={link}
                                    onClick={closeSidebar}
                                />
                            ))}
                        </nav>

                        {/* Sidebar Footer */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                                <button
                                    onClick={toggleDarkMode}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {isDarkMode ? (
                                        <>
                                            <Sun className="w-4 h-4" />
                                            <span className="text-sm">Light</span>
                                        </>
                                    ) : (
                                        <>
                                            <Moon className="w-4 h-4" />
                                            <span className="text-sm">Dark</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {!isAuthenticated ? (
                                <Link
                                    href="/login"
                                    className="w-full px-4 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg transition-all flex items-center justify-center gap-2"
                                    onClick={closeSidebar}
                                    onMouseEnter={() => prefetchOnHover('/login')}
                                >
                                    <LogIn className="w-4 h-4" />
                                    Đăng nhập
                                </Link>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center relative overflow-hidden">
                                            {userProfile?.avatar_url ? (
                                                <Image
                                                    src={userProfile.avatar_url}
                                                    alt={userProfile.full_name || 'User'}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <User className="w-5 h-5 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                {userProfile?.full_name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                {userRole}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            closeSidebar();
                                            void handleSignOut();
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};