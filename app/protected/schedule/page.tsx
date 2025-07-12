import React from 'react'
import data from "@/lib/dummyData.json";
import { LucidePencil, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Schedule } from '@/lib/type';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import Tabeljadwal from './tabeljadwal';

const page = async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('schedules')
        .select('*');

    if (error) {
        redirect("/auth/login");
    }

    return (
        <div className="rounded-2xl shadow-lg dark:shadow-white/20 p-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">📋 Tabel Jadwal</h2>
                    <p className="text-gray-500 mt-1">Data jadwal kantor secara keseluruhan</p>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                {/* <table className="min-w-full text-sm">
                    <thead className="bg-blue-600 text-white text-xs uppercase tracking-wide">
                        <tr>
                            <th className="px-6 py-4 text-left">No</th>
                            <th className="px-6 py-4 text-left">Hari</th>
                            <th className="px-6 py-4 text-left">Waktu Mulai</th>
                            <th className="px-6 py-4 text-left">Waktu Selesai</th>
                            <th className="px-6 py-4 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((schedule: Schedule, index) => (
                            <tr
                                key={schedule.id}
                                className={`${index % 2 === 0 ? 'bg-white dark:bg-inherit' : 'bg-gray-50 dark:bg-gray-900'} border-t hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150`}
                            >
                                <td className="px-6 py-4 font-medium">{index + 1}</td>
                                <td className="px-6 py-4">{schedule.day.toUpperCase()}</td>
                                <td className="px-6 py-4">
                                    <span className="text-yellow-500 font-semibold">
                                        {schedule.start_time}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-blue-500 font-semibold">
                                        {schedule.end_time}
                                    </span>
                                </td>
                                <td className="px-6 py-4 space-x-2">
                                    <button
                                        className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                                    >
                                        🗑 Delete
                                    </button>
                                    <button
                                        className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                                    >
                                        ✏️ Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {data?.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center text-gray-400 py-6">
                                    Tidak ada data jadwal.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table> */}
                <Tabeljadwal initialData={data || []} />
            </div>
        </div>
    )
}

export default page;
