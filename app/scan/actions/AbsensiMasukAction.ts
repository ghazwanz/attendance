// actions/attendanceActions.ts
"use server"
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface AttendanceUser {
    user_id: string;
    name: string;
}

export interface PromiseResult {
    status: "success" | "error"; 
    message: string;
}

export const handleAbsenHadir = async (
    user: AttendanceUser,
    isOutside: boolean,
): Promise<PromiseResult> => {
    if (isOutside) return {status: "error", message: "Anda berada di luar area kantor."}
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
    const jamNow = parseInt(getLocaleTime.split('.')[0]);
    const menitNow = parseInt(getLocaleTime.split('.')[1]);

    const status = (jamNow >= jadwalJam && menitNow >= jadwalMenit) ? "terlambat" : "hadir";

    const today = nowDate.toISOString().split('T')[0];

    const { data: getAttendanceToday, error: getAttendanceError } = await supabase
        .from('attendances')
        .select('*')
        .eq('user_id', user_id)
        .eq('date', today)
        .single();

    if (getAttendanceToday || !getAttendanceError) return {status: "error", message: "Anda sudah melakukan absensi masuk hari ini"};

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
    if (insertError) return {status: "error", message: "Gagal melakukan absensi masuk"};
    
    revalidatePath('/scan');
    return {status: "success", message: `Absensi masuk berhasil untuk ${name}`}
};