// components/DeleteModal.tsx
'use client';
import React from 'react';
import { Trash2, X, Check } from 'lucide-react';

export default function DeleteModal({ item, onClose, onConfirm }: any) {
   return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-white/10 w-full max-w-sm">
        <h2 className="text-lg font-semibold text-red-600 mb-4">⚠️ Konfirmasi Hapus</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          Apakah Anda yakin ingin menghapus jadwal <strong>{item.day.toUpperCase()}</strong>?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-slate-700 dark:text-white rounded-lg hover:bg-gray-300"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}