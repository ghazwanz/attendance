// components/tables/PermissionTable.tsx
"use client";

import React from "react";
import { Permission } from "../lib/types";

interface PermissionTableProps {
    data: Permission[];
    currentUser: { id: string; role: string } | null;
    onEdit: (item: Permission) => void;
    onDelete: (id: string) => void;
    loading: boolean;
}

export default function PermissionTable({
    data,
    currentUser,
    onEdit,
    onDelete,
    loading
}: PermissionTableProps) {
    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString("id-ID", {
            dateStyle: "short",
            timeStyle: "short",
        });
    };

    return (
        <div className="overflow-x-auto w-full p-2">
            <table className="w-full text-sm text-left border-separate border-spacing-y-2 table-auto">
                <thead>
                    <tr className="bg-blue-600 text-white uppercase tracking-wider">
                        <th className="px-4 py-3 rounded-l-xl">NO</th>
                        <th className="px-4 py-3">Nama</th>
                        <th className="px-4 py-3">Waktu Keluar</th>
                        <th className="px-4 py-3">Waktu Masuk</th>
                        <th className="px-4 py-3">Jenis</th>
                        <th className="px-4 py-3">Alasan</th>
                        <th className="px-4 py-3">Dibuat</th>
                        <th className="px-4 py-3 rounded-r-xl">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item,idx) => (
                        <tr key={item.id} className="rounded-xl shadow-sm">
                            <td>{idx+1}</td>
                            <td className="px-4 py-3 rounded-l-xl">
                                {item.users?.name || "-"}
                            </td>
                            <td className="px-4 py-3">{item.exit_time?formatDateTime(item.exit_time):"-"}</td>
                            <td className="px-4 py-3">{item.reentry_time?formatDateTime(item.reentry_time):"-"}</td>
                            <td>
                                lapet
                            </td>
                            <td className="px-4 py-3">{item?.reason ? item.reason:"-"}</td>
                            {/* <td className="px-4 py-3">
                                <span
                                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${item.status === "diterima"
                                            ? "bg-green-100 text-green-700"
                                            : item.status === "ditolak"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-yellow-100 text-yellow-700"
                                        }`}
                                >
                                    {item.status}
                                </span>
                            </td> */}
                            <td className="px-4 py-3">
                                {formatDateTime(item.created_at)}
                            </td>
                            <td className="px-4 py-3 flex gap-2">
                                <button
                                    onClick={() => onEdit(item)}
                                    disabled={loading}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-full text-xs disabled:opacity-50"
                                >
                                    ✏️ Edit
                                </button>

                                {currentUser?.role === "admin" && (
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        disabled={loading}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-xs disabled:opacity-50"
                                    >
                                        🗑️ Hapus
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={8} className="text-center text-gray-500 py-4">
                                Tidak ada data izin.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}