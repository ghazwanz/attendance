'use client';

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import CreateForm from "./CreateForm";
import UpdateForm from "./UpdateForm";

export default function Page() {
  const supabase = createClient();
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // 🆕 Untuk search
  const [selected, setSelected] = useState<any | null>(null);
  const [checkoutItem, setCheckoutItem] = useState<any | null>(null);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const fetchData = async () => {
  const { data, error } = await supabase
    .from("attendances")
    .select("*, users(name)")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (!error) setData(data || []);
};

  useEffect(() => {
    fetchData();
  }, []);

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const filteredData = data.filter((item) =>
    item.users?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen py-10 px-4 bg-white dark:bg-slate-900 text-black dark:text-white transition-colors">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Notifikasi Berhasil */}
        {successMessage && (
          <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-green-600 text-white text-sm px-5 py-3 rounded-xl shadow-lg animate-bounce">
              ✅ {successMessage}
            </div>
          </div>
        )}

        {/* Judul Halaman */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-1">📊 Absensi Karyawan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kelola data kehadiran harian secara efisien dan akurat.
          </p>

          {/* 🔍 Input Search */}
          <div className="mt-6 max-w-md mx-auto">
            <input
              type="text"
              placeholder="🔍 Cari nama karyawan..."
              className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Form Absensi */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-white/10">
          <h2 className="text-xl font-semibold mb-4">📝 Form Absensi</h2>
          <CreateForm
            onRefresh={() => {
              fetchData();
              showSuccessToast("Absensi masuk berhasil disimpan!");
            }}
          />
        </div>

        {/* Tabel Kehadiran */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-white/10">
          <h2 className="text-xl font-semibold mb-4">📋 Tabel Kehadiran</h2>
          <div className="overflow-x-auto rounded-md">
            <table className="min-w-full text-sm border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-blue-600 text-white text-xs uppercase">
                  <th className="py-3 px-4 rounded-tl-lg">No</th>
                  <th className="py-3 px-4">Nama</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Check-in</th>
                  <th className="py-3 px-4">Check-out</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-tr-lg">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      🚫 Tidak ada absensi.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, i) => (
                    <tr
                      key={item.id}
                      className={`transition duration-150 ${i % 2 === 0
                          ? "bg-white dark:bg-slate-800"
                          : "bg-blue-50 dark:bg-slate-700"
                        } hover:bg-gray-100 dark:hover:bg-slate-600`}
                    >
                      <td className="py-2 px-4">{i + 1}</td>
                      <td className="py-2 px-4 uppercase">{item.users?.name || "Tanpa Nama"}</td>
                      <td className="py-2 px-4">{item.date}</td>
                      <td className="py-2 px-4">
                        <span className="text-yellow-400 font-mono text-sm">
                          {item.check_in
                            ? new Date(item.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
                            : "-"}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <span className="text-blue-400 font-mono text-sm">
                          {item.check_out
                            ? new Date(item.check_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
                            : "-"}
                        </span>
                      </td>
                      <td className="py-2 px-4">{item.notes || "-"}</td>
                      <td className="py-2 px-4">
                        <span className={`text-sm font-semibold ${item.status === "HADIR"
                          ? "text-green-400"
                          : item.status === "IZIN"
                            ? "text-yellow-400"
                            : "text-red-400"
                          }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2 px-4 space-x-2 flex flex-wrap gap-2">
                        {!item.check_out && (
                          <button
                            onClick={() => {
                              setCheckoutItem(item);
                              setCheckoutError(null);
                            }}
                            className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                          >
                            🕒 Pulang
                          </button>
                        )}
                        <button
                          onClick={() => setSelected(item)}
                          className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Edit */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg max-w-md w-full relative">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-2 right-2 text-sm text-gray-400 hover:text-red-500"
              >
                ✖
              </button>
              <h2 className="text-lg font-bold mb-4">✏️ Edit Absensi</h2>
              <UpdateForm
                attendance={selected}
                onDone={() => {
                  setSelected(null);
                  fetchData();
                  showSuccessToast("Absensi berhasil diperbarui!");
                }}
              />
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Pulang */}
        {checkoutItem && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-md w-full relative transition-all">
              <button
                onClick={() => setCheckoutItem(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg"
              >
                ✖
              </button>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                🕒 Konfirmasi Absensi Pulang
              </h2>

              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
                <p><strong>👤 Nama:</strong> {checkoutItem.users?.name || "Tanpa Nama"}</p>
                <p><strong>📅 Tanggal:</strong> {checkoutItem.date}</p>
                <p><strong>⏰ Check-in:</strong> {checkoutItem.check_in ? new Date(checkoutItem.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  📝 Catatan Kegiatan
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Mengerjakan halaman dashboard dan integrasi API."
                  onChange={(e) =>
                    setCheckoutItem({
                      ...checkoutItem,
                      notes: e.target.value,
                    })
                  }
                />
                {checkoutError && (
                  <p className="text-red-500 text-sm mt-2">{checkoutError}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setCheckoutItem(null)}
                  className="px-4 py-2 text-sm rounded-md bg-gray-300 dark:bg-slate-600 hover:bg-gray-400 dark:hover:bg-slate-500 text-black dark:text-white"
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    const now = new Date();
                    const batasPulang = new Date();
                    batasPulang.setHours(16, 0, 0, 0);

                    if (now < batasPulang) {
                      setCheckoutError("⛔ Belum waktunya pulang. Absensi pulang hanya bisa dilakukan setelah jam 16:00.");
                      return;
                    }

                    const nowISO = now.toISOString();
                    const { error } = await supabase
                      .from("attendances")
                      .update({
                        check_out: nowISO,
                        notes: checkoutItem.notes || null,
                      })
                      .eq("id", checkoutItem.id);

                    if (!error) {
                      setCheckoutItem(null);
                      setCheckoutError(null);
                      fetchData();
                      showSuccessToast("Absensi pulang berhasil disimpan!");
                    }
                  }}
                  className="px-4 py-2 text-sm rounded-md bg-green-600 hover:bg-green-700 text-white font-semibold shadow"
                >
                  ✅ Konfirmasi Pulang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Hapus */}
        {deleteItem && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-md w-full relative">
              <button
                onClick={() => setDeleteItem(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg"
              >
                ✖
              </button>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">
                🗑 Konfirmasi Hapus Data
              </h2>
              <p className="text-sm text-center text-gray-600 dark:text-gray-300 mb-6">
                Apakah kamu yakin ingin menghapus data absensi milik{" "}
                <strong>{deleteItem.users?.name || "Tanpa Nama"}</strong> pada{" "}
                <strong>{deleteItem.date}</strong>?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteItem(null)}
                  className="px-4 py-2 text-sm rounded-md bg-gray-300 dark:bg-slate-600 hover:bg-gray-400 dark:hover:bg-slate-500 text-black dark:text-white"
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    const { error } = await supabase
                      .from("attendances")
                      .delete()
                      .eq("id", deleteItem.id);
                    if (!error) {
                      setData((prev) => prev.filter((d) => d.id !== deleteItem.id));
                      showSuccessToast("Data absensi berhasil dihapus!");
                      setDeleteItem(null);
                    }
                  }}
                  className="px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold shadow"
                >
                  ✅ Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
