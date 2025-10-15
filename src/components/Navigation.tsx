// src/components/Navigation.tsx
'use client';

import Link from 'next/link';
import { LogIn, LayoutDashboard, BookOpen, LogOut, Shield, Lock, Zap, User, ChevronDown } from 'lucide-react';
import {usePathname, useRouter} from 'next/navigation';
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
    //console.log('🔍 [fetchUserProfile] Bắt đầu fetch user profile');

    if (typeof window === 'undefined') {
        //console.log('❌ [fetchUserProfile] Chạy trên server, return null');
        return null;
    }

    const demoUID = 'demo-user-al-elite-leader-uid';
    const demoSessionCookie = document.cookie.split('; ').find(row => row.startsWith('demo-auth-session='))?.split('=')[1];

    //console.log('🍪 [fetchUserProfile] Demo cookie:', demoSessionCookie);

    if (demoSessionCookie === demoUID) {
        //console.log('👤 [fetchUserProfile] Đang dùng demo account');
        return {
            full_name: "Elite Leader Demo",
            role: 'demo'
        };
    }

    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    //console.log('👤 [fetchUserProfile] Supabase user:', user);
    //console.log('❌ [fetchUserProfile] User error:', userError);

    if (!user) {
        //console.log('❌ [fetchUserProfile] Không có user, return null');
        return null;
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, user_role')
        .eq('id', user.id)
        .single();

    //console.log('📊 [fetchUserProfile] Profile data:', profile);
    //console.log('❌ [fetchUserProfile] Profile error:', profileError);

    const role = (profile?.user_role || 'normal') as UserRole;

    //console.log('🎯 [fetchUserProfile] Final role:', role);

    return {
        full_name: profile?.full_name || user.email || 'Người dùng',
        avatar_url: profile?.avatar_url,
        role: role
    };
}

export const Navigation: React.FC = () => {

    const pathname = usePathname();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const isAuthenticated = !!userProfile;
    const userRole = userProfile?.role || 'normal';

    //console.log('🔄 [Navigation] Render state:', {
    //     userProfile,
    //     isLoading,
    //     isAuthenticated,
    //     userRole,
    //     pathname
    // });

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

// Trong useEffect hiện tại, sửa lại phần listener:
    useEffect(() => {
        //console.log('🚀 [useEffect] Bắt đầu load user profile');

        const loadUserProfile = async () => {
            //console.log('📥 [loadUserProfile] Đang gọi fetchUserProfile...');
            const profile = await fetchUserProfile();
            //console.log('✅ [loadUserProfile] Nhận được profile:', profile);
            setUserProfile(profile);
            setIsLoading(false);
        };

        loadUserProfile();

        // Theo dõi thay đổi auth state - THÊM DELAY ĐỂ ĐẢM BẢO
        //console.log('👂 [useEffect] Thiết lập auth state listener');
        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                //console.log('🎯 [onAuthStateChange] Event:', event, 'Session:', session ? 'Có session' : 'Không session');

                // Thêm delay nhỏ để đảm bảo session được thiết lập
                setTimeout(() => {
                    //console.log('🔄 [onAuthStateChange] Gọi lại loadUserProfile sau delay');
                    loadUserProfile();
                }, 1000);
            }
        );

        return () => {
            //console.log('🧹 [useEffect] Cleanup - unsubscribe listener');
            subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        //console.log('🚪 [handleSignOut] Bắt đầu đăng xuất');
        try {
            // 1. Đăng xuất khỏi Supabase
            const supabase = createClient();
            const { error } = await supabase.auth.signOut();

            if (error) {
               // console.error('❌ [handleSignOut] Lỗi Supabase signOut:', error);
            }

            // 2. Xóa demo cookie (nếu có)
            document.cookie = 'demo-auth-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

            //console.log('✅ [handleSignOut] Đăng xuất thành công');
            setIsDropdownOpen(false);

            // QUAN TRỌNG: Dùng client-side navigation thay vì reload
            //console.log('🔄 [handleSignOut] Chuyển hướng về trang chủ (client-side)');
            router.push('/');
            // HOẶC router.refresh() nếu muốn giữ state hiện tại

        } catch (error) {
            console.error('❌ [handleSignOut] Lỗi đăng xuất:', error);
            router.push('/');
        }
    };


    if (isLoading) {
        //console.log('⏳ [Navigation] Đang loading...');
        return <div className="h-16 bg-white dark:bg-gray-900 border-b dark:border-gray-700"></div>;
    }

    //console.log('🎨 [Navigation] Rendering UI với isAuthenticated:', isAuthenticated);

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
                            //console.log(`🔗 [NavLink] ${link.name}: shouldShow=${shouldShow}, userRole=${userRole}, requiredRoles=${link.requiredRoles}`);
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
                            //console.log(`🛡️ [AdminLink] ${link.name}: shouldShow=${shouldShow}, userRole=${userRole}`);
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
                            <>
                                <div className="text-sm text-gray-500">(Chưa đăng nhập)</div>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition duration-300 flex items-center whitespace-nowrap"
                                >
                                    <LogIn className="w-5 h-5 mr-1" /> Đăng nhập
                                </Link>
                            </>
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
                            //console.log(`📱 [MobileNavLink] ${link.name}: shouldShow=${shouldShow}`);
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