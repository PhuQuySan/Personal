'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

type QRStatus = 'IDLE' | 'CREATING' | 'PENDING' | 'SUCCESS' | 'EXPIRED' | 'ERROR';

export function useQRLogin() {
    const [token, setToken] = useState<string | null>(null);
    const [status, setStatus] = useState<QRStatus>('IDLE');
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Create QR
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

    // Polling
    const startPolling = useCallback(() => {
        if (!token) return;

        intervalRef.current = setInterval(async () => {
            try {
                const res = await fetch(`/api/qr/status?token=${token}`);
                const data = await res.json();

                if (data.status === 'SUCCESS') {
                    setStatus('SUCCESS');
                    clearInterval(intervalRef.current!);
                }

                if (data.status === 'EXPIRED') {
                    setStatus('EXPIRED');
                    clearInterval(intervalRef.current!);
                }

            } catch (e) {
                console.error('QR POLL ERROR:', e);
                setStatus('ERROR');
                clearInterval(intervalRef.current!);
            }
        }, 1000);
    }, [token]);

    // Auto start polling
    useEffect(() => {
        if (status === 'PENDING') {
            startPolling();
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [status, startPolling]);

    // Reset
    const reset = useCallback(() => {
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
