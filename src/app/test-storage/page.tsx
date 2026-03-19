// src/app/test-storage/page.tsx
'use client';

import { checkBucketExists, listBucketFiles, uploadImage } from '@/shared/lib/upload/upload-utils';
import { useEffect, useState } from 'react';

export default function TestStoragePage() {
    const [status, setStatus] = useState<string>('Đang kiểm tra...');
    const [files, setFiles] = useState<string[]>([]);
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [isTestingUpload, setIsTestingUpload] = useState(false);

    useEffect(() => {
        const testStorage = async () => {
            try {
                console.log('🔍 Kiểm tra storage...');
                setStatus('Đang kiểm tra storage...');

                // Kiểm tra bucket tồn tại
                const bucketExists = await checkBucketExists();

                if (bucketExists) {
                    setStatus('✅ Bucket "images" tồn tại và có thể truy cập');

                    // Kiểm tra danh sách file
                    const fileList = await listBucketFiles();
                    setFiles(fileList);

                    console.log('📁 Files trong bucket:', fileList);
                } else {
                    setStatus('❌ Không thể truy cập bucket "images"');
                }

            } catch (error) {
                console.error('❌ Storage test error:', error);
                setStatus(`❌ Lỗi: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        };

        testStorage();
    }, []);

    const handleTestUpload = async () => {
        setIsTestingUpload(true);
        try {
            // Tạo file ảnh test nhỏ
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(0, 0, 100, 100);
                ctx.fillStyle = '#ffffff';
                ctx.font = '20px Arial';
                ctx.fillText('TEST', 20, 50);
            }

            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
            });

            const testFile = new File([blob], 'test-image.jpg', { type: 'image/jpeg' });

            console.log('🧪 Testing upload...');
            const imageUrl = await uploadImage(testFile);

            setDebugInfo({
                uploadSuccess: true,
                imageUrl,
                timestamp: new Date().toISOString()
            });

            // Refresh file list
            const fileList = await listBucketFiles();
            setFiles(fileList);

            alert(`✅ Upload test thành công!\nURL: ${imageUrl}`);

        } catch (error) {
            console.error('❌ Upload test error:', error);
            setDebugInfo({
                uploadSuccess: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
            alert(`❌ Upload test thất bại: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsTestingUpload(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Storage Bucket Test</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border mb-6">
                <h2 className="text-lg font-semibold mb-4">Trạng thái Storage</h2>
                <div className={`p-3 rounded mb-4 ${
                    status.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {status}
                </div>

                <button
                    onClick={handleTestUpload}
                    disabled={isTestingUpload}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {isTestingUpload ? 'Đang test upload...' : 'Test Upload Ảnh'}
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border mb-6">
                <h2 className="text-lg font-semibold mb-4">Files trong bucket</h2>
                {files.length === 0 ? (
                    <p className="text-gray-500">Chưa có file nào</p>
                ) : (
                    <div className="space-y-3">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                <code className="text-sm">{file}</code>
                                <span className="text-xs text-gray-500">
                  {`https://fptbkwagiqgwssmgkhqy.supabase.co/storage/v1/object/public/images/blog-images/${file}`}
                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {debugInfo && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
                    <h2 className="text-lg font-semibold mb-4">Debug Info</h2>
                    <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
                </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <h3 className="font-semibold mb-2">Thông tin hiện tại:</h3>
                <ul className="text-sm space-y-1">
                    <li>✅ Bạn đã upload ảnh thành công qua PostForm</li>
                    <li>✅ Ảnh có thể truy cập public</li>
                    <li>✅ Bucket thực tế đang hoạt động</li>
                    <li>🔧 Chỉ có vấn đề với hàm checkBucketExists()</li>
                </ul>
            </div>
        </div>
    );
}