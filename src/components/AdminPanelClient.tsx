// src/components/AdminPanelClient.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { upsertPost, deletePost } from '@/app/auth/post.actions';
import {
    Pencil,
    Trash2,
    Globe,
    Lock,
    Shield,
    PlusCircle,
    Check,
    X,
    Loader2
} from 'lucide-react';
import PostForm from './PostForm';
import { Post } from './AdminPanel';

interface AdminPanelClientProps {
    initialPosts: Post[];
}

const getAccessIcon = (level: Post['access_level']) => {
    switch (level) {
        case 'super_elite':
            return <Shield className="w-4 h-4 text-red-600" />;
        case 'elite':
            return <Lock className="w-4 h-4 text-yellow-600" />;
        default:
            return <Globe className="w-4 h-4 text-green-600" />;
    }
};

export default function AdminPanelClient({ initialPosts }: AdminPanelClientProps) {
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [deletingPostId, setDeletingPostId] = useState<number | null>(null);

    const currentFormTitle = editingPost
        ? `Chỉnh sửa Bài viết: ${editingPost.title}`
        : 'Tạo Bài Viết Mới';

    const currentFormDefaultPost = editingPost || undefined;
    const isFormOpen = editingPost !== null || isCreatingNew;

    // Sửa: handleFormSubmit phải nhận FormData làm tham số và trả về kết quả
    const handleFormSubmit = async (formData: FormData) => {
        const result = await upsertPost(formData);
        if (result?.success) {
            setEditingPost(null);
            setIsCreatingNew(false);
        }
        return result;
    };

    // Thêm hàm xử lý xóa bài viết
    const handleDeletePost = async (postId: number, event: React.FormEvent) => {
        event.preventDefault();

        // Xác nhận trước khi xóa
        if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            return;
        }

        setDeletingPostId(postId);
        try {
            const result = await deletePost(postId);
            if (result?.success) {
                // Cập nhật UI: loại bỏ bài viết đã xóa khỏi danh sách
                // Hoặc reload lại trang để cập nhật
                window.location.reload();
            } else if (result?.error) {
                alert(`Lỗi: ${result.error}`);
            }
        } catch (error) {
            console.error('Lỗi khi xóa bài viết:', error);
            alert('Có lỗi xảy ra khi xóa bài viết');
        } finally {
            setDeletingPostId(null);
        }
    };

    return (
        <>
            {/* Form Tạo/Sửa Bài Viết */}
            <h3 className="text-2xl font-semibold mb-4 text-blue-700 dark:text-blue-400 border-b pb-2 flex justify-between items-center">
                {currentFormTitle}
                <button
                    onClick={() => {
                        if (isFormOpen) {
                            setEditingPost(null);
                            setIsCreatingNew(false);
                        } else {
                            setIsCreatingNew(true);
                            setEditingPost(null);
                        }
                    }}
                    className={`text-sm px-4 py-1 rounded-full font-medium transition duration-200 ${
                        isFormOpen
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    {isFormOpen ? 'Đóng Form' : (
                        <>
                            <PlusCircle className='w-4 h-4 inline-block mr-1' /> Tạo Mới
                        </>
                    )}
                </button>
            </h3>

            {isFormOpen && (
                <div className='mb-8 transition-all duration-300'>
                    <PostForm
                        action={handleFormSubmit}
                        defaultPost={currentFormDefaultPost}
                    />
                </div>
            )}

            {/* Danh sách Bài Viết */}
            <h3 className="text-2xl font-semibold mt-10 mb-4 text-blue-700 dark:text-blue-400 border-b pb-2">
                Quản lý {initialPosts.length || 0} Bài Viết
            </h3>

            <div className="space-y-3">
                {initialPosts.map((post) => (
                    <div
                        key={post.id}
                        className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg transition duration-150 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <div className="flex-1 min-w-0 mr-4">
                            <p className="font-semibold text-lg truncate">{post.title}</p>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-3 mt-1">
                <span className="flex items-center">
                  {getAccessIcon(post.access_level)}
                    <span className="ml-1 capitalize">{post.access_level}</span>
                </span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {post.profiles?.[0]?.full_name || 'Admin'}
                </span>
                                <span className={post.is_published
                                    ? "flex items-center text-green-600"
                                    : "flex items-center text-red-600"
                                }>
                  {post.is_published
                      ? <Check className="w-4 h-4 mr-1" />
                      : <X className="w-4 h-4 mr-1" />
                  }
                                    {post.is_published ? 'Đã Xuất bản' : 'Nháp'}
                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                            <Link
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition"
                                title='Xem bài viết'
                            >
                                <Globe className="w-4 h-4" />
                            </Link>

                            <button
                                onClick={() => {
                                    setEditingPost(post);
                                    setIsCreatingNew(false);
                                }}
                                className="p-2 text-yellow-500 hover:bg-yellow-100 rounded-full transition"
                                title='Chỉnh sửa'
                            >
                                <Pencil className="w-4 h-4" />
                            </button>

                            {/* Sửa form xóa bài viết */}
                            <form onSubmit={(e) => handleDeletePost(post.id, e)}>
                                <button
                                    type="submit"
                                    disabled={deletingPostId === post.id}
                                    className="p-2 text-red-500 hover:bg-red-100 rounded-full transition disabled:opacity-50"
                                    title='Xóa'
                                >
                                    {deletingPostId === post.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}