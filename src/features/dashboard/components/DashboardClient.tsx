// src/components/DashboardClient.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/shared/lib/supabase/client';
import { UserLink, UserProfile } from '@/shared/types';
import MediaLibrary from './MediaLibrary';
import { Plus, Edit2, Trash2, Copy, ExternalLink, X, Image as ImageIcon, Link as LinkIcon, Save, Calendar, Globe } from 'lucide-react';

interface DashboardClientProps {
    initialProfile: UserProfile;
    initialLinks: UserLink[];
}

export default function DashboardClient({ initialProfile, initialLinks }: DashboardClientProps) {
    const [links, setLinks] = useState<UserLink[]>(initialLinks);
    const [profile] = useState<UserProfile>(initialProfile);
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
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
            setIsAddModalOpen(false);
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
        setIsAddModalOpen(true);

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setFormData({ link_name: '', link_url: '', description: '', image_url: '' });
        setIsAddModalOpen(false);
        setEditingId(null);
    };

    const handleSelectFromLibrary = (imageUrl: string) => {
        setFormData({ ...formData, image_url: imageUrl });
        setIsMediaLibraryOpen(false);
    };

    return (
        // ✅ Sử dụng bg-background và text-foreground như FilesPage
        <div className="min-h-screen p-6 bg-background text-foreground transition-colors duration-500">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl p-8 mb-8 animate-fade-in-up">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 blue-3xl rounded-full" />

                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <img
                                    src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name || 'User'}&background=6366f1&color=fff`}
                                    alt="Avatar"
                                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all duration-300"
                                />
                                <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-1.5 rounded-lg shadow-lg">
                                    <Globe className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
                                    Bảng Điều Khiển
                                </h1>
                                <div className="flex flex-wrap items-center gap-3">
                                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                                        Chào, <span className="text-indigo-600 dark:text-indigo-400">
                                            {profile.full_name || 'User'}
                                        </span>
                                    </p>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${profile.user_role === 'super_elite'
                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                        : profile.user_role === 'elite'
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                            : profile.user_role === 'demo'
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
                                        }`}>
                                        {profile.user_role === 'super_elite' ? '👑 Super Elite'
                                            : profile.user_role === 'elite' ? '⭐ Elite'
                                                : profile.user_role === 'demo' ? '🎭 Demo'
                                                    : '👤 Normal'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({ link_name: '', link_url: '', description: '', image_url: '' });
                                setIsAddModalOpen(true);
                            }}
                            className="inline-flex items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 group"
                        >
                            <Plus className="w-6 h-6 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                            Thêm liên kết mới
                        </button>
                    </div>
                </div>

                {/* Add/Edit Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={cancelEdit} />
                        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-zoom-in">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                        {editingId ? <Edit2 className="w-6 h-6 text-indigo-500" /> : <Plus className="w-7 h-7 text-indigo-500" />}
                                        {editingId ? 'Chỉnh sửa liên kết' : 'Thêm liên kết mới'}
                                    </h2>
                                    <button onClick={cancelEdit} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                                        <X className="w-6 h-6 text-gray-400" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                                                Tên liên kết <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.link_name}
                                                    onChange={(e) => setFormData({ ...formData, link_name: e.target.value })}
                                                    className="w-full pl-4 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-gray-900 dark:text-white transition-all outline-none"
                                                    placeholder="VD: Website chính"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                                                URL <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="url"
                                                required
                                                value={formData.link_url}
                                                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                                                className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-gray-900 dark:text-white transition-all outline-none"
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                                            Hình ảnh hiển thị
                                        </label>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="flex-1 relative">
                                                <input
                                                    type="url"
                                                    value={formData.image_url}
                                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                                    className="w-full pl-4 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-gray-900 dark:text-white transition-all outline-none"
                                                    placeholder="Dán link ảnh tại đây..."
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsMediaLibraryOpen(true)}
                                                className="px-6 py-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                                            >
                                                <ImageIcon className="w-5 h-5" />
                                                Từ thư viện
                                            </button>
                                        </div>

                                        {formData.image_url && (
                                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center gap-4 animate-fade-in">
                                                <img
                                                    src={formData.image_url}
                                                    alt="Preview"
                                                    className="h-20 w-20 object-cover rounded-xl shadow-lg"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Error';
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Xem trước ảnh</p>
                                                    <p className="text-sm text-gray-400 truncate">{formData.image_url}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                                            Mô tả ngắn
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-gray-900 dark:text-white transition-all outline-none resize-none"
                                            placeholder="Một chút mô tả về liên kết này..."
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Save className="w-5 h-5" />
                                            {editingId ? 'Cập Nhật Ngay' : 'Lưu Liên Kết'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                <div className="relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl animate-fade-in-up">
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 blue-3xl rounded-full" />

                    <div className="relative p-8 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <LinkIcon className="w-6 h-6 text-indigo-500" />
                            Liên Kết Đã Lưu ({links.length})
                        </h2>
                    </div>

                    {loading ? (
                        <div className="relative p-20 text-center">
                            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 font-bold animate-pulse">Đang đồng bộ dữ liệu...</p>
                        </div>
                    ) : links.length === 0 ? (
                        <div className="relative p-20 text-center">
                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
                                <LinkIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Chưa có liên kết nào</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Hãy thêm các liên kết như Facebook, Pixiv, hoặc Website của bạn để mọi người có thể tìm thấy bạn.</p>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Tạo liên kết đầu tiên
                            </button>
                        </div>
                    ) : (
                        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
                            {links.map((link, index) => (
                                <div
                                    key={link.id}
                                    className="group relative bg-gray-50 dark:bg-gray-800/30 border border-transparent hover:border-indigo-500/30 rounded-3xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
                                >
                                    <div className="flex gap-6">
                                        <div className="flex-shrink-0">
                                            <div className="relative">
                                                <img
                                                    src={link.image_url || `https://ui-avatars.com/api/?name=${link.link_name}&background=random`}
                                                    alt={link.link_name}
                                                    className="h-24 w-24 object-cover rounded-2xl shadow-xl ring-2 ring-white dark:ring-gray-700 group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect fill="%23f3f4f6" width="96" height="96" rx="20"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="32"%3E🔗%3C/text%3E%3C/svg%3E';
                                                    }}
                                                />
                                                <div className="absolute -top-3 -left-3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-lg border border-gray-100 dark:border-gray-700">
                                                    #{index + 1}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900 dark:text-white truncate mb-1">
                                                    {link.link_name}
                                                </h3>
                                                <a
                                                    href={link.link_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold text-sm truncate max-w-full mb-3"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                                    {new URL(link.link_url).hostname}
                                                </a>
                                                {link.description && (
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed mb-4">
                                                        {link.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    onClick={() => handleCopy(link.link_url)}
                                                    className="p-2.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl hover:text-indigo-500 dark:hover:text-indigo-400 transition-all shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                                                    title="Sao chép"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                    CP
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setFormData({
                                                            link_name: link.link_name,
                                                            link_url: link.link_url,
                                                            description: link.description || '',
                                                            image_url: link.image_url || '',
                                                        });
                                                        setEditingId(link.id);
                                                        setIsAddModalOpen(true);
                                                    }}
                                                    className="p-2.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl hover:text-amber-500 dark:hover:text-amber-400 transition-all shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(link.id)}
                                                    className="flex-1 p-2.5 bg-white dark:bg-gray-800 text-red-400 dark:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <Calendar className="w-3 h-3" />
                                            {link.created_at ? new Date(link.created_at).toLocaleDateString('vi-VN') : 'Unknown'}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3].map((_, i) => (
                                                <div key={i} className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <MediaLibrary
                    isOpen={isMediaLibraryOpen}
                    onClose={() => setIsMediaLibraryOpen(false)}
                    onSelect={handleSelectFromLibrary}
                />

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>© 2024 Dashboard. Được phát triển với ❤️</p>
                </div>
            </div>
        </div>
    );
}