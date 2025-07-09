import React from "react";
import data from "@/lib/dummyData.json";

const PermissionTable = () => {
  const { permissions } = data;

  return (
    <div className="min-h-screen  px-4 py-8">
      <div className="max-w-6xl mx-auto  p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">
          Surat Izin Tidak Masuk PKL
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-blue-600 text-white text-sm uppercase tracking-wider">
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
