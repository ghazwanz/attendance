import React from "react";
// import datas from "@/lib/dummyData.json";
import { createClient } from "@/lib/supabase/server";

 export default async function PermissionTable () {
  // const { permissions } = data;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('permissions')
      .select("*")

  return (
    <div className="flex items-center justify-center bg-transparent py-10 px-4">
      <div className="max-w-6xl w-full rounded-2xl shadow-lg dark:shadow-white/20 p-6 border border-white/20">
        <h1 className="text-3xl font-bold mt-1 items-center gap-2 mb-1">
          📋 Tabel Izin
        </h1>
        <p className="text-gray-500 mt-1 mb-5 text-sm">
          Data Izin karyawan secara keseluruhan
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-blue-600 text-white text-sm uppercase tracking-wider">
                <th className="px-4 py-3 rounded-l-xl">Nama</th>
                <th className="px-4 py-3">Tanggal Mulai</th>
                <th className="px-4 py-3">Tanggal Selesai</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Alasan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-r-xl">Dibuat Pada</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((item,index) => (
                <tr key={index} className=" text-white-800 rounded-xl shadow-sm transition">
                  <td className="px-4 py-3 rounded-l-xl">{item.id}</td>
                  <td className="px-4 py-3">{item.start_date}</td>
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
              {data?.length === 0 && (
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

  
