// src/app/blog/[slug]/page.tsx
import { createServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Calendar, User, Lock, Shield, Globe, Clock, ArrowLeft, Share2 } from 'lucide-react';
import Link from "next/link";
import PostImage from '@/components/PostImage';
import ShareButtons from '@/components/Post/SAVEPOST/ShareButtons';
import RelatedPosts from '@/components/RelatedPosts';
import SaveButton from '@/components/Post/SAVEPOST/SaveButton';
import type { ProfileData } from '@/types';

interface PostPageProps {
    params: Promise<{
        slug: string;
    }>;
}

interface Post {
    id: number;
    title: string;
    content: string;
    tag: string | null;
    created_at: string;
    access_level: 'public' | 'elite' | 'super_elite';
    featured_image: string | null;
    summary: string | null;
    profiles: ProfileData[] | ProfileData | null;
}

function getFullName(profiles: ProfileData[] | ProfileData | null | undefined): string {
    if (!profiles) return "Vô danh";
    if (Array.isArray(profiles)) {
        return profiles[0]?.full_name ?? "Vô danh";
    }
    return profiles.full_name ?? "Vô danh";
}

function getAvatarUrl(profiles: ProfileData[] | ProfileData | null | undefined): string | null {
    if (!profiles) return null;
    if (Array.isArray(profiles)) {
        return profiles[0]?.avatar_url ?? null;
    }
    return profiles.avatar_url ?? null;
}

function getAccessLevelInfo(level: Post['access_level']) {
    switch (level) {
        case 'super_elite':
            return {
                icon: Shield,
                label: 'Super Elite',
                color: 'from-red-500 to-pink-500',
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                textColor: 'text-red-700 dark:text-red-300',
                borderColor: 'border-red-300 dark:border-red-700'
            };
        case 'elite':
            return {
                icon: Lock,
                label: 'Elite',
                color: 'from-yellow-400 to-orange-400',
                bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
                textColor: 'text-yellow-700 dark:text-yellow-300',
                borderColor: 'border-yellow-300 dark:border-yellow-700'
            };
        default:
            return {
                icon: Globe,
                label: 'Public',
                color: 'from-green-400 to-emerald-400',
                bgColor: 'bg-green-50 dark:bg-green-900/20',
                textColor: 'text-green-700 dark:text-green-300',
                borderColor: 'border-green-300 dark:border-green-700'
            };
    }
}

function estimateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
}

