// actions/attendanceActions.ts
"use server"
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface AttendanceUser {
    user_id: string;
    name: string;
}

export interface ResultStatus {
    status: "success" | "error"
    msg: string
}

export const handleAbsenHadir = async (
    user: AttendanceUser,
    isOutside: boolean,
): Promise<boolean> => {
    if (isOutside) throw new Error("Anda berada di luar area kantor.")
    const { user_id, name } = user
    const supabase = await createClient();

    // Get today's day name
    const nowDate = new Date();
    const options = { weekday: 'long' } as const;
    const todayName = nowDate.toLocaleDateString('id-ID', options).toLowerCase();

    const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedules')
        .select('start_time,day')
        .eq('day', todayName)
        .single();

    if (!scheduleData || scheduleError) throw new Error('Jadwal tidak ditemukan untuk hari ini');

    const [jadwalJam, jadwalMenit] = scheduleData.start_time.split(':').map(Number);

    const localeOptions = { hour: '2-digit', minute: '2-digit', second: "2-digit", hour12: false, timeZone: 'Asia/Jakarta' } as const;
    const getLocaleTime = nowDate.toLocaleString('id-ID', localeOptions);
    // const jamNow = nowDate.getHours();
    // const jamNow = parseInt(getLocaleTime.split('.')[0]);
    // const menitNow = parseInt(getLocaleTime.split('.')[1]);
    const jamNow = nowDate.getHours();
    const menitNow = nowDate.getMinutes();


    // const status = (jamNow >= jadwalJam && menitNow >= jadwalMenit) ? "terlambat" : "hadir";
    const jadwalTotalMenit = jadwalJam * 60 + jadwalMenit;
    const nowTotalMenit = jamNow * 60 + menitNow;

    const status = nowTotalMenit > jadwalTotalMenit ? "terlambat" : "hadir";
// === DEBUG LOG ===
console.log("⏰ Debug Absensi");
console.log("Tanggal:", nowDate);
console.log("Jadwal:", `${jadwalJam}:${jadwalMenit.toString().padStart(2, "0")}`);
console.log("Sekarang:", `${jamNow}:${menitNow.toString().padStart(2, "0")}`);
console.log("Total Menit Jadwal:", jadwalTotalMenit);
console.log("Total Menit Sekarang:", nowTotalMenit);
console.log("Status:", status);
    const today = nowDate.toISOString().split('T')[0];

    const { data: getAttendanceToday, error: getAttendanceError } = await supabase
        .from('attendances')
        .select('*')
        .eq('user_id', user_id)
        .eq('date', today)
        .single();

    if (getAttendanceToday || !getAttendanceError) throw new Error('Anda sudah melakukan absensi masuk hari ini');

    const { error: insertError } = await supabase
        .from('attendances').insert({
            user_id: user_id,
            date: today,
            check_in: nowDate.toISOString(),
            status: status.toUpperCase()
        })
        .eq('user_id', user_id)
        .eq('date', today)
        .single();
    console.log("Jam sekarang: ", jamNow, "Menit sekarang: ", menitNow, "\nJadwal jam: ", jadwalJam, "Menit jadwal", jadwalMenit, "\nStatus: ", status, "\nlocaleTime:", getLocaleTime);

    if (insertError) throw new Error('Gagal mencatat kehadiran');
    revalidatePath('/scan');
    return true
};