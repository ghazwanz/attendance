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
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<string | null>(null);
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
    const { data: udata, error } = await supabase.from("users").select("id, name");
    if (!error && udata) setUsers(udata);
  };

  const fetchData = async () => {
    const { data: perms, error } = await supabase
      .from("permissions")
      .select("*, users(name)")
      .order("created_at", { ascending: false });
    if (!error && perms) setData(perms);
  };

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ user_id: "", type: "izin", start_date: "", end_date: "", reason: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form };
    if (editingId) {
      const { error } = await supabase.from("permissions").update(payload).eq("id", editingId);
      if (!error) {
        setSuccessMessage("✅ Berhasil mengedit izin!");
        setShowEditModal(false);
        resetForm();
        fetchData();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } else {
      const { error } = await supabase.from("permissions").insert({ ...payload, status: "pending" });
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
    const { error } = await supabase.from("permissions").delete().eq("id", selectedIdToDelete);
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
    const kw = searchTerm.toLowerCase();
    const nama = item.users?.name?.toLowerCase() || "";
    return nama.includes(kw) || item.reason.toLowerCase().includes(kw) || item.type.toLowerCase().includes(kw);
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 border border-white/20 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-4">📋 Tabel Izin</h1>

      {successMessage && (
        <div className="mb-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-sm">
          {successMessage}
        </div>
      )}

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button
          onClick={() => { setShowForm((p) => !p); resetForm(); }}
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded w-fit"
        >
          {showForm ? "Tutup Form" : "Tambah Izin"}
        </button>
        <input
          type="text"
          placeholder="🔍 Cari nama, jenis, atau alasan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:max-w-xs px-4 py-2 rounded bg-white/10 text-white border border-white/20"
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <select name="user_id" value={form.user_id} onChange={handleChange} required
            className="px-3 py-2 rounded bg-white/10 text-white border border-white/20">
            <option value="">Pilih Nama User</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select name="type" value={form.type} onChange={handleChange}
            className="px-3 py-2 rounded bg-white/10 text-white border border-white/20">
            <option value="izin">Izin</option>
            <option value="cuti">Cuti</option>
            <option value="sakit">Sakit</option>
          </select>
          <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required
            className="px-3 py-2 rounded bg-white/10 text-white border border-white/20" />
          <input type="date" name="end_date" value={form.end_date} onChange={handleChange} required
            className="px-3 py-2 rounded bg-white/10 text-white border border-white/20" />
          <input type="text" name="reason" placeholder="Alasan" value={form.reason} onChange={handleChange} required
            className="px-3 py-2 rounded bg-white/10 text-white border border-white/20 sm:col-span-2 md:col-span-2" />
          <button type="submit" disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded col-span-full md:col-span-1">
            {editingId ? "Update" : "Tambah"}
          </button>
        </form>
      )}

      {/* Tabel untuk layar medium ke atas */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-[900px] w-full table-auto text-sm text-left border-separate border-spacing-y-2">
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
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id} className="text-white rounded-xl shadow-sm bg-white/5">
                  <td className="px-4 py-3 rounded-l-xl">{item.users?.name || "-"}</td>
                  <td className="px-4 py-3">{item.start_date}</td>
                  <td className="px-4 py-3">{item.end_date}</td>
                  <td className="px-4 py-3 capitalize">{item.type}</td>
                  <td className="px-4 py-3">{item.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                      item.status === "diterima"
                        ? "bg-green-100 text-green-700"
                        : item.status === "ditolak"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
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
                    <button onClick={() => handleEdit(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs">
                      ✏️ Edit
                    </button>
                    <button onClick={() => confirmDelete(item.id)} disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-xs">
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center text-gray-400 py-4">Tidak ada data izin.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Kartu untuk mobile */}
      <div className="block md:hidden space-y-4">
        {filteredData.map((item) => (
          <div key={item.id} className="bg-white/5 rounded-xl p-4 text-white shadow-sm">
            <p><strong>Nama:</strong> {item.users?.name || "-"}</p>
            <p><strong>Mulai:</strong> {item.start_date}</p>
            <p><strong>Selesai:</strong> {item.end_date}</p>
            <p><strong>Jenis:</strong> {item.type}</p>
            <p><strong>Alasan:</strong> {item.reason}</p>
            <p><strong>Status:</strong>{" "}
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                item.status === "diterima"
                  ? "bg-green-100 text-green-700"
                  : item.status === "ditolak"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                {item.status}
              </span>
            </p>
            <p><strong>Dibuat:</strong>{" "}
              {new Date(item.created_at).toLocaleString("id-ID", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => handleEdit(item)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                ✏️ Edit
              </button>
              <button onClick={() => confirmDelete(item.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                🗑️ Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Confirm & Edit */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <p className="text-red-600 font-semibold text-lg mb-2">🗑️ Konfirmasi Hapus</p>
            <p className="text-sm text-gray-500 mb-4">Yakin ingin menghapus data ini?</p>
            <div className="flex justify-end gap-3">
              <button onClick={handleDeleteConfirm}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Ya, Hapus</button>
              <button onClick={() => setShowConfirmModal(false)}
                className="border border-gray-400 px-4 py-2 text-gray-700 rounded hover:bg-gray-200">Batal</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">✏️ Edit Izin</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select name="user_id" value={form.user_id} onChange={handleChange} required
                className="w-full px-3 py-2 rounded bg-white/10 text-gray-900 border border-gray-300">
                <option value="">Pilih User</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-white/10 text-gray-900 border border-gray-300">
                <option value="izin">Izin</option>
                <option value="cuti">Cuti</option>
                <option value="sakit">Sakit</option>
              </select>
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required
                className="w-full px-3 py-2 rounded bg-white/10 text-gray-900 border border-gray-300" />
              <input type="date" name="end_date" value={form.end_date} onChange={handleChange} required
                className="w-full px-3 py-2 rounded bg-white/10 text-gray-900 border border-gray-300" />
              <input type="text" name="reason" placeholder="Alasan" value={form.reason} onChange={handleChange} required
                className="w-full px-3 py-2 rounded bg-white/10 text-gray-900 border border-gray-300" />
              <div className="flex justify-end gap-3">
                <button type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Simpan</button>
                <button type="button" onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="text-gray-700 hover:underline px-4 py-2">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
