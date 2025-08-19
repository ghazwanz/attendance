"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LocationTable() {
  const [locations, setLocations] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchLocations() {
      const { data, error } = await supabase
        .from("location_company")
        .select("*");
      if (!error) setLocations(data || []);
    }
    fetchLocations();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-white/10 mt-8">
      <h3 className="text-xl font-bold mb-4">📍 Tabel Lokasi Perusahaan</h3>
      <table className="min-w-full text-sm">
        <thead className="bg-blue-600 text-white text-xs uppercase tracking-wide">
          <tr>
            <th className="px-6 py-4 text-left">No</th>
            <th className="px-6 py-4 text-left">Nama Lokasi</th>
            <th className="px-6 py-4 text-left">Map</th>
            <th className="px-6 py-4 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc, idx) => (
            <tr key={loc.id} className={idx % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-blue-50 dark:bg-slate-700"}>
              <td className="px-6 py-4 font-medium">{idx + 1}</td>
              <td className="px-6 py-4">{loc.location_name}</td>
              <td className="px-6 py-4">
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <iframe
                    title={`Map ${loc.location_name}`}
                    src={`https://maps.google.com/maps?q=${loc.longtitude},${loc.latitude}&z=15&output=embed`}
                    width="200"
                    height="150"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </td>
              <td className="px-6 py-4">
                {loc.status ? (
                  <span className="text-green-600 font-semibold">Aktif</span>
                ) : (
                  <span className="text-red-600 font-semibold">Tidak Aktif</span>
                )}
              </td>
            </tr>
          ))}
          {locations.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-gray-400 py-6">Tidak ada data lokasi.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
