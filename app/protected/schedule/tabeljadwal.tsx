"use client";

import React, { useEffect, useState } from "react";
import { Schedule } from "@/lib/type";
import { createClient } from "@/lib/supabase/client";
import DeleteModal from "./delete";
import EditModal from "./edit";

export default function Tabeljadwal() {
  const [data, setData] = useState<Schedule[]>([]);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Schedule | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    role: string;
  } | null>(null);
  const supabase = createClient();

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .order("day", { ascending: true });

    if (!error) setData(data || []);
  };

  const fetchCurrentUser = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (authData.user) {
      const { data: users } = await supabase
        .from("users")
        .select("id, role")
        .eq("id", authData.user.id)
        .single();

      if (users) setCurrentUser(users);
    }
  };

  const formatTime = (time: string | any) => {
    const times = time.split(":");
    return `${times[0]}:${times[1]}`;
  };

  useEffect(() => {
    fetchData();
    fetchCurrentUser();
  }, []);

  const handleDelete = async (item: Schedule) => {
    const { error } = await supabase
      .from("schedules")
      .delete()
      .eq("id", item.id);
    if (!error) {
      setData((prev) => prev.filter((i) => i.id !== item.id));
    }
    setShowDelete(false);
  };

  const handleUpdate = async (updatedItem: Schedule) => {
    const { error } = await supabase
      .from("schedules")
      .update({
        day: updatedItem.day,
        start_time: updatedItem.start_time,
        end_time: updatedItem.end_time,
        mulai_istirahat: updatedItem.mulai_istirahat,
        selesai_istirahat: updatedItem.selesai_istirahat,
        is_active: updatedItem.is_active,
      })
      .eq("id", updatedItem.id);

    if (!error) {
      setData((prev) =>
        prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
      );
    }
    setShowEdit(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-600 text-white text-xs uppercase tracking-wide">
            <tr>
              <th className="px-6 py-4 text-left">No</th>
              <th className="px-6 py-4 text-left">Hari</th>
              <th className="px-6 py-4 text-left">Jam Masuk</th>
              <th className="px-6 py-4 text-left">Jam Pulang</th>
              <th className="px-6 py-4 text-left">Mulai Istirahat</th>
              <th className="px-6 py-4 text-left">Selesai Istirahat</th>
              <th className="px-6 py-4 text-left">Aktif</th>
              {currentUser?.role === "admin" && (
                <th className="px-6 py-4 text-left">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data?.map((schedule, index) => (
              <tr
                key={schedule.id}
                className={`transition duration-150 ${index % 2 === 0
                      ? "bg-white dark:bg-slate-800"
                      : "bg-blue-50 dark:bg-slate-700"
                      } hover:bg-gray-100 dark:hover:bg-slate-600`}
              >
                <td className="px-6 py-4 font-medium">{index + 1}</td>
                <td className="px-6 py-4">{schedule.day.toUpperCase()}</td>
                <td className="px-6 py-4 text-yellow-500 font-semibold">
                  {formatTime(schedule.start_time)}
                </td>
                <td className="px-6 py-4 text-blue-500 font-semibold">
                  {formatTime(schedule.end_time)}
                </td>
                <td className="px-6 py-4 text-orange-500 font-semibold">
                  {formatTime(schedule.mulai_istirahat) || "11:30"}
                </td>
                <td className="px-6 py-4 text-orange-500 font-semibold">
                  {formatTime(schedule.selesai_istirahat) || "12:30"}
                </td>
                <td className="px-6 py-4">
                  {schedule.is_active ? (
                    <span className="text-green-600 font-semibold">Aktif</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Tidak Aktif</span>
                  )}
                </td>
                {currentUser?.role === "admin" && (
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => {
                        setSelectedItem(schedule);
                        setShowEdit(true);
                      }}
                      className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                    >
                      ✏️ Edit
                    </button>
                    {/* <button
                      onClick={() => {
                        setSelectedItem(schedule);
                        setShowDelete(true);
                      }}
                      className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                    >
                      🗑️ Delete
                    </button> */}
                  </td>
                )}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-gray-400 py-6">
                  Tidak ada data jadwal.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EditModal hanya admin */}
      {showEdit && selectedItem && currentUser?.role === "admin" && (
        <EditModal
          item={selectedItem}
          onClose={() => setShowEdit(false)}
          onSave={handleUpdate}
          isAdmin={true}
        />
      )}
      {/* DeleteModal hanya admin */}
      {showDelete && selectedItem && currentUser?.role === "admin" && (
        <DeleteModal
          item={selectedItem}
          onClose={() => setShowDelete(false)}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
