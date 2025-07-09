import React from "react";
import attendance from "@/lib/dummyData.json";

const absensiData = attendance.attendances;

export default function TabelAbsensi() {
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto bg-zinc-900 rounded-2xl shadow-xl p-6">
        <h1 className="text-3xl font-bold text-blue-500 mb-6 border-b border-indigo-500 pb-3">
          Daftar Kehadiran Siswa
        </h1>

        <div className="overflow-x-auto rounded-xl shadow-sm">
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead className="bg-indigo-500 text-white uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Check-in</th>
                <th className="px-4 py-3 text-left">Check-out</th>
                <th className="px-4 py-3 text-left">Keterangan</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {absensiData.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-zinc-800 transition-all border-b border-indigo-500"
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {item.nama || "Tanpa Nama"}
                  </td>
                  <td className="px-4 py-3 text-white">{item.date}</td>
                  <td className="px-4 py-3 text-white">
                    {item.check_in
                      ? new Date(item.check_in).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {item.check_out
                      ? new Date(item.check_out).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-zinc-200">{item.notes}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === "HADIR"
                          ? "bg-green-200 text-green-800"
                          : item.status === "IZIN"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-red-300 text-red-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}