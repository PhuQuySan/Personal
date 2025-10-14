// src/components/RichTextEditor.tsx (FULL CODE CẬP NHẬT)
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
    Heading,
    Link as LinkIcon,
    List,
    ListOrdered,
    Image as ImageIcon,
    Smile,
    Palette
} from 'lucide-react';
import { RichTextEditorProps } from '@/types';
// Import Modal đã tạo
import InsertImageModal from './InsertImageModal';

type ImageAlign = 'center' | 'left' | 'right' | 'none';

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false); // 🌟 State cho Image Modal 🌟
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);

    // Cập nhật nội dung khi value prop thay đổi
    useEffect(() => {
        if (editorRef.current && isInitialized) {
            if (value === '') {
                editorRef.current.innerHTML = '';
            } else if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value;
            }
        }
    }, [value, isInitialized]);

    // Đánh dấu editor đã được khởi tạo
    useEffect(() => {
        if (editorRef.current && !isInitialized) {
            setIsInitialized(true);
            if (value) {
                editorRef.current.innerHTML = value;
            }
        }
    }, [value, isInitialized]);

    // Xử lý khi nội dung thay đổi
    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    // Định dạng văn bản
    const formatText = (command: string, value?: string) => {
        if (typeof window !== 'undefined' && document && document.execCommand) {
            try {
                document.execCommand(command, false, value);
                // Sau khi thực thi command, cần focus lại vào editor để tránh mất caret
                editorRef.current?.focus();
                handleInput();
            } catch (error) {
                console.error('Lỗi khi định dạng văn bản:', error);
            }
        }
    };

    // Chèn liên kết (Giữ nguyên)
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

    // 🌟 HÀM CẬP NHẬT: Chèn hình ảnh với căn chỉnh và HTML chuẩn 🌟
// 🌟 SỬA LẠI HÀM insertImage TRONG RichTextEditor 🌟
    const insertImage = (url: string, align: ImageAlign) => {
        if (typeof window !== 'undefined' && document && document.execCommand) {
            // Focus vào editor trước khi chèn
            editorRef.current?.focus();

            // Tạo HTML cho hình ảnh
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
                // Thêm một khoảng trắng trước khi chèn hình ảnh để đảm bảo nó được chèn đúng vị trí
                document.execCommand('insertHTML', false, '<br>' + imgHTML + '<br>');
                handleInput();

                // Debug: log để kiểm tra
                console.log('Image inserted:', url);
                console.log('Current editor content:', editorRef.current?.innerHTML);
            } catch (error) {
                console.error('Lỗi khi chèn hình ảnh:', error);

                // Fallback: chèn trực tiếp vào DOM
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = imgHTML;

                    while (tempDiv.firstChild) {
                        range.insertNode(tempDiv.firstChild);
                    }

                    // Di chuyển cursor sau hình ảnh
                    range.setStartAfter(tempDiv);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);

                    handleInput();
                }
            }
        }
    };

    return (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap gap-1">
                {/* Định dạng văn bản */}
                <button
                    type="button"
                    onClick={() => formatText('bold')}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="In đậm"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => formatText('italic')}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="In nghiêng"
                >
                    <Italic className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => formatText('underline')}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Gạch chân"
                >
                    <Underline className="w-4 h-4" />
                </button>

                <div className="border-l border-gray-300 dark:border-gray-600 mx-1 h-6"></div>

                {/* Căn lề */}
                <button
                    type="button"
                    onClick={() => formatText('justifyLeft')}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Căn trái"
                >
                    <AlignLeft className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => formatText('justifyCenter')}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Căn giữa"
                >
                    <AlignCenter className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => formatText('justifyRight')}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Căn phải"
                >
                    <AlignRight className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => formatText('justifyFull')}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Căn đều"
                >
                    <AlignJustify className="w-4 h-4" />
                </button>

                <div className="border-l border-gray-300 dark:border-gray-600 mx-1 h-6"></div>

                {/* Tiêu đề */}
                <button
                    type="button"
                    onClick={() => formatText('formatBlock', 'h2')}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Tiêu đề"
                >
                    <Heading className="w-4 h-4" />
                </button>

                <div className="border-l border-gray-300 dark:border-gray-600 mx-1 h-6"></div>

                {/* Liên kết */}
                <button
                    type="button"
                    onClick={() => setIsLinkModalOpen(true)}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Chèn liên kết"
                >
                    <LinkIcon className="w-4 h-4" />
                </button>

                {/* Danh sách */}
                <button
                    type="button"
                    onClick={() => formatText('insertUnorderedList')}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Danh sách không đánh số"
                >
                    <List className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => formatText('insertOrderedList')}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Danh sách có đánh số"
                >
                    <ListOrdered className="w-4 h-4" />
                </button>

                <div className="border-l border-gray-300 dark:border-gray-600 mx-1 h-6"></div>

                {/* Hình ảnh */}
                <button
                    type="button"
                    onClick={() => setIsImageModalOpen(true)} // 🌟 Thay prompt bằng mở Modal 🌟
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Chèn hình ảnh"
                >
                    <ImageIcon className="w-4 h-4" />
                </button>

                {/* Biểu tượng cảm xúc */}
                <button
                    type="button"
                    onClick={() => {
                        const emoji = prompt('Nhập emoji:');
                        if (emoji) formatText('insertText', emoji);
                    }}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Chèn biểu tượng cảm xúc"
                >
                    <Smile className="w-4 h-4" />
                </button>

                {/* Màu sắc */}
                <button
                    type="button"
                    onClick={() => {
                        const color = prompt('Nhập mã màu (ví dụ: #ff0000):');
                        if (color) formatText('foreColor', color);
                    }}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Đổi màu chữ"
                >
                    <Palette className="w-4 h-4" />
                </button>
            </div>

            {/* Editor */}
            {/* Editor */}
            <div className="relative">
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning={true}
                    onInput={handleInput}
                    className="min-h-[300px] p-4 bg-white dark:bg-gray-900 focus:outline-none"
                    // Thêm style cho phép hình ảnh được float nếu cần
                    style={{ direction: 'ltr', textAlign: 'left' }}
                />

                {/* Placeholder */}
                {(!value || value === '<p></p>' || editorRef.current?.innerText === '') && ( // Cập nhật logic placeholder
                    <div
                        className="absolute top-4 left-4 text-gray-400 pointer-events-none"
                    >
                        {placeholder || 'Viết nội dung tại đây...'}
                    </div>
                )}
            </div>

            {/* Link Modal (Giữ nguyên) */}
            {isLinkModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Chèn liên kết</h3>

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
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
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
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setIsLinkModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={insertLink}
                                disabled={!linkUrl || !linkText}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                Chèn
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* 🌟 IMAGE MODAL MỚI 🌟 */}
            {/*// Trong hàm xử lý insert của modal*/}
            <InsertImageModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                onInsert={(url, align) => {
                    console.log('Modal onInsert called:', { url, align });
                    insertImage(url, align);
                    setIsImageModalOpen(false);
                }}
            />
        </div>
    );
}