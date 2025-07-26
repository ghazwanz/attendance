'use client';

import React, { useEffect, useState } from 'react';
import { Schedule } from '@/lib/type';
import { createClient } from '@/lib/supabase/client';
import DeleteModal from './delete';
import EditModal from './edit';

export default function Tabeljadwal() {
  const [data, setData] = useState<Schedule[]>([]);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Schedule | null>(null);
  const supabase = createClient();

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('day', { ascending: true });

    if (!error) setData(data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (item: Schedule) => {
    const { error } = await supabase.from('schedules').delete().eq('id', item.id);
    if (!error) {
      setData(prev => prev.filter(i => i.id !== item.id));
    }
    setShowDelete(false);
  };

  const handleUpdate = async (updatedItem: Schedule) => {
    const { error } = await supabase
      .from('schedules')
      .update({
      day: updatedItem.day,
      start_time: updatedItem.start_time,
      end_time: updatedItem.end_time,
      mulai_istirahat: updatedItem.mulai_istirahat,
      selesai_istirahat: updatedItem.selesai_istirahat,
      })
      .eq('id', updatedItem.id);

    if (!error) {
      setData(prev =>
        prev.map(i => (i.id === updatedItem.id ? updatedItem : i))
      );
    }
    setShowEdit(false);
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-600 text-white text-xs uppercase tracking-wide">
            <tr>
              <th className="px-6 py-4 text-left">No</th>
              <th className="px-6 py-4 text-left">Hari</th>
              <th className="px-6 py-4 text-left">Waktu Mulai</th>
              <th className="px-6 py-4 text-left">Waktu Istirahat</th>
              <th className="px-6 py-4 text-left">Selesai Istirahat</th>
              <th className="px-6 py-4 text-left">Waktu Selesai</th>
              <th className="px-6 py-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((schedule, index) => (
              <tr
                key={schedule.id}
                className={`${
                  index % 2 === 0
                    ? 'bg-white dark:bg-inherit'
                    : 'bg-gray-50 dark:bg-gray-900'
                } border-t hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150`}
              >
                <td className="px-6 py-4 font-medium">{index + 1}</td>
                <td className="px-6 py-4">{schedule.day.toUpperCase()}</td>
                <td className="px-6 py-4 text-yellow-500 font-semibold">
                  {schedule.start_time}
                </td>
                <td className="px-6 py-4 text-orange-500 font-semibold">
                  {schedule.mulai_istirahat || '11:30'}
                </td>
                <td className="px-6 py-4 text-orange-500 font-semibold">
                  {schedule.selesai_istirahat || '12:30'}
                </td>
                <td className="px-6 py-4 text-blue-500 font-semibold">
                  {schedule.end_time}
                </td>
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
                  <button
                    onClick={() => {
                      setSelectedItem(schedule);
                      setShowDelete(true);
                    }}
                    className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-6">
                  Tidak ada data jadwal.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showDelete && selectedItem && (
        <DeleteModal
          item={selectedItem}
          onClose={() => setShowDelete(false)}
          onConfirm={() => handleDelete(selectedItem)}
        />
      )}

      {showEdit && selectedItem && (
        <EditModal
          item={selectedItem}
          onClose={() => setShowEdit(false)}
          onSave={handleUpdate}
        />
      )}
    </>
  );
}
