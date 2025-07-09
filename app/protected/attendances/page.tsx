import React from "react";

const dataJurnal = [
  { tanggal: "7/8/2025", nama: "Arya", status: "Work", masuk: "6:47", keluar: "", jurnal: "" },
  { tanggal: "7/8/2025", nama: "Joice", status: "Work", masuk: "7:23", keluar: "", jurnal: "" },
  { tanggal: "7/8/2025", nama: "Fanessa", status: "Work", masuk: "7:23", keluar: "", jurnal: "" },
  { tanggal: "7/8/2025", nama: "Adinda", status: "Work", masuk: "7:37", keluar: "", jurnal: "" },
  { tanggal: "7/8/2025", nama: "Alya", status: "Work", masuk: "7:40", keluar: "", jurnal: "" },
  { tanggal: "7/8/2025", nama: "Fina", status: "Work", masuk: "7:45", keluar: "", jurnal: "" },
  { tanggal: "7/8/2025", nama: "Hanun", status: "Work", masuk: "7:48", keluar: "", jurnal: "" },
  { tanggal: "7/8/2025", nama: "Chelsea", status: "Work", masuk: "8:00", keluar: "", jurnal: "" },
  { tanggal: "7/8/2025", nama: "Yiandre", status: "Work", masuk: "8:00", keluar: "", jurnal: "" },
  { tanggal: "7/8/2025", nama: "Deden", status: "Work", masuk: "8:00", keluar: "", jurnal: "" },
  { tanggal: "7/8/2025", nama: "Rozi", status: "Work", masuk: "8:00", keluar: "", jurnal: "" },
  { tanggal: "7/8/2025", nama: "Rama", status: "Work", masuk: "8:02", keluar: "", jurnal: "" },
  { tanggal: "7/8/2025", nama: "Amar", status: "Work", masuk: "8:10", keluar: "", jurnal: "" },
];

export default function JurnalFullScreen() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="overflow-x-auto w-full">
        <table className="min-w-full table-auto text-sm border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr className="text-left text-black">
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">In</th>
              <th className="px-4 py-3">Out</th>
              <th className="px-4 py-3">Journal</th>
            </tr>
          </thead>
          <tbody>
            {dataJurnal.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{item.tanggal}</td>
                <td className="px-4 py-2">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-black">
                    {item.nama}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-2">{item.masuk}</td>
                <td className="px-4 py-2">{item.keluar || "-"}</td>
                <td className="px-4 py-2">{item.jurnal || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
