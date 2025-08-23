// actions/attendanceActions.ts
"use server"
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { AttendanceUser, PromiseResult } from '../lib/types';
import { 
    checkExistingAttendance, 
    determineAttendanceStatus, 
    fetchExternalTime, 
    getScheduleForDay, 
    insertAttendanceRecord, 
    logDebugInfo, 
    parseTimeData 
} from '../lib/utils';


export const handleAbsenHadir = async (
    user: AttendanceUser,
    isOutside: boolean,
): Promise<PromiseResult> => {
    try {
        // Early validation
        if (isOutside) {
            return {
                status: "error",
                message: "Anda berada di luar area kantor."
            };
        }

        const { user_id, name } = user;
        const supabase = await createClient();

        // Get current time from external API
        const externalTime = await fetchExternalTime();
        const currentTime = parseTimeData(externalTime);

        // Get schedule for today
        const schedule = await getScheduleForDay(supabase, currentTime.dayName);

        // Determine attendance status
        const status = determineAttendanceStatus(
            currentTime.totalMinutes,
            schedule.totalMinutes
        );

        // Log debug information
        logDebugInfo(currentTime, schedule, status);

        // Check if user has already checked in today
        const hasCheckedIn = await checkExistingAttendance(
            supabase,
            user_id,
            currentTime.dateString
        );

        if (hasCheckedIn) {
            return {
                status: "error",
                message: "Anda sudah melakukan absensi masuk hari ini"
            };
        }

        // Insert attendance record
        await insertAttendanceRecord(
            supabase,
            user_id,
            currentTime.dateString,
            currentTime.date.toISOString(),
            status
        );

        // Revalidate the scan page
        revalidatePath('/', "layout");
        revalidatePath('/scan');

        return {
            status: "success",
            message: `Absensi masuk berhasil untuk ${name}. Status: ${status}`
        };

    } catch (error) {
        console.error('Attendance error:', error);

        // Return user-friendly error message
        const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
        return {
            status: "error",
            message: errorMessage
        };
    }
};