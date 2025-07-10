"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UpdateForm({ attendance, onDone }: { attendance: any; onDone: () => void }) {
  const [form, setForm] = useState(attendance);
  const supabase = createClient();

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("attendances")
      .update(form)
      .eq("id", form.id);

    if (error) alert(error.message);
    else {
      alert("✅ Absensi berhasil diperbarui!");
      onDone();
    }
  };

  return (
    <form
      onSubmit={handleUpdate}
      className="space-y-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 p-6 rounded-xl shadow-md transition-all"
    >
      <h2 className="text-lg font-semibold mb-2">✏️ Perbarui Absensi</h2>

      {/* Tanggal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📅 Tanggal</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Check In */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">🕐 Waktu Masuk</label>
        <input
          type="time"
          value={form.check_in}
          onChange={(e) => setForm({ ...form, check_in: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Check Out */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">🕔 Waktu Pulang</label>
        <input
          type="time"
          value={form.check_out}
          onChange={(e) => setForm({ ...form, check_out: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Keterangan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📝 Keterangan</label>
        <input
          type="text"
          placeholder="Contoh: Hadir tepat waktu"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📌 Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="HADIR">HADIR</option>
          <option value="IZIN">IZIN</option>
          <option value="ALPA">ALPA</option>
        </select>
      </div>

      {/* Tombol Simpan */}
      <button
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-md hover:shadow-lg"
      >
        💾 Simpan Perubahan
      </button>
    </form>
  );
}
