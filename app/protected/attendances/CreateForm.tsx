"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CreateForm({ onRefresh }: { onRefresh: () => void }) {
  const supabase = createClient();

  const [form, setForm] = useState({ status: "HADIR" });
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [attendanceId, setAttendanceId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false); // ✅ Tambahkan state error

  const today = new Date().toISOString().split("T")[0];
  const allowedIP = "125.166.12.91"; // Ganti dengan IP kantor kamu

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
        if (data.check_in) {
          setIsFinished(true);
        }
        setForm({ status: data.status || "HADIR" });
      }
    };

    init();
  }, [supabase, today]);

  const handleCheckIn = async (status: string) => {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const ipData = await res.json();
      const currentIP = ipData.ip;

      if (currentIP !== allowedIP) {
        setShowError(true); // ✅ Tampilkan notifikasi error
        setTimeout(() => setShowError(false), 3000);
        return;
      }

      const now = new Date();
      const nowISO = now.toISOString();

      const batasMasuk = new Date();
      batasMasuk.setHours(8, 0, 0, 0); // jam 08:00:00

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
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
          setIsFinished(true);
        }, 2000);

        onRefresh();
      }
    } catch (error) {
      alert("Gagal memeriksa IP.");
    }
  };

  return (
    <>
      {/* ✅ Pop-up Notifikasi Sukses */}
      {showSuccess && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg text-sm animate-bounce">
            ✅ Absensi berhasil disimpan!
          </div>
        </div>
      )}

      {/* ❌ Pop-up Notifikasi Gagal */}
      {showError && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg text-sm animate-bounce">
            ❌ Absensi hanya bisa dilakukan di jaringan kantor!
          </div>
        </div>
      )}

      {/* ✅ Jika absensi sudah selesai */}
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
            <div className="sm:flex-row flex gap-3 flex-col">
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
