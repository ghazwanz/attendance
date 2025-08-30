import { differenceInHours, differenceInMinutes, parseISO, setHours, setMinutes } from "date-fns";
import { FetchExtResult, ParsedTime, TimeApiResponse } from "./types";
import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchExternalTime(): Promise<FetchExtResult> {
    try {
        // Using WorldTimeAPI for Jakarta timezone
        const response = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Jakarta', {
            cache: 'no-store', // Ensure fresh data
            headers: {
                'User-Agent': 'AttendanceApp/1.0'
            },
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            throw new Error(`Time API returned ${response.status}`);
        }

        const data: TimeApiResponse = await response.json();
        const result = {
            date:new Date(data.dateTime),
            time: data.time,
            hour: data.hour,
            minute: data.minute,
        }
        return result;
    } catch (error) {
        console.log('Failed to fetch external time:', error);
        // Fallback to server time if API fails
        console.warn('Falling back to server time');
        const result = {
            date:new Date(),
            time: new Date().toLocaleString('sv').split(" ")[1].slice(0,5),
            hour: new Date().getHours(),
            minute: new Date().getMinutes(),
        }
        return result;
    }
}

/**
 * Parses time data for attendance processing
 */
export function parseTimeData(date: Date): ParsedTime {
    const options = { weekday: 'long' } as const;
    const dayName = date.toLocaleDateString('id-ID', options).toLowerCase();

    return {
        date,
        dayName,
        hours: date.getHours(),
        minutes: date.getMinutes(),
        totalMinutes: date.getHours() * 60 + date.getMinutes(),
        dateString: date.toLocaleDateString('sv')
    };
}

/**
 * Gets schedule data for the given day
 */
export async function getScheduleForDay(supabase: SupabaseClient<any, "public", any>, dayName: string) {
    const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedules')
        .select('start_time, day')
        .eq('day', dayName)
        .single();

    if (!scheduleData || scheduleError) {
        throw new Error('Jadwal tidak ditemukan untuk hari ini');
    }

    const [hours, minutes] = scheduleData.start_time.split(':').map(Number);
    return {
        hours,
        minutes,
        totalMinutes: hours * 60 + minutes,
        startTime: scheduleData.start_time
    };
}

/**
 * Determines attendance status based on schedule and current time
 */
export function determineAttendanceStatus(currentMinutes: number, scheduleMinutes: number): string {
    return currentMinutes > scheduleMinutes ? "terlambat" : "hadir";
}

export function determineAttendanceStatusFNS(date:Date,scheduleHour:any): "terlambat"|"hadir" {
    const nowDateSetMinutes = setMinutes(date,0)
    const nowDateSetHours = setHours(nowDateSetMinutes,scheduleHour)
    const minuteDiff = differenceInMinutes(date,nowDateSetHours)
    console.log("Minute Diff: ",minuteDiff)
    console.log('Date Schedules: ',nowDateSetHours.toLocaleTimeString('sv'))
    console.log('Date Now: ',date.toLocaleTimeString('sv'))
    return minuteDiff > 0 ? "terlambat" : "hadir";
}

/**
 * Checks if user has already checked in today
 */
export async function checkExistingAttendance(supabase: SupabaseClient<any, "public", any>, userId: string, dateString: string) {
    const { data: existingAttendance, error } = await supabase
        .from('attendances')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('date', dateString)
        .maybeSingle(); // Use maybeSingle instead of single to avoid error when no record

        console.log(existingAttendance?.created_at)
    // If there's data, user has already checked in
    return {
        exist:!!existingAttendance,
        clockInTime:existingAttendance?.created_at?parseISO(existingAttendance?.created_at):null
    };
}

/**
 * Inserts attendance record
 */
export async function insertAttendanceRecord(
    supabase: SupabaseClient<any, "public", any>,
    userId: string,
    dateString: string,
    checkInTime: string,
) {
    const { error } = await supabase
        .from('attendances')
        .insert({
            user_id: userId,
            date: dateString,
            check_in: checkInTime,
            status: "HADIR"
        });

    if (error) {
        console.error('Database insert error:', error);
        throw new Error('Gagal menyimpan data absensi');
    }
}

export const updateClockInStatus = async (
    supabase:SupabaseClient<any, "public", any>,
    userId: string,
    dateString: string,
    scheduleHour:any
) => {
    const isExist = await checkExistingAttendance(supabase,userId,dateString)
    if (!isExist) throw new Error('Data Absensi tidak ditemukan');
    if (!isExist.clockInTime) throw new Error('Gagal menyimpan data absensi')

    const status = determineAttendanceStatusFNS(isExist.clockInTime,scheduleHour)
    if(status === "hadir") return
    const { error } = await supabase
    .from("attendances")
    .update({ status:status.toUpperCase() })
    .eq('user_id',userId)
    .eq('date',dateString)

    if (error) {
        console.error('Database insert error:', error);
        throw new Error('Gagal menyimpan data absensi');
    }
}

/**
 * Logs debug information for attendance process
 */
export function logDebugInfo(currentTime: ParsedTime, schedule: any, status: string) {
    console.log("🕐 Debug Absensi");
    console.log("Tanggal:", currentTime.date.toISOString());
    console.log("Hari:", currentTime.dayName);
    console.log("Jadwal:", `${schedule.hours.toString().padStart(2, "0")}:${schedule.minutes.toString().padStart(2, "0")}`);
    console.log("Sekarang:", `${currentTime.hours.toString().padStart(2, "0")}:${currentTime.minutes.toString().padStart(2, "0")}`);
    console.log("Total Menit Jadwal:", schedule.totalMinutes);
    console.log("Total Menit Sekarang:", currentTime.totalMinutes);
    console.log("Status:", status);
}