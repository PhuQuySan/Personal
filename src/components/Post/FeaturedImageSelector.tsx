// src/components/Post/FeaturedImageSelector.tsx (FIXED - Click vùng để mở file picker)
'use client';

import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, FolderOpen } from 'lucide-react';
import MediaLibrary from '../MediaLibrary';
import { uploadImage, deleteImage } from '@/lib/upload/upload-utils';

interface FeaturedImageSelectorProps {
    value: string;
    onChange: (url: string) => void;
    onRemove: () => void;
    isUploading?: boolean;
    setIsUploading?: (loading: boolean) => void;
}

export default function FeaturedImageSelector({
                                                  value,
                                                  onChange,
                                                  onRemove,
                                                  isUploading = false,
                                                  setIsUploading
                                              }: FeaturedImageSelectorProps) {
    const [showOptions, setShowOptions] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null); // 🌟 Ref cho file input

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        e.target.value = '';

        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Vui lòng chọn file ảnh (PNG, JPG, JPEG, WEBP)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Kích thước ảnh không được vượt quá 5MB');
            return;
        }

        setIsUploading?.(true);

        try {
            const imageUrl = await uploadImage(file);
            onChange(imageUrl);
            setShowOptions(false);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload thất bại. Vui lòng thử lại.');
        } finally {
            setIsUploading?.(false);
        }
    };

    const handleLibrarySelect = (url: string) => {
        onChange(url);
        setIsLibraryOpen(false);
        setShowOptions(false);
    };

    // 🌟 FIX: Click vào drop zone để mở file picker
    const handleDropZoneClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl border-2 border-blue-200 dark:border-gray-700 shadow-lg">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Hình ảnh đại diện
                </label>

                {value ? (
                    <div className="relative mb-3 group">
                        <img
                            src={value}
                            alt="Featured preview"
                            className="w-full h-64 object-cover rounded-xl shadow-xl"
                        />
                        <button
                            type="button"
                            onClick={onRemove}
                            disabled={isUploading}
                            className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 disabled:opacity-50 transition-all duration-200 shadow-lg hover:scale-110"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <>
                        {!showOptions ? (
                            <>
                                {/* 🌟 FIX: Click vào đây để mở file picker trực tiếp */}
                                <div
                                    onClick={handleDropZoneClick}
                                    className="w-full border-2 border-dashed border-blue-300 dark:border-gray-600 rounded-xl p-8 text-center bg-white/50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer group"
                                >
                                    <ImageIcon className="w-16 h-16 mx-auto text-blue-400 group-hover:text-blue-500 mb-3 transition-colors" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                        Kéo thả ảnh vào đây hoặc click để chọn
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        PNG, JPG, WEBP (tối đa 5MB)
                                    </p>
                                </div>

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                    className="hidden"
                                />

                                {/* 🌟 Nút "Chọn từ thư viện" bên dưới */}
                                <div className="mt-3 flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setIsLibraryOpen(true)}
                                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                                    >
                                        <FolderOpen className="w-4 h-4" />
                                        <span>Hoặc chọn từ thư viện</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                                {/* Chọn từ thư viện */}
                                <button
                                    type="button"
                                    onClick={() => setIsLibraryOpen(true)}
                                    className="flex flex-col items-center justify-center p-8 border-2 border-indigo-300 dark:border-indigo-600 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-all duration-200 group"
                                >
                                    <FolderOpen className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                                    <p className="font-bold text-gray-700 dark:text-gray-300">Thư viện</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Chọn từ ảnh có sẵn
                                    </p>
                                </button>

                                {/* Upload mới */}
                                <label className="flex flex-col items-center justify-center p-8 border-2 border-green-300 dark:border-green-600 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-200 cursor-pointer group">
                                    <Upload className="w-12 h-12 text-green-600 dark:text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                                    <p className="font-bold text-gray-700 dark:text-gray-300">Upload mới</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Tải ảnh từ máy tính
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                        className="hidden"
                                    />
                                </label>

                                {/* Cancel button */}
                                <button
                                    type="button"
                                    onClick={() => setShowOptions(false)}
                                    className="col-span-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                >
                                    Hủy
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Media Library Modal */}
            <MediaLibrary
                isOpen={isLibraryOpen}
                onClose={() => setIsLibraryOpen(false)}
                onSelect={handleLibrarySelect}
                mode="select"
            />
        </>
    );
}