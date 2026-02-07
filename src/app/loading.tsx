// src/app/loading.tsx

'use client';

import { useEffect, useState } from 'react';

export default function Loading() {
    const [shouldShow, setShouldShow] = useState(false);

    useEffect(() => {
        // Chỉ show loading nếu page load quá 300ms
        // Với prefetch, page sẽ load ngay nên không bao giờ thấy loading
        const timer = setTimeout(() => {
            setShouldShow(true);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    // Không show gì nếu chưa quá 300ms
    if (!shouldShow) {
        return null;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50 dark:bg-gray-900/80 animate-fade-in">
            <div className="flex flex-col items-center space-y-4">
                {/* Circular Loading Spinner */}
                <div className="relative">
                    {/* Outer ring */}
                    <div className="w-12 h-12 border-4 border-gray-200 rounded-full dark:border-gray-700"></div>
                    {/* Spinning ring */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin dark:border-blue-500"></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
                    Đang tải...
                </p>
            </div>
        </div>
    );
}