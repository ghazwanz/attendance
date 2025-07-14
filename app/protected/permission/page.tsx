"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Permission } from "@/lib/type";

export default function PermissionTable() {
  const supabase = createClient();
  const [successMessage, setSuccessMessage] = useState("");
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.user_id) return alert("User ID wajib diisi");
    setLoading(true);

    if (editingId) {
      // Update mode
      const { error } = await supabase
        .from("permissions")
        .update(form)
        .eq("id", editingId);

      if (!error) {
        setSuccessMessage("✅ Berhasil menambahkan izin!");
        resetForm();
        fetchData();
        // otomatis hilang setelah 3 detik
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } else {
      // Create mode
      const { error } = await supabase.from("permissions").insert({
        ...form,
        status: "pending",
      });

      if (!error) {
        setSuccessMessage("✅ Berhasil menambahkan izin!");
        resetForm();
        fetchData();
        setTimeout(() => setSuccessMessage(""), 3000); // hilang otomatis
      } else {
        alert("Gagal tambah data");
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
  };

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

  // Fungsi hapus data izin
  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus data ini?")) return;
    setLoading(true);
    const { error } = await supabase.from("permissions").delete().eq("id", id);
    if (!error) {
      setSuccessMessage("✅ Data berhasil dihapus!");
      fetchData();
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      alert("Gagal menghapus data");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl w-full rounded-2xl shadow-lg p-6 border border-white/20">
      <h1 className="text-3xl font-bold mb-2">📋 Tabel Izin</h1>

      {successMessage && (
        <div className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md text-sm shadow">
          {successMessage}
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 bg-white/5 p-4 rounded-xl"
      >
        <select
          name="user_id"
          value={form.user_id}
          onChange={handleChange}
          required
          className="px-3 py-2 rounded bg-white/10 text-white border border-white/20"
        >
          <option value="">Pilih Nama User</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="px-3 py-2 rounded bg-white/10 text-white border border-white/20"
        >
          <option value="izin">Izin</option>
          <option value="cuti">Cuti</option>
          <option value="cuti">Sakit</option>
        </select>
        <input
          type="date"
          name="start_date"
          value={form.start_date}
          onChange={handleChange}
          required
          className="px-3 py-2 rounded bg-white/10 text-white border border-white/20"
        />
        <input
          type="date"
          name="end_date"
          value={form.end_date}
          onChange={handleChange}
          required
          className="px-3 py-2 rounded bg-white/10 text-white border border-white/20"
        />
        <input
          type="text"
          name="reason"
          placeholder="Alasan"
          value={form.reason}
          onChange={handleChange}
          required
          className="px-3 py-2 rounded bg-white/10 text-white border border-white/20 col-span-2"
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            disabled={loading}
          >
            {editingId ? "Update" : "Tambah"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-gray-400 underline"
            >
              Batal Edit
            </button>
          )}
        </div>
      </form>

      {/* TABEL */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border-separate border-spacing-y-2">
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
            {data?.map((item) => (
              <tr key={item.id} className=" text-white rounded-xl shadow-sm">
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
                    className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                    disabled={loading}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-gray-500 py-4">
                  Tidak ada data surat izin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
