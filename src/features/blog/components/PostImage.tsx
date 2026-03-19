// src/components/PostImage.tsx
'use client';

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface PostImageProps {
    src: string | null | undefined;
    alt: string;
    className?: string;
}

export default function PostImage({ src, alt, className = '' }: PostImageProps) {
    const [imageError, setImageError] = useState(false);

    if (!src || imageError) {
        return (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 ${className}`}>
                <ImageIcon className="w-12 h-12 text-gray-500 dark:text-gray-400" />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${className}`}
            onError={() => setImageError(true)}
            loading="lazy"
        />
    );
}