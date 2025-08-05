"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CreateForm({
  onRefresh,
  userRole,
}: {
  onRefresh: () => void;
  userRole: string;
}) {
  const supabase = createClient();

  const [form, setForm] = useState({ status: "HADIR" });
  const [attendanceId, setAttendanceId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showIzinModal, setShowIzinModal] = useState(false);
  const [izinReason, setIzinReason] = useState("");

  const today = new Date().toISOString().split("T")[0];
  // const allowedIP = ["125.166.12.91", "125.166.1.71"]; // Ganti sesuai IP kantor

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
        setForm({ status: data.status || "HADIR" });
        setIsFinished(true);
      }
    };

    init();
  }, [supabase, today]);

  const handleCheckIn = async (status: string, notes: string | null = null) => {
    try {

      const now = new Date();
      const nowISO = now.toISOString();

      const batasMasuk = new Date();
      batasMasuk.setHours(8, 0, 0, 0);

      let finalStatus = status;
      if (status && now > batasMasuk) {
        finalStatus = "TERLAMBAT";
      }

      setForm({ status: finalStatus });

      const { error, data } = await supabase
        .from("attendances")
        .insert([
          {
            user_id: userId,
            date: today,
            check_in: status === "IZIN" ? null : nowISO,
            check_out: null,
            notes,
            status: finalStatus,
          },
        ])
        .select()
        .single();

      if (error) {
        alert("❌ Gagal absen masuk: " + error.message);
      } else {
        setAttendanceId(data.id);
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
      {/* ✅ Notifikasi Sukses */}
      {showSuccess && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg text-sm animate-bounce">
            ✅ Absensi berhasil disimpan!
          </div>
        </div>
      )}

      {/* 🟡 Modal Alasan Izin */}
      {showIzinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              📄 Masukkan Alasan Izin
            </h3>
            <textarea
              rows={3}
              placeholder="Contoh: Sakit, urusan keluarga, dll."
              className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white"
              value={izinReason}
              onChange={(e) => setIzinReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowIzinModal(false)}
                className="px-4 py-2 rounded-lg text-sm bg-gray-300 hover:bg-gray-400 text-black"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  handleCheckIn("IZIN", izinReason);
                  setShowIzinModal(false);
                }}
                className="px-4 py-2 rounded-lg text-sm bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Kirim Izin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Tampilan Berdasarkan Role */}
      {userRole === "admin" ? (
        <div className="p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl shadow-md text-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            🔧 Akses Admin
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Gunakan tombol "Tambah Absen" untuk menambah data manual.
          </p>
        </div>
      ) : isFinished ? (
        <div className="p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl shadow-md text-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            ✅ Absensi Hari Ini Telah Diselesaikan
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Terima kasih! Anda sudah mengisi absensi hari ini.
          </p>
        </div>
      ) : (
        <div className="space-y-5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 p-6 rounded-xl shadow-md transition-all">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            📥 Absensi Masuk
          </h2>

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
                onClick={() => setShowIzinModal(true)}
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
