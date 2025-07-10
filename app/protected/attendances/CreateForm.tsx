"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CreateForm({ onRefresh }: { onRefresh: () => void }) {
  const supabase = createClient();

  const [form, setForm] = useState({
    notes: "",
    status: "HADIR",
  });

  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [attendanceId, setAttendanceId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserId(user.id);

      const { data } = await supabase
        .from("attendances")
        .select("id, check_in, check_out")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      if (data) {
        setAttendanceId(data.id);
        setHasCheckedIn(!!data.check_in && !data.check_out);
      }
    };

    init();
  }, [supabase, today]);

  const handleCheckIn = async (e: any) => {
    e.preventDefault();
    const now = new Date().toTimeString().split(" ")[0];

    const { error, data } = await supabase
      .from("attendances")
      .insert([
        {
          user_id: userId,
          date: today,
          check_in: now,
          check_out: null,
          notes: form.notes,
          status: form.status,
        },
      ])
      .select()
      .single();

    if (error) {
      alert("❌ Gagal absen masuk: " + error.message);
    } else {
      alert("✅ Absensi masuk berhasil!");
      setAttendanceId(data.id);
      setHasCheckedIn(true);
      onRefresh();
    }
  };

  const handleCheckOut = async (e: any) => {
    e.preventDefault();
    const now = new Date().toTimeString().split(" ")[0];

    if (!attendanceId) {
      alert("❌ Data absensi tidak ditemukan.");
      return;
    }

    const { error } = await supabase
      .from("attendances")
      .update({ check_out: now })
      .eq("id", attendanceId);

    if (error) {
      alert("❌ Gagal absen pulang: " + error.message);
    } else {
      alert("✅ Absensi pulang berhasil!");
      setHasCheckedIn(false);
      onRefresh();
    }
  };

  return (
    <form
      onSubmit={hasCheckedIn ? handleCheckOut : handleCheckIn}
      className="space-y-5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 p-6 rounded-xl shadow-md transition-all"
    >
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
        {hasCheckedIn ? "📤 Absensi Pulang" : "📥 Absensi Masuk"}
      </h2>

      {!hasCheckedIn && (
        <>
          {/* Keterangan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ✍️ Keterangan
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Hadir tepat waktu, izin, dll."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              📌 Status Kehadiran
            </label>
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
        </>
      )}

      {/* Tombol Simpan */}
      <button
        type="submit"
        className={`w-full py-3 font-semibold rounded-lg transition-all shadow-md hover:shadow-lg text-white ${
          hasCheckedIn
            ? "bg-green-600 hover:bg-green-700"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {hasCheckedIn ? "💾 Simpan Absensi Pulang" : "💾 Simpan Absensi Masuk"}
      </button>
    </form>
  );
}
