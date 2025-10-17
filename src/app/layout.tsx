// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import {AuthProvider} from "@/components/AuthProvider";
import { Navigation } from "@/components/Navigation";
// import { LoadingProvider } from "@/contexts/LoadingContext";
import { Toaster } from 'react-hot-toast';

const inter = Inter({
    subsets: ["latin", "vietnamese"],
    display: 'swap',
    variable: '--font-inter',
});

// export const metadata: Metadata = {
//     title: {
//         default: "ELITE LEADER - Công Nghệ & Chiến Lược | Blog Chuyên Sâu",
//         template: "%s | ELITE LEADER"
//     },
//     description: "Cổng thông tin cá nhân và blog chuyên sâu về Phát triển Mã Nguồn, Lãnh đạo cấp cao và Hệ thống Bảo mật tiên tiến. Khám phá chiến lược AI, công nghệ hiện đại và phát triển bản thân.",
//     keywords: [
//         "elite leader",
//         "công nghệ",
//         "chiến lược",
//         "AI",
//         "lãnh đạo",
//         "bảo mật",
//         "nextjs",
//         "react",
//         "development",
//         "blog công nghệ",
//         "phát triển phần mềm",
//         "quản lý dự án",
//         "hệ thống bảo mật",
//         "trí tuệ nhân tạo"
//     ],
//     authors: [{ name: "Elite Leader", url: "https://elite-leader.com" }],
//     creator: "Elite Leader",
//     publisher: "Elite Leader",
//     formatDetection: {
//         email: false,
//         address: false,
//         telephone: false,
//     },
//     metadataBase: new URL('https://elite-leader.com'),
//     alternates: {
//         canonical: '/',
//         languages: {
//             'vi-VN': '/vi-VN',
//         },
//     },
//     openGraph: {
//         type: 'website',
//         locale: 'vi_VN',
//         url: 'https://elite-leader.com',
//         siteName: 'ELITE LEADER',
//         title: "ELITE LEADER - Công Nghệ & Chiến Lược | Blog Chuyên Sâu",
//         description: "Blog chuyên sâu về Phát triển Mã Nguồn, Lãnh đạo cấp cao và Hệ thống Bảo mật tiên tiến",
//         images: [
//             {
//                 url: '/og-image.jpg',
//                 width: 1200,
//                 height: 630,
//                 alt: 'ELITE LEADER - Công Nghệ & Chiến Lược',
//             },
//         ],
//     },
//     twitter: {
//         card: 'summary_large_image',
//         title: "ELITE LEADER - Công Nghệ & Chiến Lược",
//         description: "Blog chuyên sâu về Phát triển Mã Nguồn, Lãnh đạo và Bảo mật",
//         creator: '@eliteleader',
//         images: ['/og-image.jpg'],
//     },
//     robots: {
//         index: true,
//         follow: true,
//         googleBot: {
//             index: true,
//             follow: true,
//             'max-video-preview': -1,
//             'max-image-preview': 'large',
//             'max-snippet': -1,
//         },
//     },
//     verification: {
//         // Thêm các verification codes cho Google Search Console, Bing, etc.
//         // google: 'your-google-verification-code',
//         // yandex: 'your-yandex-verification-code',
//         // yahoo: 'your-yahoo-verification-code',
//     },
//     category: 'technology',
// };

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" data-scroll-behavior="smooth" className={inter.variable}>
        <body className={`${inter.className} antialiased`}>
        {/* Bọc toàn bộ ứng dụng bằng AuthProvider */}
        {/*<AuthProvider>*/}
        {/*<LoadingProvider>*/}

        {/* Thanh điều hướng */}
        <Navigation />

        {/* Main content */}
        <main className="min-h-screen">
            {children}
            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
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
        </main>

        {/*</LoadingProvider>*/}
        {/*</AuthProvider>*/}
        </body>
        </html>
    );
}