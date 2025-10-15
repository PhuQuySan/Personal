// src/app/loading.tsx
export default function Loading() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50 dark:bg-gray-900/80">
            <div className="flex flex-col items-center space-y-4">
                {/* Circular Loading Spinner */}
                <div className="relative">
                    {/* Outer ring */}
                    <div className="w-12 h-12 border-4 border-gray-200 rounded-full dark:border-gray-700"></div>
                    {/* Spinning ring */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin dark:border-blue-500"></div>
                </div>
            </div>
        </div>
    );
}