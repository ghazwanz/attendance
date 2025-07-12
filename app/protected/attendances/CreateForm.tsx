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

  const handleCheckIn = async (status: string) => {
    const now = new Date();
    const nowISO = now.toISOString();

    // Batas waktu masuk: 08:00
    const batasMasuk = new Date();
    batasMasuk.setHours(8, 0, 0, 0); // jam 08:00:00

    // Cek keterlambatan jika status HADIR
    let finalStatus = status;
    if (status === "HADIR" && now > batasMasuk) {
      finalStatus = "TERLAMBAT";
    }

    setForm({ status: finalStatus });

    const { error, data } = await supabase
      .from("attendances")
      .insert([
        {
          user_id: userId,
          date: today,
          check_in: nowISO,
          check_out: null,
          notes: null,
          status: finalStatus,
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
        <div className="space-y-5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 p-6 rounded-xl shadow-md transition-all">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            📥 Absensi Masuk
          </h2>

          {/* Tombol Pilih Status Kehadiran */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              📌 Pilih Status Kehadiran
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleCheckIn("HADIR")}
                className="flex-1 py-2 rounded-lg font-semibold text-white transition-all bg-green-600 hover:bg-green-700"
              >
                ✅ HADIR
              </button>
              <button
                type="button"
                onClick={() => handleCheckIn("IZIN")}
                className="flex-1 py-2 rounded-lg font-semibold text-white transition-all bg-yellow-500 hover:bg-yellow-600"
              >
                📄 IZIN
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}