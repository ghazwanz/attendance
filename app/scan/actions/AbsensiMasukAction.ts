// actions/attendanceActions.ts
import { createClient } from '@/lib/supabase/client';

export interface AttendanceUser {
    user_id: string;
    name: string;
}

export const handleAbsenHadir = async (
    user: AttendanceUser,
    isOutside: boolean,
    showToast: (options: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => void
): Promise<boolean> => {
    const supabase = createClient();

    if (isOutside) {
        showToast({ type: 'error', message: 'Anda berada di luar area kantor' });
        return false;
    }

    try {
        const { user_id, name } = user;
        const nowDate = new Date();
        const now = nowDate.toISOString();

        // Get today's day name
        const options = { weekday: 'long' } as const;
        const todayName = nowDate.toLocaleDateString('id-ID', options).toLowerCase();

        // Get today's schedule
        const { data: jadwalHariIni, error: jadwalError } = await supabase
            .from('schedules')
            .select('start_time')
            .eq('day', todayName)
            .single();

        if (jadwalError || !jadwalHariIni)
            throw new Error(`Jadwal hari ${todayName} tidak ditemukan`);

        const [jamJadwal, menitJadwal] = jadwalHariIni.start_time.split(':').map(Number);

        // Convert to local time
        // const optionsTime = { weekday: 'long'} as const;
        const getLocaleTime = nowDate.toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' });
        // const jamNow = nowDate.getHours();
        const jamNow = parseInt(getLocaleTime.split('.')[0]);
        const menitNow = parseInt(getLocaleTime.split('.')[1]);
        // const menitNow = nowDate.getMinutes();

        let status = 'HADIR';
        if (jamNow > jamJadwal || (jamNow === jamJadwal && menitNow > menitJadwal))
            status = 'TERLAMBAT';


        const today = nowDate.toISOString().split('T')[0];
        // Check existing attendance

        const { error } = await supabase.from('attendances').insert({
            user_id,
            date: today,
            check_in: now,
            check_out: null,
            notes: '',
            created_at: now,
            status,
        });

        if (error) throw new Error('Gagal menyimpan kehadiran');

        showToast({ type: 'success', message: `Berhasil hadir (${status}) untuk ${name}` });
        return true;
    } catch (err) {
        showToast({ type: 'error', message: (err as Error).message });
        return false;
    }
};