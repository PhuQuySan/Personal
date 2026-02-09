// src/components/Post/SAVEPOST/SaveButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { savePost, unsavePost, checkIfPostSaved } from '@/app/auth/saved-post.actions';
import toast from 'react-hot-toast';

interface SaveButtonProps {
    postId: number;
}

export default function SaveButton({ postId }: SaveButtonProps) {
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Kiểm tra trạng thái lưu khi component mount
    useEffect(() => {
        async function checkSavedStatus() {
            const result = await checkIfPostSaved(postId);
            setIsSaved(result.isSaved);
        }
        checkSavedStatus();
    }, [postId]);

    const handleToggleSave = async () => {
        setIsLoading(true);

        try {
            if (isSaved) {
                const result = await unsavePost(postId);
                if (result.success) {
                    setIsSaved(false);
                    toast.success('Đã bỏ lưu bài viết');
                } else {
                    toast.error(result.error || 'Có lỗi xảy ra');
                }
            } else {
                const result = await savePost(postId);
                if (result.success) {
                    setIsSaved(true);
                    toast.success('Đã lưu bài viết');
                } else {
                    toast.error(result.error || 'Có lỗi xảy ra');
                }
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggleSave}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                isSaved
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Đã lưu' : 'Lưu bài viết'}
        </button>
    );
}