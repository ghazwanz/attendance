// actions/attendanceActions.ts
"use server"
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { AttendanceUser, PromiseResult } from '../lib/types';
import { 
    checkExistingAttendance, 
    // determineAttendanceStatus, 
    determineAttendanceStatusFNS, 
    fetchExternalTime, 
    getScheduleForDay, 
    insertAttendanceRecord, 
    logDebugInfo, 
    parseTimeData 
} from '../lib/utils';

import { formatISO } from 'date-fns';

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
        const currentTime = parseTimeData(externalTime.date);

        // Get schedule for today
        const schedule = await getScheduleForDay(supabase, currentTime.dayName);

        // Determine attendance status
        const status = determineAttendanceStatusFNS(externalTime.date,schedule.hours);

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
            formatISO(new Date()),
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