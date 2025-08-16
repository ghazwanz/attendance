"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UpdateForm({
  attendance,
  onDone,
  userRole,
  onClose,
}: {
  attendance: any;
  onDone: () => void;
  userRole?: string;
  onClose?: () => void;
}) {
  const supabase = createClient();

  const getLocalTime = (isoString: string) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getLocalDate = (isoString: string) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toISOString().split("T")[0];
  };

  const [form, setForm] = useState({
    ...attendance,
    date: attendance.date ? getLocalDate(attendance.date) : "",
    check_in: attendance.check_in ? getLocalTime(attendance.check_in) : "",
    check_out: attendance.check_out ? getLocalTime(attendance.check_out) : "",
  });

  const [showToast, setShowToast] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);

  const localDateTimeToISO = (date: string, time: string) => {
    if (!date || !time) return null;
    const [hours, minutes] = time.split(":").map(Number);
    const dt = new Date(date);
    dt.setHours(hours);
    dt.setMinutes(minutes);
    dt.setSeconds(0);
    dt.setMilliseconds(0);
    return dt.toISOString();
  };

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    setTimeError(null);

    const checkInISO = form.check_in
      ? localDateTimeToISO(form.date, form.check_in)
      : null;
    const checkOutISO = form.check_out
      ? localDateTimeToISO(form.date, form.check_out)
      : null;
    const dateISO = form.date
      ? new Date(form.date + "T00:00:00Z").toISOString()
      : null;

    if (checkInISO && checkOutISO && checkOutISO < checkInISO) {
      setTimeError("❌ Waktu pulang tidak boleh lebih awal dari waktu masuk!");
      return;
    }

    const { data: dupe } = await supabase
      .from("attendances")
      .select("id")
      .eq("user_id", form.user_id)
      .eq("date", dateISO)
      .neq("id", form.id)
      .maybeSingle();

    if (dupe) {
      setTimeError("❌ Sudah ada absensi untuk tanggal ini!");
      return;
    }

    const { error } = await supabase
      .from("attendances")
      .update({
        user_id: form.user_id,
        date: dateISO,
        check_in: checkInISO,
        check_out: checkOutISO,
        notes: form?.notes,
        status: userRole === "admin" ? form.status : form.status, // status hanya bisa diedit oleh admin
      })
      .eq("id", form.id);

    if (!error) {
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        onDone();
      }, 2000);
    } else {
      alert("❌ Gagal update absensi: " + JSON.stringify(error));
    }
  };

  return (
    <>
      {showToast && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg text-sm animate-bounce">
            ✅ Absensi berhasil diperbarui!
          </div>
        </div>
      )}


      <form
        onSubmit={handleUpdate}
        className="space-y-4 bg-white relative w-full max-w-md dark:bg-slate-800 border border-gray-200 dark:border-white/10 p-6 rounded-xl shadow-md transition-all"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-sm text-gray-400 hover:text-red-500"
        >
          ✖
        </button>
        <h2 className="text-lg font-semibold mb-2">✏️ Perbarui Absensi</h2>

        {/* TANGGAL */}
        <div>
          <label className="block text-sm font-medium mb-1">Tanggal</label>
          {userRole === "admin" ? (
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white"
            />
          ) : (
            <p className="px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-md text-sm text-gray-800 dark:text-white">
              {form.date}
            </p>
          )}
        </div>

        {/* CHECK-IN */}
        <div>
          <label className="block text-sm font-medium mb-1">Check-in</label>
          {userRole === "admin" ? (
            <input
              type="time"
              value={form.check_in}
              onChange={(e) => setForm({ ...form, check_in: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white"
            />
          ) : (
            <p className="px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-md text-sm text-gray-800 dark:text-white">
              {form.check_in || "-"}
            </p>
          )}
        </div>

        {/* CHECK-OUT */}
        <div>
          <label className="block text-sm font-medium mb-1">Check-out</label>
          {userRole === "admin" ? (
            <input
              type="time"
              value={form.check_out}
              onChange={(e) => setForm({ ...form, check_out: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-black dark:text-white"
            />
          ) : (
            <p className="px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-md text-sm text-gray-800 dark:text-white">
              {form.check_out || "-"}
            </p>
          )}
        </div>
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
            disabled={
              userRole !== "admin" && attendance.user_id !== form.user_id
            }
          />
        </div>

        {/* Tampilkan status hanya untuk admin */}
        {userRole === "admin" ? (
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
              <option value="TERLAMBAT">TERLAMBAT</option>
              <option value="ALPA">ALPA</option>
            </select>
          </div>
        ) : (
          <p className="px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-md text-sm text-gray-800 dark:text-white">
            {form.status}
          </p>
        )}

        {timeError && (
          <p className="text-[#ff4d4f] text-sm mt-4 font-semibold">
            {timeError}
          </p>
        )}

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
