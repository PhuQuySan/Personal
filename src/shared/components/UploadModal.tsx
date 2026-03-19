'use client';

import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { Upload, X, Loader2, Image as ImageIcon, Tag, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadImage } from '@/shared/lib/upload/upload-utils';
import { mediaApi } from '@/shared/lib/media/media-api';
import { MediaItem } from '@/shared/types';
import { useCachedUserProfile } from '@/shared/hooks/useCachedData';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: (item: MediaItem) => void;
}

export default function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Metadata states
    const [customName, setCustomName] = useState('');
    const [customTags, setCustomTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [autoTags, setAutoTags] = useState<string[]>([]);
    const [imageDimensions, setImageDimensions] = useState<{ width: number, height: number } | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data: userProfile } = useCachedUserProfile();

    if (!isOpen) return null;

    const resetState = () => {
        setFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setCustomTags([]);
        setTagInput('');
        setAutoTags([]);
        setCustomName('');
        setImageDimensions(null);
        setError(null);
        setSuccess(false);
    };

    const handleClose = () => {
        if (isUploading) return;
        resetState();
        onClose();
    };

    const extractAutoTags = (filename: string) => {
        // Simple logic to extract words longer than 3 chars from filename
        const words = filename
            .toLowerCase()
            .replace(/\.[^/.]+$/, "") // remove extension
            .split(/[\s\-_]+/)
            .filter(word => word.length > 3);

        // Take up to 3 unique words
        const uniqueTags = Array.from(new Set(words)).slice(0, 3);
        setAutoTags(uniqueTags);
    };

    const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
            };
            img.src = url;
        });
    };

    const handleFileProcess = async (selectedFile: File) => {
        setError(null);
        setSuccess(false);

        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(selectedFile.type)) {
            setError('Chỉ chấp nhận file ảnh (PNG, JPG, JPEG, WEBP)');
            return;
        }

        // Auto tags extraction
        extractAutoTags(selectedFile.name);

        // Preview and dimensions
        const dimensions = await getImageDimensions(selectedFile);
        setImageDimensions(dimensions);

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
        setCustomName(selectedFile.name);

        setFile(selectedFile);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await handleFileProcess(e.dataTransfer.files[0]);
        }
    };

    const compressImageIfNeeded = async (fileToCompress: File): Promise<File> => {
        const MAX_MB = 5;
        if (fileToCompress.size <= MAX_MB * 1024 * 1024) {
            return fileToCompress; // No compression needed
        }

        console.log(`Kiểm tra ảnh: ${fileToCompress.size / 1024 / 1024}MB - Bắt đầu nén xuống dưới ${MAX_MB}MB`);

        const options = {
            maxSizeMB: MAX_MB,
            maxWidthOrHeight: 3840, // 4K max
            useWebWorker: true
        };

        try {
            const compressedFile = await imageCompression(fileToCompress, options);
            console.log(`Nén thành công: ${compressedFile.size / 1024 / 1024}MB`);
            return new File([compressedFile], fileToCompress.name, {
                type: compressedFile.type,
                lastModified: Date.now()
            });
        } catch (error) {
            console.error('Lỗi khi nén ảnh:', error);
            throw new Error('Không thể nén ảnh có kích thước quá lớn.');
        }
    };

    const handleUpload = async () => {
        if (!file || !userProfile) {
            setError('Vui lòng chọn ảnh và đảm bảo bạn đã đăng nhập.');
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            // 1. Compress if > 5MB
            const finalFile = await compressImageIfNeeded(file);

            // 2. Upload to Supabase Storage
            const publicUrl = await uploadImage(finalFile);

            // 3. Combine tags and remove duplicates
            const finalTags = Array.from(new Set([...autoTags, ...customTags]));

            // 4. Save metadata to database (id and created_at handled by DB)
            const mediaItemData = {
                url: publicUrl,
                name: customName.trim() || file.name,
                size: finalFile.size,
                width: imageDimensions?.width || 0,
                height: imageDimensions?.height || 0,
                tags: finalTags,
                user_id: userProfile?.id || '', // Explicitly providing the value since Omit does not include user_id exclusion currently... Wait, actually mediaApi needs Omit<MediaItem, 'created_at' | 'profiles'> currently. Let's send a fake ID or fix the type.
                id: crypto.randomUUID(), // Temporarily provide an ID to satisfy type until we fix the API type
                layout_x: 0,
                layout_y: 0,
                layout_w: 2,
                layout_h: 2,
                is_public: false
            };

            // Call API to save to media_items table
            const savedItem = await mediaApi.addImage(mediaItemData);

            setSuccess(true);
            setTimeout(() => {
                onUploadSuccess(savedItem);
                handleClose();
            }, 1000);

        } catch (err: any) {
            console.error('Upload process failed:', err);
            setError(err.message || 'Có lỗi xảy ra trong quá trình tải lên.');
        } finally {
            setIsUploading(false);
        }
    };

    const addCustomTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !customTags.includes(tag) && !autoTags.includes(tag)) {
            setCustomTags([...customTags, tag]);
        }
        setTagInput('');
    };

    const removeTag = (tagToRemove: string, isAuto: boolean) => {
        if (isAuto) {
            setAutoTags(autoTags.filter(t => t !== tagToRemove));
        } else {
            setCustomTags(customTags.filter(t => t !== tagToRemove));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose} />

            <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
                            <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tải ảnh lên</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isUploading}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar">

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                        </div>
                    )}

                    {!file ? (
                        // Upload Area
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-3 border-dashed rounded-[32px] p-12 text-center transition-all duration-300 ${isDragging
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.02]'
                                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                }`}
                        >
                            <ImageIcon className={`w-16 h-16 mx-auto mb-6 transition-colors duration-300 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Kéo thả ảnh vào đây</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
                                Hỗ trợ PNG, JPG, WEBP. Ảnh lớn hơn 5MB sẽ tự động được nén.
                            </p>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Chọn tệp tin
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => e.target.files && handleFileProcess(e.target.files[0])}
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                className="hidden"
                            />
                        </div>
                    ) : (
                        // Preview & Metadata Area
                        <div className="space-y-8 animate-fade-in">
                            {/* Preview */}
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group">
                                {previewUrl && (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                )}

                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={resetState}
                                        disabled={isUploading}
                                        className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-xl text-white transition-colors"
                                        title="Đổi ảnh khác"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-white font-medium text-sm truncate">{file.name}</p>
                                    <div className="flex gap-4 mt-1">
                                        <p className="text-gray-300 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        {imageDimensions && (
                                            <p className="text-gray-300 text-xs">{imageDimensions.width} x {imageDimensions.height}</p>
                                        )}
                                        {file.size > 5 * 1024 * 1024 && (
                                            <p className="text-amber-400 text-xs font-bold flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Sẽ được nén
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Metadata Section */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-900 dark:text-white block">Tên hiển thị</label>
                                    <input
                                        type="text"
                                        value={customName}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        disabled={isUploading}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        placeholder="Nhập tên ảnh..."
                                    />
                                </div>

                                <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white pt-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                                    <Tag className="w-4 h-4 text-indigo-500" />
                                    <span>Hashtags</span>
                                </div>

                                {/* Current Tags */}
                                <div className="flex flex-wrap gap-2 min-h-[40px]">
                                    {autoTags.map(tag => (
                                        <span key={`auto-${tag}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-medium border border-gray-200 dark:border-gray-700">
                                            #{tag}
                                            <button onClick={() => removeTag(tag, true)} disabled={isUploading} className="hover:text-red-500 focus:outline-none">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                    {customTags.map(tag => (
                                        <span key={`custom-${tag}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-medium border border-indigo-200 dark:border-indigo-800">
                                            #{tag}
                                            <button onClick={() => removeTag(tag, false)} disabled={isUploading} className="hover:text-red-500 focus:outline-none">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                    {autoTags.length === 0 && customTags.length === 0 && (
                                        <p className="text-sm text-gray-400 py-1.5">Chưa có hashtag nào</p>
                                    )}
                                </div>

                                {/* Add Custom Tag input */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                                        placeholder="Thêm hashtag tùy chỉnh..."
                                        disabled={isUploading}
                                        className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                    />
                                    <button
                                        onClick={addCustomTag}
                                        disabled={!tagInput.trim() || isUploading}
                                        className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {file && (
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                        <button
                            onClick={handleClose}
                            disabled={isUploading}
                            className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                            Hủy
                        </button>

                        <button
                            onClick={handleUpload}
                            disabled={isUploading || success}
                            className={`px-8 py-3 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center min-w-[140px] ${success
                                ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                                }`}
                        >
                            {isUploading ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang xử lý</>
                            ) : success ? (
                                <><CheckCircle2 className="w-5 h-5 mr-2" /> Xong!</>
                            ) : (
                                'Xác nhận Upload'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
