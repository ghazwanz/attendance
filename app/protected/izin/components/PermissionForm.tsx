// components/forms/PermissionForm.tsx
"use client";

import React from "react";
import { PermissionForm, User } from "../lib/types";

interface PermissionFormProps {
    form: PermissionForm;
    users: User[];
    currentUser: { id: string; role: string } | null;
    loading: boolean;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function PermissionFormComponent({
    form,
    users,
    currentUser,
    loading,
    onSubmit,
    onChange
}: PermissionFormProps) {
    const availableUsers = currentUser?.role === "admin"
        ? users
        : users.filter(user => user.id === currentUser?.id);

    return (
        <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
        >
            <select
                name="user_id"
                value={form.user_id}
                onChange={onChange}
                required
                className="w-full px-3 py-2 rounded bg-white/10 border border-black dark:border-white/20 text-black dark:text-white"
            >
                <option value="">Pilih User</option>
                {availableUsers.map((user) => (
                    <option key={user.id} value={user.id} className="text-black">
                        {user.name}
                    </option>
                ))}
            </select>

            <input
                type="datetime-local"
                name="exit_time"
                value={form.exit_time}
                onChange={onChange}
                required
                placeholder="Waktu Keluar"
                className="px-3 py-2 rounded border border-black bg-white/10 text-black dark:text-white"
            />

            <input
                type="datetime-local"
                name="reentry_time"
                value={form.reentry_time}
                onChange={onChange}
                required
                placeholder="Waktu Masuk Kembali"
                className="px-3 py-2 rounded border border-black bg-white/10 text-black dark:text-white"
            />

            <input
                type="text"
                name="reason"
                placeholder="Alasan"
                value={form.reason}
                onChange={onChange}
                required
                className="px-3 py-2 rounded border border-black bg-white/10 text-black dark:text-white col-span-2"
            />

            <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full md:w-auto col-span-full disabled:opacity-50"
                disabled={loading}
            >
                {loading ? "Menambahkan..." : "Tambah"}
            </button>
        </form>
    );
}