// src/components/Navigation.tsx
'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';

export const Navigation: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();

    // Định nghĩa các liên kết
    const navLinks = [
        { name: 'Trang Chủ', href: '/' },
        { name: 'Đăng Nhập', href: '/login', requiresAuth: false, showWhenLoggedIn: false },
        // Liên kết ẨN - Chỉ hiện khi Đăng nhập (isAuthenticated = true)
        { name: 'Dashboard Cá nhân', href: '/dashboard', requiresAuth: true },
        { name: 'Tệp & Bí mật', href: '/dashboard/files', requiresAuth: true },
    ];

    return (
        <nav style={{ padding: '10px 20px', backgroundColor: '#333', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                    ELITE LEADER BLOG
                </Link>
                <div>
                    {navLinks.map((link) => {
                        // Logic hiển thị:
                        // 1. Luôn hiển thị nếu không yêu cầu xác thực VÀ không bị cấm hiển thị khi đã đăng nhập
                        // 2. Chỉ hiển thị nếu yêu cầu xác thực VÀ đã đăng nhập
                        if (
                            (!link.requiresAuth && (link.showWhenLoggedIn === undefined || link.showWhenLoggedIn === true)) ||
                            (link.requiresAuth && isAuthenticated)
                        ) {
                            // Ẩn link Đăng Nhập khi đã đăng nhập
                            if (link.href === '/login' && isAuthenticated) return null;

                            return (
                                <Link key={link.name} href={link.href} style={{ color: 'white', marginLeft: '15px', textDecoration: 'none' }}>
                                    {link.name}
                                </Link>
                            );
                        }
                        return null;
                    })}

                    {/* Nút Đăng Xuất */}
                    {isAuthenticated && (
                        <button
                            onClick={logout}
                            style={{
                                marginLeft: '15px',
                                padding: '5px 10px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            Đăng Xuất
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};