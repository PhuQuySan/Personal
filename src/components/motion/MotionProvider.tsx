'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface MotionProviderProps {
    children: ReactNode;
}

export const MotionProvider = ({ children }: MotionProviderProps) => {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                // Dùng scale nhẹ (0.98) và opacity thay vì kéo y từ dưới lên
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.01 }}
                transition={{
                    duration: 0.25, // Thời gian vừa đủ, không quá chậm gây cảm giác lag
                    ease: [0.22, 1, 0.36, 1], // Cubic-bezier chuẩn "mượt" (Quint out)
                }}
                className="w-full origin-top" // origin-top giúp scale từ trên xuống tự nhiên hơn
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};