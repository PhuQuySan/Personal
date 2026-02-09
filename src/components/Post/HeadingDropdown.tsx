// src/components/Post/HeadingDropdown.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Heading, ChevronDown } from 'lucide-react';

interface HeadingDropdownProps {
    onSelect: (tag: string) => void;
}

const HEADING_OPTIONS = [
    { tag: 'h1', label: 'Tiêu đề 1', size: 'text-3xl' },
    { tag: 'h2', label: 'Tiêu đề 2', size: 'text-2xl' },
    { tag: 'h3', label: 'Tiêu đề 3', size: 'text-xl' },
    { tag: 'h4', label: 'Tiêu đề 4', size: 'text-lg' },
    { tag: 'h5', label: 'Tiêu đề 5', size: 'text-base' },
    { tag: 'h6', label: 'Tiêu đề 6', size: 'text-sm' },
    { tag: 'p', label: 'Văn bản thường', size: 'text-base' },
];

export default function HeadingDropdown({ onSelect }: HeadingDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (tag: string) => {
        onSelect(tag);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm transition-all duration-200 group flex items-center space-x-1"
                title="Chọn kiểu tiêu đề"
            >
                <Heading className="w-4 h-4 text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                <ChevronDown className={`w-3 h-3 text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    {HEADING_OPTIONS.map((option) => (
                        <button
                            key={option.tag}
                            type="button"
                            onClick={() => handleSelect(option.tag)}
                            className="w-full px-4 py-3 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0 group"
                        >
                            <div className={`${option.size} font-semibold text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors`}>
                                {option.label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                &lt;{option.tag}&gt;
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}