// src/components/DashboardClient.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserLink, UserProfile } from '@/types';

interface DashboardClientProps {
    initialProfile: UserProfile;
    initialLinks: UserLink[];
}

export default function DashboardClient({ initialProfile, initialLinks }: DashboardClientProps) {
    const [links, setLinks] = useState<UserLink[]>(initialLinks);
    const [profile] = useState<UserProfile>(initialProfile);
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        link_name: '',
        link_url: '',
        description: '',
        image_url: '',
    });

    const supabase = createClient();

    // Fetch links from server
    const fetchLinks = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No user found');
                return;
            }

            const { data, error } = await supabase
                .from('user_links')
                .select('*')
                .eq('user_id', user.id)
                .order('sort_order', { ascending: true });

            if (error) throw error;
            setLinks(data || []);
        } catch (error) {
            console.error('Error fetching links:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert('Vui lòng đăng nhập để thực hiện thao tác này');
                return;
            }

            if (editingId) {
                // Update existing link
                const { error } = await supabase
                    .from('user_links')
                    .update({
                        link_name: formData.link_name,
                        link_url: formData.link_url,
                        description: formData.description || null,
                        image_url: formData.image_url || null,
                    })
                    .eq('id', editingId);

                if (error) throw error;
            } else {
                // Create new link
                const { error } = await supabase
                    .from('user_links')
                    .insert({
                        user_id: user.id,
                        link_name: formData.link_name,
                        link_url: formData.link_url,
                        description: formData.description || null,
                        image_url: formData.image_url || null,
                        sort_order: links.length,
                    });

                if (error) throw error;
            }

            // Reset form
            setFormData({ link_name: '', link_url: '', description: '', image_url: '' });
            setIsAdding(false);
            setEditingId(null);
            fetchLinks();
        } catch (error) {
            console.error('Error saving link:', error);
            alert('Có lỗi xảy ra khi lưu liên kết');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa liên kết này?')) return;

        try {
            const { error } = await supabase
                .from('user_links')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchLinks();
        } catch (error) {
            console.error('Error deleting link:', error);
            alert('Có lỗi xảy ra khi xóa liên kết');
        }
    };

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url);

        // Show toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-down';
        toast.textContent = '✓ Đã sao chép liên kết!';
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 2000);
    };

    const handleEdit = (link: UserLink) => {
        setFormData({
            link_name: link.link_name,
            link_url: link.link_url,
            description: link.description || '',
            image_url: link.image_url || '',
        });
        setEditingId(link.id);
        setIsAdding(true);

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setFormData({ link_name: '', link_url: '', description: '', image_url: '' });
        setIsAdding(false);
        setEditingId(null);
    };

    return (
        // ✅ Sử dụng bg-background và text-foreground như FilesPage
        <div className="min-h-screen p-6 bg-background text-foreground transition-colors duration-500">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 mb-6 animate-fade-in-up">
                    {/* Hiệu ứng Glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full" />

                    <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase mb-2">
                                Dashboard Quản lý
                            </h1>
                            <div className="flex items-center gap-3">
                                <p className="text-gray-600 dark:text-gray-400">
                                    Xin chào, <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                        {profile.full_name || 'User'}
                                    </span>
                                </p>
                                {/* Role Badge */}
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${profile.user_role === 'super_elite'
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                    : profile.user_role === 'elite'
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                        : profile.user_role === 'demo'
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                    {profile.user_role === 'super_elite' ? '👑 Super Elite'
                                        : profile.user_role === 'elite' ? '⭐ Elite'
                                            : profile.user_role === 'demo' ? '🎭 Demo'
                                                : '👤 Normal'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {isAdding ? 'Hủy' : 'Thêm liên kết'}
                        </button>
                    </div>
                </div>

                {/* Add/Edit Form */}
                {isAdding && (
                    <div className="relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 mb-6 animate-slide-down">
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 blur-3xl rounded-full" />

                        <div className="relative">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                {editingId ? '✏️ Chỉnh sửa liên kết' : '➕ Thêm liên kết mới'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Tên liên kết <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.link_name}
                                            onChange={(e) => setFormData({ ...formData, link_name: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            placeholder="VD: Website chính"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            URL <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            required
                                            value={formData.link_url}
                                            onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        URL hình ảnh (tùy chọn)
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {formData.image_url && (
                                        <div className="mt-3">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                                            <img
                                                src={formData.image_url}
                                                alt="Preview"
                                                className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23e5e7eb" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Mô tả (tùy chọn)
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="Mô tả ngắn về liên kết này..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        className="flex-1 sm:flex-none px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        {editingId ? '💾 Cập nhật' : '✨ Thêm liên kết'}
                                    </button>
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
                                        >
                                            ✕ Hủy
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Links List */}
                <div className="relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl animate-fade-in-up">
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full" />

                    <div className="relative p-6 sm:p-8 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            📌 Danh sách liên kết ({links.length})
                        </h2>
                    </div>

                    {loading ? (
                        <div className="relative p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
                            <p className="text-gray-500 dark:text-gray-400 mt-4">Đang tải...</p>
                        </div>
                    ) : links.length === 0 ? (
                        <div className="relative p-12 text-center">
                            <svg className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Chưa có liên kết nào</p>
                            <p className="text-gray-400 dark:text-gray-500">Nhấn "Thêm liên kết" để bắt đầu</p>
                        </div>
                    ) : (
                        <div className="relative divide-y divide-gray-200 dark:divide-gray-800">
                            {links.map((link, index) => (
                                <div
                                    key={link.id}
                                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                                >
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {/* Image */}
                                        <div className="flex-shrink-0">
                                            {link.image_url ? (
                                                <img
                                                    src={link.image_url}
                                                    alt={link.link_name}
                                                    className="h-20 w-20 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm hover:scale-105 transition-transform"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23f3f4f6" width="80" height="80" rx="12"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="28"%3E🔗%3C/text%3E%3C/svg%3E';
                                                    }}
                                                />
                                            ) : (
                                                <div className="h-20 w-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 flex items-center justify-center shadow-sm">
                                                    <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                                        {link.link_name}
                                                    </h3>

                                                    {/* FIX 1: Thêm thẻ mở <a> */}
                                                    <a
                                                        href={link.link_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline text-sm truncate block"
                                                    >
                                                        {link.link_url}
                                                    </a>
                                                </div>
                                                <span className="flex-shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                                    #{index + 1}
                                                </span>
                                            </div>

                                            {link.description && (
                                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                                    {link.description}
                                                </p>
                                            )}

                                            {link.created_at && (
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>Tạo lúc: {new Date(link.created_at).toLocaleString('vi-VN')}</span>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => handleCopy(link.link_url)}
                                                    className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors"
                                                    title="Sao chép liên kết"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                    Sao chép
                                                </button>

                                                {/* FIX 2: Thêm thẻ mở <a> */}
                                                <a
                                                    href={link.link_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center px-4 py-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-lg transition-colors"
                                                    title="Mở liên kết"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    Mở
                                                </a>

                                                <button
                                                    onClick={() => handleEdit(link)}
                                                    className="inline-flex items-center px-4 py-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-800/50 text-amber-700 dark:text-amber-300 text-sm font-medium rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Sửa
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(link.id)}
                                                    className="inline-flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 text-sm font-medium rounded-lg transition-colors"
                                                    title="Xóa liên kết"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>© 2024 Dashboard. Được phát triển với ❤️</p>
                </div>
            </div>
        </div>
    );
}