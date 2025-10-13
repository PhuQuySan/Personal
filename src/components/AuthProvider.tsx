// src/components/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Định nghĩa kiểu cho Context
interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Giả định: Tên key lưu trong Local Storage
const TOKEN_STORAGE_KEY = 'authToken';

// Custom Hook để tạo token demo (giả lập JWT)
const createDemoToken = (): string => {
    // Trong thực tế, đây sẽ là JWT được tạo và ký bởi máy chủ
    // Ở đây, ta chỉ tạo một chuỗi đơn giản để mô phỏng sự tồn tại của token
    const payload = {
        userId: 'elite-admin',
        role: 'elite_leader',
        exp: Date.now() + 3600 * 1000, // Token hết hạn sau 1 giờ
    };
    return btoa(JSON.stringify(payload)); // Mã hóa Base64 đơn giản
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const isAuthenticated = !!token;

    // 1. Kiểm tra Local Storage khi component mount
    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    // 2. Hàm đăng nhập
    const login = (demoToken: string) => {
        setToken(demoToken);
        localStorage.setItem(TOKEN_STORAGE_KEY, demoToken);
    };

    // 3. Hàm đăng xuất
    const logout = () => {
        setToken(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook tùy chỉnh để sử dụng trạng thái xác thực
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};