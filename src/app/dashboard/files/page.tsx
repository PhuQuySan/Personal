// src/app/dashboard/files/page.tsx
import { Lock, ShieldAlert } from 'lucide-react';

export default function FilesPage() {
    return (
        /* Sử dụng bg-background để tự động lấy màu từ :root hoặc .dark trong globals.css
           Thêm transition-colors để khi hệ thống đổi theme, trang sẽ fade mượt mà.
        */
        <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground transition-colors duration-500">

            <div className="relative w-full max-w-lg p-10 overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl">

                {/* Hiệu ứng Glow nhẹ ở góc để tăng tính thẩm mỹ cho giao diện Dark Mode */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/10 blur-3xl rounded-full" />

                <div className="relative text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-yellow-50 dark:bg-yellow-900/20">
                        <Lock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
                        Khu Vực Tệp & Bí Mật
                    </h1>

                    <div className="mt-6 space-y-4">
                        <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                            Trang này chỉ dành riêng cho vai trò <span className="font-bold text-yellow-600 dark:text-yellow-400">Elite</span> hoặc <span className="font-bold text-red-600 dark:text-red-400">Super Elite</span>.
                        </p>

                        <div className="flex items-center justify-center gap-2 p-3 text-sm font-medium border rounded-lg bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                            <ShieldAlert className="w-4 h-4" />
                            <span>Hệ thống bảo mật FIXCODE3 đang giám sát</span>
                        </div>
                    </div>

                    <p className="mt-8 text-xs italic text-gray-400 dark:text-gray-500">
                        (Dữ liệu thực tế sẽ được tải lên thông qua Supabase Storage)
                    </p>
                </div>
            </div>
        </div>
    );
}