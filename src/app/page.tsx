// src/app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Zap, BookOpen, Lock, Star, Users, Target } from 'lucide-react';

// Metadata for SEO
export const metadata = {
  title: "ELITE LEADER - Trang chủ",
  description: "Cổng thông tin cá nhân và blog chuyên sâu về Phát triển Mã Nguồn, Lãnh đạo cấp cao và Hệ thống Bảo mật tiên tiến."
};

// Dữ liệu cho các bài viết nổi bật
const featuredPosts = [
  {
    id: 1,
    title: "Chiến Lược Lãnh Đạo AI Cấp Độ Elite",
    summary: "Phân tích sâu về các chiến thuật và nguyên tắc mà một thủ lĩnh cấp độ Elite cần nắm vững để thành công trong kỷ nguyên AI.",
    href: "/blog/elite-strategy",
    tag: "Chiến Lược",
    icon: Zap,
    iconColor: "text-yellow-500",
    readTime: "5 phút"
  },
  {
    id: 2,
    title: "Bảo Mật Hệ Thống Web: Vai Trò của JWT",
    summary: "Tìm hiểu cách thức JWT hoạt động và tầm quan trọng của xác thực mã hóa trong hệ thống Next.js hiện đại.",
    href: "/blog/jwt-security",
    tag: "Bảo Mật",
    icon: Lock,
    iconColor: "text-red-500",
    readTime: "7 phút"
  },
  {
    id: 3,
    title: "Triển Khai Next.js Trên Vercel: Tối Ưu Hóa",
    summary: "Các bước tối ưu hóa và cấu hình DNS để đạt hiệu suất cao nhất khi triển khai lên Vercel.",
    href: "/blog/vercel-optimization",
    tag: "DevOps",
    icon: BookOpen,
    iconColor: "text-green-500",
    readTime: "4 phút"
  },
];

// Thống kê nổi bật
const stats = [
  { number: "50+", label: "Dự Án Hoàn Thành", icon: Target },
  { number: "5+", label: "Năm Kinh Nghiệm", icon: Star },
  { number: "10K+", label: "Độc Giả", icon: Users },
];

// Component Card cho Bài Viết
function PostCard({ title, summary, href, tag, icon: Icon, iconColor, readTime }: typeof featuredPosts[0]) {
  return (
      <Link href={href}>
        <article className="group block h-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:translate-y-[-4px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Icon className={`w-5 h-5 ${iconColor}`} />
              <span className="ml-3 text-sm font-semibold uppercase text-blue-600 dark:text-blue-400">{tag}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{readTime}</span>
          </div>
          <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-base leading-relaxed line-clamp-3">
            {summary}
          </p>
          <div className="flex items-center text-blue-500 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
            Đọc thêm
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </article>
      </Link>
  );
}

// Component Thống kê
function StatCard({ number, label, icon: Icon }: typeof stats[0]) {
  return (
      <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
        <div className="flex justify-center mb-3 text-blue-600 dark:text-blue-400">
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{number}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</div>
      </div>
  );
}

export default function HomePage() {
  return (
      <div className="flex flex-col items-center px-4 sm:px-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 text-gray-800 dark:text-gray-100">

        {/* 1. Hero Section */}
        <section className="text-center py-16 sm:py-24 max-w-6xl w-full relative">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-200 dark:bg-blue-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-green-200 dark:bg-green-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="relative">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-green-500 dark:from-blue-400 dark:via-purple-400 dark:to-green-300 leading-tight">
              ELITE LEADER:
              <br />
              <span className="text-3xl sm:text-5xl lg:text-6xl">CÔNG NGHỆ & CHIẾN LƯỢC</span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl font-light mb-10 max-w-4xl mx-auto text-gray-600 dark:text-gray-300 leading-relaxed">
              Cổng thông tin cá nhân và blog chuyên sâu về{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">Phát triển Mã Nguồn</span>,{" "}
              <span className="font-semibold text-purple-600 dark:text-purple-400">Lãnh đạo cấp cao</span> và{" "}
              <span className="font-semibold text-green-600 dark:text-green-400">Hệ thống Bảo mật</span> tiên tiến.
            </p>

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-full shadow-2xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 ease-in-out transform hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-blue-500/50"
              >
                <Zap className="w-5 h-5 mr-3" />
                Truy Cập Khu Vực RIÊNG TƯ
              </Link>

              <Link
                  href="/blog"
                  className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 dark:border-gray-600 text-base font-semibold rounded-full shadow-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 ease-in-out"
              >
                <BookOpen className="w-5 h-5 mr-3" />
                Khám Phá Blog
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Thống kê nổi bật */}
        <section className="w-full max-w-6xl py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
          </div>
        </section>

        {/* 3. Featured Posts Section */}
        <section className="w-full max-w-6xl py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              🔥 Bài Viết Nổi Bật
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Khám phá những bài viết chuyên sâu về công nghệ, chiến lược và phát triển bản thân
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPosts.map((post) => (
                <PostCard key={post.id} {...post} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
                href="/blog"
                className="inline-flex items-center text-lg font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300 group"
            >
              Khám phá tất cả bài viết và thư viện
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </section>

        {/* 4. About Section */}
        <section className="w-full max-w-4xl py-16">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-900 dark:text-white">
              Về Elite Leader AI
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Tôi tập trung vào việc tạo ra các giải pháp mã hóa <span className="font-semibold text-blue-600 dark:text-blue-400">hiệu suất cao, an toàn</span> và dễ bảo trì.
                Website này là không gian để chia sẻ kiến thức, tài nguyên cá nhân, và các dự án phát triển phần mềm tiên tiến.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Mục tiêu là xây dựng cộng đồng vững mạnh xoay quanh <span className="font-semibold text-purple-600 dark:text-purple-400">công nghệ AI</span>,{" "}
                <span className="font-semibold text-green-600 dark:text-green-400">lãnh đạo chiến lược</span> và{" "}
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">đổi mới sáng tạo</span>.
                <br/>
                <span>ver 13 </span>
              </p>
            </div>
          </div>
        </section>

      </div>
  );
}