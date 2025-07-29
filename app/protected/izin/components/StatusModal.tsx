"use client";

import React from "react";

interface StatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectStatus: (status: string) => void;
    loading?: boolean;
}

export default function StatusModal({
    isOpen,
    onClose,
    onSelectStatus,
    loading = false,
}: StatusModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#0F172A] rounded-xl shadow-xl p-6 w-64 text-center animate-fade-in">
                <h2 className="text-lg font-semibold mb-4 text-white">Pilih Status Izin</h2>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => onSelectStatus("pending")}
                        disabled={loading}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-full disabled:opacity-50"
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => onSelectStatus("diterima")}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-full disabled:opacity-50"
                    >
                        Diterima
                    </button>
                    <button
                        onClick={() => onSelectStatus("ditolak")}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full disabled:opacity-50"
                    >
                        Ditolak
                    </button>
                </div>
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="mt-4 text-sm text-gray-300 hover:text-white disabled:opacity-50"
                >
                    Batal
                </button>
            </div>
        </div>
    );
}