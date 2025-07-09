import React from "react";
import attendance from "@/lib/dummyData.json";

const absensiData = attendance.attendances;

export default function TabelAbsensi() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6 border-b pb-3">
          Daftar Kehadiran Siswa
        </h1>

        <div className="overflow-x-auto rounded-xl shadow-sm">
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead className="bg-indigo-600 text-white uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Check-in</th>
                <th className="px-4 py-3 text-left">Check-out</th>
                <th className="px-4 py-3 text-left">Keterangan</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {absensiData.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-indigo-50 transition-all border-b"
                >
                  <td className="px-4 py-3 font-medium">
                    {item.nama || "Tanpa Nama"}
                  </td>
                  <td className="px-4 py-3">{item.date}</td>
                  <td className="px-4 py-3">
                    {item.check_in
                      ? new Date(item.check_in).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {item.check_out
                      ? new Date(item.check_out).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">{item.notes}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === "HADIR"
                          ? "bg-green-100 text-green-700"
                          : item.status === "IZIN"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-600"
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
