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
            className="flex flex-col gap-4 mb-10"
        >
            <div>
                <label className="block mb-1 font-medium">User</label>
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
            </div>
            {/*
            <div>
                <label className="block mb-1 font-medium">Tanggal</label>
                <input
                    type="date"
                    name="tanggal"
                    value={form.tanggal || ""}
                    onChange={onChange}
                    className="w-full border rounded px-3 py-2"
                    required
                />
            </div>
            */}
            <div>
                <label className="block mb-1 font-medium">Mulai Izin</label>
                <input
                    type="datetime-local"
                    name="exit_time"
                    value={form.exit_time}
                    onChange={onChange}
                    required
                    className="w-full px-3 py-2 rounded border border-black bg-white/10 text-black dark:text-white"
                />
            </div>
            <div>
                <label className="block mb-1 font-medium">Waktu Masuk Kembali</label>
                <input
                    type="datetime-local"
                    name="reentry_time"
                    value={form.reentry_time}
                    onChange={onChange}
                    required
                    className="w-full px-3 py-2 rounded border border-black bg-white/10 text-black dark:text-white"
                />
            </div>
            <div>
                <label className="block mb-1 font-medium">Alasan</label>
                <input
                    type="text"
                    name="reason"
                    placeholder="Alasan"
                    value={form.reason}
                    onChange={onChange}
                    required
                    className="w-full px-3 py-2 rounded border border-black bg-white/10 text-black dark:text-white"
                />
            </div>
            <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full md:w-auto disabled:opacity-50"
                disabled={loading}
            >
                {loading ? "Menambahkan..." : "Tambah"}
            </button>
        </form>
    );
}