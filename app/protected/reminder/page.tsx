"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


interface Reminder {
  id: string;
  title: string;
  message: string;
  jadwal: string;
  type: string;
  created_at?: string;
}

export default function ReminderPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Reminder | undefined>(undefined);
  const [userRole, setUserRole] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchReminders = async () => {
      const { data, error } = await supabase
        .from("reminder")
        .select("*")
        .order("jadwal", { ascending: true });

      if (error) {
        toast.error("Gagal mengambil data reminder");
      } else {
        setReminders(data || []);
      }

      setLoading(false);
    };

    const fetchUserRole = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;
      const { data: userInfo } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();
      setUserRole(userInfo?.role || null);
    };

    fetchReminders();
    fetchUserRole();
  }, []);

  const handleDelete = (id: string) => {
    toast(
      ({ closeToast }) => (
        <div>
          <p>Yakin ingin menghapus reminder ini?</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                const { error } = await supabase.from("reminder").delete().eq("id", id);
                if (error) {
                  toast.error("Gagal menghapus reminder");
                } else {
                  setReminders((prev) => prev.filter((r) => r.id !== id));
                  toast.success("Reminder berhasil dihapus");
                }
                closeToast?.();
              }}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Ya, Hapus
            </button>
            <button
              onClick={closeToast}
              className="bg-gray-300 px-3 py-1 rounded"
            >
              Batal
            </button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
  };

  const handleSave = async (
    data: Omit<Reminder, "id" | "created_at">,
    id?: string
  ) => {
    if (id) {
      const { error } = await supabase.from("reminder").update(data).eq("id", id);

      if (error) {
        toast.error("Gagal mengupdate reminder");
        return;
      }

      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...data } : r))
      );
      toast.success("Reminder berhasil diperbarui");
    } else {
      const { data: inserted, error } = await supabase
        .from("reminder")
        .insert([{ ...data, created_at: new Date().toISOString() }])
        .select();

      if (error) {
        toast.error("Gagal menambahkan reminder");
        return;
      }

      if (inserted && inserted.length > 0) {
        setReminders((prev) => [...prev, inserted[0]]);
        toast.success("Reminder berhasil ditambahkan");
      }
    }

    setShowModal(false);
    setEditing(undefined);
  };

  return (
    <div className="p-6">
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Reminder List</h1>
        {userRole === "admin" && (
          <button
            onClick={() => {
              setEditing(undefined);
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Tambah
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full text-sm border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-blue-600 text-white text-xs uppercase">
              <th className="py-3 px-4 rounded-tl-lg">Title</th>
              <th className="py-3 px-4">Message</th>
              <th className="py-3 px-4">Jadwal</th>
              <th className="py-3 px-4">Type</th>
              {userRole === "admin" && <th className="py-3 px-4 rounded-tr-lg">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {reminders.length === 0 ? (
              <tr>
                <td colSpan={userRole === "admin" ? 5 : 4} className="text-center py-4 text-gray-500">
                  🚫 Tidak ada notifikasi
                </td>
              </tr>
            ) : (
              reminders.map((r) => (
                <tr key={r.id}>
                  <td className="border px-4 py-2">{r.title}</td>
                  <td className="border px-4 py-2">{r.message}</td>
                  <td className="border px-4 py-2">{r.jadwal?.slice(0, 5)}</td>
                  <td className="border px-4 py-2">{r.type}</td>
                  {userRole === "admin" && (
                    <td className="border px-4 py-2 space-x-2">
                      <button
                        onClick={() => {
                          setEditing(r);
                          setShowModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                      >
                        🗑 Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <ReminderModal
          initialData={editing}
          onClose={() => {
            setShowModal(false);
            setEditing(undefined);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}


function ReminderModal({
  initialData,
  onClose,
  onSave,
}: {
  initialData?: Reminder;
  onClose: () => void;
  onSave: (data: Omit<Reminder, "id" | "created_at">, id?: string) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    message: "",
    jadwal: "",
    type: "reminder",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        message: initialData.message,
        jadwal: initialData.jadwal?.slice(0, 5),
        type: initialData.type,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(form, initialData?.id);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-black dark:text-white">
          {initialData ? "Edit Reminder" : "Tambah Reminder"}
        </h2>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-white -mb-1">
            Judul
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Judul"
            className="w-full border px-3 py-2 rounded dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
          <label className="block text-sm font-medium text-white -mb-1">
            Pesan
          </label>
          <input
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Pesan"
            className="w-full border px-3 py-2 rounded dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
          <label className="block text-sm font-medium text-white -mb-1">
            Waktu (HH:MM)
          </label>
          <input
            name="jadwal"
            type="time"
            value={form.jadwal}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
          <label className="block text-sm font-medium text-white -mb-1">
            Tipe
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <option value="reminder">Reminder</option>
            <option value="izin">Alert</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="text-gray-500">
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded border border-blue-600"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}  
