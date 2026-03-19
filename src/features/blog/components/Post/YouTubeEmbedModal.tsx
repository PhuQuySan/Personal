// src/components/Post/YouTubeEmbedModal.tsx (FIXED - Không tạo khoảng trống)
'use client';

import React, { useState, useEffect } from 'react';
import { X, Youtube, Play, List, AlertCircle, Loader2, CheckCircle, Maximize2 } from 'lucide-react';

interface YouTubeEmbedModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (embedCode: string) => void;
}

interface YouTubeData {
    type: 'video' | 'playlist' | null;
    id: string;
    thumbnailUrl: string;
    isValid: boolean;
}

type AlignmentType = 'left' | 'center' | 'right';
type SizeType = 'small' | 'medium' | 'large' | 'full';

const SIZE_CONFIG = {
    small: { width: '560px', maxWidth: '45%' },
    medium: { width: '720px', maxWidth: '70%' },
    large: { width: '960px', maxWidth: '85%' },
    full: { width: '100%', maxWidth: '100%' }
};

export default function YouTubeEmbedModal({ isOpen, onClose, onInsert }: YouTubeEmbedModalProps) {
    const [url, setUrl] = useState('');
    const [youtubeData, setYoutubeData] = useState<YouTubeData>({
        type: null,
        id: '',
        thumbnailUrl: '',
        isValid: false
    });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [options, setOptions] = useState({
        autoplay: false,
        controls: true,
        noCookie: true,
        modest: true,
    });
    const [alignment, setAlignment] = useState<AlignmentType>('center');
    const [size, setSize] = useState<SizeType>('medium');

    const parseYouTubeURL = (inputUrl: string): YouTubeData => {
        const result: YouTubeData = {
            type: null,
            id: '',
            thumbnailUrl: '',
            isValid: false
        };

        try {
            const cleanUrl = inputUrl.trim();

            const videoPattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
            const playlistPattern = /[?&]list=([^&]+)/;

            const playlistMatch = cleanUrl.match(playlistPattern);
            if (playlistMatch) {
                result.type = 'playlist';
                result.id = playlistMatch[1];
                result.thumbnailUrl = 'https://img.youtube.com/vi/0/hqdefault.jpg';
                result.isValid = true;
                return result;
            }

            const videoMatch = cleanUrl.match(videoPattern);
            if (videoMatch) {
                result.type = 'video';
                result.id = videoMatch[1];
                result.thumbnailUrl = `https://img.youtube.com/vi/${result.id}/maxresdefault.jpg`;
                result.isValid = true;
                return result;
            }

        } catch (error) {
            console.error('Error parsing YouTube URL:', error);
        }

        return result;
    };

    useEffect(() => {
        if (url.length > 10) {
            setIsAnalyzing(true);
            const timer = setTimeout(() => {
                const data = parseYouTubeURL(url);
                setYoutubeData(data);
                setIsAnalyzing(false);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setYoutubeData({
                type: null,
                id: '',
                thumbnailUrl: '',
                isValid: false
            });
        }
    }, [url]);

    const generateEmbedCode = (): string => {
        if (!youtubeData.isValid || !youtubeData.id) return '';

        const domain = options.noCookie
            ? 'https://www.youtube-nocookie.com'
            : 'https://www.youtube.com';

        let src = '';
        const params = new URLSearchParams();

        if (youtubeData.type === 'video') {
            src = `${domain}/embed/${youtubeData.id}`;
        } else if (youtubeData.type === 'playlist') {
            src = `${domain}/embed/videoseries`;
            params.append('list', youtubeData.id);
        }

        if (options.autoplay) params.append('autoplay', '1');
        if (!options.controls) params.append('controls', '0');
        if (options.modest) params.append('modestbranding', '1');
        params.append('rel', '0');

        const queryString = params.toString();
        const fullSrc = queryString ? `${src}?${queryString}` : src;

        const sizeConfig = SIZE_CONFIG[size];

        // 🌟 FIX: Không dùng margin, dùng display: block để tránh khoảng trống
        let containerStyle = `position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: ${sizeConfig.maxWidth}; width: ${sizeConfig.width}; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); display: block;`;

        // Xử lý alignment với float thay vì margin auto
        if (alignment === 'left') {
            containerStyle += ' float: left; margin-right: 1rem; margin-bottom: 0.5rem;';
        } else if (alignment === 'right') {
            containerStyle += ' float: right; margin-left: 1rem; margin-bottom: 0.5rem;';
        } else {
            // Center: dùng margin-left/right auto
            containerStyle += ' margin-left: auto; margin-right: auto; margin-bottom: 0.5rem;';
        }

        // 🌟 Thêm clear div sau video để text không wrap quanh
        const clearDiv = alignment !== 'center'
            ? '<div style="clear: both;"></div>'
            : '';

        return `
            <div class="youtube-embed-wrapper" style="${containerStyle}">
                <iframe 
                    src="${fullSrc}"
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 12px;"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                ></iframe>
            </div>${clearDiv}
        `.trim();
    };

    const handleInsert = () => {
        const embedCode = generateEmbedCode();
        if (embedCode) {
            onInsert(embedCode);
            handleClose();
        }
    };

    const handleClose = () => {
        setUrl('');
        setYoutubeData({
            type: null,
            id: '',
            thumbnailUrl: '',
            isValid: false
        });
        setOptions({
            autoplay: false,
            controls: true,
            noCookie: true,
            modest: true
        });
        setAlignment('center');
        setSize('medium');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Youtube className="w-6 h-6 text-white" />
                        <h3 className="text-xl font-bold text-white">Chèn YouTube Video/Playlist</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
                    {/* URL Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            YouTube URL <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="w-full px-4 py-3 pr-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm"
                                autoFocus
                            />
                            {isAnalyzing && (
                                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-red-500" />
                            )}
                            {!isAnalyzing && youtubeData.isValid && (
                                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                            )}
                        </div>

                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Hỗ trợ: youtu.be, youtube.com/watch, youtube.com/playlist
                        </p>
                    </div>

                    {/* Preview */}
                    {youtubeData.isValid && (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-start space-x-4">
                                {youtubeData.type === 'video' && (
                                    <div className="relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-lg group">
                                        <img
                                            src={youtubeData.thumbnailUrl}
                                            alt="YouTube thumbnail"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://img.youtube.com/vi/0/hqdefault.jpg';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                                            <Play className="w-8 h-8 text-white drop-shadow-lg" />
                                        </div>
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-2">
                                        {youtubeData.type === 'video' ? (
                                            <>
                                                <Play className="w-4 h-4 text-red-500" />
                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Video</span>
                                            </>
                                        ) : (
                                            <>
                                                <List className="w-4 h-4 text-red-500" />
                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Playlist</span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all bg-white dark:bg-gray-900 px-2 py-1 rounded">
                                        ID: {youtubeData.id}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Invalid URL Warning */}
                    {url.length > 10 && !isAnalyzing && !youtubeData.isValid && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-start space-x-3 animate-in slide-in-from-top-2 duration-300">
                            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-800 dark:text-yellow-300">
                                <p className="font-semibold mb-1">URL không hợp lệ</p>
                                <p className="text-xs">Vui lòng kiểm tra lại đường dẫn YouTube</p>
                            </div>
                        </div>
                    )}

                    {/* Size & Alignment Options */}
                    {youtubeData.isValid && (
                        <>
                            {/* Size Selection */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                                    <Maximize2 className="w-4 h-4 mr-2 text-red-500" />
                                    Kích thước
                                </h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['small', 'medium', 'large', 'full'] as SizeType[]).map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setSize(s)}
                                            className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                                                size === s
                                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            {s === 'small' && 'Nhỏ'}
                                            {s === 'medium' && 'Vừa'}
                                            {s === 'large' && 'Lớn'}
                                            {s === 'full' && 'Toàn màn'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Alignment Selection */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                                    <span className="w-1 h-4 bg-red-500 rounded-full mr-2"></span>
                                    Căn chỉnh
                                </h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['left', 'center', 'right'] as AlignmentType[]).map((a) => (
                                        <button
                                            key={a}
                                            type="button"
                                            onClick={() => setAlignment(a)}
                                            className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                                                alignment === a
                                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            {a === 'left' && 'Trái'}
                                            {a === 'center' && 'Giữa'}
                                            {a === 'right' && 'Phải'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Other Options */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                                    <span className="w-1 h-4 bg-red-500 rounded-full mr-2"></span>
                                    Tùy chọn nhúng
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-red-300 dark:hover:border-red-500 transition-colors group">
                                        <input
                                            type="checkbox"
                                            checked={options.autoplay}
                                            onChange={(e) => setOptions({ ...options, autoplay: e.target.checked })}
                                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                            Tự động phát
                                        </span>
                                    </label>

                                    <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-red-300 dark:hover:border-red-500 transition-colors group">
                                        <input
                                            type="checkbox"
                                            checked={options.controls}
                                            onChange={(e) => setOptions({ ...options, controls: e.target.checked })}
                                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                            Hiện điều khiển
                                        </span>
                                    </label>

                                    <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-red-300 dark:hover:border-red-500 transition-colors group">
                                        <input
                                            type="checkbox"
                                            checked={options.noCookie}
                                            onChange={(e) => setOptions({ ...options, noCookie: e.target.checked })}
                                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                            Chặn tracking
                                        </span>
                                    </label>

                                    <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-red-300 dark:hover:border-red-500 transition-colors group">
                                        <input
                                            type="checkbox"
                                            checked={options.modest}
                                            onChange={(e) => setOptions({ ...options, modest: e.target.checked })}
                                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                            Ẩn logo YouTube
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-all duration-200"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleInsert}
                        disabled={!youtubeData.isValid}
                        className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-200 flex items-center space-x-2"
                    >
                        <Youtube className="w-4 h-4" />
                        <span>Chèn video</span>
                    </button>
                </div>
            </div>
        </div>
    );
}