// src/components/LinkForm.tsx
'use client';

import React, { useState, useTransition, useRef } from 'react';
import { PlusCircle, Loader2, Link as LinkIcon } from 'lucide-react';
// import { upsertUserLink } from "@/app/auth/link.actions"; // Import action function
import { UserLink, LinkFormProps, ActionResult } from '@/types'; // Import các interface từ file types

export default function LinkForm({ action }: LinkFormProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Lấy form data từ event target
        const form = e.currentTarget;
        const formData = new FormData(form);

        startTransition(async () => {
            setError(null);
            setSuccess(false);

            const result: ActionResult = await action(formData);

            if (result?.error) {
                setError(result.error);
            } else if (result?.success) {
                setSuccess(true);

                // Reset form sử dụng event target thay vì ref
                form.reset();

                // Tự động xóa thông báo thành công sau 3 giây
                setTimeout(() => setSuccess(false), 3000);
            }
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-750">
                <h3 className="font-bold text-lg text-blue-700 dark:text-blue-300 flex items-center">
                    <LinkIcon className="w-5 h-5 mr-2" />
                    Thêm Liên kết Mới
                </h3>
            </div>

            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="p-5 space-y-4"
            >
                {/* Tên Link */}
                <div>
                    <label htmlFor="link_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tên Liên kết
                    </label>
                    <input
                        id="link_name"
                        name="link_name"
                        type="text"
                        placeholder="Portfolio cá nhân"
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 transition"
                    />
                </div>

                {/* URL */}
                <div>
                    <label htmlFor="link_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        URL
                    </label>
                    <input
                        id="link_url"
                        name="link_url"
                        type="url"
                        placeholder="https://portfolio.com"
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 transition"
                    />
                </div>

                {/* Mô tả */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Mô tả <span className="text-gray-500 dark:text-gray-400">(tùy chọn)</span>
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        placeholder="Mô tả ngắn về liên kết"
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 transition"
                    />
                </div>

                {/* Nút Submit */}
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg text-base font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 transition duration-300 disabled:opacity-70 shadow-md hover:shadow-lg"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Thêm Liên kết
                        </>
                    )}
                </button>

                {/* Thông báo */}
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-700 text-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-700 text-sm flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Thêm liên kết thành công!
                    </div>
                )}
            </form>
        </div>
    );
}