// src/components/BlogFilter.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, User, Filter, X, Search, Grid3x3, Rows3 } from 'lucide-react';
import PostImage from '@/components/PostImage';
import type { Post, ProfileData } from '@/types';

interface BlogFilterProps {
    posts: Post[];
    tags: string[];
}

function getFullName(profiles: ProfileData[] | ProfileData | null | undefined): string {
    if (!profiles) return "Vô danh";
    if (Array.isArray(profiles)) {
        return profiles[0]?.full_name ?? "Vô danh";
    }
    return profiles.full_name ?? "Vô danh";
}

function getAccessBadgeColor(level: Post['access_level']): string {
    switch (level) {
        case 'super_elite':
            return 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30';
        case 'elite':
            return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 shadow-lg shadow-yellow-500/30';
        default:
            return 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg shadow-green-500/30';
    }
}

export default function BlogFilter({ posts, tags }: BlogFilterProps) {
    const [selectedTag, setSelectedTag] = useState<string>('all');
    const [selectedAccess, setSelectedAccess] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            const matchesTag = selectedTag === 'all' || post.tag === selectedTag;
            const matchesAccess = selectedAccess === 'all' || post.access_level === selectedAccess;
            const matchesSearch = !searchQuery ||
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (post.summary ?? '').toLowerCase().includes(searchQuery.toLowerCase());

            return matchesTag && matchesAccess && matchesSearch;
        });
    }, [posts, selectedTag, selectedAccess, searchQuery]);

    const clearFilters = () => {
        setSelectedTag('all');
        setSelectedAccess('all');
        setSearchQuery('');
    };

    const hasActiveFilters = selectedTag !== 'all' || selectedAccess !== 'all' || searchQuery !== '';

    return (
        <>
            {/* Filter Bar */}
            <div className="mb-8 sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    {/* Search */}
                    <div className="relative flex-1 w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài viết..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Filter Toggle & View Mode */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                                showFilters || hasActiveFilters
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            Bộ lọc
                            {hasActiveFilters && (
                                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                                    {[selectedTag !== 'all', selectedAccess !== 'all', searchQuery !== ''].filter(Boolean).length}
                                </span>
                            )}
                        </button>

                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-white dark:bg-gray-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                                title="Chế độ lưới"
                            >
                                <Grid3x3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${
                                    viewMode === 'list'
                                        ? 'bg-white dark:bg-gray-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                                title="Chế độ danh sách"
                            >
                                <Rows3 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter Options */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tag Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Chủ đề
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedTag('all')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                        selectedTag === 'all'
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    Tất cả
                                </button>
                                {tags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setSelectedTag(tag)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                            selectedTag === tag
                                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Access Level Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Cấp độ truy cập
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {(['all', 'public', 'elite', 'super_elite'] as const).map(level => (
                                    <button
                                        key={level}
                                        onClick={() => setSelectedAccess(level)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                                            selectedAccess === level
                                                ? level === 'public'
                                                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                                                    : level === 'elite'
                                                        ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/30'
                                                        : level === 'super_elite'
                                                            ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                                                            : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {level === 'all' ? 'Tất cả' : level.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Filters */}
                {hasActiveFilters && (
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Đang lọc:</span>
                        {selectedTag !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm">
                                {selectedTag}
                                <button onClick={() => setSelectedTag('all')} className="hover:bg-purple-200 dark:hover:bg-purple-800/50 rounded-full p-0.5">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {selectedAccess !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm capitalize">
                                {selectedAccess.replace('_', ' ')}
                                <button onClick={() => setSelectedAccess('all')} className="hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full p-0.5">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {searchQuery && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                                &quot;{searchQuery}&quot;
                                <button onClick={() => setSearchQuery('')} className="hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-0.5">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        <button onClick={clearFilters} className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium">
                            Xóa tất cả
                        </button>
                    </div>
                )}
            </div>

            {/* Results Count */}
            <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                Hiển thị <span className="font-semibold text-gray-900 dark:text-white">{filteredPosts.length}</span> trong tổng số <span className="font-semibold">{posts.length}</span> bài viết
            </div>

            {/* Posts Grid/List */}
            {filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                    <Filter className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Không tìm thấy bài viết nào
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Thử điều chỉnh bộ lọc hoặc tìm kiếm khác
                    </p>
                    <button onClick={clearFilters} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        Xóa bộ lọc
                    </button>
                </div>
            ) : (
                <div className={
                    viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                        : 'space-y-4'
                }>
                    {filteredPosts.map((post) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className={`group block bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 transform hover:-translate-y-1 ${
                                viewMode === 'list' ? 'flex flex-col md:flex-row' : ''
                            }`}
                        >
                            <div className={`relative bg-gray-200 dark:bg-gray-700 overflow-hidden ${
                                viewMode === 'list' ? 'md:w-64 h-48 md:h-auto flex-shrink-0' : 'h-48'
                            }`}>
                                <PostImage src={post.featured_image} alt={post.title} />

                                <div className="absolute top-3 left-3">
                                    <span className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm ${getAccessBadgeColor(post.access_level)}`}>
                                        <span className="capitalize">{post.access_level.replace('_', ' ')}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                {post.tag && (
                                    <span className="inline-flex items-center w-fit text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 mb-3">
                                        {post.tag}
                                    </span>
                                )}

                                <h2 className={`font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
                                    viewMode === 'list' ? 'text-2xl line-clamp-2' : 'text-xl line-clamp-2'
                                }`}>
                                    {post.title}
                                </h2>

                                <p className={`text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1 ${
                                    viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-3'
                                }`}>
                                    {post.summary ?? "Bài viết này hiện chưa có tóm tắt. Nhấp để đọc toàn bộ nội dung..."}
                                </p>

                                <div className="pt-3 mt-auto border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <User className="w-3.5 h-3.5" />
                                            <span className="truncate max-w-[120px]">
                                                {getFullName(post.profiles)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(post.created_at).toLocaleDateString("vi-VN", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
}