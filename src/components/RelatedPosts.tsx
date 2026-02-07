// src/components/RelatedPosts.tsx
import { createServer } from '@/lib/supabase/server';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import PostImage from '@/components/PostImage';

interface RelatedPostsProps {
    currentSlug: string;
    currentTag: string | null;
}

interface RelatedPost {
    id: number;
    title: string;
    slug: string;
    summary: string | null;
    tag: string | null;
    created_at: string;
    featured_image: string | null;
}

export default async function RelatedPosts({ currentSlug, currentTag }: RelatedPostsProps) {
    const supabase = await createServer();

    let query = supabase
        .from('posts')
        .select('id, title, slug, summary, tag, created_at, featured_image')
        .eq('is_published', true)
        .neq('slug', currentSlug)
        .limit(3);

    if (currentTag) {
        query = query.eq('tag', currentTag);
    }

    const { data: relatedPosts } = await query.order('created_at', { ascending: false });

    if (!relatedPosts || relatedPosts.length === 0) {
        return null;
    }

    return (
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Bài viết liên quan
                </h2>
                <Link
                    href="/blog"
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                    Xem tất cả
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((post) => (
                    <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="group block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 transform hover:-translate-y-1"
                    >
                        <div className="relative h-40 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <PostImage
                                src={post.featured_image}
                                alt={post.title}
                            />
                            {post.tag && (
                                <div className="absolute top-2 left-2">
                                    <span className="inline-block px-2 py-1 bg-purple-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded">
                                        {post.tag}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="p-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                {post.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                {post.summary ?? "Nhấp để đọc thêm..."}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Calendar className="w-3 h-3" />
                                {new Date(post.created_at).toLocaleDateString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}