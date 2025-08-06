"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Schedule {
  id: string;
  user_id: string;
  date: string;
  shift: string;
  created_at: string;
  users?: { name: string };
}

interface User {
  id: string;
  name: string;
}

export default function JadwalPiketPage() {
  const supabase = createClient();
  const [data, setData] = useState<Schedule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ user_id: "", date: "", shift: "Pagi" });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchData();
    fetchUsers();
    fetchCurrentUser();
  }, []);

  async function fetchData() {
    const { data: schedules } = await supabase
      .from("piket")
      .select("*, users(name), schedules(day)")
      .order("date", { ascending: true });
    setData(schedules || []);
  }

  async function fetchUsers() {
    const { data: users } = await supabase.from("users").select("id, name");
    setUsers(users || []);
  }

  async function fetchCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      setCurrentUser({ ...user, role: profile?.role || "user" });
    }
  }

  function resetForm() {
    setForm({ user_id: "", date: "", shift: "Pagi" });
    setEditingId(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await supabase.from("piket").update(form).eq("id", editingId);
      toast.success("Jadwal berhasil diperbarui!");
    } else {
      await supabase.from("piket").insert(form);
      toast.success("Jadwal berhasil ditambahkan!");
    }
    resetForm();
    setShowForm(false);
    fetchData();
  }

  function handleEdit(item: Schedule) {
    setShowForm(true);
    setEditingId(item.id);
    setForm({
      user_id: item.user_id,
      date: item.date,
      shift: item.shift,
    });
  }

  function confirmDelete(id: string) {
    setDeleteId(id);
    setShowConfirmModal(true);
  }

  async function handleDeleteConfirm() {
    if (deleteId) {
      await supabase.from("piket").delete().eq("id", deleteId);
      toast.success("Jadwal berhasil dihapus!");
      setDeleteId(null);
      setShowConfirmModal(false);
      fetchData();
    }
  }

  const filteredData = data.filter((item) => {
    const name = item.users?.name?.toLowerCase() || "";
    const shift = item.shift?.toLowerCase() || "";
    return (
      (!searchTerm || name.includes(searchTerm.toLowerCase()) || shift.includes(searchTerm.toLowerCase())) &&
      (!filterDate || item.date === filterDate)
    );
  });

  return (
    <div className="w-full max-w-screen-xl mx-auto px-6 py-8 text-black dark:text-white">
      <h1 className="text-4xl font-bold mb-8 text-blue-700 dark:text-blue-400">📅 Jadwal Piket</h1>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110 text-white font-semibold px-5 py-2 rounded-xl shadow"
        >
          ➕ Tambah Jadwal
        </button>

        <div className="flex gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="🔍 Cari nama/shift..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-56 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid md:grid-cols-4 gap-4 mb-6 bg-white/90 dark:bg-gray-900 p-6 rounded-2xl shadow-xl animate-fade-in">
          <select
            name="user_id"
            value={form.user_id}
            onChange={handleChange}
            required
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">👤 Pilih User</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="shift"
            value={form.shift}
            onChange={handleChange}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
          >
            <option value="Senin">Senin</option>
            <option value="Selasa">Selasa</option>
            <option value="Rabu">Rabu</option>
            <option value="Kamis">Kamis</option>
            <option value="Jumat">Jumat</option>
            <option value="Sabtu">Sabtu</option>
            <option value="Minggu">Minggu</option>
          </select>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
            💾 Simpan
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-4 text-sm text-gray-800 dark:text-gray-100">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm uppercase">
              <th className="px-6 py-3 rounded-l-xl text-left">👤 Nama</th>
              <th className="px-6 py-3 text-left">📆 Tanggal</th>
              <th className="px-6 py-3 text-left">⏰ Hari</th>
              <th className="px-6 py-3 rounded-r-xl text-left">⚙️ Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md transition-transform hover:scale-[1.01] hover:shadow-lg"
              >
                <td className="px-6 py-3 rounded-l-xl">{item.users?.name || "-"}</td>
                <td className="px-6 py-3">{item.date}</td>
                <td className="px-6 py-3">{item.shift}</td>
                <td className="px-6 py-3 flex gap-2 rounded-r-xl">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-3 py-1 rounded-lg text-xs transition"
                  >
                    ✏️ Edit
                  </button>
                  {currentUser?.role === "admin" && (
                    <button
                      onClick={() => confirmDelete(item.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 rounded-lg text-xs transition"
                    >
                      🗑️ Hapus
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 dark:text-gray-400 py-6">
                  😕 Tidak ada jadwal piket.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-sm text-black dark:text-white shadow-xl">
            <h2 className="text-xl font-bold mb-3 text-red-600 flex items-center gap-2">
              🗑️ Konfirmasi Hapus
            </h2>
            <p className="mb-5">Apakah kamu yakin ingin menghapus jadwal ini?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
              >
                Hapus
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}