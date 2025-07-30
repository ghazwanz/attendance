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
  const [searchName, setSearchName] = useState("");
  const [selectedDay, setSelectedDay] = useState("semua");

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const getDayName = (dateString: string) => {
    const days = ["minggu", "senin", "selasa", "rabu", "kamis", "jum'at", "sabtu"];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  const filteredData = [...localData]
    .filter((item) => {
      if (searchName && !(item.users?.name || "").toLowerCase().includes(searchName.toLowerCase())) {
        return false;
      }
      if (selectedDay !== "semua") {
        const dayName = getDayName(item.created_at);
        if (dayName !== selectedDay) return false;
      }
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
          style={{ minWidth: 130 }}
        >
          <option value="semua">Semua Hari</option>
          <option value="minggu">Minggu</option>
          <option value="senin">Senin</option>
          <option value="selasa">Selasa</option>
          <option value="rabu">Rabu</option>
          <option value="kamis">Kamis</option>
          <option value="jum'at">Jum'at</option>
          <option value="sabtu">Sabtu</option>
        </select>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold px-4 h-10"
          style={{ minWidth: 90 }}
          onClick={() => {
            setSearchName(searchName);
            setSelectedDay(selectedDay);
          }}
        >
          Filter
        </button>
        {(searchName || selectedDay !== "semua") && (
          <button
            className="ml-2 bg-gray-300 hover:bg-gray-400 text-black rounded text-sm px-4 h-10"
            style={{ minWidth: 80 }}
            onClick={() => {
              setSearchName("");
              setSelectedDay("semua");
            }}
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
              <th className="px-4 py-3">Disetujui Oleh</th>
              <th className="px-4 py-3">Dibuat</th>
              <th className="px-4 py-3 rounded-r-xl">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const today = new Date();
              const pad = (n: number) => n.toString().padStart(2, "0");
              const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
              let renderedToday = false;
              let renderedPrev = false;
              let rowIdx = 0;

              return filteredData.map((item) => {
                const createdDate = item.created_at.split("T")[0];
                let sectionLabel = null;
                if (createdDate === todayStr && !renderedToday) {
                  sectionLabel = (
                    <tr key="section-today">
                      <td colSpan={10} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-bold text-center py-2">
                        Hari Ini
                      </td>
                    </tr>
                  );
                  renderedToday = true;
                  rowIdx = 1;
                } else if (createdDate !== todayStr && !renderedPrev) {
                  sectionLabel = (
                    <tr key="section-prev">
                      <td colSpan={10} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-center py-2">
                        Hari Sebelumnya
                      </td>
                    </tr>
                  );
                  renderedPrev = true;
                  rowIdx = 1;
                } else {
                  rowIdx++;
                }

                return (
                  <React.Fragment key={item.id}>
                    {sectionLabel}
                    <tr className="rounded-xl shadow-sm bg-white dark:bg-slate-800 text-black dark:text-white transition-colors">
                      <td className="px-4 py-3">{rowIdx}</td>
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
                            ${item.status === "ditolak" ? "bg-red-100 text-red-800" : ""}`}
                        >
                          {item.status || "pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{item.approved_by_user?.name || "-"}</td>
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
                  </React.Fragment>
                );
              });
            })()}

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

      <StatusModal
        isOpen={showStatusModal}
        onClose={handleCloseModal}
        onSelectStatus={handleSelectStatus}
        loading={statusLoading}
      />
    </div>
  );
}
