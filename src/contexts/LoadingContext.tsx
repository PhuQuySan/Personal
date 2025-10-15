// // src/contexts/LoadingContext.tsx
// 'use client';
//
// import React, { createContext, useContext, useState } from 'react';
// import { TechLoading } from '@/components/loading/TechLoading';
//
// interface LoadingContextType {
//     showLoading: (message?: string, duration?: number) => void;
//     hideLoading: () => void;
//     isLoading: boolean;
// }
//
// const LoadingContext = createContext<LoadingContextType | undefined>(undefined);
//
// // Fallback implementation khi không có Provider
// const defaultLoadingContext: LoadingContextType = {
//     showLoading: () => console.warn('LoadingProvider chưa được thiết lập'),
//     hideLoading: () => console.warn('LoadingProvider chưa được thiết lập'),
//     isLoading: false
// };
//
// export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     const [isLoading, setIsLoading] = useState(false);
//     const [loadingMessage, setLoadingMessage] = useState('Đang tải...');
//     const [loadingDuration, setLoadingDuration] = useState(2000);
//
//     const showLoading = (message = 'Đang tải...', duration = 2000) => {
//         setLoadingMessage(message);
//         setLoadingDuration(duration);
//         setIsLoading(true);
//     };
//
//     const hideLoading = () => {
//         setIsLoading(false);
//     };
//
//     return (
//         <LoadingContext.Provider value={{ showLoading, hideLoading, isLoading }}>
//             {children}
//             {isLoading && (
//                 <TechLoading
//                     message={loadingMessage}
//                     duration={loadingDuration}
//                     onComplete={hideLoading}
//                 />
//             )}
//         </LoadingContext.Provider>
//     );
// };
//
// export const useLoading = () => {
//     const context = useContext(LoadingContext);
//
//     // Trả về default context nếu không có Provider
//     if (context === undefined) {
//         return defaultLoadingContext;
//     }
//
//     return context;
// };