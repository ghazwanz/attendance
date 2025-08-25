// components/modals/EditPermissionModal.tsx
"use client";

import React from "react";
import { PermissionForm, User } from "../lib/types";

interface EditPermissionModalProps {
    isOpen: boolean;
    form: PermissionForm;
    users: User[];
    currentUser: { id: string; role: string } | null;
    loading: boolean;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onClose: () => void;
}

export default function EditPermissionModal({
    isOpen,
    form,
    users,
    currentUser,
    loading,
    onSubmit,
    onChange,
    onClose
}: EditPermissionModalProps) {
    if (!isOpen) return null;

    const availableUsers = currentUser?.role === "admin"
        ? users
        : users.filter(user => user.id === currentUser?.id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-xl text-black dark:text-white">
                <h2 className="text-xl font-bold mb-4">✏️ Edit Izin</h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <label className="block mb-0 font-medium">Pilih User</label>
                    <select
                        name="user_id"
                        value={form.user_id}
                        onChange={onChange}
                        required
                        className="w-full px-3 py-2 rounded border border-white/20 bg-white/10 dark:text-white"
                    >    
                        <option value="">Pilih Nama User</option>
                        {availableUsers.map((user) => (
                            <option key={user.id} value={user.id} className="text-black">
                                {user.name}
                            </option>
                        ))}
                    </select>
                    <label className="block mb-0 font-medium">Mulai Izin</label>
                    <input
                        type="date"
                        name="exit_time"
                        value={form.exit_time||""}
                        onChange={onChange}
                        className="w-full px-3 py-2 rounded bg-white/10 border border-black dark:border-white/20 text-black dark:text-white"
                        required
                    />
                    <label className="block mb-0 font-medium">Waktu Masuk Kembali</label>
                    <input
                        type="date"
                        name="reentry_time"
                        value={form.reentry_time||""}
                        onChange={onChange}
                        className="w-full px-3 py-2 rounded bg-white/10 border border-black dark:border-white/20 text-black dark:text-white"
                        required
                    />
                    <label className="block mb-0  font-medium">Alasan</label>
                    <input
                        type="text"
                        name="reason"
                        value={form.reason}
                        onChange={onChange}
                        placeholder="Alasan"
                        className="w-full px-3 py-2 rounded bg-white/10 border border-black dark:border-white/20 text-black dark:text-white"
                        required
                    />

                    <div className="flex justify-end gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            {loading ? "Menyimpan..." : "Simpan"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="hover:underline disabled:opacity-50"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}