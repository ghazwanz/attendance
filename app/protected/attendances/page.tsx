"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CreateForm from "./CreateForm";
import UpdateForm from "./UpdateForm";
import { Attendance } from "@/lib/type";
import { showToast } from "@/lib/utils/toast";
import { useLocationStores } from "@/lib/stores/useLocationStores";

export default function Page() {
  const supabase = createClient();

  const isOutside = useLocationStores(state=>state.isOutside)
  

  // ====== State dasar ======
  const [userList, setUserList] = useState<{ id: string; name: string }[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // UI + Form
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
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [selected, setSelected] = useState<any | null>(null);
  const [checkoutItem, setCheckoutItem] = useState<any | null>(null);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // ====== Pagination ======
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(20); // ubah jika ingin page size lain
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage; // untuk penomoran "No"

  // ====== Helpers ======
  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  useEffect(() => {
    if (errorToast) {
      const timeout = setTimeout(() => setErrorToast(null), 3000);
      return () => clearTimeout(timeout);
    }
  }, [errorToast]);

  // Reset ke page 1 saat filter/search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, searchTerm]);

  // Ambil data ketika halaman, filter, atau search berubah
  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, rowsPerPage, selectedFilter, searchTerm]);

  const buildDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    if (selectedFilter === "today") {
      return { startISO: today.toISOString(), endISO: endOfToday.toISOString() };
    }
    if (selectedFilter === "yesterday") {
      const y1 = new Date(today);
      y1.setDate(today.getDate() - 1);
      const y2 = new Date(endOfToday);
      y2.setDate(endOfToday.getDate() - 1);
      return { startISO: y1.toISOString(), endISO: y2.toISOString() };
    }
    if (selectedFilter === "last7days") {
      const s = new Date(today);
      s.setDate(today.getDate() - 6);
      return { startISO: s.toISOString(), endISO: endOfToday.toISOString() };
    }
    return { startISO: null as string | null, endISO: null as string | null };
  };

  const fetchData = async () => {
    setLoading(true);

    // Ambil user & role
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id || null;

    const { data: userInfo } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();
    const role = userInfo?.role || null;
    setUserRole(role);

    // Ambil semua user untuk dropdown
    const { data: allUsers } = await supabase.from("users").select("id, name");
    setUserList(allUsers || []);

    // Range untuk pagination
    const from = (currentPage - 1) * rowsPerPage;
    const to = from + rowsPerPage - 1;

    const { startISO, endISO } = buildDateRange();

    // Query utama + count (Supabase akan kembalikan count total berdasarkan filter)
    let query = supabase
      .from("attendances")
      .select("*, users!inner(name, role)", { count: "exact" })
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (role !== "admin" && userId) query = query.eq("user_id", userId);
    if (startISO) query = query.gte("date", startISO);
    if (endISO) query = query.lte("date", endISO);
    if (searchTerm.trim()) query = query.ilike("users.name", `%${searchTerm}%`);

    query = query.range(from, to);

    const { data: pageData, count, error } = await query;

    if (!error) {
      setData(pageData || []);
      setTotalCount(count || 0);
    }

    // ====== Logic khusus user non-admin (cek status & prompt checkout) ======
    if (role !== "admin" && userId) {
      const tStart = new Date();
      tStart.setHours(0, 0, 0, 0);
      const tEnd = new Date();
      tEnd.setHours(23, 59, 59, 999);

      const { data: todayRows } = await supabase
        .from("attendances")
        .select("*")
        .eq("user_id", userId)
        .gte("date", tStart.toISOString())
        .lte("date", tEnd.toISOString());

      const now = new Date();
      const batasJam16 = new Date();
      batasJam16.setHours(16, 0, 0, 0); // ✅ fix: memang 16:00

      const belumCheckIn = (todayRows || []).find(
        (item: any) => !item.check_in && item.status === "HADIR"
      );

      if (belumCheckIn && now >= batasJam16) {
        await supabase
          .from("attendances")
          .update({ status: "TANPA KETERANGAN" })
          .eq("id", belumCheckIn.id);
      }

      const batasPulang = new Date();
      batasPulang.setHours(16, 0, 0, 0);
      const absensiHariIni = (todayRows || []).find(
        (item: any) => item.check_in && !item.check_out
      );
      if (absensiHariIni && now >= batasPulang) {
        setCheckoutItem(absensiHariIni);
      }
    }

    setLoading(false);
  };

  // ====== Filtered data untuk tampilan nomor urut ======
  // Catatan: data sudah dipaginasi di server; di sini hanya menampilkan saja.

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

          {/* Form Absensi */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-white/10">
            <h2 className="text-xl font-semibold mb-4">📝 Form Absensi</h2>
            <CreateForm
              onRefresh={() => {
                void fetchData();
                showSuccessToast("Absensi masuk berhasil disimpan!");
              }}
              isOutside={isOutside}
              userRole={userRole ?? ""}
            />
          </div>

          {/* Filter & Search & Tambah (admin) */}
          <div className="flex justify-between items-center mt-6 flex-wrap gap-4">
            {/* Filter Hari */}
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">📅 Semua Hari</option>
              <option value="today">📆 Hari Ini</option>
              <option value="yesterday">📆 Kemarin</option>
              <option value="last7days">📆 7 Hari Terakhir</option>
            </select>

            {/* Search */}
            <div className="mt-6 max-w-md ">
              <input
                type="text"
                placeholder="🔍 Cari nama Team..."
                className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {userRole === "admin" && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110 text-white font-semibold px-5 py-2 rounded-xl shadow"
                >
                  ➕ Tambah Absen
                </button>
              </div>
            )}
          </div>
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
                <h2 className="text-lg font-bold mb-4 text-center">
                  Tambah Absen
                </h2>
                {errorToast && (
                  <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg text-sm animate-bounce">
                      {errorToast}
                    </div>
                  </div>
                )}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setAddLoading(true);

                    if (!addForm.user_id || !addForm.date) {
                      alert("Nama dan Tanggal wajib diisi!");
                      setAddLoading(false);
                      return;
                    }

                    if (addForm.check_in && addForm.check_out) {
                      const checkIn = new Date(
                        `${addForm.date}T${addForm.check_in}`
                      );
                      const checkOut = new Date(
                        `${addForm.date}T${addForm.check_out}`
                      );
                      if (checkIn >= checkOut) {
                        setErrorToast(
                          "❌ Jam Check-in tidak boleh sama atau lebih dari Check-out!"
                        );
                        setErrorToast(
                          "❌ Jam Check-in tidak boleh sama atau lebih dari Check-out!"
                        );
                        setAddLoading(false);
                        return;
                      }
                    }

                    const { error } = await supabase
                      .from("attendances")
                      .insert({
                        user_id: addForm.user_id,
                        date: addForm.date,
                        check_in: addForm.check_in
                          ? new Date(
                            `${addForm.date}T${addForm.check_in}`
                          ).toISOString()
                          : null,
                        check_out: addForm.check_out
                          ? new Date(
                            `${addForm.date}T${addForm.check_out}`
                          ).toISOString()
                          : null,
                        notes: addForm.notes,
                        status: addForm.status,
                      });

                    if (!error) {
                      setShowAddModal(false);
                      setAddForm({
                        user_id: "",
                        date: "",
                        check_in: "",
                        check_out: "",
                        notes: "",
                        status: "HADIR",
                      });
                      void fetchData();
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
                    <label className="block text-sm font-medium mb-1">
                      Nama
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white"
                      value={addForm.user_id}
                      onChange={(e) =>
                        setAddForm({ ...addForm, user_id: e.target.value })
                      }
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
                    <label className="block text-sm font-medium mb-1">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white"
                      value={addForm.date}
                      onChange={(e) =>
                        setAddForm({ ...addForm, date: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Check-in */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Check-in
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white"
                      value={addForm.check_in}
                      onChange={(e) =>
                        setAddForm({ ...addForm, check_in: e.target.value })
                      }
                    />
                  </div>

                  {/* Check-out */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Check-out
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white"
                      value={addForm.check_out}
                      onChange={(e) =>
                        setAddForm({ ...addForm, check_out: e.target.value })
                      }
                    />
                  </div>

                  {/* Keterangan */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Keterangan
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white"
                      value={addForm.notes}
                      onChange={(e) =>
                        setAddForm({ ...addForm, notes: e.target.value })
                      }
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white"
                      value={addForm.status}
                      onChange={(e) =>
                        setAddForm({ ...addForm, status: e.target.value })
                      }
                    >
                      <option value="HADIR">HADIR</option>
                      <option value="TERLAMBAT">TERLAMBAT</option>
                      <option value="IZIN">IZIN</option>
                      <option value="ALPA">ALPA</option>
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

          {/* Tabel */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-blue-600 text-white text-xs uppercase">
                  <th className="py-3 px-4 rounded-tl-lg">No</th>
                  <th className="py-3 px-4">Nama</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Masuk</th>
                  <th className="py-3 px-4">Pulang</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-tr-lg">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      🚫 Tidak ada absensi.
                    </td>
                  </tr>
                ) : (
                  data.map((item, i) => (
                    <tr
                      key={item.id}
                      className={`transition duration-150 cursor-pointer ${i % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-blue-50 dark:bg-slate-700"} hover:bg-gray-100 dark:hover:bg-slate-600`}
                      onClick={() => {
                        if (item.user_id) {
                          window.location.href = `/protected/users/${item.user_id}`;
                        }
                      }}
                    >
                      <td className="py-2 px-4">{startIndex + i + 1}</td>
                      <td className="py-2 px-4 uppercase">{item.users?.name || "Tanpa Nama"}</td>
                      <td className="py-2 px-4">
                        {item.date ? new Date(item.date).toLocaleDateString("id-ID") : "-"}
                      </td>
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
                          className={`text-sm font-semibold ${item.status === "HADIR"
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
                              {userRole === "admin" ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelected(item); }}
                                  className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                                >
                                  ✏️ Edit
                                </button>
                              ) : (
                                item.date?.split("T")[0] === new Date().toISOString().split("T")[0] && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setSelected(item); }}
                                    className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                                  >
                                    ✏️ Edit
                                  </button>
                                )
                              )}

                              {userRole === "admin" && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setDeleteItem(item); }}
                                  className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                                >
                                  🗑 Delete
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              {!item.check_out && item.status !== "alpa".toUpperCase() && userRole !== "admin" && (
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

                              {userRole === "admin" ? (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setSelected(item); }}
                                    className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                                  >
                                    ✏️ Edit
                                  </button>
                              ) : (
                                item.date?.split("T")[0] === new Date().toISOString().split("T")[0] && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setSelected(item); }}
                                    className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                                  >
                                    ✏️ Edit
                                  </button>
                                )
                              )}

                              {userRole === "admin" && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setDeleteItem(item); }}
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

          {/* ====== Pagination Bar ====== */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Menampilkan <b>{data.length > 0 ? startIndex + 1 : 0}</b>–
                <b>{startIndex + data.length}</b> dari <b>{totalCount}</b> data
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                  .slice(
                    Math.max(0, currentPage - 3),
                    Math.max(0, currentPage - 3) + 5
                  )
                  .map((n) => (
                    <button
                      key={n}
                      onClick={() => setCurrentPage(n)}
                      className={`px-3 py-1 border rounded-md text-sm hover:bg-gray-100 dark:hover:bg-slate-700 ${currentPage === n ? "bg-blue-600 text-white" : ""
                        }`}
                    >
                      {n}
                    </button>
                  ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 p-3 backdrop-blur-sm flex items-center justify-center z-50">
          <UpdateForm
            userRole={userRole ?? ""}
            attendance={selected}
            onClose={() => setSelected(null)}
            onDone={() => {
              setSelected(null);
              void fetchData();
              showSuccessToast("Absensi berhasil diperbarui!");
            }}
          />
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
                <strong>👤 Nama:</strong> {checkoutItem.users?.name || "Tanpa Nama"}
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
                onChange={(e) => setCheckoutItem({ ...checkoutItem, notes: e.target.value })}
              />
              {checkoutError && <p className="text-red-500 text-sm mt-2">{checkoutError}</p>}
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
                  // if (isOutside) return showToast({ type: "error", message: "Anda berada di luar area kantor" })

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
                    void fetchData();
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
