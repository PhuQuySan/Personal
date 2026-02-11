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
    Image as ImageIcon,
    Settings,
    Calendar,
    Eye,
    EyeOff,
    Bell,
    Upload,
    FolderOpen
} from 'lucide-react';
import PostForm from './PostForm';
import MediaLibrary from './MediaLibrary';
import {Post, AdminPanelClientProps, ActionResult, UserProfile, PostData} from '@/types';
import {useCachedUserProfile} from "@/hooks/useCachedData";

/**
 * Component để hiển thị biểu tượng tương ứng với cấp độ truy cập của bài viết.
 */
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

const getAccessBadgeColor = (level: Post['access_level']) => {
    switch (level) {
        case 'super_elite':
            return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
        case 'elite':
            return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900';
        default:
            return 'bg-gradient-to-r from-green-400 to-emerald-400 text-white';
    }
};

interface ExtendedAdminPanelClientProps extends AdminPanelClientProps {
    userRole: UserProfile['user_role'];
    userId: string;
}

// Toast notification component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

    return (
        <div className={`fixed top-4 right-4 z-[60] ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-top duration-300`}>
            <Bell className="w-5 h-5" />
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded-full p-1">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default function AdminPanelClient({ initialPosts, userRole, userId }: ExtendedAdminPanelClientProps) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'settings'>('posts');
    const [activePostSubTab, setActivePostSubTab] = useState<'all' | 'my_posts'>('all');
    const [isActionPending, setIsActionPending] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [publishingPostId, setPublishingPostId] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

    const { data: userProfile } = useCachedUserProfile();
    const isSuperElite = userRole === 'super_elite';
    const isElite = userRole === 'super_elite' || userRole === 'elite';

    useEffect(() => {
        setMounted(true);
    }, []);

    const isFormOpen = editingPost !== null || isCreatingNew;

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </div>
        );
    }

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, type });
    };

    const filteredPosts = posts.filter(post => {
        if (activePostSubTab === 'all' && isElite) {
            return true;
        }
        if (activePostSubTab === 'my_posts' && post.user_id === userId) {
            return true;
        }
        if (activePostSubTab === 'all' && !isElite && post.user_id === userId) {
            return true;
        }
        return false;
    });

    const reloadPostsFromApi = async () => {
        setIsActionPending(true);
        try {
            const response = await fetch('/api/posts');
            if (response.ok) {
                const data = await response.json();
                if (!data.posts || !Array.isArray(data.posts)) {
                    setPosts([]);
                    return;
                }
                const validatedPosts = data.posts.map((post: any) => ({
                    id: post.id || 0,
                    title: post.title || 'Không có tiêu đề',
                    slug: post.slug || '',
                    summary: post.summary || '',
                    content: post.content || '',
                    tag: post.tag || '',
                    is_published: Boolean(post.is_published),
                    access_level: post.access_level || 'public',
                    featured_image: post.featured_image || '',
                    created_at: post.created_at || new Date().toISOString(),
                    user_id: post.user_id || '',
                    profiles: post.profiles || { full_name: 'Unknown' }
                }));
                setPosts(validatedPosts);
            } else {
                showToast('Không thể tải lại danh sách bài viết', 'error');
            }
        } catch (error) {
            console.error('Reload error:', error);
            showToast('Lỗi khi tải lại bài viết', 'error');
        } finally {
            setIsActionPending(false);
        }
    };

    const handleFormSubmit = async (formData: FormData): Promise<ActionResult> => {
        setIsActionPending(true);
        try {
            const result = await upsertPost(formData);
            if (result && result.success) {
                await reloadPostsFromApi();
                setEditingPost(null);
                setIsCreatingNew(false);
                showToast(result.message || 'Lưu bài viết thành công!', 'success');
                return { success: true, message: result.message || 'Thao tác thành công!' };
            } else {
                showToast(result?.error || 'Đã xảy ra lỗi', 'error');
                return { success: false, error: result?.error || 'Đã xảy ra lỗi không xác định' };
            }
        } catch (error) {
            showToast('Có lỗi xảy ra khi lưu bài viết', 'error');
            return { success: false, error: 'Có lỗi xảy ra khi lưu bài viết' };
        } finally {
            setIsActionPending(false);
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
                await reloadPostsFromApi();
                showToast('Xóa bài viết thành công!', 'success');
            } else if (result && 'error' in result) {
                showToast(`Lỗi: ${result.error}`, 'error');
            }
        } catch (error) {
            showToast('Có lỗi xảy ra khi xóa bài viết', 'error');
        } finally {
            setDeletingPostId(null);
        }
    };

    const handleTogglePublish = async (post: Post) => {
        setPublishingPostId(post.id);

        const newPublishedState = !post.is_published;

        console.log('🔄 Toggle Publish Debug:', {
            postId: post.id,
            currentState: post.is_published,
            newState: newPublishedState,
            postTitle: post.title
        });

        try {
            const formData = new FormData();
            formData.set('id', post.id.toString());
            formData.set('title', post.title);
            formData.set('slug', post.slug);
            formData.set('content', post.content || '');
            formData.set('is_published', newPublishedState.toString());
            formData.set('access_level', post.access_level);
            if (post.summary) formData.set('summary', post.summary);
            if (post.tag) formData.set('tag', post.tag);
            if (post.featured_image) formData.set('featured_image', post.featured_image);

            console.log('📤 Sending FormData with is_published:', formData.get('is_published'));

            const result = await upsertPost(formData);

            console.log('✅ UpsertPost result:', result);

            if (result && result.success) {
                // Reload posts to get fresh data
                await reloadPostsFromApi();

                showToast(
                    newPublishedState ? 'Đã xuất bản bài viết!' : 'Đã chuyển về nháp!',
                    'success'
                );
            } else {
                console.error('❌ UpsertPost failed:', result);
                showToast(result?.error || 'Không thể thay đổi trạng thái xuất bản', 'error');
            }
        } catch (error) {
            console.error('❌ Toggle publish error:', error);
            showToast('Có lỗi xảy ra khi thay đổi trạng thái', 'error');
        } finally {
            setPublishingPostId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-12">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-white/10 backdrop-blur-lg rounded-xl">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                                Quản lý {posts.length || 0} Bài Viết của {userProfile?.full_name || 'Bạn'}
                            </h1>
                            <p className="text-blue-100">
                                Tạo, chỉnh sửa và quản lý nội dung của bạn
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setIsCreatingNew(true);
                                setEditingPost(null);
                            }}
                            className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center space-x-2"
                        >
                            <PlusCircle className="w-5 h-5" />
                            <span>Tạo Bài Mới</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 bg-white dark:bg-gray-800 rounded-t-xl px-4">
                    <button
                        className={`px-6 py-4 font-semibold text-sm transition-all ${
                            activeTab === 'posts'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                        onClick={() => setActiveTab('posts')}
                    >
                        <FileText className="w-4 h-4 inline mr-2" />
                        Bài viết
                    </button>
                    <button
                        className={`px-6 py-4 font-semibold text-sm transition-all ${
                            activeTab === 'media'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                        onClick={() => setActiveTab('media')}
                    >
                        <ImageIcon className="w-4 h-4 inline mr-2" />
                        Thư viện
                    </button>
                    {isSuperElite && (
                        <button
                            className={`px-6 py-4 font-semibold text-sm transition-all ${
                                activeTab === 'settings'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <Settings className="w-4 h-4 inline mr-2" />
                            Cài đặt
                        </button>
                    )}
                </div>

                {/* Posts Tab */}
                {activeTab === 'posts' && (
                    <>
                        {/* Sub-tabs */}
                        {isElite && (
                            <div className="flex space-x-2 mb-6">
                                <button
                                    onClick={() => setActivePostSubTab('all')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                        activePostSubTab === 'all'
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    Tất cả bài viết
                                </button>
                                <button
                                    onClick={() => setActivePostSubTab('my_posts')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                        activePostSubTab === 'my_posts'
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    Bài viết của tôi
                                </button>
                            </div>
                        )}

                        {isActionPending && !isFormOpen ? (
                            <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-xl">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : filteredPosts.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredPosts.map((post) => (
                                    <div
                                        key={post.id}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="flex flex-col sm:flex-row">
                                            {/* Featured Image - Fixed Dimensions */}
                                            <div className="w-full sm:w-48 h-48 flex-shrink-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
                                                {post.featured_image ? (
                                                    <img
                                                        src={post.featured_image}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ImageIcon className="w-12 h-12 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                                                                {post.title}
                                                            </h3>
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${getAccessBadgeColor(post.access_level)}`}>
                                                                {getAccessIcon(post.access_level)}
                                                                <span className="ml-1">{post.access_level.replace('_', ' ')}</span>
                                                            </span>
                                                        </div>

                                                        {post.summary && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                                                                {post.summary}
                                                            </p>
                                                        )}

                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                            <span className="flex items-center">
                                                                <Calendar className="w-3 h-3 mr-1" />
                                                                {new Date(post.created_at).toLocaleDateString('vi-VN')}
                                                            </span>
                                                            {post.tag && (
                                                                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md font-medium">
                                                                    {post.tag}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        {/* Toggle Publish */}
                                                        <button
                                                            onClick={() => handleTogglePublish(post)}
                                                            disabled={publishingPostId === post.id}
                                                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                                                post.is_published
                                                                    ? 'bg-green-500'
                                                                    : 'bg-gray-300 dark:bg-gray-600'
                                                            } ${publishingPostId === post.id ? 'opacity-50' : ''}`}
                                                            title={post.is_published ? 'Đã xuất bản' : 'Chưa xuất bản'}
                                                        >
                                                            {publishingPostId === post.id ? (
                                                                <Loader2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-white" />
                                                            ) : (
                                                                <>
                                                                    <span
                                                                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                                                                            post.is_published ? 'translate-x-7' : 'translate-x-1'
                                                                        }`}
                                                                    >
                                                                        {post.is_published ? (
                                                                            <Eye className="w-4 h-4 text-green-500 m-1" />
                                                                        ) : (
                                                                            <EyeOff className="w-4 h-4 text-gray-400 m-1" />
                                                                        )}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </button>

                                                        <Link
                                                            href={`/blog/${post.slug}`}
                                                            target="_blank"
                                                            className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition"
                                                            title="Xem bài viết"
                                                        >
                                                            <Globe className="w-5 h-5" />
                                                        </Link>

                                                        <button
                                                            onClick={() => {
                                                                setEditingPost(post);
                                                                setIsCreatingNew(false);
                                                            }}
                                                            className="p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-full transition"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Pencil className="w-5 h-5" />
                                                        </button>

                                                        <form onSubmit={(e) => handleDeletePost(post.id, e)}>
                                                            <button
                                                                type="submit"
                                                                disabled={deletingPostId === post.id}
                                                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition disabled:opacity-50"
                                                                title="Xóa"
                                                            >
                                                                {deletingPostId === post.id ? (
                                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="w-5 h-5" />
                                                                )}
                                                            </button>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                                <FileText className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    Chưa có bài viết nào
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    Bắt đầu tạo bài viết đầu tiên của bạn!
                                </p>
                                <button
                                    onClick={() => {
                                        setIsCreatingNew(true);
                                        setEditingPost(null);
                                    }}
                                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                                >
                                    <PlusCircle className="w-5 h-5 mr-2" />
                                    Tạo Bài Mới
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Media Tab */}
                {activeTab === 'media' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                    <span className="text-3xl font-bold">
                                        {(() => {
                                            try {
                                                const stored = localStorage.getItem('mediaLibrary');
                                                return stored ? JSON.parse(stored).length : 0;
                                            } catch {
                                                return 0;
                                            }
                                        })()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold mb-1">Tổng số ảnh</h3>
                                <p className="text-blue-100 text-sm">Trong thư viện</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <span className="text-3xl font-bold">
                                        {(() => {
                                            try {
                                                const stored = localStorage.getItem('mediaLibrary');
                                                if (!stored) return '0';
                                                const items = JSON.parse(stored);
                                                const total = items.reduce((sum: number, item: any) => sum + (item.size || 0), 0);
                                                return (total / 1024 / 1024).toFixed(1);
                                            } catch {
                                                return '0';
                                            }
                                        })()}
                                        <span className="text-lg ml-1">MB</span>
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold mb-1">Dung lượng</h3>
                                <p className="text-purple-100 text-sm">Tổng dung lượng</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <FolderOpen className="w-8 h-8" />
                                    </div>
                                    <span className="text-3xl font-bold">
                                        {(() => {
                                            try {
                                                const stored = localStorage.getItem('mediaLibrary');
                                                if (!stored) return 0;
                                                const items = JSON.parse(stored);
                                                const today = new Date().toDateString();
                                                return items.filter((item: any) =>
                                                    new Date(item.uploadedAt).toDateString() === today
                                                ).length;
                                            } catch {
                                                return 0;
                                            }
                                        })()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold mb-1">Hôm nay</h3>
                                <p className="text-green-100 text-sm">Ảnh upload</p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <ImageIcon className="w-7 h-7 mr-3 text-indigo-600" />
                                Quản lý Thư viện Hình ảnh
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Upload, quản lý và sử dụng hình ảnh cho các bài viết của bạn.
                                Tất cả ảnh được lưu trữ an toàn trên Supabase Storage.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-700">
                                    <div className="flex items-start space-x-4">
                                        <div className="p-3 bg-blue-500 rounded-lg">
                                            <Upload className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Upload nhanh</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Hỗ trợ PNG, JPG, WEBP. Tối đa 5MB/ảnh. Upload nhiều ảnh cùng lúc.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border-2 border-purple-200 dark:border-purple-700">
                                    <div className="flex items-start space-x-4">
                                        <div className="p-3 bg-purple-500 rounded-lg">
                                            <FolderOpen className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Tổ chức dễ dàng</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Tìm kiếm, lọc và quản lý thư viện ảnh với giao diện trực quan.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => setIsMediaLibraryOpen(true)}
                                    className="flex-1 min-w-[200px] px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <ImageIcon className="w-6 h-6" />
                                    <span>Mở Thư viện Hình ảnh</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setIsMediaLibraryOpen(true);
                                        showToast('Mở thư viện để upload ảnh', 'info');
                                    }}
                                    className="px-6 py-4 bg-white dark:bg-gray-700 border-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold hover:bg-indigo-50 dark:hover:bg-gray-600 transition-all duration-300 flex items-center space-x-3 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Upload className="w-6 h-6" />
                                    <span>Upload Nhanh</span>
                                </button>
                            </div>
                        </div>

                        {/* Tips Section */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border-2 border-amber-200 dark:border-amber-700">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-amber-500 rounded-lg flex-shrink-0">
                                    <ImageIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">💡 Mẹo sử dụng</h4>
                                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>Nén ảnh trước khi upload để tăng tốc độ tải trang</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>Sử dụng tên file mô tả rõ ràng để dễ tìm kiếm sau này</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>Định dạng WebP có dung lượng nhỏ hơn mà vẫn giữ chất lượng tốt</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>Ảnh được lưu trữ vĩnh viễn, có thể tái sử dụng cho nhiều bài viết</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && isSuperElite && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                        <Settings className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Cài đặt Hệ thống
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Tính năng đang phát triển...
                        </p>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                            onClick={() => {
                                setEditingPost(null);
                                setIsCreatingNew(false);
                            }}
                        />

                        {/* Modal */}
                        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">
                                    {editingPost ? 'Chỉnh sửa Bài Viết' : 'Tạo Bài Viết Mới'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setEditingPost(null);
                                        setIsCreatingNew(false);
                                    }}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>

                            {/* Form Content */}
                            <div className="p-6">
                                <PostForm
                                    action={handleFormSubmit}
                                    defaultPost={editingPost as PostData}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MediaLibrary Modal */}
            <MediaLibrary
                isOpen={isMediaLibraryOpen}
                onClose={() => setIsMediaLibraryOpen(false)}
                mode="manage"
            />
        </div>
    );
}