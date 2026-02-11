// src/components/PostForm.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, PlusCircle, Image, X, Upload, Plus, Tag as TagIcon, Wand2, Save, CheckCircle } from 'lucide-react';
import RichTextEditor from './Post/RichTextEditor';
import { PostData, PostFormProps, ActionResult } from '@/types';
import { uploadImage, deleteImage } from '@/lib/upload/upload-utils';

const ACCESS_LEVELS = ['public', 'elite', 'super_elite'];

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
    const [selectedTag, setSelectedTag] = useState<string>('');
    const [customTag, setCustomTag] = useState<string>('');
    const [isCreatingNewTag, setIsCreatingNewTag] = useState(false);

    const formRef = useRef<HTMLFormElement>(null);

    const generateSlug = (text: string): string => {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    useEffect(() => {
        if (!isSlugManuallyEdited && title) {
            const autoSlug = generateSlug(title);
            setSlug(autoSlug);
        }
    }, [title, isSlugManuallyEdited]);

    useEffect(() => {
        if (formRef.current) {
            const form = formRef.current;
            form.reset();

            if (defaultPost) {
                let idInput = form.querySelector<HTMLInputElement>('input[name="id"]');
                if (!idInput) {
                    idInput = document.createElement('input');
                    idInput.type = 'hidden';
                    idInput.name = 'id';
                    form.appendChild(idInput);
                }
                idInput.value = defaultPost.id?.toString() || '';

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

                let featuredImageInput = form.querySelector<HTMLInputElement>('input[name="featured_image"]');
                if (!featuredImageInput) {
                    featuredImageInput = document.createElement('input');
                    featuredImageInput.type = 'hidden';
                    featuredImageInput.name = 'featured_image';
                    form.appendChild(featuredImageInput);
                }
                featuredImageInput.value = defaultPost.featured_image || '';

                setContent(defaultPost.content || '');
                setTitle(defaultPost.title || '');
                setSlug(defaultPost.slug || '');
                setFeaturedImage(defaultPost.featured_image || '');
                setSelectedTag(defaultPost.tag || '');
                setIsSlugManuallyEdited(!!defaultPost.slug);
            } else {
                const idInput = form.querySelector<HTMLInputElement>('input[name="id"]');
                if (idInput) idInput.remove();

                const featuredImageInput = form.querySelector<HTMLInputElement>('input[name="featured_image"]');
                if (featuredImageInput) featuredImageInput.remove();

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
        formData.set('content', content);

        const finalTag = isCreatingNewTag && customTag ? customTag : selectedTag;
        formData.set('tag', finalTag);

        try {
            const result: ActionResult = await action(formData);

            if (result && 'error' in result) {
                setStatus({ type: 'error', message: result.error || 'Đã xảy ra lỗi.' });
            } else if (result && 'success' in result && result.success) {
                setStatus({ type: 'success', message: result.message || 'Thao tác thành công!' });

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
        <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {/* Featured Image Section - Compact */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-blue-200 dark:border-gray-600">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <Image className="w-4 h-4 mr-2 text-blue-600" />
                    Hình ảnh đại diện
                </label>

                {featuredImage ? (
                    <div className="relative mb-3 group">
                        <img
                            src={featuredImage}
                            alt="Featured preview"
                            className="w-full h-48 object-cover rounded-lg shadow-lg"
                        />
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={isUploading}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 disabled:opacity-50 transition-all shadow-lg"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-blue-300 dark:border-gray-600 rounded-lg p-6 text-center bg-white/50 dark:bg-gray-800/50">
                        {isUploading ? (
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">Đang upload...</p>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-10 h-10 mx-auto text-blue-400 mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    Kéo thả ảnh hoặc click để chọn
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    PNG, JPG, WEBP (max 5MB)
                                </p>
                            </>
                        )}
                    </div>
                )}

                {!featuredImage && !isUploading && (
                    <label className="block cursor-pointer">
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                            className="block w-full text-sm text-gray-500 mt-2
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-600 file:text-white
                                hover:file:bg-blue-700
                                file:transition-all
                                disabled:opacity-50"
                        />
                    </label>
                )}
            </div>

            {/* Title & Slug Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Tiêu đề <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        placeholder="Nhập tiêu đề bài viết"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                        maxLength={200}
                    />
                </div>

                <div>
                    <label htmlFor="slug" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                        <span>
                            Slug <span className="text-red-500">*</span>
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                const autoSlug = generateSlug(title);
                                setSlug(autoSlug);
                                setIsSlugManuallyEdited(false);
                            }}
                            className="text-xs flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                            <Wand2 className="w-3 h-3 mr-1" />
                            Tạo lại
                        </button>
                    </label>
                    <input
                        id="slug"
                        name="slug"
                        type="text"
                        placeholder="url-bai-viet"
                        required
                        value={slug}
                        onChange={(e) => {
                            setSlug(e.target.value);
                            setIsSlugManuallyEdited(true);
                        }}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                    />
                </div>
            </div>

            {/* Summary */}
            <div>
                <label htmlFor="summary" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Tóm tắt bài viết
                </label>
                <textarea
                    id="summary"
                    name="summary"
                    placeholder="Tóm tắt ngắn gọn về bài viết của bạn"
                    rows={3}
                    defaultValue={defaultPost?.summary || ''}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white resize-none"
                />
            </div>

            {/* Content Editor */}
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Nội dung bài viết <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Viết nội dung bài viết tại đây..."
                />
            </div>

            {/* Tag, Access Level, Publish Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Tag */}
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
                                className="w-full px-4 py-2.5 pr-10 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white appearance-none"
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
                                className="w-full px-4 py-2.5 pr-10 border-2 border-orange-500 dark:border-orange-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreatingNewTag(false);
                                    setCustomTag('');
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Access Level */}
                <div>
                    <label htmlFor="access_level" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Cấp độ truy cập
                    </label>
                    <select
                        id="access_level"
                        name="access_level"
                        required
                        defaultValue={defaultPost?.access_level || 'public'}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
                    >
                        {ACCESS_LEVELS.map(level => (
                            <option key={level} value={level} className="capitalize">
                                {level.replace('_', ' ').toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Publish Checkbox */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Xuất bản
                    </label>
                    <label className="flex items-center h-[42px] px-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 rounded-lg border-2 border-green-200 dark:border-green-700 cursor-pointer hover:shadow-md transition-all">
                        <input
                            id="is_published"
                            name="is_published"
                            type="checkbox"
                            defaultChecked={defaultPost?.is_published || false}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1.5 text-green-500" />
                            Xuất bản ngay
                        </span>
                    </label>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>💡 Lưu ý:</strong> Bài viết chưa xuất bản sẽ không hiển thị công khai.
                </p>
            </div>

            {/* Status Message */}
            {status && (
                <div className={`p-3 rounded-lg text-sm font-medium border ${
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
                className="w-full flex items-center justify-center py-3 px-6 border border-transparent rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
                {isPending ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Đang lưu...
                    </>
                ) : (
                    <>
                        <Save className="w-5 h-5 mr-2" />
                        {defaultPost?.id ? 'Cập nhật Bài Viết' : 'Tạo Bài Viết Mới'}
                    </>
                )}
            </button>
        </form>
    );
}