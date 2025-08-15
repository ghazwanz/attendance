// components/forms/PermissionForm.tsx
"use client";

import React from "react";
import { PermissionForm, User } from "../lib/types";

interface PermissionFormProps {
    form: PermissionForm;
    users: User[];
    currentUser: { id: string; role: string, name:string } | null;
    loading: boolean;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function PermissionFormComponent({
    isOpen,
    form,
    users,
    currentUser,
    loading,
    onSubmit,
    onChange,
    onClose
}: PermissionFormProps) {
    // Validation: reentry_time >= exit_time
    if (!isOpen) return null;
    let timeError = "";
    let isTimeValid = true;
    if (form.exit_time && form.reentry_time) {
        const exit = new Date(form.exit_time);
        const reentry = new Date(form.reentry_time);
        if (reentry < exit) {
            timeError = "Waktu Masuk Kembali harus sama atau setelah Mulai Izin.";
            isTimeValid = false;
        }
    }
    const availableUsers = currentUser?.role === "admin"
        ? users
        : users.filter(user => user.id === currentUser?.id);
    if (currentUser?.role !== "admin") {
        form.user_id = currentUser?.id ?? ""
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 w-full max-w-lg relative">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl font-bold"
                    onClick={onClose}
                    aria-label="Tutup"
                >
                    ×
                </button>
                <h2 className="text-xl font-semibold mb-4">Tambah Izin</h2>
                <form
                    onSubmit={onSubmit}
                    className="flex flex-col gap-4 mb-10"
                >
                    <div>
                        <label className="block mb-1 font-medium">User</label>
                        {currentUser?.role === 'admin'?
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
                        :
                        <p>{currentUser?.name}</p>
                        }
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
                            min={form.exit_time || undefined}
                            className="w-full px-3 py-2 rounded border border-black bg-white/10 text-black dark:text-white"
                        />
                        {!isTimeValid && (
                            <div className="text-red-500 text-xs mt-1">{timeError}</div>
                        )}
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
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110 text-white font-semibold px-5 py-2 rounded-xl shadow"
                        disabled={loading || !isTimeValid}
                    >
                        {loading ? "Menambahkan..." : "Tambah"}
                    </button>
                </form>
            </div>
        </div>
    );
}