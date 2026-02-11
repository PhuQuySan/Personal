// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Toaster } from 'react-hot-toast';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { AuthErrorHandler } from '@/components/checkerror/AuthErrorHandler'; // 🔥 THÊM DÒNG NÀY

const inter = Inter({
    subsets: ["latin", "vietnamese"],
    display: 'swap',
    variable: '--font-inter',
    preload: true,
});

export const metadata: Metadata = {
    title: {
        default: "ELITE LEADER - Công Nghệ & Chiến Lược | Blog Chuyên Sâu",
        template: "%s | ELITE LEADER"
    },
    description: "Cổng thông tin cá nhân và blog chuyên sâu về Phát triển Mã Nguồn, Lãnh đạo cấp cao và Hệ thống Bảo mật tiên tiến.",
    keywords: ["elite leader", "công nghệ", "chiến lược", "AI", "lãnh đạo", "bảo mật", "nextjs", "react", "development"],
    authors: [{ name: "Elite Leader" }],
    creator: "Elite Leader",
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" className={inter.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
        <head>
            <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        (function() {
                            try {
                                const theme = localStorage.getItem('theme');
                                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                
                                if (theme === 'dark' || (!theme && prefersDark)) {
                                    document.documentElement.classList.add('dark');
                                } else {
                                    document.documentElement.classList.remove('dark');
                                }
                                
                                document.documentElement.classList.add('preload');
                            } catch (e) {}
                        })();
                    `,
                }}
            />
        </head>
        <body className={`${inter.className} antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300`} suppressHydrationWarning>

        {/* 🔥 THÊM DÒNG NÀY */}
        <AuthErrorHandler />

        <NavigationProvider>
            <Navigation />
            <main className="min-h-screen lg:ml-0 transition-all duration-300">
                {children}
            </main>
        </NavigationProvider>

        <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
                duration: 4000,
                style: {
                    background: 'var(--toast-bg, #1e293b)',
                    color: 'var(--toast-color, #fff)',
                    border: '1px solid rgba(255,255,255,0.1)',
                },
                success: {
                    iconTheme: { primary: '#10B981', secondary: '#fff' },
                },
                error: {
                    iconTheme: { primary: '#EF4444', secondary: '#fff' },
                },
            }}
        />

        <script
            dangerouslySetInnerHTML={{
                __html: `
                    (function() {
                        window.addEventListener('load', function() {
                            setTimeout(function() {
                                document.documentElement.classList.remove('preload');
                            }, 100);
                        });

                        if ('requestIdleCallback' in window) {
                            requestIdleCallback(function() {
                                const routes = ['/', '/blog', '/dashboard', '/login'];
                                routes.forEach(function(route) {
                                    const link = document.createElement('link');
                                    link.rel = 'prefetch';
                                    link.href = route;
                                    document.head.appendChild(link);
                                });
                            });
                        }
                        
                        const layout = localStorage.getItem('nav-layout') || 'vertical';
                        if (layout === 'vertical') {
                            document.body.classList.add('vertical-layout');
                        }
                    })();
                `,
            }}
        />
        </body>
        </html>
    );
}