// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Toaster } from 'react-hot-toast';
import { NavigationProvider } from '@/contexts/NavigationContext';

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
    keywords: [
        "elite leader",
        "công nghệ",
        "chiến lược",
        "AI",
        "lãnh đạo",
        "bảo mật",
        "nextjs",
        "react",
        "development"
    ],
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
            {/* DNS Prefetch for external resources */}
            <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://fptbkwagiqgwssmgkhqy.supabase.co" />
        </head>
        <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {/* CRITICAL: Inline script để prevent flash - PHẢI ở đầu body */}
        <script
            dangerouslySetInnerHTML={{
                __html: `
                            (function() {
                                try {
                                    // Prevent flash by setting theme immediately
                                    const theme = localStorage.getItem('theme');
                                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                    
                                    if (theme === 'dark' || (!theme && prefersDark)) {
                                        document.documentElement.classList.add('dark');
                                    } else {
                                        document.documentElement.classList.remove('dark');
                                    }
                                    
                                    // Prevent animation flash on load
                                    document.documentElement.classList.add('preload');
                                    
                                    // Remove preload after load
                                    window.addEventListener('load', function() {
                                        setTimeout(function() {
                                            document.documentElement.classList.remove('preload');
                                        }, 100);
                                    });
                                } catch (e) {}
                            })();
                        `,
            }}
        />

        <NavigationProvider>
            <Navigation />
            <main className="min-h-screen">
                {children}
            </main>
        </NavigationProvider>

        <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
                duration: 4000,
                style: {
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                },
                success: {
                    duration: 3000,
                    iconTheme: {
                        primary: '#10B981',
                        secondary: '#fff',
                    },
                },
                error: {
                    duration: 5000,
                    iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff',
                    },
                },
            }}
        />

        {/* Prefetch routes sau khi page load */}
        <script
            dangerouslySetInnerHTML={{
                __html: `
                            (function() {
                                if ('requestIdleCallback' in window) {
                                    requestIdleCallback(function() {
                                        const routes = ['/', '/blog', '/dashboard', '/login', '/signup'];
                                        routes.forEach(function(route) {
                                            const link = document.createElement('link');
                                            link.rel = 'prefetch';
                                            link.href = route;
                                            link.as = 'document';
                                            document.head.appendChild(link);
                                        });
                                    });
                                } else {
                                    setTimeout(function() {
                                        const routes = ['/', '/blog', '/dashboard', '/login', '/signup'];
                                        routes.forEach(function(route) {
                                            const link = document.createElement('link');
                                            link.rel = 'prefetch';
                                            link.href = route;
                                            link.as = 'document';
                                            document.head.appendChild(link);
                                        });
                                    }, 100);
                                }
                            })();
                        `,
            }}
        />
        </body>
        </html>
    );
}