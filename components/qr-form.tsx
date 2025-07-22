'use client';
import { useState, useEffect } from 'react';
import { generateEncryptedData } from '@/lib/actions';

interface User {
    id: string;
    name: string;
}

interface QRFormProps {
    users: User[];
    initialUserId?: string|null;
    initialStatus?: string;
}

export function QRForm({ users, initialUserId, initialStatus }: QRFormProps) {
    const [userId, setUserId] = useState(initialUserId || '');
    const [status, setStatus] = useState(initialStatus || '');
    const [isLoading, setIsLoading] = useState(false);

    // Auto-submit when both values are selected
    useEffect(() => {
        const submitForm = async () => {
            if (userId && status) {
                setIsLoading(true);
                try {
                    await generateEncryptedData(userId, status);
                } catch (error) {
                    console.error('Error generating QR:', error);
                    setIsLoading(false);
                }
            }
        };

        // Small delay to prevent immediate submission on initial load
        const timeoutId = setTimeout(submitForm, 100);

        return () => clearTimeout(timeoutId);
    }, [userId, status]);

    const handleStatusClick = (newStatus: string) => {
        setStatus(newStatus);
    };

    return (
        <div className="space-y-4">
            <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full p-2 border rounded bg-white dark:bg-gray-900 dark:text-white"
                disabled={isLoading}
            >
                <option value="" disabled>-- Pilih Nama --</option>
                {users?.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.name}
                    </option>
                ))}
            </select>

            <div className="space-x-4 mt-2">
                <button
                    onClick={() => handleStatusClick('HADIR')}
                    disabled={!userId || isLoading || status === "HADIR"}
                    className={`px-4 py-2 rounded text-white transition-colors ${!userId || isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : status === 'HADIR'
                                ? 'bg-blue-800'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {isLoading && status === 'HADIR' ? 'Generating...' : 'Tampilkan QR HADIR'}
                </button>
                <button
                    onClick={() => handleStatusClick('IZIN')}
                    disabled={!userId || isLoading|| status === "IZIN"}
                    className={`px-4 py-2 rounded text-white transition-colors ${!userId || isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : status === 'IZIN'
                                ? 'bg-yellow-700'
                                : 'bg-yellow-500 hover:bg-yellow-600'
                        }`}
                >
                    {isLoading && status === 'IZIN' ? 'Generating...' : 'Tampilkan QR IZIN'}
                </button>
            </div>

            {userId && status && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Selected: {users?.find(u => u.id === userId)?.name} - {status}
                </div>
            )}
        </div>
    );
}