// src/components/AdminPanelClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
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
    Loader2,
    FileText,
    Users,
    Settings,
    Image,
    Link as LinkIcon
} from 'lucide-react';
import PostForm from './PostForm';
import {
    Post,
    AdminPanelClientProps,
    ActionResult
} from '@/types'; // Import các interface từ file types

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
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'settings'>('posts');
    const [isLoading, setIsLoading] = useState(false);

    // Tải lại dữ liệu khi component được mount
    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/posts');
                if (response.ok) {
                    const data = await response.json();
                    setPosts(data.posts || []);
                }
            } catch (error) {
                console.error('Lỗi khi tải bài viết:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const currentFormTitle = editingPost
        ? `Chỉnh sửa Bài viết: ${editingPost.title}`
        : 'Tạo Bài Viết Mới';

    const currentFormDefaultPost = editingPost || undefined;
    const isFormOpen = editingPost !== null || isCreatingNew;

    // Sửa lại kiểu trả về của hàm handleFormSubmit để khớp với PostFormProps
    const handleFormSubmit = async (formData: FormData): Promise<ActionResult> => {
        setIsLoading(true);
        try {
            const result = await upsertPost(formData);
            if (result && 'success' in result && result.success) {
                // Tải lại danh sách bài viết
                const response = await fetch('/api/posts');
                if (response.ok) {
                    const data = await response.json();
                    setPosts(data.posts || []);
                }

                setEditingPost(null);
                setIsCreatingNew(false);

                // Hiển thị thông báo thành công
                alert(result.message || 'Thao tác thành công!');

                // Trả về kết quả thành công
                return { success: true, message: result.message || 'Thao tác thành công!' };
            } else if (result && 'error' in result) {
                alert(result.error);
                // Trả về kết quả lỗi
                // @ts-ignore
                return { error: result.error };
            }

            // Trường hợp mặc định
            return { error: 'Đã xảy ra lỗi không xác định' };
        } catch (error) {
            console.error('Lỗi khi lưu bài viết:', error);
            alert('Có lỗi xảy ra khi lưu bài viết. Vui lòng thử lại.');
            // Trả về kết quả lỗi
            return { error: 'Có lỗi xảy ra khi lưu bài viết' };
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePost = async (postId: number, event: React.FormEvent) => {
        event.preventDefault();

        if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            return;
        }

        setDeletingPostId(postId);
        try {
            const result = await deletePost(postId);
            if (result && 'success' in result && result.success) {
                // Cập nhật UI: loại bỏ bài viết đã xóa khỏi danh sách
                setPosts(posts.filter(post => post.id !== postId));
                alert('Xóa bài viết thành công!');
            } else if (result && 'error' in result) {
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
        <div>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    className={`px-4 py-2 font-medium text-sm ${activeTab === 'posts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                    onClick={() => setActiveTab('posts')}
                >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Quản lý Bài viết
                </button>
                <button
                    className={`px-4 py-2 font-medium text-sm ${activeTab === 'media' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                    onClick={() => setActiveTab('media')}
                >
                    <Image className="w-4 h-4 inline mr-2" />
                    Thư viện Hình ảnh
                </button>
                <button
                    className={`px-4 py-2 font-medium text-sm ${activeTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <Settings className="w-4 h-4 inline mr-2" />
                    Cài đặt Hệ thống
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'posts' && (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-semibold text-blue-700 dark:text-blue-400">
                            Quản lý {posts.length || 0} Bài Viết
                        </h3>
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
                            className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
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
                    </div>

                    {isFormOpen && (
                        <div className='mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'>
                            <PostForm
                                action={handleFormSubmit}
                                defaultPost={currentFormDefaultPost}
                            />
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <div className="overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                            {posts.length > 0 ? (
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {posts.map((post) => (
                                        <li key={post.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition duration-150">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center mb-2">
                                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                                            {post.title}
                                                        </h4>
                                                        <span className="ml-2 flex items-center">
                                                            {getAccessIcon(post.access_level)}
                                                            <span className="ml-1 text-xs capitalize">{post.access_level}</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                                            {post.profiles?.[0]?.full_name || 'Admin'}
                                                        </span>
                                                        <span className="mx-2">•</span>
                                                        <span className={post.is_published
                                                            ? "text-green-600 flex items-center"
                                                            : "text-red-600 flex items-center"
                                                        }>
                                                            {post.is_published
                                                                ? <><Check className="w-4 h-4 mr-1" /> Đã Xuất bản</>
                                                                : <><X className="w-4 h-4 mr-1" /> Nháp</>
                                                            }
                                                        </span>
                                                        <span className="mx-2">•</span>
                                                        <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                                                    </div>
                                                </div>

                                                <div className="flex space-x-2 ml-4">
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
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-12 text-center">
                                    <FileText className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Chưa có bài viết nào</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                        Bạn chưa tạo bài viết nào. Hãy tạo bài viết đầu tiên của bạn!
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'media' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-8">
                    <div className="text-center">
                        <Image className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Thư viện Hình ảnh</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Tải lên và quản lý hình ảnh để sử dụng trong bài viết của bạn.
                        </p>

                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 mb-6">
                            <div className="space-y-2 text-center">
                                <Image className="w-12 h-12 mx-auto text-gray-400" />
                                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                        <span>Tải lên hình ảnh</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                                    </label>
                                    <p className="pl-1">hoặc kéo và thả</p>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    PNG, JPG, GIF tối đa 10MB
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {/* Placeholder for images */}
                            {[1, 2, 3, 4].map((item) => (
                                <div key={item} className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                    <Image className="w-8 h-8 text-gray-400" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Settings className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Cài đặt Hệ thống</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Chức năng cài đặt hệ thống sẽ được phát triển trong phiên bản tiếp theo.
                    </p>
                </div>
            )}
        </div>
    );
}