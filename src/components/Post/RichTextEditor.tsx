// src/components/Post/RichTextEditor.tsx (UPDATED - Icons to rõ, khoảng cách tốt)
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Link as LinkIcon,
    List,
    ListOrdered,
    Image as ImageIcon,
    Smile,
    Palette,
    Youtube
} from 'lucide-react';
import { RichTextEditorProps } from '@/types';
import InsertImageModal from './InsertImageModal';
import YouTubeEmbedModal from './YouTubeEmbedModal'; // 🌟 V2 với resize
import ColorPickerModal from './ColorPickerModal';
import EmojiPickerModal from './EmojiPickerModal';
import HeadingDropdown from './HeadingDropdown';

type ImageAlign = 'center' | 'left' | 'right' | 'none';

// Tooltip Component
interface TooltipProps {
    text: string;
    children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => (
    <div className="relative group">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
        </div>
    </div>
);

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (editorRef.current && isInitialized) {
            if (value === '') {
                editorRef.current.innerHTML = '';
            } else if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value;
            }
        }
    }, [value, isInitialized]);

    useEffect(() => {
        if (editorRef.current && !isInitialized) {
            setIsInitialized(true);
            if (value) {
                editorRef.current.innerHTML = value;
            }
        }
    }, [value, isInitialized]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const formatText = (command: string, value?: string) => {
        if (typeof window !== 'undefined' && document && document.execCommand) {
            try {
                document.execCommand(command, false, value);
                editorRef.current?.focus();
                handleInput();
            } catch (error) {
                console.error('Lỗi khi định dạng văn bản:', error);
            }
        }
    };

    const insertLink = () => {
        if (!linkUrl || !linkText) return;

        if (typeof window !== 'undefined' && window.getSelection) {
            try {
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const linkElement = document.createElement('a');
                    linkElement.href = linkUrl;
                    linkElement.target = '_blank';
                    linkElement.rel = 'noopener noreferrer';
                    linkElement.textContent = linkText;
                    linkElement.className = 'text-blue-600 dark:text-blue-400 hover:underline font-medium';

                    range.deleteContents();
                    range.insertNode(linkElement);

                    handleInput();

                    setLinkUrl('');
                    setLinkText('');
                    setIsLinkModalOpen(false);
                }
            } catch (error) {
                console.error('Lỗi khi chèn liên kết:', error);
            }
        }
    };

    const insertImage = (url: string, align: ImageAlign) => {
        if (typeof window !== 'undefined' && document && document.execCommand) {
            editorRef.current?.focus();

            let imgHTML = '';

            if (align === 'center') {
                imgHTML = `
                <div style="text-align: center; margin: 1em 0;">
                    <img src="${url}" alt="Inserted image" style="max-width: 100%; height: auto; border-radius: 8px; display: inline-block;" />
                </div>
            `;
            } else if (align === 'left') {
                imgHTML = `
                <div style="float: left; margin: 0 1em 1em 0;">
                    <img src="${url}" alt="Inserted image" style="max-width: 100%; height: auto; border-radius: 8px;" />
                </div>
            `;
            } else if (align === 'right') {
                imgHTML = `
                <div style="float: right; margin: 0 0 1em 1em;">
                    <img src="${url}" alt="Inserted image" style="max-width: 100%; height: auto; border-radius: 8px;" />
                </div>
            `;
            } else {
                imgHTML = `
                <img src="${url}" alt="Inserted image" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1em 0;" />
            `;
            }

            try {
                document.execCommand('insertHTML', false, '<br>' + imgHTML + '<br>');
                handleInput();
            } catch (error) {
                console.error('Lỗi khi chèn hình ảnh:', error);
            }
        }
    };

    const insertYouTube = (embedCode: string) => {
        if (typeof window !== 'undefined' && document && document.execCommand) {
            editorRef.current?.focus();

            try {
                document.execCommand('insertHTML', false, embedCode);
                handleInput();
            } catch (error) {
                console.error('❌ Error inserting YouTube embed:', error);
            }
        }
    };

    return (
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* 🌟 TOOLBAR - TO RÕ RÀNG HƠN 🌟 */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b-2 border-gray-200 dark:border-gray-700 p-4 flex flex-wrap gap-2">
                {/* Định dạng văn bản */}
                <div className="flex items-center gap-2 pr-3 border-r-2 border-gray-300 dark:border-gray-600">
                    <Tooltip text="In đậm (Ctrl+B)">
                        <button
                            type="button"
                            onClick={() => formatText('bold')}
                            className="p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 group"
                        >
                            <Bold className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        </button>
                    </Tooltip>
                    <Tooltip text="In nghiêng (Ctrl+I)">
                        <button
                            type="button"
                            onClick={() => formatText('italic')}
                            className="p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 group"
                        >
                            <Italic className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        </button>
                    </Tooltip>
                    <Tooltip text="Gạch chân (Ctrl+U)">
                        <button
                            type="button"
                            onClick={() => formatText('underline')}
                            className="p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 group"
                        >
                            <Underline className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        </button>
                    </Tooltip>
                </div>

                {/* Căn lề */}
                <div className="flex items-center gap-2 pr-3 border-r-2 border-gray-300 dark:border-gray-600">
                    <Tooltip text="Căn trái">
                        <button
                            type="button"
                            onClick={() => formatText('justifyLeft')}
                            className="p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 group"
                        >
                            <AlignLeft className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                        </button>
                    </Tooltip>
                    <Tooltip text="Căn giữa">
                        <button
                            type="button"
                            onClick={() => formatText('justifyCenter')}
                            className="p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 group"
                        >
                            <AlignCenter className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                        </button>
                    </Tooltip>
                    <Tooltip text="Căn phải">
                        <button
                            type="button"
                            onClick={() => formatText('justifyRight')}
                            className="p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 group"
                        >
                            <AlignRight className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                        </button>
                    </Tooltip>
                    <Tooltip text="Căn đều">
                        <button
                            type="button"
                            onClick={() => formatText('justifyFull')}
                            className="p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 group"
                        >
                            <AlignJustify className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                        </button>
                    </Tooltip>
                </div>

                {/* Tiêu đề */}
                <div className="flex items-center gap-2 pr-3 border-r-2 border-gray-300 dark:border-gray-600">
                    <HeadingDropdown onSelect={(tag) => formatText('formatBlock', tag)} />
                </div>

                {/* Media */}
                <div className="flex items-center gap-2 pr-3 border-r-2 border-gray-300 dark:border-gray-600">
                    <Tooltip text="Chèn liên kết">
                        <button
                            type="button"
                            onClick={() => setIsLinkModalOpen(true)}
                            className="p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 group"
                        >
                            <LinkIcon className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        </button>
                    </Tooltip>
                    <Tooltip text="Chèn hình ảnh">
                        <button
                            type="button"
                            onClick={() => setIsImageModalOpen(true)}
                            className="p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 group"
                        >
                            <ImageIcon className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                        </button>
                    </Tooltip>
                    <Tooltip text="Chèn YouTube">
                        <button
                            type="button"
                            onClick={() => setIsYouTubeModalOpen(true)}
                            className="p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 group"
                        >
                            <Youtube className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                        </button>
                    </Tooltip>
                </div>

                {/* Danh sách */}
                <div className="flex items-center gap-2 pr-3 border-r-2 border-gray-300 dark:border-gray-600">
                    <Tooltip text="Danh sách không đánh số">
                        <button
                            type="button"
                            onClick={() => formatText('insertUnorderedList')}
                            className="p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 group"
                        >
                            <List className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" />
                        </button>
                    </Tooltip>
                    <Tooltip text="Danh sách có đánh số">
                        <button
                            type="button"
                            onClick={() => formatText('insertOrderedList')}
                            className="p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 group"
                        >
                            <ListOrdered className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" />
                        </button>
                    </Tooltip>
                </div>

                {/* Extra */}
                <div className="flex items-center gap-2">
                    <Tooltip text="Chèn emoji">
                        <button
                            type="button"
                            onClick={() => setIsEmojiPickerOpen(true)}
                            className="p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 group"
                        >
                            <Smile className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors" />
                        </button>
                    </Tooltip>
                    <Tooltip text="Đổi màu chữ">
                        <button
                            type="button"
                            onClick={() => setIsColorPickerOpen(true)}
                            className="p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 group"
                        >
                            <Palette className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors" />
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* Editor */}
            <div className="relative">
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning={true}
                    onInput={handleInput}
                    className="min-h-[300px] p-5 bg-white dark:bg-gray-900 focus:outline-none prose dark:prose-invert max-w-none"
                    style={{ direction: 'ltr', textAlign: 'left' }}
                />

                {/* Placeholder */}
                {(!value || value === '<p></p>' || editorRef.current?.innerText === '') && (
                    <div className="absolute top-5 left-5 text-gray-400 dark:text-gray-500 pointer-events-none select-none text-base">
                        {placeholder || 'Viết nội dung tại đây...'}
                    </div>
                )}
            </div>

            {/* Link Modal */}
            {isLinkModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                            <LinkIcon className="w-5 h-5 mr-2 text-blue-500" />
                            Chèn liên kết
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    URL
                                </label>
                                <input
                                    id="linkUrl"
                                    type="url"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label htmlFor="linkText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Text hiển thị
                                </label>
                                <input
                                    id="linkText"
                                    type="text"
                                    value={linkText}
                                    onChange={(e) => setLinkText(e.target.value)}
                                    placeholder="Tên liên kết"
                                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setIsLinkModalOpen(false)}
                                className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all duration-200"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={insertLink}
                                disabled={!linkUrl || !linkText}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200"
                            >
                                Chèn
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            <InsertImageModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                onInsert={(url, align) => {
                    insertImage(url, align);
                    setIsImageModalOpen(false);
                }}
            />

            {/* YouTube Modal */}
            <YouTubeEmbedModal
                isOpen={isYouTubeModalOpen}
                onClose={() => setIsYouTubeModalOpen(false)}
                onInsert={insertYouTube}
            />

            {/* Color Picker Modal */}
            <ColorPickerModal
                isOpen={isColorPickerOpen}
                onClose={() => setIsColorPickerOpen(false)}
                onSelect={(color) => {
                    formatText('foreColor', color);
                    setIsColorPickerOpen(false);
                }}
            />

            {/* Emoji Picker Modal */}
            <EmojiPickerModal
                isOpen={isEmojiPickerOpen}
                onClose={() => setIsEmojiPickerOpen(false)}
                onSelect={(emoji) => {
                    formatText('insertText', emoji);
                }}
            />
        </div>
    );
}