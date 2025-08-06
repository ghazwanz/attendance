"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Reminder } from "@/lib/type";

export default function ReminderPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reminder List</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Title</th>
              <th className="border px-4 py-2">Message</th>
              <th className="border px-4 py-2">Jadwal</th>
              <th className="border px-4 py-2">Type</th>
              <th className="border px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {reminders.map((r) => (
              <tr key={r.id}>
                <td className="border px-4 py-2">{r.title}</td>
                <td className="border px-4 py-2">{r.message}</td>
                <td className="border px-4 py-2">{new Date(r.jadwal).toLocaleString()}</td>
                <td className="border px-4 py-2">{r.type}</td>
                <td className="border px-4 py-2 space-x-2">
                  {/* Nanti tambahkan edit */}
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-red-500 hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
