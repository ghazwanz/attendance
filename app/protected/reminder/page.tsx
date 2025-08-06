"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { title } from "process";

export default function ReminderPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchReminders = async () => {
      const { data, error } = await supabase
        .from("reminder")
        .select("*")
        .order("jadwal", { ascending: true });

      if (error) {
        console.error("Error fetching:", error);
      } else {
        setReminders(data);
      }

      setLoading(false);
    };

    fetchReminders();
  }, []);

  const handleDelete = async (id: string) => {
    await supabase.from("reminder").delete().eq("id", id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSave = async (data: any, id?: string) => {
    console.log("Saving data:", data, "ID:", id);
    if (id) {
      const { error } = await supabase
        .from("reminder")
        .update(data)
        .eq("id", id);
      if (error) return console.error("Update error:", error);
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...data } : r))
      );
    } else {
      const { data: newReminder, error } = await supabase
        .from("reminder")
        .insert([
          {
            title: data.title,
            message: data.message,
            jadwal: data.jadwal,
            type: data.type,
            created_at: new Date().toISOString(),
          },
        ]);
      if (error) return console.error("Insert error:", error);
      setReminders((prev) => [...prev, newReminder]);
    }

    setShowModal(false);
    setEditing(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Reminder List</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded border border-blue-600"
        >
          + Tambah
        </button>
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
              <th className="py-3 px-4 rounded-tr-lg">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {reminders.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
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
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      onClick={() => {
                        setEditing(r);
                        setShowModal(true);
                      }}
                      className="text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-red-500 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <ReminderModal
          initialData={editing ?? undefined}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
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
  initialData?: any;
  onClose: () => void;
  onSave: (data: Omit<any, "id" | "created_at">, id?: string) => void;
}) {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    message: initialData?.message || "",
    jadwal: initialData?.jadwal?.slice(0, 16) || "",
    type: initialData?.type || "reminder",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const payload = {
      title: form.title,
      message: form.message,
      jadwal: form.jadwal, // ✅ kirim langsung "08:00"
      type: form.type,
    };

    onSave(payload, initialData?.id);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-black dark:text-white">
          {initialData ? "Edit Reminder" : "Tambah Reminder"}
        </h2>

        <div className="space-y-3">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Judul"
            className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white px-3 py-2 rounded"
          />
          <input
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Pesan"
            className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white px-3 py-2 rounded"
          />
          <input
            name="jadwal"
            type="time"
            value={form.jadwal}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white px-3 py-2 rounded"
          />
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white"
          >
            <option value="reminder">Reminder</option>
            <option value="alert">Alert</option>
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