export default async function PostPage({ params }: PostPageProps) {
    const supabase = await createServer();
    const { slug } = await params;

    // Lấy thông tin người dùng
    const { data: { user } } = await supabase.auth.getUser();
    const userRole = user?.email?.includes('@admin.com') ? 'super_elite' : (user ? 'elite' : 'normal');

    // Fetch bài viết với id
    const { data: post, error } = await supabase
        .from('posts')
        .select('id, title, content, tag, created_at, access_level, featured_image, summary, profiles(full_name, avatar_url)')
        .eq('slug', slug)
        .single();

    if (error || !post) {
        return notFound();
    }

    // Kiểm tra quyền truy cập
    let isAuthorized = false;
    if (post.access_level === 'public') {
        isAuthorized = true;
    } else if (post.access_level === 'elite' && (userRole === 'elite' || userRole === 'super_elite')) {
        isAuthorized = true;
    } else if (post.access_level === 'super_elite' && userRole === 'super_elite') {
        isAuthorized = true;
    }

    if (!isAuthorized) {
        const accessInfo = getAccessLevelInfo(post.access_level);
        const Icon = accessInfo.icon;

        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4">
                <div className={`text-center p-10 ${accessInfo.bgColor} border ${accessInfo.borderColor} rounded-2xl max-w-lg shadow-xl`}>
                    <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-r ${accessInfo.color} rounded-full flex items-center justify-center`}>
                        <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h2 className={`text-3xl font-bold ${accessInfo.textColor} mb-3`}>
                        Nội dung bị khóa
                    </h2>
                    <p className={`text-lg ${accessInfo.textColor} mb-6`}>
                        Bài viết này yêu cầu cấp độ truy cập <strong>{accessInfo.label}</strong>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Vui lòng đăng nhập hoặc nâng cấp tài khoản để truy cập nội dung độc quyền này.
                    </p>
                    <div className="flex gap-3 justify-center">
                        {userRole === 'normal' && (
                            <Link
                                href="/login"
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
                            >
                                Đăng nhập ngay
                            </Link>
                        )}
                        <Link
                            href="/blog"
                            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                        >
                            Quay lại danh sách
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const accessInfo = getAccessLevelInfo(post.access_level);
    const Icon = accessInfo.icon;
    const readingTime = estimateReadingTime(post.content);
    const authorName = getFullName(post.profiles);
    const avatarUrl = getAvatarUrl(post.profiles);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
            {/* Hero Section với Featured Image */}
            <div className="relative w-full h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden bg-gray-900">
                {/* Background Image với Overlay */}
                <div className="absolute inset-0">
                    <PostImage
                        src={post.featured_image}
                        alt={post.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                </div>

                {/* Content Overlay */}
                <div className="relative h-full max-w-4xl mx-auto px-4 sm:px-8 flex flex-col justify-end pb-12">
                    {/* Back Button */}
                    <Link
                        href="/blog"
                        className="absolute top-6 left-4 sm:left-8 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white rounded-lg transition-all font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại
                    </Link>

                    {/* Tag & Access Level */}
                    <div className="flex items-center gap-3 mb-4">
                        {post.tag && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500/90 backdrop-blur-sm text-white rounded-lg text-sm font-semibold">
                                <Share2 className="w-3.5 h-3.5" />
                                {post.tag}
                            </span>
                        )}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${accessInfo.color} text-white rounded-lg text-sm font-bold shadow-lg`}>
                            <Icon className="w-4 h-4" />
                            {accessInfo.label}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
                        {post.title}
                    </h1>

                    {/* Summary */}
                    {post.summary && (
                        <p className="text-lg md:text-xl text-gray-200 mb-6 max-w-3xl">
                            {post.summary}
                        </p>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                        {/* Author */}
                        <div className="flex items-center gap-2">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={authorName || 'Author'}
                                    className="w-10 h-10 rounded-full border-2 border-white/30"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                            )}
                            <div>
                                <div className="text-white font-semibold">{authorName}</div>
                            </div>
                        </div>

                        <span className="text-white/40">•</span>

                        {/* Date */}
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.created_at).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>

                        <span className="text-white/40">•</span>

                        {/* Reading Time */}
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {readingTime} phút đọc
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <article className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
                {/* Action Buttons */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <ShareButtons title={post.title} />
                    <SaveButton postId={post.id} />
                </div>

                {/* Article Content */}
                <div
                    className="prose prose-lg dark:prose-invert max-w-none
                        prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                        prose-h1:text-4xl prose-h1:mb-4 prose-h1:mt-8
                        prose-h2:text-3xl prose-h2:mb-3 prose-h2:mt-6
                        prose-h3:text-2xl prose-h3:mb-2 prose-h3:mt-5
                        prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                        prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold
                        prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                        prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-700
                        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:italic
                        prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
                        prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
                        prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:mb-2
                        prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                        prose-hr:border-gray-300 dark:prose-hr:border-gray-700 prose-hr:my-8"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Author Card */}
                <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-750 rounded-2xl border border-blue-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={authorName || 'Author'}
                                className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-600 shadow-lg"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                                <User className="w-8 h-8 text-white" />
                            </div>
                        )}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                {authorName}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Tác giả bài viết
                            </p>
                        </div>
                    </div>
                </div>

                {/* Related Posts */}
                <RelatedPosts currentSlug={slug} currentTag={post.tag} />
            </article>
        </div>
    );
}

export const revalidate = 60;