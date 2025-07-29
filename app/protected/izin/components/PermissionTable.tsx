"use client";

import React, { useEffect, useState } from "react";
import { Permission } from "../lib/types";
import { statusActions } from "../action/status-actions";
import StatusModal from "./StatusModal";

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
  loading,
}: PermissionTableProps) {
  const [localData, setLocalData] = useState<Permission[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPermissionId, setSelectedPermissionId] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

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

  const handleSelectStatus = async (status: string) => {
    if (!selectedPermissionId) return;

    const selectedPermission = localData.find((item) => item.id === selectedPermissionId);
    if (!selectedPermission) return;

    setStatusLoading(true);

    const success = await statusActions.updatePermissionStatus(
      selectedPermissionId,
      status,
      selectedPermission
    );

    if (success) {
      setLocalData((prev) =>
        prev.map((item) =>
          item.id === selectedPermissionId
            ? { ...item, status: status as Permission["status"] }
            : item
        )
      );
    }

    setStatusLoading(false);
    setShowStatusModal(false);
    setSelectedPermissionId(null);
  };

  const handleCloseModal = () => {
    if (!statusLoading) {
      setShowStatusModal(false);
      setSelectedPermissionId(null);
    }
  };

  return (
    <>
      <div className="overflow-x-auto w-full p-2 bg-gray-100 dark:bg-[#0F172A] transition-colors">
        <table className="w-full text-sm text-left border-separate border-spacing-y-2 table-auto">
          <thead>
            <tr className="bg-blue-600 text-white uppercase tracking-wider">
              <th className="px-4 py-3 rounded-l-xl">NO</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Waktu Keluar</th>
              <th className="px-4 py-3">Waktu Masuk</th>
              <th className="px-4 py-3">Jenis</th>
              <th className="px-4 py-3">Alasan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Dibuat</th>
              <th className="px-4 py-3 rounded-r-xl">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {localData.map((item, idx) => (
              <tr
                key={item.id}
                className="rounded-xl shadow-sm bg-white dark:bg-slate-800 text-black dark:text-white transition-colors"
              >
                <td className="px-4 py-3">{idx + 1}</td>
                <td className="px-4 py-3 rounded-l-xl">{item.users?.name || "-"}</td>
                <td className="px-4 py-3">{item.exit_time ? formatDateTime(item.exit_time) : "-"}</td>
                <td className="px-4 py-3">{item.reentry_time ? formatDateTime(item.reentry_time) : "-"}</td>
                <td className="px-4 py-3">lapet</td>
                <td className="px-4 py-3">{item.reason || "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                      ${item.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                      ${item.status === "diterima" ? "bg-green-100 text-green-800" : ""}
                      ${item.status === "ditolak" ? "bg-red-100 text-red-800" : ""}
                    `}
                  >
                    {item.status || "pending"}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDateTime(item.created_at)}</td>
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
                        disabled={loading || statusLoading}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full text-xs disabled:opacity-50"
                      >
                        ✅ Setujui
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}

            {localData.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-gray-400 py-4">
                  Tidak ada data izin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <StatusModal
        isOpen={showStatusModal}
        onClose={handleCloseModal}
        onSelectStatus={handleSelectStatus}
        loading={statusLoading}
      />
    </>
  );
}