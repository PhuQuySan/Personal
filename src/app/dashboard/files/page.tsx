// src/app/dashboard/files/page.tsx
import { Lock } from 'lucide-react';

export default function FilesPage() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center p-10 bg-gray-50 dark:bg-gray-950">
            <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg">
                <Lock className="w-12 h-12 mx-auto text-yellow-600 dark:text-yellow-400 mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Khu Vực Tệp & Bí Mật
                </h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                    Trang này chỉ hiển thị cho người dùng có vai trò Elite hoặc Super Elite. Logic bảo mật đã được áp dụng!
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                    (Đây là trang mẫu - Nội dung quản lý tệp sẽ được thêm sau)
                </p>
            </div>
        </div>
    );
}