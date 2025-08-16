// components/NotificationSettings.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePushNotification } from '@/hooks/usePushNotification';

export default function NotificationSettings() {
    const {
        isSupported,
        isSubscribed,
        subscribeToPush,
        unsubscribeFromPush,
    } = usePushNotification();

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubscribe = async () => {
        setIsLoading(true);
        setMessage('');

        try {
            if (isSubscribed) {
                await unsubscribeFromPush();
                setMessage('Notifikasi berhasil dinonaktifkan.');
            } else {
                // Request notification permission
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    setMessage('Izin notifikasi ditolak. Aktifkan di pengaturan browser.');
                    return;
                }

                await subscribeToPush();
                setMessage('Notifikasi berhasil diaktifkan!');
            }
        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isSupported) {
        return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                    Push notifications are not supported in this browser.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white border dark:border-slate-600 dark:bg-slate-700 border-gray-200 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Pengaturan Notifikasi</h3>
            <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                    Aktifkan notifikasi untuk menerima pengingat harian tiap absensi masuk dan pulang.
                </p>

                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isSubscribed ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        {isSubscribed ? 'Notifikasi Aktif' : 'Belum aktif'}
                    </span>
                </div>

                <button
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${isSubscribed
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isLoading
                        ? 'Memproses...'
                        : isSubscribed
                            ? 'Nonaktifkan Notifikasi'
                            : 'Aktifkan Notifikasi'
                    }
                </button>

                {message && (
                    <div className={`p-3 rounded-lg ${message.includes('Error')
                            ? 'bg-red-50 text-red-800 border border-red-200'
                            : 'bg-green-50 text-green-800 border border-green-200'
                        }`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}