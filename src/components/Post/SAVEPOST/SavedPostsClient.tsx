// src/components/Post/SAVEPOST/SavedPostsClient.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bookmark, ArrowLeft, ExternalLink, Trash2, Calendar, User, Tag, Globe, Lock, Shield } from 'lucide-react';
import { unsavePost } from '@/app/auth/saved-post.actions';
import toast from 'react-hot-toast';

interface SavedPost {
    id: number;
    created_at: string;
    posts: {
        id: number;
        title: string;
        slug: string;
        summary: string | null;
        tag: string | null;
        featured_image: string | null;
        created_at: string;
        access_level: 'public' | 'elite' | 'super_elite';
        profiles: {
            full_name: string | null;
            avatar_url: string | null;
        } | null;
    };
}

interface SavedPostsClientProps {
    initialSavedPosts: SavedPost[];
}

export default function SavedPostsClient({ initialSavedPosts }: SavedPostsClientProps) {
    const [savedPosts, setSavedPosts] = useState<SavedPost[]>(initialSavedPosts);
    const [removingId, setRemovingId] = useState<number | null>(null);

    const handleRemove = async (savedPostId: number, postId: number) => {
        setRemovingId(savedPostId);

        const result = await unsavePost(postId);

        if (result.success) {
            setSavedPosts(prev => prev.filter(sp => sp.id !== savedPostId));
            toast.success('Đã bỏ lưu bài viết');
        } else {
            toast.error(result.error || 'Có lỗi xảy ra');
        }

        setRemovingId(null);
    };

    const getAccessIcon = (level: 'public' | 'elite' | 'super_elite') => {
        switch (level) {
            case 'super_elite':
                return <Shield className="w-3 h-3 text-red-600" />;
            case 'elite':
                return <Lock className="w-3 h-3 text-yellow-600" />;
            default:
                return <Globe className="w-3 h-3 text-green-600" />;
        }
    };

    const getAccessLabel = (level: 'public' | 'elite' | 'super_elite') => {
        switch (level) {
            case 'super_elite':
                return 'Super Elite';
            case 'elite':
                return 'Elite';
            default:
                return 'Public';
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại Dashboard
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <Bookmark className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                        Bài viết đã lưu
                    </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                    {savedPosts.length} bài viết đã được lưu
                </p>
            </div>

            {/* Saved Posts List */}
            {savedPosts.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bookmark className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Chưa có bài viết nào được lưu
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Bắt đầu lưu các bài viết yêu thích để đọc sau
                    </p>
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Khám phá bài viết
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedPosts.map((savedPost) => {
                        const post = savedPost.posts;
                        const author = post.profiles;

                        return (
                            <div
                                key={savedPost.id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow group"
                            >
                                {/* Featured Image */}
                                {post.featured_image ? (
                                    <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                        <img
                                            src={post.featured_image}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full`}>
                                                {getAccessIcon(post.access_level)}
                                                {getAccessLabel(post.access_level)}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                        <Bookmark className="w-16 h-16 text-white/30" />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-5">
                                    {/* Tag */}
                                    {post.tag && (
                                        <div className="mb-3">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded">
                                                <Tag className="w-3 h-3" />
                                                {post.tag}
                                            </span>
                                        </div>
                                    )}

                                    {/* Title */}
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {post.title}
                                    </h3>

                                    {/* Summary */}
                                    {post.summary && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                            {post.summary}
                                        </p>
                                    )}

                                    {/* Author & Date */}
                                    <div className="flex items-center gap-3 mb-4 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {author?.full_name || 'Vô danh'}
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(post.created_at).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/blog/${post.slug}`}
                                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors text-center"
                                        >
                                            Đọc bài viết
                                        </Link>
                                        <button
                                            onClick={() => handleRemove(savedPost.id, post.id)}
                                            disabled={removingId === savedPost.id}
                                            className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                                            title="Bỏ lưu"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}