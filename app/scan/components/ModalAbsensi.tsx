// components/ChoiceModal.tsx
import React, { useState } from 'react';

interface ChoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectHadir: () => void;
    onSelectIzin: () => void;
    disabled?: boolean;
    pending?: boolean;
}

export default function ClockInModal({
    isOpen,
    onClose,
    onSelectHadir,
    onSelectIzin,
    disabled,
    pending
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
                        disabled={disabled}
                        onClick={()=>{
                            onSelectHadir()
                        }}
                        className="w-full px-4 py-2 bg-green-600 disabled:bg-green-600/80 text-white rounded-md"
                    >
                        {pending?`🕒 Memproses`:`✅ Hadir`}
                    </button>
                    <button
                        onClick={onSelectIzin}
                        disabled={disabled}
                        className="w-full px-4 py-2 bg-yellow-500 disabled:bg-yellow-500/80 text-white rounded-md"
                    >
                        📝 Izin Tidak Hadir
                    </button>
                </div>
            </div>
        </div>
    );
}