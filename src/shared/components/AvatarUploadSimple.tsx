// src/components/AvatarUploadSimple.tsx
'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AvatarUploadSimpleProps {
    currentAvatar: string;
    onAvatarChange: (url: string) => void;
}

export default function AvatarUploadSimple({ currentAvatar, onAvatarChange }: AvatarUploadSimpleProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>(currentAvatar);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const processImage = (file: File) => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Tạo canvas để resize và crop
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Cannot get canvas context'));
                        return;
                    }

                    // Kích thước mong muốn
                    const maxSize = 400;
                    const size = Math.min(img.width, img.height);

                    // Set canvas size
                    canvas.width = maxSize;
                    canvas.height = maxSize;

                    // Tính toán vị trí crop để lấy phần giữa (square crop)
                    const sourceX = (img.width - size) / 2;
                    const sourceY = (img.height - size) / 2;

                    // Draw image (crop và resize)
                    ctx.drawImage(
                        img,
                        sourceX, sourceY, size, size, // source
                        0, 0, maxSize, maxSize // destination
                    );

                    // Convert to base64 (chất lượng 0.8 để giảm kích thước)
                    const base64 = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(base64);
                };

                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target?.result as string;
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file hình ảnh');
            return;
        }

        // Validate file size (max 10MB cho file gốc)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Kích thước file không được vượt quá 10MB');
            return;
        }

        setIsProcessing(true);

        try {
            const processedImage = await processImage(file);
            setPreviewUrl(processedImage);
            onAvatarChange(processedImage);
            toast.success('Tải lên avatar thành công!');
        } catch (error) {
            console.error('Processing error:', error);
            toast.error('Có lỗi xảy ra khi xử lý ảnh');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemoveAvatar = () => {
        setPreviewUrl('');
        onAvatarChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        toast.success('Đã xóa avatar');
    };

    const handleUrlInput = () => {
        const url = prompt('Nhập URL hình ảnh avatar:', previewUrl);
        if (url !== null && url.trim() !== '') {
            setPreviewUrl(url.trim());
            onAvatarChange(url.trim());
            toast.success('Đã cập nhật avatar URL');
        }
    };

    return (
        <div className="space-y-4">
            <canvas ref={canvasRef} className="hidden" />

            {/* Preview Avatar */}
            <div className="flex items-center gap-6">
                <div className="relative group">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Avatar preview"
                            className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg object-cover"
                            onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                toast.error('Không thể tải ảnh');
                            }}
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                            <Camera className="w-12 h-12 text-white" />
                        </div>
                    )}

                    {/* Remove button */}
                    {previewUrl && (
                        <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                            title="Xóa avatar"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Upload buttons */}
                <div className="flex-1 space-y-3">
                    <div className="flex gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="avatar-upload"
                        />
                        <label
                            htmlFor="avatar-upload"
                            className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer transition-colors ${
                                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Tải ảnh lên
                                </>
                            )}
                        </label>

                        <button
                            type="button"
                            onClick={handleUrlInput}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Nhập URL
                        </button>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        JPG, PNG hoặc GIF. Tối đa 10MB. Ảnh sẽ tự động crop vuông.
                    </p>
                </div>
            </div>

            {/* Guidelines */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>💡 Mẹo:</strong> Ảnh sẽ tự động được crop thành hình vuông và resize về 400x400px. Chọn ảnh có khuôn mặt ở giữa để có kết quả tốt nhất.
                </p>
            </div>
        </div>
    );
}