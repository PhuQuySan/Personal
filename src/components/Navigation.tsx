// src/components/Navigation.tsx
'use client';

import Link from 'next/link';
import { LogIn, LayoutDashboard, BookOpen, LogOut, Shield, Lock, Zap, User, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useMemo, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/auth/actions';

type UserRole = 'normal' | 'elite' | 'super_elite' | 'demo';

interface UserProfile {
    full_name?: string;
    avatar_url?: string;
    role: UserRole;
}

interface NavLink {
    name: string;
    href: string;
    icon: ReactNode;
    requiredRoles?: UserRole[];
    hiddenOnMobile?: boolean;
}

async function fetchUserProfile(): Promise<UserProfile | null> {
    if (typeof window === 'undefined') return null;

    const demoUID = 'demo-user-al-elite-leader-uid';
    const demoSessionCookie = document.cookie.split('; ').find(row => row.startsWith('demo-auth-session='))?.split('=')[1];

    if (demoSessionCookie === demoUID) {
        return {
            full_name: "Elite Leader Demo",
            role: 'demo'
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

    const role = (profile?.user_role || 'normal') as UserRole;

    return {
        full_name: profile?.full_name || user.email || 'Người dùng',
        avatar_url: profile?.avatar_url,
        role: role
    };
}

export const Navigation: React.FC = () => {
    const pathname = usePathname();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const isAuthenticated = !!userProfile;
    const userRole = userProfile?.role || 'normal';

    const navLinks: NavLink[] = useMemo(() => [
        { name: 'Trang Chủ', href: '/', icon: <Zap className="w-5 h-5 mr-1" /> },
        { name: 'Thư Viện Blog', href: '/blog', icon: <BookOpen className="w-5 h-5 mr-1" /> },
        {
            name: 'Dashboard Cá nhân', href: '/dashboard',
            icon: <LayoutDashboard className="w-5 h-5 mr-1" />,
            requiredRoles: ['demo', 'normal', 'elite', 'super_elite'],
            hiddenOnMobile: false,
        },
        {
            name: 'Tệp & Bí mật', href: '/dashboard/files',
            icon: <Lock className="w-5 h-5 mr-1" />,
            requiredRoles: ['elite', 'super_elite'],
            hiddenOnMobile: false,
        },
    ], []);

    const adminLinks: NavLink[] = useMemo(() => [
        {
            name: 'Admin Panel', href: '/dashboard/admin',
            icon: <Shield className="w-5 h-5 mr-1 text-red-600 dark:text-red-400" />,
            requiredRoles: ['super_elite']
        },
    ], []);

    useEffect(() => {
        const loadUserProfile = async () => {
            const profile = await fetchUserProfile();
            setUserProfile(profile);
            setIsLoading(false);
        };

        loadUserProfile();

        const { data: { subscription } } = createClient().auth.onAuthStateChange(() => {
            loadUserProfile();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        await signOut();
        setIsDropdownOpen(false);
    };

    if (isLoading) return <div className="h-16 bg-white dark:bg-gray-900 border-b dark:border-gray-700"></div>;

    const getLinkClass = (href: string) =>
        `px-3 py-2 rounded-lg text-sm font-medium transition duration-200 whitespace-nowrap ${
            pathname === href
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        }`;

    return (
        <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        <Zap className="w-6 h-6 text-blue-600 mr-2" />
                        Elite Blog
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => {
                            const shouldShow = !link.requiredRoles || link.requiredRoles.includes(userRole);
                            return shouldShow ? (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={getLinkClass(link.href)}
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            ) : null;
                        })}

                        {/* Admin Links - chỉ hiển thị với super_elite */}
                        {adminLinks.map((link) => {
                            const shouldShow = !link.requiredRoles || link.requiredRoles.includes(userRole);
                            return shouldShow ? (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={getLinkClass(link.href)}
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            ) : null;
                        })}
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        {!isAuthenticated ? (
                            <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition duration-300 flex items-center whitespace-nowrap">
                                <LogIn className="w-5 h-5 mr-1" /> Đăng nhập
                            </Link>
                        ) : (
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition duration-200"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                        {userProfile?.avatar_url ? (
                                            <img
                                                src={userProfile.avatar_url}
                                                alt={userProfile.full_name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        )}
                                    </div>
                                    <span className="hidden sm:inline-block">{userProfile?.full_name}</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{userProfile?.full_name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole}</p>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                href="/dashboard"
                                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <LayoutDashboard className="inline w-4 h-4 mr-2" />
                                                Dashboard
                                            </Link>

                                            {userRole === 'super_elite' && (
                                                <Link
                                                    href="/dashboard/admin"
                                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    <Shield className="inline w-4 h-4 mr-2 text-red-600" />
                                                    Admin Panel
                                                </Link>
                                            )}
                                        </div>

                                        <div className="py-1 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                onClick={handleSignOut}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <LogOut className="inline w-4 h-4 mr-2" />
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-2">
                    <div className="flex flex-wrap gap-1">
                        {navLinks.map((link) => {
                            const shouldShow = !link.requiredRoles || link.requiredRoles.includes(userRole);
                            return shouldShow ? (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition duration-200 whitespace-nowrap ${
                                        pathname === link.href
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            ) : null;
                        })}

                        {adminLinks.map((link) => {
                            const shouldShow = !link.requiredRoles || link.requiredRoles.includes(userRole);
                            return shouldShow ? (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition duration-200 whitespace-nowrap ${
                                        pathname === link.href
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            ) : null;
                        })}
                    </div>
                </div>
            </div>
        </header>
    );
};