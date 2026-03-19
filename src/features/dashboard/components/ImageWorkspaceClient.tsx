'use client';

import React, { useState, useEffect } from 'react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { MediaItem, UserProfile } from '@/shared/types';
import { mediaApi } from '@/shared/lib/media/media-api';
import UploadModal from '@/shared/components/UploadModal';
import { Upload, Trash2, Image as ImageIcon, Tag, Calendar, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout, Responsive } from "react-grid-layout";
import { WidthProvider } from "react-grid-layout/legacy";
import { Share2 } from 'lucide-react'; // Import Share2 icon

const ResponsiveGridLayout = WidthProvider(Responsive) as any;

interface ImageWorkspaceClientProps {
    initialMyImages: MediaItem[];
    initialCommunityImages: MediaItem[];
    userId: string;
    userProfile: UserProfile | null;
}

export default function ImageWorkspaceClient({
    initialMyImages,
    initialCommunityImages,
    userId,
    userProfile
}: ImageWorkspaceClientProps) {
    const [myImages, setMyImages] = useState<MediaItem[]>(initialMyImages);
    const [communityImages, setCommunityImages] = useState<MediaItem[]>(initialCommunityImages);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'mine' | 'community'>('mine');

    // Convert MediaItems to React-Grid-Layout format
    const generateLayout = (items: MediaItem[]): any[] => {
        return items.map((item, i) => ({
            i: item.id,
            x: item.layout_x !== undefined ? item.layout_x : (i % 4) * 2,
            y: item.layout_y !== undefined ? item.layout_y : Math.floor(i / 4) * 2,
            w: item.layout_w || 2,
            h: item.layout_h || 2,
        }));
    };

    const [layout, setLayout] = useState<Layout[]>(generateLayout(myImages));

    useEffect(() => {
        // Sync layout state when myImages changes
        setLayout(generateLayout(myImages));
    }, [myImages]);

    const handleLayoutChange = async (newLayout: Layout[]) => {
        setLayout(newLayout);

        // Update database with new layout coordinates
        const updatePromises = newLayout.map((itemLayout: any) => {
            const originalItem = myImages.find(img => img.id === itemLayout.i);

            // Only update if something changed
            if (originalItem && (
                originalItem.layout_x !== itemLayout.x ||
                originalItem.layout_y !== itemLayout.y ||
                originalItem.layout_w !== itemLayout.w ||
                originalItem.layout_h !== itemLayout.h
            )) {
                return mediaApi.updateLayout(itemLayout.i, {
                    x: itemLayout.x,
                    y: itemLayout.y,
                    w: itemLayout.w,
                    h: itemLayout.h
                }).then(() => {
                    // Update local state to match DB
                    setMyImages(prev => prev.map(img =>
                        img.id === itemLayout.i ? {
                            ...img,
                            layout_x: itemLayout.x,
                            layout_y: itemLayout.y,
                            layout_w: itemLayout.w,
                            layout_h: itemLayout.h
                        } : img
                    ));
                }).catch(err => {
                    console.error('Failed to save layout:', err);
                    toast.error('Lỗi khi lưu vị trí ảnh');
                });
            }
            return Promise.resolve();
        });

        await Promise.all(updatePromises);
    };

    const handleUploadSuccess = (newItem: MediaItem) => {
        setMyImages(prev => [newItem, ...prev]);
        toast.success('Tải ảnh lên thành công!');
    };

    const handleDelete = async (id: string, url: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa ảnh này?')) return;

        try {
            // Delete from database
            await mediaApi.deleteImage(id);
            setMyImages(prev => prev.filter(img => img.id !== id));
            toast.success('Xóa ảnh thành công');
        } catch (error) {
            console.error('Lỗi xóa ảnh:', error);
            toast.error('Không thể xóa ảnh');
        }
    };

    const handleTogglePublic = async (id: string, currentStatus: boolean) => {
        try {
            await mediaApi.updatePublicStatus(id, !currentStatus);
            setMyImages(prev => prev.map(img =>
                img.id === id ? { ...img, is_public: !currentStatus } : img
            ));
            toast.success(currentStatus ? 'Đã tắt chia sẻ cộng đồng' : 'Đã chia sẻ lên cộng đồng!');
        } catch (error) {
            console.error('Lỗi cập nhật trạng thái:', error);
            toast.error('Không thể thay đổi trạng thái chia sẻ');
        }
    };

    // Card component for rendering images
    const renderImageCard = (item: MediaItem, isCommunity: boolean) => (
        <div className="h-full w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col group relative">
            {/* Image display */}
            <div className="relative flex-1 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                    draggable={false}
                />

                {/* Overlay actions (only for my images) */}
                {!isCommunity && (
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePublic(item.id, item.is_public);
                            }}
                            className={`p-2 rounded-xl backdrop-blur-sm cursor-pointer transition-colors ${item.is_public
                                    ? 'bg-indigo-500/90 hover:bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                                    : 'bg-gray-800/60 hover:bg-gray-700/80 text-gray-300'
                                }`}
                            title={item.is_public ? "Đang chia sẻ cộng đồng" : "Chia sẻ lên cộng đồng"}
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id, item.url);
                            }}
                            className="p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-xl backdrop-blur-sm cursor-pointer"
                            title="Xóa ảnh"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Metadata Footer */}
            <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 h-auto min-h-[60px] cursor-default">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate mb-1">
                    {item.name}
                </p>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-gray-500">
                    <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <span>{(item.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>

                {/* Community author info */}
                {isCommunity && item.profiles && (
                    <div className="mt-2 flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        {item.profiles.avatar_url ? (
                            <img src={item.profiles.avatar_url} alt="Author" className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                                <UserIcon className="w-3 h-3 text-indigo-600" />
                            </div>
                        )}
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                            {item.profiles.full_name || 'Người dùng ẩn danh'}
                        </span>
                    </div>
                )}

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded text-[9px] font-medium border border-indigo-100 dark:border-indigo-800">
                                #{tag}
                            </span>
                        ))}
                        {item.tags.length > 3 && (
                            <span className="px-1.5 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded text-[9px] border border-gray-200">
                                +{item.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
                                <ImageIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            Workspace Hình Ảnh
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 ml-12">
                            Kéo thả, sắp xếp ảnh của bạn. Dữ liệu layout được lưu vĩnh viễn.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsUploadOpen(true)}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
                    >
                        <Upload className="w-5 h-5" />
                        Tải ảnh lên
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-800 pb-px">
                    <button
                        onClick={() => setActiveTab('mine')}
                        className={`px-6 py-3 font-semibold text-sm rounded-t-xl transition-colors ${activeTab === 'mine'
                            ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 border-t border-x border-gray-200 dark:border-gray-800'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Ảnh Cá Nhân ({myImages.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('community')}
                        className={`px-6 py-3 font-semibold text-sm rounded-t-xl transition-colors ${activeTab === 'community'
                            ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 border-t border-x border-gray-200 dark:border-gray-800'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Ảnh Cộng Đồng ({communityImages.length})
                    </button>
                </div>

                {/* Grid Content */}
                <div className="bg-white dark:bg-gray-900 rounded-b-3xl rounded-tr-3xl min-h-[500px] border border-gray-200 dark:border-gray-800 shadow-sm p-4 sm:p-6 overflow-hidden relative">
                    {activeTab === 'mine' ? (
                        myImages.length > 0 ? (
                            <ResponsiveGridLayout
                                className="layout"
                                layouts={{ lg: layout }}
                                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                                cols={{ lg: 8, md: 6, sm: 4, xs: 2, xxs: 1 }}
                                rowHeight={150}
                                onLayoutChange={handleLayoutChange}
                                isDraggable={true}
                                isResizable={true}
                                margin={[16, 16]}
                                draggableHandle=".react-grid-dragHandleExample" // Can use a specific handle if we want
                            >
                                {myImages.map((item) => (
                                    <div key={item.id} className="cursor-move react-grid-item-wrapper rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        {renderImageCard(item, false)}
                                    </div>
                                ))}
                            </ResponsiveGridLayout>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                                <ImageIcon className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-700" />
                                <p>Bạn chưa tải lên bức ảnh nào.</p>
                                <button
                                    onClick={() => setIsUploadOpen(true)}
                                    className="mt-4 text-indigo-600 hover:underline font-medium"
                                >
                                    Tải ảnh lên ngay
                                </button>
                            </div>
                        )
                    ) : (
                        // Community Images (Read-only Grid)
                        communityImages.length > 0 ? (
                            <ResponsiveGridLayout
                                className="layout opacity-90"
                                layouts={{ lg: generateLayout(communityImages) }}
                                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                                cols={{ lg: 8, md: 6, sm: 4, xs: 2, xxs: 1 }}
                                rowHeight={150}
                                isDraggable={false} // Community images are NOT draggable
                                isResizable={false} // Community images are NOT resizable
                                margin={[16, 16]}
                            >
                                {communityImages.map((item) => (
                                    <div key={item.id} className="rounded-2xl overflow-hidden shadow-sm">
                                        {renderImageCard(item, true)}
                                    </div>
                                ))}
                            </ResponsiveGridLayout>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                                <p>Chưa có ảnh cộng đồng nào được chia sẻ.</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            <UploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />
        </div>
    );
}
