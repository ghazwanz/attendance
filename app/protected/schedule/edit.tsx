// components/EditModal.tsx
"use client";
import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { Schedule } from "@/lib/type";

export default function EditModal({
  item,
  onClose,
  onSave,
  isAdmin,
}: {
  item: Schedule;
  onClose: () => void;
  onSave: (updatedItem: Schedule) => void;
  isAdmin: boolean;
}) {
  if (!isAdmin) return null;

  const [day, setDay] = useState(item.day);
  const [start, setStart] = useState(item.start_time);
  const [end, setEnd] = useState(item.end_time);
  const [breakStart, setBreakStart] = useState(item.mulai_istirahat);
  const [breakEnd, setBreakEnd] = useState(item.selesai_istirahat);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (end <= start) {
      setErrorMsg("❌ Jam pulang tidak boleh lebih awal dari jam masuk!");
      return;
    }

    if (breakEnd && breakStart && breakEnd <= breakStart) {
      setErrorMsg(
        "❌ Waktu selesai istirahat tidak boleh lebih awal dari waktu mulai istirahat!"
      );
      return;
    }

    setErrorMsg(""); // reset error jika valid
    onSave({
      ...item,
      day,
      start_time: start,
      end_time: end,
      mulai_istirahat: breakStart,
      selesai_istirahat: breakEnd,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 p-6 rounded-xl shadow-md transition-all w-full max-w-sm"
      >
        <h2 className="text-lg font-semibold mb-2">✏️ Edit Jadwal</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            🗓 Hari
          </label>
          <input
            type="text"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ⏰ Waktu Mulai
          </label>
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ⌛ Waktu Selesai
          </label>
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ⌛ Waktu Istirahat Mulai
          </label>
          <input
            type="time"
            value={breakStart || ""}
            onChange={(e) => setBreakStart(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ⌛ Waktu Istirahat Selesai
          </label>
          <input
            type="time"
            value={breakEnd || ""}
            onChange={(e) => setBreakEnd(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {errorMsg && (
          <p className="text-red-600 text-sm font-semibold">{errorMsg}</p>
        )}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-slate-700 dark:text-white rounded-lg hover:bg-gray-300"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
