// src/components/InsertImageModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Upload, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface InsertImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (url: string, align: 'left' | 'center' | 'right' | 'none') => void;
}

type ImageAlign = 'left' | 'center' | 'right' | 'none';

export default function InsertImageModal({ isOpen, onClose, onInsert }: InsertImageModalProps) {
    const [imageUrl, setImageUrl] = useState('');
    const [align, setAlign] = useState<ImageAlign>('center');
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (imageUrl.trim()) {
            onInsert(imageUrl.trim(), align);
            resetForm();
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setImageUrl('');
        setAlign('center');
        setIsUploading(false);
        setActiveTab('url');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);

            setTimeout(() => {
                const fakeImageUrl = URL.createObjectURL(file);
                setImageUrl(fakeImageUrl);
                setIsUploading(false);
                setActiveTab('url');
            }, 1500);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Chèn hình ảnh
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Thêm hình ảnh vào nội dung
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content - THAY THẾ FORM BẰNG DIV */}
                <div className="p-6">
                    {/* Tab Selection */}
                    <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setActiveTab('upload')}
                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all duration-200 ${
                                activeTab === 'upload'
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <div className="flex items-center justify-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Tải lên</span>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('url')}
                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all duration-200 ${
                                activeTab === 'url'
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <div className="flex items-center justify-center space-x-2">
                                <LinkIcon className="w-4 h-4" />
                                <span>URL</span>
                            </div>
                        </button>
                    </div>

                    {/* URL Input */}
                    {activeTab === 'url' && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    URL hình ảnh
                                </label>
                                <input
                                    id="imageUrl"
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* File Upload */}
                    {activeTab === 'upload' && (
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center transition-all duration-200 hover:border-blue-500 dark:hover:border-blue-400">
                                <input
                                    type="file"
                                    id="fileUpload"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <label htmlFor="fileUpload" className="cursor-pointer">
                                    <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        <span className="text-blue-600 dark:text-blue-400 font-medium">Click để tải lên</span> hoặc kéo thả
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                        PNG, JPG, GIF tối đa 5MB
                                    </p>
                                </label>
                            </div>
                            {isUploading && (
                                <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                                    <span className="text-sm">Đang tải lên...</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Preview */}
                    {imageUrl && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xem trước:</p>
                            <div className="relative aspect-video bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Alignment Options */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Căn chỉnh
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'left' as const, icon: AlignLeft, label: 'Trái' },
                                { value: 'center' as const, icon: AlignCenter, label: 'Giữa' },
                                { value: 'right' as const, icon: AlignRight, label: 'Phải' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setAlign(option.value)}
                                    className={`p-3 border rounded-xl flex flex-col items-center space-y-2 transition-all duration-200 ${
                                        align === option.value
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                                >
                                    <option.icon className="w-5 h-5" />
                                    <span className="text-xs font-medium">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all duration-200"
                        >
                            Hủy
                        </button>
                        <button
                            type="button" // ĐỔI THÀNH type="button"
                            onClick={handleSubmit} // THÊM onClick
                            disabled={!imageUrl.trim()}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                        >
                            Chèn hình ảnh
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}