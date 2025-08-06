// components/ChoiceModal.tsx
import React from 'react';

interface ChoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectHadir: () => void;
    onSelectIzin: () => void;
}

export default function ClockInModal({
    isOpen,
    onClose,
    onSelectHadir,
    onSelectIzin
}: ChoiceModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="bg-white relative dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm shadow-xl text-gray-900 dark:text-white">
                <h2 className="text-2xl font-semibold mb-4 text-center">Pilih Kehadiran</h2>
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-red-500 text-xl font-bold"
                    aria-label="Tutup"
                >
                    &times;
                </button>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={onSelectHadir}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md"
                    >
                        ✅ Hadir
                    </button>
                    <button
                        onClick={onSelectIzin}
                        className="w-full px-4 py-2 bg-yellow-500 text-white rounded-md"
                    >
                        📝 Izin Tidak Hadir
                    </button>
                </div>
            </div>
        </div>
    );
}