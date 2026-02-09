// src/components/PostForm.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, PlusCircle, Image, X, Upload, Plus, Tag as TagIcon, Wand2 } from 'lucide-react';
import RichTextEditor from './Post/RichTextEditor';
import { PostData, PostFormProps, ActionResult } from '@/types';
import { uploadImage, deleteImage } from '@/lib/upload/upload-utils';

const ACCESS_LEVELS = ['public', 'elite', 'super_elite'];

// 🌟 Danh sách tags có sẵn (có thể lấy từ DB)
const PRESET_TAGS = [
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'Python',
    'AI/ML',
    'Web Development',
    'DevOps',
    'Database',
    'UI/UX',
    'Mobile',
    'Tutorial',
    'News',
    'Tips & Tricks'
];

export default function PostForm({ action, defaultPost }: PostFormProps) {
    const [isPending, setIsPending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
    const [content, setContent] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [slug, setSlug] = useState<string>('');
    const [featuredImage, setFeaturedImage] = useState<string>('');
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

    // 🌟 Tag state
    const [selectedTag, setSelectedTag] = useState<string>('');
    const [customTag, setCustomTag] = useState<string>('');
    const [isCreatingNewTag, setIsCreatingNewTag] = useState(false);

    const formRef = useRef<HTMLFormElement>(null);

    // 🌟 Hàm tạo slug từ tiêu đề
    const generateSlug = (text: string): string => {
        return text
            .toLowerCase()
            .normalize('NFD') // Chuẩn hóa Unicode
            .replace(/[\u0300-\u036f]/g, '') // Xóa dấu tiếng Việt
            .replace(/[đĐ]/g, 'd') // Đổi đ thành d
            .replace(/[^a-z0-9\s-]/g, '') // Xóa ký tự đặc biệt
            .replace(/\s+/g, '-') // Thay khoảng trắng bằng -
            .replace(/-+/g, '-') // Xóa - trùng lặp
            .replace(/^-+|-+$/g, ''); // Xóa - ở đầu/cuối
    };

    // 🌟 Auto-generate slug khi title thay đổi
    useEffect(() => {
        if (!isSlugManuallyEdited && title) {
            const autoSlug = generateSlug(title);
            setSlug(autoSlug);
        }
    }, [title, isSlugManuallyEdited]);

    // Reset form khi defaultPost thay đổi
    useEffect(() => {
        if (formRef.current) {
            const form = formRef.current;
            form.reset();

            if (defaultPost) {
                // Tìm hoặc tạo input ID
                let idInput = form.querySelector<HTMLInputElement>('input[name="id"]');
                if (!idInput) {
                    idInput = document.createElement('input');
                    idInput.type = 'hidden';
                    idInput.name = 'id';
                    form.appendChild(idInput);
                }
                idInput.value = defaultPost.id?.toString() || '';

                // Cập nhật các input
                const titleInput = form.querySelector<HTMLInputElement>('input[name="title"]');
                if (titleInput) titleInput.value = defaultPost.title || '';

                const slugInput = form.querySelector<HTMLInputElement>('input[name="slug"]');
                if (slugInput) slugInput.value = defaultPost.slug || '';

                const summaryInput = form.querySelector<HTMLTextAreaElement>('textarea[name="summary"]');
                if (summaryInput) summaryInput.value = defaultPost.summary || '';

                const accessSelect = form.querySelector<HTMLSelectElement>('select[name="access_level"]');
                if (accessSelect) accessSelect.value = defaultPost.access_level || 'public';

                const publishedInput = form.querySelector<HTMLInputElement>('input[name="is_published"]');
                if (publishedInput) publishedInput.checked = defaultPost.is_published || false;

                // Featured image
                let featuredImageInput = form.querySelector<HTMLInputElement>('input[name="featured_image"]');
                if (!featuredImageInput) {
                    featuredImageInput = document.createElement('input');
                    featuredImageInput.type = 'hidden';
                    featuredImageInput.name = 'featured_image';
                    form.appendChild(featuredImageInput);
                }
                featuredImageInput.value = defaultPost.featured_image || '';

                // Update local state
                setContent(defaultPost.content || '');
                setTitle(defaultPost.title || '');
                setSlug(defaultPost.slug || '');
                setFeaturedImage(defaultPost.featured_image || '');
                setSelectedTag(defaultPost.tag || '');
                setIsSlugManuallyEdited(!!defaultPost.slug); // Nếu có slug sẵn thì đánh dấu đã edit thủ công
            } else {
                // Nếu tạo mới, xóa input id
                const idInput = form.querySelector<HTMLInputElement>('input[name="id"]');
                if (idInput) idInput.remove();

                const featuredImageInput = form.querySelector<HTMLInputElement>('input[name="featured_image"]');
                if (featuredImageInput) featuredImageInput.remove();

                // Reset state
                setContent('');
                setTitle('');
                setSlug('');
                setFeaturedImage('');
                setSelectedTag('');
                setCustomTag('');
                setIsSlugManuallyEdited(false);
                setIsCreatingNewTag(false);
            }
        }
    }, [defaultPost]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        e.target.value = '';

        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setStatus({ type: 'error', message: 'Vui lòng chọn file ảnh (PNG, JPG, JPEG, WEBP)' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setStatus({ type: 'error', message: 'Kích thước ảnh không được vượt quá 5MB' });
            return;
        }

        setIsUploading(true);
        setStatus(null);

        try {
            const tempUrl = URL.createObjectURL(file);
            setFeaturedImage(tempUrl);

            const imageUrl = await uploadImage(file);
            setFeaturedImage(imageUrl);

            if (formRef.current) {
                let imageInput = formRef.current.querySelector('input[name="featured_image"]') as HTMLInputElement;
                if (!imageInput) {
                    imageInput = document.createElement('input');
                    imageInput.type = 'hidden';
                    imageInput.name = 'featured_image';
                    formRef.current.appendChild(imageInput);
                }
                imageInput.value = imageUrl;
            }

            setStatus({ type: 'success', message: 'Upload ảnh thành công!' });
            URL.revokeObjectURL(tempUrl);

        } catch (error) {
            console.error('❌ Upload error:', error);
            setFeaturedImage('');
            const errorMessage = error instanceof Error ? error.message : 'Upload ảnh thất bại. Vui lòng thử lại.';
            setStatus({ type: 'error', message: errorMessage });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = async () => {
        if (featuredImage) {
            try {
                if (featuredImage.includes('supabase.co')) {
                    await deleteImage(featuredImage);
                }
            } catch (error) {
                console.error('❌ Error removing image:', error);
            }
        }

        setFeaturedImage('');

        if (formRef.current) {
            const imageInput = formRef.current.querySelector('input[name="featured_image"]') as HTMLInputElement;
            if (imageInput) {
                imageInput.value = '';
            }
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsPending(true);
        setStatus(null);

        if (!formRef.current) return;

        const formData = new FormData(formRef.current);

        // Thêm content
        formData.set('content', content);

        // 🌟 Xử lý tag: ưu tiên custom tag nếu đang tạo mới
        const finalTag = isCreatingNewTag && customTag ? customTag : selectedTag;
        formData.set('tag', finalTag);

        try {
            const result: ActionResult = await action(formData);

            if (result && 'error' in result) {
                setStatus({ type: 'error', message: result.error || 'Đã xảy ra lỗi.' });
            } else if (result && 'success' in result && result.success) {
                setStatus({ type: 'success', message: result.message || 'Thao tác thành công!' });

                // Reset form sau khi tạo mới thành công
                if (!defaultPost) {
                    formRef.current.reset();
                    setContent('');
                    setTitle('');
                    setSlug('');
                    setFeaturedImage('');
                    setSelectedTag('');
                    setCustomTag('');
                    setIsSlugManuallyEdited(false);
                    setIsCreatingNewTag(false);
                }
            }
        } catch (error) {
            console.error('Lỗi khi gửi form:', error);
            setStatus({ type: 'error', message: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.' });
        } finally {
            setIsPending(false);
            setTimeout(() => setStatus(null), 5000);
        }
    };

    return (
        <div className="space-y-6">
            {/* Featured Image Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl border-2 border-blue-200 dark:border-gray-700 shadow-lg">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <Image className="w-4 h-4 mr-2 text-blue-600" />
                    Hình ảnh đại diện
                </label>

                {featuredImage ? (
                    <div className="relative mb-3 group">
                        <img
                            src={featuredImage}
                            alt="Featured preview"
                            className="w-full h-64 object-cover rounded-xl shadow-xl"
                        />
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={isUploading}
                            className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 disabled:opacity-50 transition-all duration-200 shadow-lg hover:scale-110"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-blue-300 dark:border-gray-600 rounded-xl p-8 text-center mb-3 bg-white/50 dark:bg-gray-800/50">
                        {isUploading ? (
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Đang upload ảnh...</p>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-12 h-12 mx-auto text-blue-400 mb-3" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    Kéo thả ảnh vào đây hoặc click để chọn
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    PNG, JPG, WEBP (tối đa 5MB)
                                </p>
                            </>
                        )}
                    </div>
                )}

                {!featuredImage && !isUploading && (
                    <label className="block cursor-pointer">
                        <span className="sr-only">Chọn hình ảnh</span>
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2.5 file:px-5
                                file:rounded-lg file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-600 file:text-white
                                hover:file:bg-blue-700
                                file:transition-all file:duration-200
                                file:shadow-lg file:shadow-blue-500/30
                                dark:file:bg-blue-700 dark:file:text-white
                                disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </label>
                )}
            </div>

            {/* Main Form */}
            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 space-y-6"
            >
                {/* Tiêu đề */}
                <div>
                    <label htmlFor="title" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <span className="w-1 h-4 bg-blue-600 rounded-full mr-2"></span>
                        Tiêu đề bài viết <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="title"
                            name="title"
                            type="text"
                            placeholder="Nhập tiêu đề bài viết"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 pr-16 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 font-medium"
                            maxLength={200}
                        />
                        <div className="absolute right-4 top-3 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                            {title.length}/200
                        </div>
                    </div>
                </div>

                {/* 🌟 Slug với Auto-generate */}
                <div>
                    <label htmlFor="slug" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="w-1 h-4 bg-green-600 rounded-full mr-2"></span>
                            Slug (URL) <span className="text-red-500 ml-1">*</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                const autoSlug = generateSlug(title);
                                setSlug(autoSlug);
                                setIsSlugManuallyEdited(false);
                            }}
                            className="text-xs flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                            <Wand2 className="w-3 h-3" />
                            <span>Tạo lại</span>
                        </button>
                    </label>
                    <input
                        id="slug"
                        name="slug"
                        type="text"
                        placeholder="bai-viet-mau"
                        required
                        value={slug}
                        onChange={(e) => {
                            setSlug(e.target.value);
                            setIsSlugManuallyEdited(true);
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {isSlugManuallyEdited ? '✏️ Đã chỉnh sửa thủ công' : '✨ Tự động từ tiêu đề'}
                    </p>
                </div>

                {/* Tóm tắt */}
                <div>
                    <label htmlFor="summary" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <span className="w-1 h-4 bg-purple-600 rounded-full mr-2"></span>
                        Tóm tắt bài viết
                    </label>
                    <textarea
                        id="summary"
                        name="summary"
                        placeholder="Tóm tắt ngắn về bài viết của bạn"
                        rows={3}
                        defaultValue={defaultPost?.summary || ''}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white resize-none"
                    />
                </div>

                {/* 🌟 Nội dung - FIX: Luôn hiển thị content khi edit */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <span className="w-1 h-4 bg-red-600 rounded-full mr-2"></span>
                        Nội dung bài viết <span className="text-red-500 ml-1">*</span>
                    </label>
                    <RichTextEditor
                        value={content}
                        onChange={setContent}
                        placeholder="Viết nội dung bài viết tại đây..."
                    />
                </div>

                {/* Tag, Access Level, Publish */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 🌟 Tag Dropdown với Create New */}
                    <div>
                        <label htmlFor="tag" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <TagIcon className="w-4 h-4 mr-1 text-orange-600" />
                            Tag
                        </label>

                        {!isCreatingNewTag ? (
                            <div className="relative">
                                <select
                                    id="tag"
                                    name="tag"
                                    value={selectedTag}
                                    onChange={(e) => setSelectedTag(e.target.value)}
                                    className="w-full px-4 py-3 pr-10 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white appearance-none"
                                >
                                    <option value="">Chọn tag</option>
                                    {PRESET_TAGS.map(tag => (
                                        <option key={tag} value={tag}>{tag}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingNewTag(true)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                    title="Tạo tag mới"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    type="text"
                                    value={customTag}
                                    onChange={(e) => setCustomTag(e.target.value)}
                                    placeholder="Nhập tag mới"
                                    className="w-full px-4 py-3 pr-10 border-2 border-orange-500 dark:border-orange-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreatingNewTag(false);
                                        setCustomTag('');
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    title="Hủy"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Access Level */}
                    <div>
                        <label htmlFor="access_level" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <span className="w-1 h-4 bg-yellow-600 rounded-full mr-2"></span>
                            Cấp độ truy cập
                        </label>
                        <select
                            id="access_level"
                            name="access_level"
                            required
                            defaultValue={defaultPost?.access_level || 'public'}
                            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                        >
                            {ACCESS_LEVELS.map(level => (
                                <option key={level} value={level} className="capitalize">
                                    {level.replace('_', ' ').toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Publish Checkbox */}
                    <div className="flex items-end">
                        <label className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-green-200 dark:border-green-700 cursor-pointer hover:shadow-md transition-all duration-200 w-full">
                            <input
                                id="is_published"
                                name="is_published"
                                type="checkbox"
                                defaultChecked={defaultPost?.is_published || false}
                                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                Xuất bản ngay
                            </span>
                        </label>
                    </div>
                </div>

                {/* Thông báo */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>💡 Lưu ý:</strong> Bài viết chưa xuất bản sẽ không hiển thị với public.
                        Chỉ tác giả đã đăng nhập mới xem được bản nháp của mình.
                    </p>
                </div>

                {/* Status Message */}
                {status && (
                    <div className={`p-4 rounded-xl text-sm font-medium border-2 ${
                        status.type === 'error'
                            ? 'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-400'
                            : 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400'
                    }`}>
                        {status.message}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isPending || isUploading}
                    className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <PlusCircle className="w-5 h-5 mr-2" />
                            {defaultPost?.id ? 'Cập nhật Bài Viết' : 'Tạo Bài Viết Mới'}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}