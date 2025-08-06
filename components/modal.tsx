'use client';

import { useRouter } from 'next/navigation';

export function Modal({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-50 z-50">
            <div className="bg-foreground rounded-lg shadow-lg max-w-md w-full p-6 relative">
                <button
                    onClick={() => router.back()}
                    aria-label="Close"
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                >
                    ✖
                </button>
                {children}
            </div>
        </div>
    );
}