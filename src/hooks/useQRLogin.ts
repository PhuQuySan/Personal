// src/hooks/useQRLogin.ts
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

type QRStatus = 'IDLE' | 'CREATING' | 'PENDING' | 'SUCCESS' | 'EXPIRED' | 'ERROR';

export function useQRLogin() {
    const [token, setToken] = useState<string | null>(null);
    const [status, setStatus] = useState<QRStatus>('IDLE');
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const createQR = useCallback(async () => {
        setStatus('CREATING');
        try {
            const res = await fetch('/api/qr/create', { method: 'POST' });
            const data = await res.json();

            if (!data.token) throw new Error('NO_TOKEN');

            setToken(data.token);
            setExpiresAt(new Date(data.expiresAt));
            setStatus('PENDING');
        } catch (e) {
            console.error('QR CREATE FAIL:', e);
            setStatus('ERROR');
        }
    }, []);

    const startPolling = useCallback(() => {
        if (!token) return;

        intervalRef.current = setInterval(async () => {
            try {
                const res = await fetch(`/api/qr/status?token=${token}`);
                const data = await res.json();

                if (data.status === 'SUCCESS' && data.login_url) {
                    clearInterval(intervalRef.current!);
                    setStatus('SUCCESS');

                    // QUAN TRỌNG: Sử dụng window.location.href thay vì assign
                    // Để đảm bảo browser xử lý hash fragment đúng cách
                    window.location.href = data.login_url;
                }

                if (data.status === 'EXPIRED') {
                    setStatus('EXPIRED');
                    clearInterval(intervalRef.current!);
                }

                if (data.status === 'INVALID') {
                    setStatus('ERROR');
                    clearInterval(intervalRef.current!);
                }

            } catch (e) {
                console.error('QR POLL ERROR:', e);
                setStatus('ERROR');
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        }, 1500);
    }, [token]);

    useEffect(() => {
        if (status === 'PENDING') {
            startPolling();
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [status, startPolling]);

    const reset = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setToken(null);
        setStatus('IDLE');
        setExpiresAt(null);
    }, []);

    return {
        token,
        status,
        expiresAt,
        createQR,
        reset,
    };
}