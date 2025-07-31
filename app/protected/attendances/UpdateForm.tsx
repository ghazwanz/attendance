"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UpdateForm({
  attendance,
  onDone,
}: {
  attendance: any;
  onDone: () => void;
}) {
  const supabase = createClient();

  // Fungsi untuk mengubah date ISO menjadi HH:mm lokal
  const getLocalTime = (isoString: string) => {
    const d = new Date(isoString);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const [form, setForm] = useState({
    ...attendance,
    check_in: attendance.check_in ? getLocalTime(attendance.check_in) : "",
    check_out: attendance.check_out ? getLocalTime(attendance.check_out) : "",
  });

  const [showToast, setShowToast] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);

  // Fungsi untuk menggabungkan date + time jadi Date lokal
  const localDateTime = (date: string, time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const dt = new Date(date);
    dt.setHours(hours);
    dt.setMinutes(minutes);
    dt.setSeconds(0);
    dt.setMilliseconds(0);
    return dt;
  };

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    setTimeError(null);

    const checkInTime = form.check_in ? localDateTime(form.date, form.check_in) : null;
    const checkOutTime = form.check_out ? localDateTime(form.date, form.check_out) : null;

    if (checkInTime && checkOutTime && checkOutTime < checkInTime) {
      setTimeError("❌ Waktu pulang tidak boleh lebih awal dari waktu masuk!");
      return;
    }

    const { error } = await supabase
      .from("attendances")
      .update({
        date: form.date,
        check_in: checkInTime?.toISOString() || null,
        check_out: checkOutTime?.toISOString() || null,
        notes: form?.notes,
        status: form.status,
      })
      .eq("id", form.id);

    if (!error) {
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        onDone(); // Tutup modal & refresh
      }, 2000);
    } else {
      alert("❌ " + error.message);
    }
  };

  return (
    <>
      {/* Notifikasi Sukses */}
      {showToast && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg text-sm animate-bounce">
            ✅ Absensi berhasil diperbarui!
          </div>
        </div>
      )}

      <form
        onSubmit={handleUpdate}
        className="space-y-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 p-6 rounded-xl shadow-md transition-all"
      >
        <h2 className="text-lg font-semibold mb-2">✏️ Perbarui Absensi</h2>

        {/* Tanggal */}
        <input
          type="date"
          value={form.date}
          disabled
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white cursor-not-allowed"
        />

        {/* Check In */}
        <input
          type="time"
          value={form.check_in}
          disabled
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white cursor-not-allowed"
        />

        {/* Check Out */}
        <input
          type="time"
          value={form.check_out}
          disabled
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white cursor-not-allowed"
        />

        {/* Keterangan */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            📝 Keterangan
          </label>
          <input
            type="text"
            placeholder="Contoh: Hadir tepat waktu"
            value={form.notes || ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            📌 Status
          </label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="HADIR">HADIR</option>
            <option value="IZIN">IZIN</option>
          </select>

          {timeError && (
            <p className="text-[#ff4d4f] text-sm mt-4 font-semibold">
              {timeError}
            </p>
          )}
        </div>

        {/* Tombol Simpan */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-md hover:shadow-lg"
        >
          💾 Simpan Perubahan
        </button>
      </form>
    </>
  );
}
