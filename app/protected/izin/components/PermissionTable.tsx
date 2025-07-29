"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
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
  loading,
}: PermissionTableProps) {
  const supabase = createClient();
  const [localData, setLocalData] = useState<Permission[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPermissionId, setSelectedPermissionId] = useState<string | null>(null);

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

    const tanggal = new Date(selectedPermission.created_at).toISOString().split("T")[0];

    // Cek jika status 'diterima', pastikan belum ada absensi hari itu
    if (status === "diterima") {
      const { data: existingAttendance, error: checkError } = await supabase
        .from("attendances")
        .select("*")
        .eq("user_id", selectedPermission.user_id)
        .eq("date", tanggal)
        .maybeSingle();

      if (checkError) {
        toast.error("Gagal memeriksa data absensi.");
        return;
      }

      if (existingAttendance) {
        toast.error("User sudah melakukan absensi di tanggal tersebut.");
        return;
      }

      // Simpan ke attendances
      const { error: insertError } = await supabase.from("attendances").insert({
        user_id: selectedPermission.user_id,
        status: "IZIN",
        notes: selectedPermission.reason,
        date: tanggal,
      });

      if (insertError) {
        toast.error("Gagal menyimpan ke absensi.");
        return;
      }
    }

    // Update status permission
    const { error: updateError } = await supabase
      .from("permissions")
      .update({ status })
      .eq("id", selectedPermissionId);

    if (updateError) {
      toast.error("Gagal mengubah status.");
    } else {
      toast.success("Status berhasil diperbarui.");
      setLocalData((prev) =>
        prev.map((item) =>
          item.id === selectedPermissionId
            ? { ...item, status: status as Permission["status"] }
            : item
        )
      );
    }

    setShowStatusModal(false);
    setSelectedPermissionId(null);
  };

  return (
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

          {localData.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center text-gray-400 py-4">
                Tidak ada data izin.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* MODAL STATUS */}
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
              onClick={() => {
                setShowStatusModal(false);
                setSelectedPermissionId(null);
              }}
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
