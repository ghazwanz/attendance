"use client";

import React, { useState } from "react";
import { Permission } from "../lib/types";

interface PermissionTableProps {
    data: Permission[];
    currentUser: { id: string; role: string } | null;
    onEdit: (item: Permission) => void;
    onDelete: (id: string) => void;
    loading: boolean;
    onApproveStatus?: (id: string, status: string) => void; // Handler untuk perubahan status
}

export default function PermissionTable({
    data,
    currentUser,
    onEdit,
    onDelete,
    loading,
    onApproveStatus
}: PermissionTableProps) {
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedPermissionId, setSelectedPermissionId] = useState<string | null>(null);

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString("id-ID", {
            dateStyle: "short",
            timeStyle: "short",
        });
    };

    const handleOpenStatusModal = (id: string) => {
        setSelectedPermissionId(id);
        setShowStatusModal(true);
    };

    const handleSelectStatus = (status: string) => {
        if (selectedPermissionId && onApproveStatus) {
            onApproveStatus(selectedPermissionId, status);
        }
        setShowStatusModal(false);
        setSelectedPermissionId(null);
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
                    {data.map((item, idx) => (
                        <tr key={item.id} className="rounded-xl shadow-sm">
                            <td>{idx + 1}</td>
                            <td className="px-4 py-3 rounded-l-xl">
                                {item.users?.name || "-"}
                            </td>
                            <td className="px-4 py-3">
                                {item.exit_time ? formatDateTime(item.exit_time) : "-"}
                            </td>
                            <td className="px-4 py-3">
                                {item.reentry_time ? formatDateTime(item.reentry_time) : "-"}
                            </td>
                            <td>lapet</td>
                            <td className="px-4 py-3">{item?.reason || "-"}</td>
                            <td className="px-4 py-3">
                                {formatDateTime(item.created_at)}
                            </td>
                            <td className="px-4 py-3 flex gap-2 flex-wrap">
                                <button
                                    onClick={() => onEdit(item)}
                                    disabled={loading}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-full text-xs disabled:opacity-50"
                                >
                                    ✏️ Edit
                                </button>

                                {currentUser?.role === "admin" && (
                                    <>
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            disabled={loading}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-xs disabled:opacity-50"
                                        >
                                            🗑️ Hapus
                                        </button>
                                        <button
                                            onClick={() => handleOpenStatusModal(item.id)}
                                            disabled={loading}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full text-xs disabled:opacity-50"
                                        >
                                            ✅ Setujui
                                        </button>
                                    </>
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

            {/* MODAL PILIH STATUS */}
{showStatusModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#0F172A] rounded-xl shadow-xl p-6 w-64 text-center animate-fade-in">
            <h2 className="text-lg font-semibold mb-4 text-white">Pilih Status Izin</h2>
            <div className="flex flex-col gap-2">
                <button
                    onClick={() => handleSelectStatus("pending")}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-full"
                >
                    Pending
                </button>
                <button
                    onClick={() => handleSelectStatus("diterima")}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-full"
                >
                    Diterima
                </button>
                <button
                    onClick={() => handleSelectStatus("ditolak")}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full"
                >
                    Ditolak
                </button>
            </div>
            <button
                onClick={() => { setShowStatusModal(false); setSelectedPermissionId(null); }}
                className="mt-4 text-sm text-gray-300 hover:text-white"
            >
                Batal
            </button>
        </div>
    </div>
)}
        </div>
    );
}
