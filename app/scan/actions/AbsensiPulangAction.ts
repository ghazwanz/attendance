// actions/attendanceActions.ts
import { createClient } from '@/lib/supabase/client';

export interface AttendanceUser {
    user_id: string;
    name: string;
    notes?: string;
}

export interface ResultStatus {
    status: "success" | "error"
    msg: string
}

export const handlePulangAction = async (
    user: AttendanceUser,
    isOutside: boolean,
): Promise<boolean> => {
    const { user_id, name, notes } = user
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const supabase = createClient();

    if (isOutside) throw new Error("Anda berada di luar area kantor.")
    const { data: attendanceToday, error: fetchError } = await supabase
        .from('attendances')
        .select('*')
        .eq('user_id', user_id)
        .eq('date', today)
        .single();

    if (fetchError || !attendanceToday) throw new Error('Data kehadiran tidak ditemukan');

    const checkInTime = new Date(attendanceToday.check_in);
    const hoursDiff = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 8)
        throw new Error(`Belum bisa pulang. Baru ${hoursDiff.toFixed(1)} jam, minimal 8 jam.`);

    const { error: updateError } = await supabase
        .from('attendances')
        .update({ 
            check_out: now.toISOString(),
            notes: notes
        })
        .eq('user_id', user_id)
        .eq('date', today);

    if (updateError) throw new Error('Gagal mencatat pulang');
    return true
};