// src/components/Navigation.tsx
'use client';

import Link from 'next/link';
import { LogIn, LayoutDashboard, BookOpen, LogOut, Shield, Lock, Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useMemo, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/auth/actions';

type UserRole = 'normal' | 'elite' | 'super_elite' | 'demo';

interface UserProfile {
    role: UserRole;
}

interface NavLink {
    name: string;
    href: string;
    icon: ReactNode;
    requiredRoles?: UserRole[];
    hiddenOnMobile?: boolean;
}

async function fetchUserRole(): Promise<UserProfile | null> {
    const demoUID = 'demo-user-al-elite-leader-uid';
    const demoSessionCookie = document.cookie.split('; ').find(row => row.startsWith('demo-auth-session='))?.split('=')[1];

    if (demoSessionCookie === demoUID) {
        return { role: 'demo' };
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('id', user.id)
        .single();

    const role = (profile?.user_role || 'normal') as UserRole;

    return { role: role };
}

export const Navigation: React.FC = () => {
    // 1. KHAI BÁO TẤT CẢ HOOKS Ở ĐÂY (Cấp cao nhất)
    const pathname = usePathname();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!userProfile;
    const userRole = userProfile?.role || 'normal';

    // 🌟 useMemo PHẢI Ở ĐÂY
    const navLinks: NavLink[] = useMemo(() => [
        { name: 'Trang Chủ', href: '/', icon: <Zap className="w-5 h-5 mr-1" /> },
        { name: 'Thư Viện Blog', href: '/blog', icon: <BookOpen className="w-5 h-5 mr-1" /> },
        {
            name: 'Dashboard Cá nhân', href: '/dashboard',
            icon: <LayoutDashboard className="w-5 h-5 mr-1" />,
            requiredRoles: ['demo', 'normal', 'elite', 'super_elite'],
            hiddenOnMobile: true,
        },
        {
            name: 'Tệp & Bí mật', href: '/dashboard/files',
            icon: <Lock className="w-5 h-5 mr-1" />,
            requiredRoles: ['elite', 'super_elite'],
            hiddenOnMobile: true,
        },
        {
            name: 'Admin Panel', href: '/dashboard',
            icon: <Shield className="w-5 h-5 mr-1 text-red-600 dark:text-red-400" />,
            requiredRoles: ['super_elite']
        },
    ], []); // Dependencies trống nghĩa là chỉ chạy một lần

    // useEffect PHẢI Ở ĐÂY
    useEffect(() => {
        fetchUserRole().then(profile => {
            setUserProfile(profile);
            setIsLoading(false);
        });

        const { data: { subscription } } = createClient().auth.onAuthStateChange(() => {
            fetchUserRole().then(setUserProfile);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);


    const handleSignOut = async () => {
        await signOut();
    };

    // 2. Lệnh return có điều kiện phải nằm SAU TẤT CẢ HOOKS
    if (isLoading) return <div className="h-16 bg-white dark:bg-gray-900 border-b dark:border-gray-700"></div>;

    // ... (Phần JSX còn lại) ...
    const getLinkClass = (href: string) =>
        `px-3 py-2 rounded-lg text-sm font-medium transition duration-200 whitespace-nowrap ${
            pathname === href
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        }`;

    return (
        <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 shadow-md sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex-shrink-0 text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        <Zap className="w-6 h-6 text-blue-600 mr-2" />
                        Elite Blog
                    </Link>

                    <div className="flex items-center space-x-2 md:space-x-4">
                        <nav className="flex items-center space-x-2">
                            {navLinks.map((link) => {
                                const shouldShow = !link.requiredRoles || link.requiredRoles.includes(userRole);

                                if (shouldShow) {
                                    return (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className={`${getLinkClass(link.href)} ${link.hiddenOnMobile ? 'hidden sm:flex' : 'flex'}`}
                                        >
                                            {link.icon}
                                            {link.name}
                                        </Link>
                                    );
                                }
                                return null;
                            })}
                        </nav>

                        <div className="ml-4">
                            {!isAuthenticated ? (
                                <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition duration-300 flex items-center whitespace-nowrap">
                                    <LogIn className="w-5 h-5 mr-1" /> Đăng nhập
                                </Link>
                            ) : (
                                <button onClick={handleSignOut} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition duration-300 flex items-center whitespace-nowrap">
                                    <LogOut className="w-5 h-5 mr-1" /> Đăng xuất
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};