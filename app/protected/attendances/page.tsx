import React from "react";
import attendance from "@/lib/dummyData.json";

const absensiData = attendance.attendances;

export default function TabelAbsensi() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent py-10 px-4">
      <div className="max-w-6xl w-full bg-[#0f0f0f] rounded-2xl shadow-[0_0_30px_3px_rgba(255,255,255,0.1)] p-6 border border-white/20">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2 mb-1">
          📋 Tabel Kehadiran
        </h1>
        <p className="text-gray-400 mb-5 text-sm">
          Data kehadiran karyawan secara keseluruhan
        </p>

        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full table-auto text-sm text-white border-separate border-spacing-y-3">
            <thead>
              <tr className="bg-blue-600 text-white text-xs uppercase">
                <th className="py-3 px-4 rounded-tl-lg">NO</th>
                <th className="py-3 px-4">Nama</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Check-in</th>
                <th className="py-3 px-4">Check-out</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {absensiData.map((item, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-[#0f0f0f]" : "bg-[#111827]"
                  } transition rounded-xl shadow-md`}
                >
                  <td className="py-3 px-4 font-semibold">{index + 1}</td>
                  <td className="py-3 px-4 font-semibold uppercase">
                    {item.nama || "Tanpa Nama"}
                  </td>
                  <td className="py-3 px-4">{item.date}</td>
                  <td className="py-3 px-4">
                    <span className="bg-yellow-300 text-black px-3 py-1 rounded-full font-mono text-xs">
                      {item.check_in
                        ? new Date(item.check_in).toLocaleTimeString()
                        : "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-mono text-xs">
                      {item.check_out
                        ? new Date(item.check_out).toLocaleTimeString()
                        : "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{item.notes}</td>
                  <td className="py-3 px-4">
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
