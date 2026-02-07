// src/components/Navigation.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LogIn, LayoutDashboard, BookOpen, LogOut, Shield, Lock, Zap, User, ChevronDown } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserRole, UserProfile, NavLink } from '@/types';

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

    const isAuthenticated = !!userProfile;
    const userRole = userProfile?.user_role || 'normal';

    const navLinks: NavLink[] = useMemo(() => [
        { name: 'Trang Chủ', href: '/', icon: <Zap className="w-5 h-5 mr-1" /> },
        { name: 'Thư Viện Blog', href: '/blog', icon: <BookOpen className="w-5 h-5 mr-1" /> },
        {
            name: 'Dashboard', href: '/dashboard',
            icon: <LayoutDashboard className="w-5 h-5 mr-1" />,
            requiredRoles: ['demo', 'normal', 'elite', 'super_elite'],
        },
        {
            name: 'Tệp & Bí mật', href: '/dashboard/files',
            icon: <Lock className="w-5 h-5 mr-1" />,
            requiredRoles: ['elite', 'super_elite'],
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

        void loadUserProfile();

        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            setTimeout(() => {
                void loadUserProfile();
            }, 1000);
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

    const getLinkClass = (href: string) =>
        `px-3 py-2 rounded-lg text-sm font-medium transition duration-200 flex items-center whitespace-nowrap ${
            pathname === href
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        }`;

    if (isLoading) {
        return <div className="h-16 bg-white dark:bg-gray-900 border-b dark:border-gray-700"></div>;
    }

    return (
        <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex-shrink-0 text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        <Zap className="w-6 h-6 text-blue-600 mr-2" />
                        Elite Blog
                    </Link>

                    <nav className="hidden md:flex items-center space-x-1">
                        {[...navLinks, ...adminLinks].map((link) => {
                            const shouldShow = !link.requiredRoles || link.requiredRoles.includes(userRole);
                            return shouldShow ? (
                                <Link key={link.href} href={link.href} className={getLinkClass(link.href)}>
                                    {link.icon} {link.name}
                                </Link>
                            ) : null;
                        })}
                    </nav>

                    <div className="flex items-center space-x-4">
                        {!isAuthenticated ? (
                            <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition duration-300 flex items-center">
                                <LogIn className="w-5 h-5 mr-1" /> Đăng nhập
                            </Link>
                        ) : (
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition duration-200"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center relative overflow-hidden">
                                        {userProfile?.avatar_url ? (
                                            <Image
                                                src={userProfile.avatar_url}
                                                alt={userProfile.full_name || 'User'}
                                                fill
                                                className="object-cover"
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
                                            <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setIsDropdownOpen(false)}>
                                                <LayoutDashboard className="inline w-4 h-4 mr-2" /> Dashboard
                                            </Link>
                                        </div>
                                        <div className="py-1 border-t border-gray-200 dark:border-gray-700">
                                            <button onClick={() => void handleSignOut()} className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <LogOut className="inline w-4 h-4 mr-2" /> Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};