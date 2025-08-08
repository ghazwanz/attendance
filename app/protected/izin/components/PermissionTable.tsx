"use client";

import React, { useEffect, useState } from "react";
import { Permission } from "../lib/types";
import { statusActions } from "../action/status-actions";

// ---------------- Modal Status ----------------
interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStatus: (status: string) => void;
  loading: boolean;
}

function StatusModal({ isOpen, onClose, onSelectStatus, loading }: StatusModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300 ease-in-out">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm px-6 py-8 relative animate-fadeInUp">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-xl font-bold transition"
        >
          ×
        </button>
        <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Pilih Status Izin
        </h3>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => onSelectStatus("diterima")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold text-sm shadow-md disabled:opacity-50 transition"
          >
            ✅ Diterima
          </button>
          <button
            onClick={() => onSelectStatus("ditolak")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold text-sm shadow-md disabled:opacity-50 transition"
          >
            ❌ Ditolak
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Tabel Izin ----------------
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
  const [selectedDay, setSelectedDay] = useState("all");
  const [searchName, setSearchName] = useState("");

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const filteredData = [...localData]
    .filter((item) => {
      if (searchName && !(item.user?.name || "").toLowerCase().includes(searchName.toLowerCase())) {
        return false;
      }
      const created = new Date(item.created_at);
      const today = new Date();
      if (selectedDay === "today") {
        return created.toDateString() === today.toDateString();
      } else if (selectedDay === "yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return created.toDateString() === yesterday.toDateString();
      } else if (selectedDay === "last7") {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return created >= sevenDaysAgo && created <= today;
      } else if (selectedDay === "last30") {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return created >= thirtyDaysAgo && created <= today;
      }
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", { dateStyle: "short" });
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
            ? {
                ...item,
                status: status as Permission["status"],
                approved_by: currentUser?.id || null,
              }
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
    <div>
      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <input
          type="text"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          placeholder="Cari nama..."
          className="border rounded text-sm px-4 py-2 h-10"
          style={{ minWidth: 150 }}
        />
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="border rounded text-sm px-4 py-2 h-10"
          style={{ minWidth: 170 }}
        >
          <option value="all">Semua Data</option>
          <option value="today">Hari Ini</option>
          <option value="yesterday">Kemarin</option>
          <option value="last7">7 Hari Kemarin</option>
          <option value="last30">Sebulan Kemarin</option>
        </select>
        {(selectedDay !== "all" || searchName) && (
          <button
            className="ml-2 bg-gray-300 hover:bg-gray-400 text-black rounded text-sm px-4 h-10"
            onClick={() => {
              setSearchName("");
              setSelectedDay("all");
            }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-white/10">
        <table className="w-full text-sm text-left border-separate border-spacing-y-2 table-auto">
          <thead>
            <tr className="bg-blue-600 text-white uppercase tracking-wider">
              <th className="px-4 py-3 rounded-l-xl">NO</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Mulai Izin</th>
              <th className="px-4 py-3">Selesai Izin</th>
              <th className="px-4 py-3">Jenis</th>
              <th className="px-4 py-3">Alasan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Dibuat</th>
              <th className="px-4 py-3">Disetujui Oleh</th>
              <th className="px-4 py-3 rounded-r-xl">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => (
              <tr key={item.id}  className={`transition duration-150 ${idx % 2 === 0
                      ? "bg-white dark:bg-slate-800"
                      : "bg-blue-50 dark:bg-slate-700"
                      } hover:bg-gray-100 dark:hover:bg-slate-600`}>
                <td className="px-4 py-3">{idx + 1}</td>
                <td className="px-4 py-3 rounded-l-xl">{item.user?.name || "-"}</td>
                <td className="px-4 py-3">{item.exit_time ? formatDateTime(item.exit_time) : "-"}</td>
                <td className="px-4 py-3">{item.reentry_time ? formatDateTime(item.reentry_time) : "-"}</td>
                <td className="px-4 py-3">lapet</td>
                <td className="px-4 py-3">{item.reason || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    item.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : item.status === "diterima"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {item.status || "pending"}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDateTime(item.created_at)}</td>
                <td className="px-4 py-3">{item.approver?.name || "-"}</td>
                <td className="px-4 py-3 flex gap-2 flex-nowrap">
                  {(currentUser?.role === "admin" ||
                    (currentUser?.id === item.user_id &&
                      item.status === "pending" &&
                      new Date(item.created_at).toDateString() === new Date().toDateString())) && (
                    <>
                      <button
                        onClick={() => onEdit(item)}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs"
                      >
                        ✏️ Edit
                      </button>

                      {currentUser?.role === "admin" && (
                        <button
                          onClick={() => handleOpenStatusModal(item.id)}
                          disabled={loading || statusLoading}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full text-xs"
                        >
                          ✅ Persetujuan
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center text-gray-400 py-4">
                  Tidak ada data izin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <StatusModal
        isOpen={showStatusModal}
        onClose={handleCloseModal}
        onSelectStatus={handleSelectStatus}
        loading={statusLoading}
      />
    </div>
  );
}
