"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CreateForm({ onRefresh }: { onRefresh: () => void }) {
  const supabase = createClient();

  const [form, setForm] = useState({
    status: "HADIR",
  });

  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [attendanceId, setAttendanceId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
        .select("id, check_in, check_out, status")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      if (data) {
        setAttendanceId(data.id);
        setHasCheckedIn(!!data.check_in && !data.check_out);

        if (data.check_in && data.check_out) {
          setIsFinished(true);
        }

        setForm({
          status: data.status || "HADIR",
        });
      }
    };

    init();
  }, [supabase, today]);

  const handleCheckIn = async (e: any) => {
    e.preventDefault();
    const now = new Date().toISOString();

    const { error, data } = await supabase
      .from("attendances")
      .insert([
        {
          user_id: userId,
          date: today,
          check_in: now,
          check_out: null,
          notes: null,
          status: form.status,
        },
      ])
      .select()
      .single();

    if (error) {
      alert("❌ Gagal absen masuk: " + error.message);
    } else {
      setAttendanceId(data.id);
      setHasCheckedIn(true);
      setIsFinished(true);
      setShowSuccess(true);

      setTimeout(() => setShowSuccess(false), 2000);

      onRefresh();
    }
  };

  return (
    <>
      {/* ✅ Pop-up Notifikasi Disamakan */}
      {showSuccess && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg text-sm animate-bounce">
            ✅ Absensi berhasil disimpan!
          </div>
        </div>
      )}

      {/* Jika sudah selesai absen */}
      {isFinished ? (
        <div className="p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl shadow-md text-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            ✅ Absensi Hari Ini Telah Diselesaikan
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Terima kasih! Anda sudah mengisi absensi masuk hari ini.
          </p>
        </div>
      ) : (
        // Form absensi masuk
        <form
          onSubmit={handleCheckIn}
          className="space-y-5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 p-6 rounded-xl shadow-md transition-all"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            📥 Absensi Masuk
          </h2>

          {/* Status Kehadiran */}
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

          {/* Tombol Simpan */}
          <button
            type="submit"
            className="w-full py-3 font-semibold rounded-lg transition-all shadow-md hover:shadow-lg text-white bg-blue-600 hover:bg-blue-700"
          >
            💾 Simpan Absensi Masuk
          </button>
        </form>
      )}
    </>
  );
}
