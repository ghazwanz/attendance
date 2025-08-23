"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix ikon marker bawaan Leaflet (kalau tidak, marker tidak muncul)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

export default function LocationTable() {
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [notifType, setNotifType] = useState<"success" | "error" | null>(null);
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
      setNotifType("success");
      setNotification("Lokasi berhasil diperbarui ✅");
    } else {
      setNotifType("error");
      setNotification("Gagal memperbarui lokasi ❌");
    }
    setTimeout(() => setNotification(null), 3000);
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
      setNotifType("success");
      setNotification("Lokasi berhasil dihapus ✅");
    } else {
      setNotifType("error");
      setNotification("Gagal menghapus lokasi ❌");
    }
    setTimeout(() => setNotification(null), 3000);
  };

  // Marker untuk map edit
  function LocationMarker({ selectedLoc, setSelectedLoc }: any) {
    useMapEvents({
      click(e) {
        setSelectedLoc({
          ...selectedLoc,
          latitude: e.latlng.lat,
          longtitude: e.latlng.lng,
        });
      },
    });

    return selectedLoc.latitude && selectedLoc.longtitude ? (
      <Marker
        position={[selectedLoc.latitude, selectedLoc.longtitude]}
      />
    ) : null;
  }

  function ResizeMap() {
    const map = useMap();
    useEffect(() => {
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }, [map]);
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-white/10 mt-8 relative">
      <h3 className="text-xl font-bold mb-4">
        📍 Tabel Lokasi Perusahaan
      </h3>

      {/* ==== TABLET/DESKTOP: TABEL ==== */}
      <div className="w-full">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-blue-600 text-white text-xs uppercase tracking-wide">
              <tr>
                <th className="px-6 py-4 text-left w-14 rounded-tl-lg">No</th>
                <th className="px-6 py-4 text-left w-72">Nama Lokasi</th>
                <th className="px-6 py-4 text-left w-72">Map</th>
                <th className="px-6 py-4 text-left w-32">Status</th>
                <th className="px-6 py-4 text-left w-40 rounded-tr-lg">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc, idx) => (
                <tr
                      key={loc.id}
                      className={`transition duration-150 ${
                        idx % 2 === 0
                          ? "bg-white dark:bg-slate-800"
                          : "bg-blue-50 dark:bg-slate-700"
                      } hover:bg-gray-100 dark:hover:bg-slate-600`}
                    >
                  <td className="px-6 py-4 align-middle">{idx + 1}</td>
                  <td className="px-6 py-4 align-middle break-words">
                    {loc.location_name}
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="w-[240px] h-[160px] rounded-xl overflow-hidden shadow">
                      <iframe
                        title={`Map ${loc.location_name}`}
                        src={`https://maps.google.com/maps?q=${loc.latitude},${loc.longtitude}&z=15&output=embed`}
                        className="w-full h-full"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    {loc.status ? (
                      <span className="text-green-600 font-semibold">
                        Aktif
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        Tidak Aktif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex flex-wrap gap-2">
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
                  <td
                    colSpan={5}
                    className="text-center text-gray-400 py-6"
                  >
                    Tidak ada data lokasi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit */}
      {showEditModal && selectedLoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md w-[32rem] max-w-[95vw]">
            <h3 className="text-lg font-bold mb-4">Edit Lokasi</h3>

            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium">
                Nama Lokasi
              </label>
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

            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium">
                Status
              </label>
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

            {/* Map interaktif */}
            <div className="mb-4 h-64 w-full rounded-xl overflow-hidden shadow">
              <MapContainer
                center={[
                  selectedLoc.latitude || -6.2,
                  selectedLoc.longtitude || 106.8,
                ]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker
                  selectedLoc={selectedLoc}
                  setSelectedLoc={setSelectedLoc}
                />
                <ResizeMap />
              </MapContainer>
            </div>

            {/* Koordinat */}
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-3">
              <span>Lat: {selectedLoc.latitude}</span>
              <span>Lng: {selectedLoc.longtitude}</span>
            </div>

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
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md w-80 max-w-[90vw] text-center">
            <h3 className="text-lg font-bold mb-4">
              Konfirmasi Hapus
            </h3>
            <p className="mb-4">
              Yakin ingin menghapus{" "}
              <b>{selectedLoc.location_name}</b>?
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

      {/* Notifikasi */}
      {notification && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-md z-50 ${notifType === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
            }`}
        >
          {notification}
        </div>
      )}
    </div>
  );
}
