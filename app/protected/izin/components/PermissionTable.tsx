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
  // State untuk filter
  const [selectedDay, setSelectedDay] = useState("all");
  const [searchName, setSearchName] = useState("");

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Fungsi untuk mendapatkan nama hari dari tanggal
  const getDayName = (dateString: string) => {
    const days = ["minggu", "senin", "selasa", "rabu", "kamis", "jum'at", "sabtu"];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  // Filter data berdasarkan nama dan hari
  // Filter data berdasarkan nama dan hari
  const filteredData = [...localData]
    .filter((item) => {
      // Filter nama
      if (searchName && !(item.users?.name || "").toLowerCase().includes(searchName.toLowerCase())) {
        return false;
      }
      // Filter hari
      if (selectedDay === "today") {
        const today = new Date();
        const created = new Date(item.created_at);
        return created.toDateString() === today.toDateString();
      } else if (selectedDay === "yesterday") {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const created = new Date(item.created_at);
        return created.toDateString() === yesterday.toDateString();
      } else if (selectedDay === "last7") {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        const created = new Date(item.created_at);
        return created >= sevenDaysAgo && created <= today;
      } else if (selectedDay === "last30") {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const created = new Date(item.created_at);
        return created >= thirtyDaysAgo && created <= today;
      }
      // "all"
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
      selectedPermission,
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
    <div>
      {/* Filter Bar tanpa judul */}
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <input
          type="text"
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
          placeholder="Cari nama..."
          className="border rounded text-sm px-4 py-2 h-10"
          style={{ minWidth: 150 }}
        />
        <select
          value={selectedDay}
          onChange={e => setSelectedDay(e.target.value)}
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
            style={{ minWidth: 80 }}
            onClick={() => { setSelectedDay("all"); setSearchName(""); }}
          >
            Reset
          </button>
        )}
      </div>
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
            {filteredData.map((item, idx) => (
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
                      {item.status === "pending" && (
                        <button
                          onClick={() => handleOpenStatusModal(item.id)}
                          disabled={loading || statusLoading}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full text-xs disabled:opacity-50"
                        >
                          ✅ Setujui
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}

            {filteredData.length === 0 && (
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
    </div>
  );
}