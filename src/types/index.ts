// src/types/index.ts

// Định nghĩa kiểu cho bài viết
export interface Post {
    id: number;
    title: string;
    slug: string;
    content: string;
    is_published: boolean;
    access_level: 'public' | 'elite' | 'super_elite';
    created_at: string;
    profiles: { full_name: string | null }[] | null;
}

// Định nghĩa kiểu cho dữ liệu form bài viết
export interface PostData {
    id?: number;
    title?: string;
    slug?: string;
    summary?: string;
    content?: string;
    tag?: string;
    access_level?: 'public' | 'elite' | 'super_elite';
    is_published?: boolean;
}

// Định nghĩa kiểu cho UserLink
export interface UserLink {
    id: number;
    link_name: string;
    link_url: string;
    description: string | null;
}

// Định nghĩa kiểu cho kết quả action
export type ActionResult =
    | { error: string; success?: undefined; }
    | { success: boolean; error?: undefined; message?: string; };

// Định nghĩa kiểu cho props của AdminPanelClient
export interface AdminPanelClientProps {
    initialPosts: Post[];
}

// Định nghĩa kiểu cho props của PostForm
export interface PostFormProps {
    action: (formData: FormData) => Promise<ActionResult>;
    defaultPost?: PostData;
}

// Định nghĩa kiểu cho props của LinkForm
export interface LinkFormProps {
    action: (formData: FormData) => Promise<ActionResult>;
    defaultLink?: UserLink;
}

// Định nghĩa kiểu cho props của RichTextEditor
export interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}