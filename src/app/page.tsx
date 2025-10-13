// src/app/page.tsx
import Link from "next/link";
import { ChevronRight, Zap, BookOpen, Lock } from 'lucide-react';

// Dữ liệu giả lập cho các bài viết nổi bật
const featuredPosts = [
  {
    id: 1,
    title: "Chiến Lược Lãnh Đạo AL Cấp Độ Elite",
    summary: "Phân tích sâu về các chiến thuật và nguyên tắc mà một thủ lĩnh cấp độ Elite cần nắm vững để thành công.",
    href: "/blog/elite-strategy",
    tag: "Chiến Lược",
    icon: <Zap className="w-5 h-5 text-yellow-500" />
  },
  {
    id: 2,
    title: "Bảo Mật Hệ Thống Web: Vai Trò của JWT",
    summary: "Tìm hiểu cách thức JWT hoạt động và tầm quan trọng của xác thực mã hóa trong hệ thống Next.js.",
    href: "/blog/jwt-security",
    tag: "Bảo Mật",
    icon: <Lock className="w-5 h-5 text-red-500" />
  },
  {
    id: 3,
    title: "Triển Khai Next.js Trên Vercel: Tối Ưu Hóa",
    summary: "Các bước tối ưu hóa và cấu hình DNS để đạt hiệu suất cao nhất khi triển khai lên Vercel.",
    href: "/blog/vercel-optimization",
    tag: "DevOps",
    icon: <BookOpen className="w-5 h-5 text-green-500" />
  },
];

// Component Card cho Bài Viết
const PostCard: React.FC<typeof featuredPosts[0]> = ({ title, summary, href, tag, icon }) => (
    <Link
        href={href}
        className="group block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 ease-in-out border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-400"
    >
      <div className="flex items-center mb-3">
        {icon}
        <span className="ml-3 text-sm font-semibold uppercase text-blue-600 dark:text-blue-400">{tag}</span>
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition duration-300">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4 text-base line-clamp-3">
        {summary}
      </p>
      <div className="flex items-center text-blue-500 dark:text-blue-400 font-medium">
        Đọc thêm
        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
);


export default function HomePage() {
  return (
      <div className="flex flex-col items-center p-4 sm:p-10 min-h-[calc(100vh-60px)] bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">

        {/* 1. Hero Section - Header Mạnh Mẽ */}
        <section className="text-center py-16 sm:py-24 max-w-5xl w-full">
          <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500 dark:from-blue-400 dark:to-green-300">
            ELITE LEADER: CÔNG NGHỆ & CHIẾN LƯỢC
          </h1>
          <p className="text-lg sm:text-2xl font-light mb-10 max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
            Cổng thông tin cá nhân và blog chuyên sâu về Phát triển Mã, Lãnh đạo cấp cao và Hệ thống Bảo mật tiên tiến.
          </p>

          {/* Call to Action - Nút Truy Cập Khu Vực Riêng Tư */}
          <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-full shadow-xl text-white bg-blue-600 hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-blue-500/50"
          >
            <Zap className="w-5 h-5 mr-3" />
            Truy Cập Khu Vực RIÊNG TƯ (Dashboard)
          </Link>
        </section>

        ---

        {/* 2. Featured Posts Section - Layout lưới responsive */}
        <section className="w-full max-w-6xl py-12">
          <h2 className="text-3xl font-bold mb-10 text-center sm:text-left border-b pb-4 border-gray-200 dark:border-gray-700">
            🔥 Bài Viết Nổi Bật
          </h2>

          {/* Grid Responsive: 1 cột trên mobile, 2 cột trên md, 3 cột trên lg */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPosts.map((post) => (
                <PostCard key={post.id} {...post} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
                href="/blog"
                className="text-lg text-blue-600 dark:text-blue-400 hover:underline font-semibold transition duration-300"
            >
              Xem tất cả bài viết và thư viện →
            </Link>
          </div>
        </section>

        ---

        {/* 3. About Section (Giới thiệu ngắn) */}
        <section className="w-full max-w-5xl py-12 mt-10">
          <h2 className="text-3xl font-bold mb-6 text-center">Về Elite Leader AL</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center">
            Tôi tập trung vào việc tạo ra các giải pháp mã hóa **hiệu suất cao, an toàn** và dễ bảo trì. Website này là không gian để tôi chia sẻ kiến thức, tài nguyên cá nhân, và các dự án phát triển phần mềm tiên tiến. Mục tiêu là xây dựng cộng đồng vững mạnh xoay quanh công nghệ và lãnh đạo.
          </p>
        </section>

      </div>
  );
}