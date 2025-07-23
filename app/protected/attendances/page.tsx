// ... (import tetap sama)
"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import CreateForm from "./CreateForm";
import UpdateForm from "./UpdateForm";

export default function Page() {
  // State untuk daftar user
  const [userList, setUserList] = useState<{id: string, name: string}[]>([]);
  // State untuk modal tambah absen
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    user_id: "",
    date: "",
    check_in: "",
    check_out: "",
    notes: "",
    status: "HADIR",
  });
  const [addLoading, setAddLoading] = useState(false);
  const supabase = createClient();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [checkoutItem, setCheckoutItem] = useState<any | null>(null);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const fetchData = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    let query = supabase
      .from("attendances")
      .select("*, users(name, role)")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    const { data: userInfo } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    const role = userInfo?.role;
    setUserRole(role);

    // Ambil semua user untuk dropdown
    const { data: allUsers } = await supabase
      .from("users")
      .select("id, name");
    setUserList(allUsers || []);
    if (role !== "admin") {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    if (!error) {
      setData(data || []);

      if (userRole !== "admin") {
        const today = new Date().toISOString().split("T")[0];
        const now = new Date();
        const batasJam16 = new Date();
        batasJam16.setHours(10, 0, 0, 0);

        // 🔴 Jika belum check-in hari ini setelah jam 16:00, ubah status jadi TANPA KETERANGAN
        const belumCheckIn = (data || []).find((item) => {
          const tanggal = item.date?.split("T")[0];
          return tanggal === today && !item.check_in && item.status === "HADIR";
        });

        if (belumCheckIn && now >= batasJam16) {
          await supabase
            .from("attendances")
            .update({ status: "TANPA KETERANGAN" })
            .eq("id", belumCheckIn.id);
          fetchData(); // refresh setelah update
          return;
        }

        // 🟡 Jika sudah check-in tapi belum check-out setelah jam 08:30 pagi
        const absensiHariIni = (data || []).find((item) => {
          const tanggal = item.date?.split("T")[0];
          return tanggal === today && item.check_in && !item.check_out;
        });

        const batasPulang = new Date();
        batasPulang.setHours(16, 0, 0, 0);

        if (absensiHariIni && now >= batasPulang) {
          setCheckoutItem(absensiHariIni);
        }
      }
    }
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
    <div className="min-h-screen py-10 bg-white dark:bg-slate-900 text-black dark:text-white transition-colors">
      <div className="w-full space-y-10">
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
          <h1 className="text-3xl font-bold mb-1">📊 Absensi Team</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kelola data kehadiran harian secara efisien dan akurat.
          </p>

          {/* 🔍 Input Search */}
          <div className="mt-6 max-w-md mx-auto">
            <input
              type="text"
              placeholder="🔍 Cari nama Team..."
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
          {/* Tombol Tambah Absen khusus admin di bawah form */}
          {userRole === "admin" && (
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-700 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow font-semibold"
              >
                Tambah Absen
              </button>
            </div>
          )}
        </div>

        {/* Tabel Kehadiran */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-white/10">
          <h2 className="text-xl font-semibold mb-4">📋 Tabel Kehadiran</h2>
          {/* Modal Tambah Absen */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg max-w-md w-full relative">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-2 right-2 text-sm text-gray-400 hover:text-red-500"
                >
                  ✖
                </button>
                <h2 className="text-lg font-bold mb-4 text-center">Tambah Absen</h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setAddLoading(true);
                    // Validasi
                    if (!addForm.user_id || !addForm.date) {
                      alert("Nama dan Tanggal wajib diisi!");
                      setAddLoading(false);
                      return;
                    }
                    const { error } = await supabase.from("attendances").insert({
                      user_id: addForm.user_id,
                      date: addForm.date,
                      check_in: addForm.check_in ? new Date(`${addForm.date}T${addForm.check_in}`).toISOString() : null,
                      check_out: addForm.check_out ? new Date(`${addForm.date}T${addForm.check_out}`).toISOString() : null,
                      notes: addForm.notes,
                      status: addForm.status,
                    });
                    if (!error) {
                      setShowAddModal(false);
                      setAddForm({ user_id: "", date: "", check_in: "", check_out: "", notes: "", status: "HADIR" });
                      fetchData();
                      showSuccessToast("Data absen berhasil ditambahkan!");
                    } else {
                      alert("Gagal menambah data absen!");
                    }
                    setAddLoading(false);
                  }}
                  className="space-y-4"
                >
                  {/* Nama User */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama</label>
                    <select
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white"
                      value={addForm.user_id}
                      onChange={(e) => setAddForm({ ...addForm, user_id: e.target.value })}
                      required
                    >
                      <option value="">Pilih Nama</option>
                      {userList.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Tanggal */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Tanggal</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white"
                      value={addForm.date}
                      onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                      required
                    />
                  </div>
                  {/* Check-in */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Check-in</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white"
                      value={addForm.check_in}
                      onChange={(e) => setAddForm({ ...addForm, check_in: e.target.value })}
                    />
                  </div>
                  {/* Check-out */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Check-out</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white"
                      value={addForm.check_out}
                      onChange={(e) => setAddForm({ ...addForm, check_out: e.target.value })}
                    />
                  </div>
                  {/* Keterangan */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Keterangan</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white"
                      value={addForm.notes}
                      onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                    />
                  </div>
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white"
                      value={addForm.status}
                      onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                    >
                      <option value="HADIR">HADIR</option>
                      <option value="IZIN">IZIN</option>
                      <option value="TANPA KETERANGAN">TANPA KETERANGAN</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-sm rounded-md bg-gray-300 dark:bg-slate-600 hover:bg-gray-400 dark:hover:bg-slate-500 text-black dark:text-white"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm rounded-md bg-green-600 hover:bg-green-700 text-white font-semibold shadow"
                      disabled={addLoading}
                    >
                      ✅ Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
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
                    <td
                      colSpan={8}
                      className="text-center py-8 text-gray-500 dark:text-gray-400"
                    >
                      🚫 Tidak ada absensi.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, i) => (
                    <tr
                      key={item.id}
                      className={`transition duration-150 ${
                        i % 2 === 0
                          ? "bg-white dark:bg-slate-800"
                          : "bg-blue-50 dark:bg-slate-700"
                      } hover:bg-gray-100 dark:hover:bg-slate-600`}
                    >
                      <td className="py-2 px-4">{i + 1}</td>
                      <td className="py-2 px-4 uppercase">
                        {item.users?.name || "Tanpa Nama"}
                      </td>
                      <td className="py-2 px-4">{item.date}</td>
                      <td className="py-2 px-4">
                        <span className="text-yellow-400 font-mono text-sm">
                          {item.check_in
                            ? new Date(item.check_in).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              })
                            : "-"}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <span className="text-blue-400 font-mono text-sm">
                          {item.check_out
                            ? new Date(item.check_out).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              })
                            : "-"}
                        </span>
                      </td>
                      <td className="py-2 px-4">{item.notes || "-"}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`text-sm font-semibold ${
                            item.status === "HADIR"
                              ? "text-green-400"
                              : item.status === "IZIN"
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex flex-wrap gap-2">
                          {item.status == "IZIN" ? (
                            <>
                              {userRole === "admin"
                                ? (
                                  <button
                                    onClick={() => setSelected(item)}
                                    className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                                  >
                                    ✏️ Edit
                                  </button>
                                )
                                : (item.date?.split("T")[0] === new Date().toISOString().split("T")[0] && (
                                  <button
                                    onClick={() => setSelected(item)}
                                    className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                                  >
                                    ✏️ Edit
                                  </button>
                                ))}

                              {userRole === "admin" && (
                                <button
                                  onClick={() => setDeleteItem(item)}
                                  className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                                >
                                  🗑 Delete
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              {!item.check_out && userRole !== "admin" && (
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

                              {userRole === "admin"
                                ? (
                                  <button
                                    onClick={() => setSelected(item)}
                                    className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                                  >
                                    ✏️ Edit
                                  </button>
                                )
                                : (item.date?.split("T")[0] === new Date().toISOString().split("T")[0] && (
                                  <button
                                    onClick={() => setSelected(item)}
                                    className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                                  >
                                    ✏️ Edit
                                  </button>
                                ))}

                              {userRole === "admin" && (
                                <button
                                  onClick={() => setDeleteItem(item)}
                                  className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                                >
                                  🗑 Delete
                                </button>
                              )}
                            </>
                          )}
                        </div>
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
              {userRole === "admin" ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const { id } = selected;
                    const { date, check_in, check_out, notes, status } = selected;
                    let updateObj = {
                      date: selected.date,
                      check_in: selected.check_in,
                      check_out: selected.check_out,
                      notes: selected.notes,
                      status: selected.status,
                    };
                    // Format waktu jika diubah
                    // Jika check_in sudah ISO string, gunakan substring jam-menit, jika string jam-menit, langsung
                    if (check_in) {
                      if (typeof check_in === "string" && check_in.length <= 5 && date) {
                        updateObj.check_in = new Date(`${date}T${check_in}`).toISOString();
                      } else if (typeof check_in === "string" && check_in.length > 5) {
                        updateObj.check_in = check_in;
                      } else if (check_in instanceof Date) {
                        updateObj.check_in = check_in.toISOString();
                      } else {
                        updateObj.check_in = null;
                      }
                    }
                    if (check_out) {
                      if (typeof check_out === "string" && check_out.length <= 5 && date) {
                        updateObj.check_out = new Date(`${date}T${check_out}`).toISOString();
                      } else if (typeof check_out === "string" && check_out.length > 5) {
                        updateObj.check_out = check_out;
                      } else if (check_out instanceof Date) {
                        updateObj.check_out = check_out.toISOString();
                      } else {
                        updateObj.check_out = null;
                      }
                    }
                    const { error } = await supabase
                      .from("attendances")
                      .update(updateObj)
                      .eq("id", id);
                    if (!error) {
                      setSelected(null);
                      fetchData();
                      showSuccessToast("Absensi berhasil diperbarui!");
                    } else {
                      alert("Gagal update absensi!");
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">Tanggal</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 !bg-white !text-black"
                      value={selected.date?.split("T")[0] || ""}
                      onChange={e => setSelected({ ...selected, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Check-in</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 !bg-white !text-black"
                      value={
                        selected.check_in
                          ? (typeof selected.check_in === "string")
                            ? selected.check_in.slice(0,5)
                            : ""
                          : ""
                      }
                      onChange={e => setSelected({ ...selected, check_in: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Check-out</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 !bg-white !text-black"
                      value={
                        selected.check_out
                          ? (typeof selected.check_out === "string")
                            ? selected.check_out.slice(0,5)
                            : ""
                          : ""
                      }
                      onChange={e => setSelected({ ...selected, check_out: e.target.value })}
                      disabled={selected.date?.split("T")[0] !== new Date().toISOString().split("T")[0]}
                    />
                    {selected.date?.split("T")[0] !== new Date().toISOString().split("T")[0] && (
                      <p className="text-xs text-gray-400 mt-1">Check-out hanya bisa diedit untuk absensi hari ini.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Keterangan</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white"
                      value={selected.notes || ""}
                      onChange={e => setSelected({ ...selected, notes: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white"
                      value={selected.status}
                      onChange={e => setSelected({ ...selected, status: e.target.value })}
                    >
                      <option value="HADIR">HADIR</option>
                      <option value="IZIN">IZIN</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="px-4 py-2 text-sm rounded-md bg-gray-300 dark:bg-slate-600 hover:bg-gray-400 dark:hover:bg-slate-500 text-black dark:text-white"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
                    >
                      ✅ Simpan
                    </button>
                  </div>
                </form>
              ) : (
                <UpdateForm
                  attendance={selected}
                  onDone={() => {
                    setSelected(null);
                    fetchData();
                    showSuccessToast("Absensi berhasil diperbarui!");
                  }}
                />
              )}
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
                <p>
                  <strong>👤 Nama:</strong>{" "}
                  {checkoutItem.users?.name || "Tanpa Nama"}
                </p>
                <p>
                  <strong>📅 Tanggal:</strong> {checkoutItem.date}
                </p>
                <p>
                  <strong>⏰ Check-in:</strong>{" "}
                  {checkoutItem.check_in
                    ? new Date(checkoutItem.check_in).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </p>
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
                      setCheckoutError(
                        "⛔ Belum waktunya pulang. Absensi pulang hanya bisa dilakukan setelah jam 16:00."
                      );
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
                {userRole === "admin" && (
                  <button
                    onClick={async () => {
                      const { error } = await supabase
                        .from("attendances")
                        .delete()
                        .eq("id", deleteItem.id);
                      if (!error) {
                        setData((prev) =>
                          prev.filter((d) => d.id !== deleteItem.id)
                        );
                        showSuccessToast("Data absensi berhasil dihapus!");
                        setDeleteItem(null);
                      }
                    }}
                    className="px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold shadow"
                  >
                    ✅ Ya, Hapus
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
