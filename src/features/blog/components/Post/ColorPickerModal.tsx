// src/components/Post/ColorPickerModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Palette, Check } from 'lucide-react';

interface ColorPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (color: string) => void;
}

const PRESET_COLORS = [
    { name: 'Đỏ', value: '#EF4444' },
    { name: 'Cam', value: '#F97316' },
    { name: 'Vàng', value: '#EAB308' },
    { name: 'Xanh lá', value: '#22C55E' },
    { name: 'Xanh dương', value: '#3B82F6' },
    { name: 'Xanh indigo', value: '#6366F1' },
    { name: 'Tím', value: '#A855F7' },
    { name: 'Hồng', value: '#EC4899' },
    { name: 'Đen', value: '#000000' },
    { name: 'Xám', value: '#6B7280' },
    { name: 'Trắng', value: '#FFFFFF' },
    { name: 'Nâu', value: '#92400E' },
];

export default function ColorPickerModal({ isOpen, onClose, onSelect }: ColorPickerModalProps) {
    const [customColor, setCustomColor] = useState('#3B82F6');
    const [selectedColor, setSelectedColor] = useState('');

    const handleSelect = (color: string) => {
        setSelectedColor(color);
        onSelect(color);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 dark:from-pink-600 dark:to-purple-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <Palette className="w-6 h-6 text-white" />
                        <h3 className="text-xl font-bold text-white">Chọn màu chữ</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Preset Colors */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                            Màu sẵn có
                        </h4>
                        <div className="grid grid-cols-4 gap-3">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => handleSelect(color.value)}
                                    className="group relative flex flex-col items-center p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                                    title={color.name}
                                >
                                    <div
                                        className="w-12 h-12 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-200 border-2 border-gray-200 dark:border-gray-600"
                                        style={{ backgroundColor: color.value }}
                                    >
                                        {selectedColor === color.value && (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Check className="w-6 h-6 text-white drop-shadow-lg" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        {color.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Color */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                            Màu tùy chỉnh
                        </h4>
                        <div className="flex items-center space-x-3">
                            <input
                                type="color"
                                value={customColor}
                                onChange={(e) => setCustomColor(e.target.value)}
                                className="w-20 h-20 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                            />
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={customColor}
                                    onChange={(e) => setCustomColor(e.target.value)}
                                    placeholder="#3B82F6"
                                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                                />
                                <button
                                    onClick={() => handleSelect(customColor)}
                                    className="mt-2 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors"
                                >
                                    Áp dụng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}