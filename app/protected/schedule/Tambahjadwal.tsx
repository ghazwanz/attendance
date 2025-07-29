'use client'
import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Schedule } from '@/lib/type'
import { useRouter } from 'next/navigation'

const Tambahjadwal = () => {
    const router = useRouter()
    const supabase = createClient()
    const [showEdit, setShowEdit] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const handleSave = async (updatedItem: Schedule) => {
        const { error } = await supabase
            .from('schedules')
            .insert({
                day: updatedItem.day,
                start_time: updatedItem.start_time,
                end_time: updatedItem.end_time,
            })

        if (error) {
            alert('❌ Gagal menyimpan: ' + error.message)
        } else {
            setShowSuccess(true)
            setTimeout(() => {
                setShowSuccess(false)
            }, 2000)
            setShowEdit(false)
            window.location.reload()
        }
    }

    return (
        <>
            <button
                onClick={() => setShowEdit(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow inline-flex items-center gap-2"
            >
                <span className="text-lg">＋</span> Tambah Jadwal
            </button>

            {showEdit && (
                <TambahModal
                    onClose={() => setShowEdit(false)}
                    onSave={handleSave}
                />
            )}
            {showSuccess && (
                <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg text-sm animate-bounce">
                        ✅ Jadwal berhasil ditambahkan!
                    </div>
                </div>
            )}
        </>
    )
}

const TambahModal = ({ onClose, onSave }: any) => {
    const [day, setDay] = useState('')
    const [start, setStart] = useState('')
    const [end, setEnd] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!day || !start || !end) {
            alert('⚠️ Semua kolom wajib diisi.')
            return
        }

        await onSave({ day, start_time: start, end_time: end })
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="space-y-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 p-6 rounded-xl shadow-md transition-all w-full max-w-sm"
            >
                <h2 className="text-lg font-semibold mb-2">✏️ Tambah Jadwal</h2>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        🗓 Hari
                    </label>
                    <input
                        type="text"
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ⏰ Waktu Mulai
                    </label>
                    <input
                        type="time"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ⌛ Waktu Selesai
                    </label>
                    <input
                        type="time"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm bg-gray-200 dark:bg-slate-700 dark:text-white rounded-lg hover:bg-gray-300"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Simpan
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Tambahjadwal
