// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import {AuthProvider} from "@/components/AuthProvider";
import {Navigation} from "@/components/Navigation"; // Đảm bảo CSS được import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Elite Leader's Personal Blog",
    description: "Cổng thông tin cá nhân và blog của Elite Leader AL.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi">
        <body className={inter.className}>
        {/* Bọc toàn bộ ứng dụng bằng AuthProvider */}
        {/*<AuthProvider>*/}
            <Navigation /> {/* Thanh điều hướng ở đây */}
            <main style={{ padding: '20px' }}>
                {children}
            </main>
        {/*</AuthProvider>*/}
        </body>
        </html>
    );
}