// components/modals/DeleteConfirmModal.tsx
"use client";

import React from "react";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function DeleteConfirmModal({
    isOpen,
    onConfirm,
    onCancel,
    loading = false
}: DeleteConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md text-black dark:text-white">
                <p className="text-red-600 font-semibold text-lg mb-2">
                    🗑️ Konfirmasi Hapus
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Yakin ingin menghapus data ini?
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        Ya, Hapus
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="border border-gray-400 px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
                    >
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
}