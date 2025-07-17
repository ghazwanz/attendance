"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Permission } from "@/lib/type";

export default function PermissionTable() {
  const supabase = createClient();
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<string | null>(
    null
  );
  const [data, setData] = useState<Permission[]>([]);
  const [form, setForm] = useState({
    user_id: "",
    type: "izin",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("id, name");
    if (!error && data) setUsers(data);
  };

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("permissions")
      .select("*, users(name)")
      .order("created_at", { ascending: false });
    if (!error) setData(data);
  };

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({
      user_id: "",
      type: "izin",
      start_date: "",
      end_date: "",
      reason: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form };

    if (editingId) {
      const { error } = await supabase
        .from("permissions")
        .update(payload)
        .eq("id", editingId);
      if (!error) {
        setSuccessMessage("✅ Berhasil mengedit izin!");
        setShowEditModal(false);
        resetForm();
        fetchData();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } else {
      const { error } = await supabase
        .from("permissions")
        .insert({ ...payload, status: "pending" });
      if (!error) {
        setSuccessMessage("✅ Berhasil menambahkan izin!");
        resetForm();
        setShowForm(false);
        fetchData();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    }

    setLoading(false);
  };

  const handleEdit = (item: Permission) => {
    setForm({
      user_id: item.user_id,
      type: item.type,
      start_date: item.start_date,
      end_date: item.end_date,
      reason: item.reason,
    });
    setEditingId(item.id);
    setShowEditModal(true);
  };

  const confirmDelete = (id: string) => {
    setSelectedIdToDelete(id);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedIdToDelete) return;
    setLoading(true);
    const { error } = await supabase
      .from("permissions")
      .delete()
      .eq("id", selectedIdToDelete);
    if (!error) {
      setSuccessMessage("✅ Data berhasil dihapus!");
      fetchData();
      setTimeout(() => setSuccessMessage(""), 3000);
    }
    setLoading(false);
    setShowConfirmModal(false);
    setSelectedIdToDelete(null);
  };

  const filteredData = data.filter((item) => {
    const nama = item.users?.name?.toLowerCase() || "";
    const alasan = item.reason.toLowerCase();
    const jenis = item.type.toLowerCase();
    const keyword = searchTerm.toLowerCase();

    return (
      nama.includes(keyword) ||
      alasan.includes(keyword) ||
      jenis.includes(keyword)
    );
  });

  return (
    <div className="max-w-6xl mx-auto p-6 border border-white/20 rounded-xl shadow-lg text-black dark:text-white">
      <h1 className="text-3xl font-bold mb-4">📋 Tabel Izin</h1>

      {successMessage && (
        <div className="mb-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-sm">
          {successMessage}
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md text-black dark:text-white">
            <p className="text-red-600 font-semibold text-lg mb-2">
              🗑️ Konfirmasi Hapus
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Yakin ingin menghapus data ini?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Ya, Hapus
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="border border-gray-400 px-4 py-2 rounded hover:bg-gray-700"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-xl text-black dark:text-white">
            <h2 className="text-xl font-bold mb-4">✏️ Edit Izin</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                name="user_id"
                value={form.user_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded bg-white/10 border border-black dark:border-white/20 text-black dark:text-white"
              >
                <option value="">Pilih User</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-white/10 border border-black dark:border-white/20 text-black dark:text-white"
              >
                <option value="izin">Izin</option>
                <option value="cuti">Cuti</option>
                <option value="sakit">Sakit</option>
              </select>

              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-white/10 border border-black dark:border-white/20 text-black dark:text-white"
                required
              />

              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
               className="w-full px-3 py-2 rounded bg-white/10 border border-black dark:border-white/20 text-black dark:text-white"
                required
              />

              <input
                type="text"
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Alasan"
               className="w-full px-3 py-2 rounded bg-white/10 border border-black dark:border-white/20 text-black dark:text-white"
                required
              />

              <div className="flex justify-end gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="hover:underline"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tombol Tambah & Pencarian */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button
          onClick={() => {
            setShowForm((prev) => !prev);
            resetForm();
          }}
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded w-fit"
        >
          {showForm ? "Tutup Form" : "Tambah Izin"}
        </button>

        <input
          type="text"
          placeholder="🔍 Cari nama, jenis, atau alasan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 px-3 py-2 rounded border border-black bg-white/10 text-black dark:text-white"
        />
      </div>

      {/* Form Tambah */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
        >
          <select
            name="user_id"
            value={form.user_id}
            onChange={handleChange}
            required
            className="px-3 py-2 rounded border border-black bg-white/10 dark:text-white"
          >
            <option value="">Pilih Nama User</option>
            {users.map((user) => (
              <option key={user.id} value={user.id} className="text-black">
                {user.name}
              </option>
            ))}
          </select>

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="px-3 py-2 rounded border border-black bg-white/10 text-black dark:text-white"
          >
            <option className="text-black" value="izin">
              Izin
            </option>
            <option className="text-black" value="cuti">
              Cuti
            </option>
            <option className="text-black" value="sakit">
              Sakit
            </option>
          </select>

          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            required
            className="px-3 py-2 rounded border border-black bg-white/10 text-black dark:text-white"
          />

          <input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            required
            className="px-3 py-2 rounded border border-black bg-white/10 text-black dark:text-white"
          />

          <input
            type="text"
            name="reason"
            placeholder="Alasan"
            value={form.reason}
            onChange={handleChange}
            required
            className="px-3 py-2 rounded border border-black bg-white/10 text-black dark:text-white col-span-2"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full md:w-auto col-span-full"
            disabled={loading}
          >
            Tambah
          </button>
        </form>
      )}

      {/* Tabel */}
      <div className="overflow-x-auto max-w-full p-2">
        <table className="min-w-[700px] text-sm text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-blue-600 text-white uppercase tracking-wider">
              <th className="px-4 py-3 rounded-l-xl">Nama</th>
              <th className="px-4 py-3">Mulai</th>
              <th className="px-4 py-3">Selesai</th>
              <th className="px-4 py-3">Jenis</th>
              <th className="px-4 py-3">Alasan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Dibuat</th>
              <th className="px-4 py-3 rounded-r-xl">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="rounded-xl shadow-sm">
                <td className="px-4 py-3 rounded-l-xl">
                  {item.users?.name || "-"}
                </td>
                <td className="px-4 py-3">{item.start_date}</td>
                <td className="px-4 py-3">{item.end_date}</td>
                <td className="px-4 py-3 capitalize">{item.type}</td>
                <td className="px-4 py-3">{item.reason}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                      item.status === "diterima"
                        ? "bg-green-100 text-green-700"
                        : item.status === "ditolak"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {new Date(item.created_at).toLocaleString("id-ID", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-3 rounded-r-xl flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(item.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-xs"
                    disabled={loading}
                  >
                    🗑️ Hapus
                  </button>
                </td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-gray-500 py-4">
                  Tidak ada data izin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
