"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface JadwalPiket {
  id: string;
  user_id: string;
  created_at: string;
  users?: { name: string };
  schedules?: { day: string };
}

interface User {
  id: string;
  name: string;
}

export default function JadwalPiketPage() {
  const supabase = createClient();
  const [data, setData] = useState<JadwalPiket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ user_id: "", hari: "Selasa" });

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
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
      .select("*, users(name), schedules(day)");
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
    setForm({ user_id: "", hari: "Selasa" });
    setEditingId(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if(currentUser?.role !== "admin"){
      toast.error("Anda tidak dapat melakukan aksi ini")
    }

    if (!form.user_id || !form.hari) {
      toast.error("❌ Lengkapi semua field terlebih dahulu.");
      return;
    }

    const { data: jadwalData } = await supabase
      .from("schedules")
      .select("id, day")
      .eq("day", form.hari.toLowerCase())
      .single();

    if (!jadwalData?.id) {
      toast.error("❌ Hari yang dipilih tidak valid.");
      return;
    }

    const { data: existing, error: existingError } = await supabase
      .from("piket")
      .select("*")
      .eq("user_id", form.user_id);

    if (existingError) {
      toast.error("❌ Gagal memeriksa data user.");
      return;
    }

    // Cek jika user sudah punya jadwal lain
    if (!editingId && existing && existing.length > 0) {
      toast.error("❌ User sudah memiliki jadwal piket.");
      return;
    }

    if (editingId && existing && existing.some((j) => j.id !== editingId)) {
      toast.error("❌ User hanya boleh memiliki satu jadwal piket.");
      return;
    }

    if (editingId) {
      const { error: updateError } = await supabase
        .from("piket")
        .update({
          user_id: form.user_id,
          jadwal_id: jadwalData.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId);

      if (updateError) {
        toast.error("❌ Gagal memperbarui jadwal.");
        return;
      }

      toast.success("✅ Jadwal berhasil diperbarui!");
      setShowEditForm(false);
    } else {
      const { error: insertError } = await supabase
        .from("piket")
        .insert({
          user_id: form.user_id,
          jadwal_id: jadwalData.id,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        toast.error("❌ Gagal menambahkan jadwal.");
        return;
      }

      toast.success("✅ Jadwal berhasil ditambahkan!");
      setShowAddForm(false);
    }

    resetForm();
    fetchData();
  }

  function handleEdit(item: JadwalPiket) {
    setShowEditForm(true);
    setEditingId(item.id);
    setForm({
      user_id: item.user_id,
      hari: item.schedules?.day || "",
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
    const hari = item.schedules?.day?.toLowerCase() || "";
    return (
      !searchTerm ||
      name.includes(searchTerm.toLowerCase()) ||
      hari.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="w-full max-w-screen-xl mx-auto px-6 py-8 text-black dark:text-white">
      <h1 className="text-4xl font-bold mb-8 text-blue-700 dark:text-white">📅 Jadwal Piket</h1>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        {
          currentUser?.role === "admin" && (
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110 text-white font-semibold px-5 py-2 rounded-xl shadow"
            >
              ➕ Tambah Jadwal
            </button>
          )
        }

        <div className="flex gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="🔍 Cari nama/hari..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-56 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {showAddForm && (
        <ModalForm
          title="➕ Tambah Jadwal"
          buttonLabel="💾 Simpan"
          buttonColor="bg-green-600 hover:bg-green-700"
          onClose={() => setShowAddForm(false)}
          onSubmit={handleSubmit}
          users={users}
          form={form}
          handleChange={handleChange}
        />
      )}

      {showEditForm && (
        <ModalForm
          title="✏️ Edit Jadwal"
          buttonLabel="💾 Update"
          buttonColor="bg-yellow-500 hover:bg-yellow-600"
          onClose={() => setShowEditForm(false)}
          onSubmit={handleSubmit}
          users={users}
          form={form}
          handleChange={handleChange}
        />
      )}

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full border-separate text-center border-spacing-y-4 text-sm text-gray-800 dark:text-gray-100">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm uppercase">
                <th className="px-6 py-3 rounded-l-xl">No.</th>
                <th className="px-6 py-3">👤 Nama</th>
                <th className="px-6 py-3">📅 Hari</th>
                {
                  currentUser?.role === "admin" &&
                  <th className="px-6 py-3 rounded-r-xl">⚙️ Aksi</th>
                }
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`transition duration-150 ${idx % 2 === 0
                      ? "bg-white dark:bg-slate-800"
                      : "bg-blue-50 dark:bg-slate-700"
                      } hover:bg-gray-100 dark:hover:bg-slate-600`}
                  >
                    <td className="px-6 py-4 rounded-l-xl font-semibold">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">👤</span>
                        <span>{item.users?.name || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-white">
                        {item.schedules?.day?.toUpperCase() || "-"}
                      </span>
                    </td>
                    {currentUser?.role === "admin" && (
                      <td className="px-6 py-4 rounded-r-xl flex items-center justify-center gap-2">
                        <>
                          <button
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => confirmDelete(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 rounded-lg text-xs shadow"
                          >
                            🗑 Delete
                          </button>
                        </>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={currentUser?.role === "admin" ? 4 : 3} className="py-10 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-4xl">📭</div>
                      <div className="text-sm">Belum ada jadwal piket.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold mb-3 text-red-600 flex items-center gap-2">🗑️ Konfirmasi Hapus</h2>
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

function ModalForm({
  title,
  onClose,
  onSubmit,
  users,
  form,
  handleChange,
  buttonLabel,
  buttonColor,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  users: User[];
  form: { user_id: string; hari: string };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  buttonLabel: string;
  buttonColor: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-xl font-bold">✖️</button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <select
            name="user_id"
            value={form.user_id}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">👤 Pilih User</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <select
            name="hari"
            value={form.hari}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
          >
            {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <div className="flex justify-end gap-3 mt-4">
            <button type="submit" className={`${buttonColor} text-white font-semibold py-2 px-6 rounded-lg`}>
              {buttonLabel}
            </button>
            <button type="button" onClick={onClose} className="border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-lg">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}