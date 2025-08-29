export interface AttendanceUser {
    user_id: string;
    name: string;
}

export interface PromiseResult {
    status: "success" | "error";
    message: string;
}

export interface TimeApiResponse {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    seconds: number;
    milliSeconds: number;
    dateTime: string;
    date:string;
    time:string;
    timeZone:string;
    dayOfWeek:string;
    dstActive:string;
}

export interface ParsedTime {
    date: Date;
    dayName: string;
    hours: number;
    minutes: number;
    totalMinutes: number;
    dateString: string;
}

export interface FetchExtResult {
    date:Date;
    time:string;
    hour:number;
    minute:number;
}