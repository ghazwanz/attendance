'use client';

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import CreateForm from "./CreateForm";
import UpdateForm from "./UpdateForm";

export default function Page() {
  const supabase = createClient();
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("attendances")
      .select("*, users(name)");
    if (!error) setData(data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen py-10 px-4 bg-white dark:bg-slate-900 text-black dark:text-white transition-colors">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Judul Halaman */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-1">📊 Absensi Karyawan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kelola data kehadiran harian secara efisien dan akurat.
          </p>
        </div>

        {/* Form Absensi */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-white/10">
          <h2 className="text-xl font-semibold mb-4">📝 Form Absensi</h2>
          <CreateForm onRefresh={fetchData} />
        </div>

        {/* Tabel Kehadiran */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-white/10">
          <h2 className="text-xl font-semibold mb-4">📋 Tabel Kehadiran</h2>
          <div className="overflow-x-auto rounded-md">
            <table className="min-w-full text-sm border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-blue-600 text-white text-xs uppercase">
                  <th className="py-3 px-4 rounded-tl-lg">No</th>
                  <th className="py-3 px-4">Nama</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Check-in</th>
                  <th className="py-3 px-4">Check-out</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-tr-lg">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => (
                  <tr
                    key={item.id}
                    className={`transition duration-150 ${i % 2 === 0
                      ? "bg-white dark:bg-slate-800"
                      : "bg-blue-50 dark:bg-slate-700"
                      } hover:bg-gray-100 dark:hover:bg-slate-600`}
                  >
                    <td className="py-2 px-4">{i + 1}</td>
                    <td className="py-2 px-4 uppercase">{item.users?.name || "Tanpa Nama"}</td>
                    <td className="py-2 px-4">{item.date}</td>
                    <td className="py-2 px-4">
                      <span className="bg-yellow-200 text-yellow-900 px-2 py-1 rounded-full font-mono text-xs">
                        {item.check_in?.slice(0, 5) || "-"}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <span className="bg-blue-200 text-blue-900 px-2 py-1 rounded-full font-mono text-xs">
                        {item.check_out?.slice(0, 5) || "-"}
                      </span>
                    </td>
                    <td className="py-2 px-4">{item.notes || "-"}</td>
                    <td className="py-2 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === "HADIR"
                          ? "bg-green-200 text-green-800"
                          : item.status === "IZIN"
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-red-200 text-red-800"
                          }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => setSelected(item)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Update */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg max-w-md w-full relative">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-2 right-2 text-sm text-gray-400 hover:text-red-500"
              >
                ✖
              </button>
              <h2 className="text-lg font-bold mb-4">✏️ Edit Absensi</h2>
              <UpdateForm
                attendance={selected}
                onDone={() => {
                  setSelected(null);
                  fetchData();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
