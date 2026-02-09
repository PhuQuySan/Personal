// src/components/Post/EmojiPickerModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Smile, Search } from 'lucide-react';

interface EmojiPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (emoji: string) => void;
}

const EMOJI_CATEGORIES = {
    'Mặt cười': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋'],
    'Cảm xúc': ['😭', '😢', '😥', '😰', '😓', '🤗', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😞', '😔', '😟', '😕', '😤', '😠'],
    'Bàn tay': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️'],
    'Tim': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'],
    'Động vật': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆'],
    'Thiên nhiên': ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🌿', '🍀', '🌾', '🌵', '🌴', '🌳', '🌲', '🎄', '⭐', '🌟', '✨', '💫', '☀️', '🌙'],
    'Đồ ăn': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥝', '🍍', '🥥', '🥑', '🍕', '🍔', '🌭', '🍟', '🍿', '🧂', '🍰'],
    'Hoạt động': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '🪁', '🎯'],
};

export default function EmojiPickerModal({ isOpen, onClose, onSelect }: EmojiPickerModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Mặt cười');

    const handleSelect = (emoji: string) => {
        onSelect(emoji);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <Smile className="w-6 h-6 text-white" />
                        <h3 className="text-xl font-bold text-white">Chọn Emoji</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm emoji..."
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {Object.keys(EMOJI_CATEGORIES).map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                                    selectedCategory === category
                                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Emoji Grid */}
                    <div className="grid grid-cols-8 gap-2">
                        {EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES].map((emoji, index) => (
                            <button
                                key={index}
                                onClick={() => handleSelect(emoji)}
                                className="text-3xl p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-125 active:scale-95"
                                title={emoji}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-end border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-all duration-200"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}