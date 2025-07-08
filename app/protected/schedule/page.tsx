import React from 'react'
import data from "@/lib/dummyData.json";

const page = () => {
    const { schedules } = data
    return (
        <div className="flex-1 w-full flex flex-col gap-12">
            <h2 className="font-bold text-2xl mb-4">User Data</h2>
            <div className="overflow-x-auto w-full rounded-lg border shadow-lg">
                <table className="min-w-full bg-card text-card-foreground">
                    <thead className="text-left text-sm uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Nama</th>
                            <th className="px-6 py-3">Tanggal</th>
                            <th className="px-6 py-3">Check-in</th>
                            <th className="px-6 py-3">Check-out</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Catatan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {schedules.map((schedule, idx) => (
                            <tr key={idx} className="hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap">{schedule.id}</td>
                                <td className="px-6 py-4">{schedule.day}</td>
                                <td className="px-6 py-4">{schedule.start_time}</td>
                                <td className="px-6 py-4">{schedule.end_time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default page