"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LocationTable() {
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const supabase = createClient();

  // ambil data lokasi
  useEffect(() => {
    async function fetchLocations() {
      const { data, error } = await supabase
        .from("location_company")
        .select("*");
      if (!error) setLocations(data || []);
    }
    fetchLocations();
  }, []);

  // buka modal edit
  const handleEdit = (loc: any) => {
    setSelectedLoc(loc);
    setShowEditModal(true);
  };

  // simpan hasil edit
  const handleSaveEdit = async () => {
    if (!selectedLoc) return;

    const { error } = await supabase
      .from("location_company")
      .update({
        location_name: selectedLoc.location_name,
        status: selectedLoc.status,
        latitude: selectedLoc.latitude,
        longtitude: selectedLoc.longtitude,
      })
      .eq("id", selectedLoc.id);

    if (!error) {
      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === selectedLoc.id ? selectedLoc : loc
        )
      );
      setShowEditModal(false);
      setSelectedLoc(null);
      alert("Lokasi berhasil diperbarui ✅");
    } else {
      alert("Gagal memperbarui lokasi ❌");
    }
  };

  // buka modal hapus
  const handleDelete = (loc: any) => {
    setSelectedLoc(loc);
    setShowDeleteModal(true);
  };

  // hapus lokasi
  const confirmDelete = async () => {
    if (!selectedLoc) return;

    const { error } = await supabase
      .from("location_company")
      .delete()
      .eq("id", selectedLoc.id);

    if (!error) {
      setLocations((prev) =>
        prev.filter((loc) => loc.id !== selectedLoc.id)
      );
      setShowDeleteModal(false);
      setSelectedLoc(null);
      alert("Lokasi berhasil dihapus ✅");
    } else {
      alert("Gagal menghapus lokasi ❌");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-white/10 mt-8">
      <h3 className="text-xl font-bold mb-4">📍 Tabel Lokasi Perusahaan</h3>

      {/* TABLE WRAPPER BIAR RESPONSIVE */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-600 text-white text-xs uppercase tracking-wide">
            <tr>
              <th className="px-6 py-4 text-left">No</th>
              <th className="px-6 py-4 text-left">Nama Lokasi</th>
              <th className="px-6 py-4 text-left">Map</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc, idx) => (
              <tr
                key={loc.id}
                className={
                  idx % 2 === 0
                    ? "bg-white dark:bg-slate-800"
                    : "bg-blue-50 dark:bg-slate-700"
                }
              >
                <td className="px-6 py-4 font-medium">{idx + 1}</td>
                <td className="px-6 py-4">{loc.location_name}</td>
                <td className="px-6 py-4">
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    <iframe
                      title={`Map ${loc.location_name}`}
                      src={`https://maps.google.com/maps?q=${loc.longtitude},${loc.latitude}&z=15&output=embed`}
                      width="200"
                      height="150"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {loc.status ? (
                    <span className="text-green-600 font-semibold">Aktif</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Tidak Aktif</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(loc)}
                      className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-md transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(loc)}
                      className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md shadow-md transition"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {locations.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-6">
                  Tidak ada data lokasi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Edit */}
      {showEditModal && selectedLoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md w-[28rem]">
            <h3 className="text-lg font-bold mb-4">Edit Lokasi</h3>

            {/* Nama Lokasi */}
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium">Nama Lokasi</label>
              <input
                type="text"
                value={selectedLoc.location_name}
                onChange={(e) =>
                  setSelectedLoc({
                    ...selectedLoc,
                    location_name: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
                placeholder="Nama Lokasi"
              />
            </div>

            {/* Status */}
            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium">Status</label>
              <select
                value={selectedLoc.status ? "1" : "0"}
                onChange={(e) =>
                  setSelectedLoc({
                    ...selectedLoc,
                    status: e.target.value === "1",
                  })
                }
                className="w-full px-3 py-2 border rounded-md dark:bg-slate-700"
              >
                <option value="1">Aktif</option>
                <option value="0">Tidak Aktif</option>
              </select>
            </div>

            {/* Map Preview */}
            {selectedLoc.latitude && selectedLoc.longtitude && (
              <div className="mb-4 rounded-xl overflow-hidden shadow-md">
                <iframe
                  title="Preview Map"
                  src={`https://maps.google.com/maps?q=${selectedLoc.longtitude},${selectedLoc.latitude}&z=15&output=embed`}
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && selectedLoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md w-80 text-center">
            <h3 className="text-lg font-bold mb-4">Konfirmasi Hapus</h3>
            <p className="mb-4">
              Yakin ingin menghapus <b>{selectedLoc.location_name}</b>?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
