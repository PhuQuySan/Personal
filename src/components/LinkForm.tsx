// src/components/LinkForm.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { upsertUserLink } from "@/app/auth/link.actions";

interface LinkFormProps {
    action: typeof upsertUserLink;
    defaultLink?: UserLink;
}

interface UserLink {
    id: number;
    link_name: string;
    link_url: string;
    description: string | null;
}

export default function LinkForm({ action }: LinkFormProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            setError(null);
            setSuccess(false);

            const result = await action(formData);

            if (result?.error) {
                setError(result.error);
            } else if (result?.success) {
                setSuccess(true);
                e.currentTarget.reset();

                // Tự động xóa thông báo thành công sau 3 giây
                setTimeout(() => setSuccess(false), 3000);
            }
        });
    };

    return (
        <form
            id="link-form"
            onSubmit={handleSubmit}
            className="p-4 border border-blue-200 dark:border-blue-700/50 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6 space-y-3"
        >
            <h3 className="font-bold text-lg text-blue-700 dark:text-blue-300">Thêm Link Mới</h3>

            {/* Tên Link và URL */}
            <div className="flex space-x-3">
                <input
                    name="link_name"
                    type="text"
                    placeholder="Tên Link (ví dụ: Portfolio cá nhân)"
                    required
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
                <input
                    name="link_url"
                    type="url"
                    placeholder="URL (ví dụ: https://portfolio.com)"
                    required
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
            </div>

            {/* Mô tả */}
            <input
                name="description"
                type="text"
                placeholder="Mô tả ngắn (Tùy chọn)"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />

            {/* Nút Submit và Trạng thái */}
            <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition duration-300 disabled:opacity-50"
            >
                {isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <PlusCircle className="w-4 h-4 mr-2" />
                )}
                {isPending ? 'Đang xử lý...' : 'Thêm Link'}
            </button>

            {error && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>}
            {success && <p className="text-sm text-green-600 dark:text-green-400 mt-2">Thêm link thành công!</p>}
        </form>
    );
}