// src/components/loading/TechLoading.tsx
'use client';

import { useEffect, useState } from 'react';

interface TechLoadingProps {
    duration?: number; // Thời gian loading (ms)
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    onComplete?: () => void;
}

export const TechLoading: React.FC<TechLoadingProps> = ({
                                                            duration = 2000,
                                                            message = "Đang tải...",
                                                            size = 'md',
                                                            onComplete
                                                        }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(0);

    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-16 h-16',
        lg: 'w-20 h-20'
    };

    const textSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const newProgress = Math.min((elapsed / duration) * 100, 100);

            setProgress(newProgress);

            if (elapsed < duration) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setIsVisible(false);
                setTimeout(() => {
                    onComplete?.();
                }, 300);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [duration, onComplete]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center transition-opacity duration-300">
            <div className="flex flex-col items-center space-y-4 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
                {/* Circular Loading */}
                <div className="relative">
                    {/* Outer ring */}
                    <div className={`${sizeClasses[size]} border-4 border-gray-600/30 rounded-full`}></div>

                    {/* Progress ring */}
                    <div
                        className={`${sizeClasses[size]} border-4 border-transparent rounded-full absolute top-0 left-0`}
                        style={{
                            background: `conic-gradient(
                from 0deg at 50% 50%,
                #3b82f6 0%, 
                #3b82f6 ${progress}%, 
                transparent ${progress}%, 
                transparent 100%
              )`,
                            mask: 'radial-gradient(white 55%, transparent 56%)',
                            WebkitMask: 'radial-gradient(white 55%, transparent 56%)'
                        }}
                    ></div>

                    {/* Inner circle with pulse effect */}
                    <div
                        className={`${sizeClasses[size]} rounded-full absolute top-0 left-0 flex items-center justify-center`}
                        style={{
                            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
                        }}
                    >
                        <div className="w-1/3 h-1/3 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                </div>

                {/* Message */}
                <div className="text-center">
                    <p className={`text-white font-medium ${textSizes[size]} mb-1`}>
                        {message}
                    </p>
                    <p className="text-blue-300 text-xs">
                        {Math.round(progress)}%
                    </p>
                </div>
            </div>
        </div>
    );
};