import React from "react";
import data from "@/lib/dummyData.json";

const PermissionTable = () => {
  const { permissions } = data;

  return (
    <div className="min-h-screen  px-4 py-8">
      <div className="max-w-6xl w-full bg-[#0f0f0f] rounded-2xl shadow-[0_0_30px_3px_rgba(255,255,255,0.1)] p-6 border border-white/20">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">
          Surat Izin Tidak Masuk PKL
        </h1>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-blue-600  text-sm uppercase tracking-wider">
                <th className="px-4 py-3 rounded-l-xl">Tanggal Mulai</th>
                <th className="px-4 py-3">Tanggal Selesai</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Alasan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-r-xl">Dibuat Pada</th>
              </tr>             
            </thead> 
            <tbody>
              {permissions.map((item) => (
                <tr
                  key={item.id}
                  className=" rounded-xl shadow-sm transition"
                >
                  <td className="px-4 py-3 rounded-l-xl">{item.start_date}</td>
                  <td className="px-4 py-3">{item.end_date}</td>
                  <td className="px-4 py-3 capitalize">{item.type}</td>
                  <td className="px-4 py-3">{item.reason}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                        item.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : item.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 rounded-r-xl">
                    {new Date(item.created_at).toLocaleString("id-ID", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
              {permissions.length === 0 && (
                <tr>
                  <td>
                    Tidak ada data surat izin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PermissionTable;
