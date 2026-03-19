import React, { useState, useEffect } from 'react';
import { X, Check, Image as ImageIcon, Loader2, Search, ArrowRight, Tag } from 'lucide-react';
import { mediaApi } from '@/shared/lib/media/media-api';
import { MediaItem } from '@/shared/types';
import Link from 'next/link';
import { useCachedUserProfile } from '@/shared/hooks/useCachedData';

interface MediaLibraryProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (imageUrl: string) => void;
}

export default function MediaLibrary({ isOpen, onClose, onSelect }: MediaLibraryProps) {
    const [images, setImages] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { data: userProfile } = useCachedUserProfile();

    useEffect(() => {
        if (isOpen && userProfile) {
            loadImages();
        }
    }, [isOpen, userProfile]);

    const loadImages = async () => {
        setIsLoading(true);
        try {
            // Load all images for selection (could limit to own images if needed, but lets allow selecting any)
            const data = await mediaApi.getImages();
            setImages(data);
        } catch (error) {
            console.error('Lỗi tải ảnh:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = () => {
        const item = images.find(img => img.id === selectedId);
        if (item) {
            onSelect(item.url);
            onClose();
        }
    };

    // Extract all unique tags
    const availableTags = Array.from(new Set(images.flatMap(img => img.tags || []))).sort();

    const filteredImages = images.filter(img => {
        const matchesSearch = img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (img.tags && img.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

        const matchesTag = selectedTag ? img.tags?.includes(selectedTag) : true;

        return matchesSearch && matchesTag;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                            <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chọn Hình Ảnh</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/image"
                            target="_blank"
                            onClick={() => onClose()}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                            Đến Workspace Hình Ảnh <ArrowRight className="w-4 h-4" />
                        </Link>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc thẻ..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all dark:text-white"
                        />
                    </div>

                    {/* Tags Filter */}
                    {availableTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            <button
                                onClick={() => setSelectedTag(null)}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${selectedTag === null
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                Tất cả
                            </button>
                            {availableTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${selectedTag === tag
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <Tag className="w-3 h-3" />
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950/50">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            <p className="text-gray-500 font-medium animate-pulse">Đang tải thư viện...</p>
                        </div>
                    ) : filteredImages.length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center">
                            <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Không tìm thấy hình ảnh nào.</p>
                            <Link href="/dashboard/image" target="_blank" className="mt-4 px-6 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium">
                                Tải ảnh mới lên Workspace
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredImages.map((img) => {
                                const isSelected = selectedId === img.id;
                                return (
                                    <div
                                        key={img.id}
                                        onClick={() => setSelectedId(img.id)}
                                        className={`relative group cursor-pointer aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 ${isSelected
                                            ? 'border-indigo-600 shadow-lg shadow-indigo-500/20 scale-95'
                                            : 'border-transparent hover:border-indigo-300'
                                            }`}
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.name}
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {/* Selection Checkmark */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-200">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}

                                        {/* File name overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                                            <p className="text-xs text-white truncate font-medium drop-shadow-md">
                                                {img.name}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-b-3xl flex items-center justify-between">
                    <p className="text-sm text-gray-500 font-medium">
                        {images.length} ảnh trong thư viện
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!selectedId}
                            className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" /> Chèn Ảnh
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}