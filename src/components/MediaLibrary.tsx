// src/components/MediaLibrary.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, Check, Image as ImageIcon, Loader2, Search, Grid3x3, List, AlertCircle } from 'lucide-react';
import { uploadImage, deleteImage } from '@/lib/upload/upload-utils';

interface MediaLibraryProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect?: (imageUrl: string) => void;
    mode?: 'select' | 'manage';
}

interface MediaItem {
    id: string;
    url: string;
    name: string;
    size: number;
    uploadedAt: string;
}

export default function MediaLibrary({ isOpen, onClose, onSelect, mode = 'manage' }: MediaLibraryProps) {
    const [images, setImages] = useState<MediaItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isLoading, setIsLoading] = useState(true);
    const [uploadError, setUploadError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadImages();
        }
    }, [isOpen]);

    const loadImages = async () => {
        setIsLoading(true);
        try {
            console.log('📂 Loading media library...');
            const storedImages = localStorage.getItem('mediaLibrary');

            if (storedImages) {
                const parsed = JSON.parse(storedImages);
                console.log('✅ Loaded images:', parsed.length);
                setImages(parsed);
            } else {
                console.log('📭 No images in library');
                setImages([]);
            }
        } catch (error) {
            console.error('❌ Error loading images:', error);
            setImages([]);
        } finally {
            setIsLoading(false);
        }
    };

    const saveImages = (newImages: MediaItem[]) => {
        try {
            localStorage.setItem('mediaLibrary', JSON.stringify(newImages));
            setImages(newImages);
            console.log('💾 Saved images:', newImages.length);
        } catch (error) {
            console.error('❌ Error saving images:', error);
            alert('Lỗi lưu ảnh. LocalStorage có thể đầy.');
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        console.log('📤 Starting upload:', files.length, 'files');
        setIsUploading(true);
        setUploadError(null);

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                console.log('📤 Uploading:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);

                const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    throw new Error(`File ${file.name} không phải ảnh hợp lệ`);
                }

                if (file.size > 5 * 1024 * 1024) {
                    throw new Error(`File ${file.name} vượt quá 5MB`);
                }

                const url = await uploadImage(file);
                console.log('✅ Uploaded:', file.name, '→', url);

                return {
                    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                    url,
                    name: file.name,
                    size: file.size,
                    uploadedAt: new Date().toISOString()
                };
            });

            const newItems = await Promise.all(uploadPromises);
            const updatedImages = [...images, ...newItems];
            saveImages(updatedImages);

            console.log('🎉 Upload completed!');
        } catch (error) {
            console.error('❌ Upload error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Upload thất bại';
            setUploadError(errorMessage);
            alert(errorMessage);
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async (item: MediaItem) => {
        if (!confirm(`Xóa ảnh "${item.name}"?`)) return;

        try {
            console.log('🗑️ Deleting:', item.name);

            if (item.url.includes('supabase.co')) {
                await deleteImage(item.url);
            }

            const updatedImages = images.filter(img => img.id !== item.id);
            saveImages(updatedImages);
            console.log('✅ Deleted:', item.name);
        } catch (error) {
            console.error('❌ Delete error:', error);
            alert('Xóa thất bại.');
        }
    };

    const handleSelect = (url: string) => {
        if (mode === 'select' && onSelect) {
            console.log('✅ Selected image:', url);
            onSelect(url);
            onClose();
        } else {
            setSelectedImage(selectedImage === url ? null : url);
        }
    };

    const filteredImages = images.filter(img =>
        img.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <ImageIcon className="w-7 h-7 text-white" />
                        <div>
                            <h3 className="text-2xl font-bold text-white">Thư viện Hình ảnh</h3>
                            <p className="text-sm text-white/80 mt-1">
                                {images.length} ảnh • {mode === 'select' ? 'Chọn ảnh để sử dụng' : 'Quản lý thư viện'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center justify-between gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm ảnh..."
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-700 rounded-lg p-1 border border-gray-300 dark:border-gray-600">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded transition-all duration-200 ${
                                    viewMode === 'grid'
                                        ? 'bg-indigo-500 text-white'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                            >
                                <Grid3x3 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded transition-all duration-200 ${
                                    viewMode === 'list'
                                        ? 'bg-indigo-500 text-white'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Upload Button */}
                        <label className="cursor-pointer px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 flex items-center space-x-2">
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Đang tải...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    <span>Upload ảnh</span>
                                </>
                            )}
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleUpload}
                                disabled={isUploading}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Error Message */}
                    {uploadError && (
                        <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-800 dark:text-red-300">{uploadError}</p>
                            </div>
                            <button
                                onClick={() => setUploadError(null)}
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">Đang tải thư viện...</p>
                        </div>
                    ) : filteredImages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <ImageIcon className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" />
                            <h4 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                                {searchQuery ? 'Không tìm thấy ảnh' : 'Thư viện trống'}
                            </h4>
                            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                                {searchQuery
                                    ? 'Thử tìm kiếm với từ khóa khác'
                                    : 'Hãy upload ảnh đầu tiên vào thư viện của bạn'}
                            </p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredImages.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleSelect(item.url)}
                                    className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-4 transition-all duration-200 ${
                                        selectedImage === item.url || (mode === 'select')
                                            ? 'border-indigo-500 shadow-lg shadow-indigo-500/50 scale-95'
                                            : 'border-transparent hover:border-indigo-300 hover:shadow-xl'
                                    }`}
                                >
                                    <img
                                        src={item.url}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <p className="text-white text-xs font-medium truncate">{item.name}</p>
                                            <p className="text-white/70 text-xs">
                                                {(item.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>

                                    {/* Selected Check */}
                                    {selectedImage === item.url && (
                                        <div className="absolute top-2 right-2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                                            <Check className="w-5 h-5 text-white" />
                                        </div>
                                    )}

                                    {/* Delete Button */}
                                    {mode === 'manage' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(item);
                                            }}
                                            className="absolute top-2 left-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 shadow-lg"
                                        >
                                            <Trash2 className="w-4 h-4 text-white" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredImages.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleSelect(item.url)}
                                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                                        selectedImage === item.url
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'border-transparent hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }`}
                                >
                                    <img
                                        src={item.url}
                                        alt={item.name}
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {(item.size / 1024 / 1024).toFixed(2)} MB • {new Date(item.uploadedAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    {selectedImage === item.url && (
                                        <Check className="w-6 h-6 text-indigo-500" />
                                    )}
                                    {mode === 'manage' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(item);
                                            }}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {mode === 'select' && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-all duration-200"
                        >
                            Hủy
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}