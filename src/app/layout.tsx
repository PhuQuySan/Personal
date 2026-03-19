// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/shared/components/Navigation";
import { Toaster } from 'react-hot-toast';
import { NavigationProvider } from '@/shared/contexts/NavigationContext';
import { AuthErrorHandler } from '@/shared/components/checkerror/AuthErrorHandler';
import { ThemeProvider } from "@/shared/components/theme-provider";
import { cn } from "@/shared/lib/utils";

const inter = Inter({
    subsets: ["latin", "vietnamese"],
    display: 'swap',
    variable: '--font-sans',
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
        // suppressHydrationWarning ở đây để next-themes hoạt động không lỗi
        <html lang="vi" suppressHydrationWarning>
        <head>
            <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        </head>

        <body
            // 🔥 SỬA LỖI Ở ĐÂY: Thêm suppressHydrationWarning={true}
            // Lý do: Đoạn script phía dưới tự ý thêm class 'vertical-layout'
            // khiến React báo lỗi lệch pha giữa Server và Client.
            suppressHydrationWarning={true}
            className={cn(
                "min-h-screen bg-background font-sans antialiased transition-colors duration-300",
                inter.variable
            )}
        >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
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
        </ThemeProvider>

        <script
            dangerouslySetInnerHTML={{
                __html: `
                        (function() {
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
                            
                            // Đây là thủ phạm gây lỗi Hydration nếu không có suppressHydrationWarning ở body
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