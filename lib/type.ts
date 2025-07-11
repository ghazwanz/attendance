export type User = {
    id: string;
    name: string;
    role: "admin" | "employee";
    created_at: string; // ISO 8601 format
}

export type Schedule = {
    id: string;
    day: string;
    start_time: string;
    end_time: string;
}

export type Attendance = {
    id: string;
    user_id: string;
    schedule_id: string;
    date: string; // ISO 8601 format, e.g., "2023-10-01"
    check_in: string; // ISO 8601 format, e.g., "2023-10-01T08:00:00Z"
    check_out: string; // ISO 8601 format, e.g., "2023-10-01T08:00:00Z"
    status: "HADIR" | "TERLAMBAT" | "IZIN" | "SAKIT" | "TANPA KETERANGAN";
    note?: string; // Optional field for additional notes
    created_at: string; // ISO 8601 format
}

export type Permission = {
    id: string;
    user_id: string;
    users:{name: string}; // Reference to User
    type: "izin" | "cuti" | "sakit"; // Example permission types
    reason: string;
    start_date: string; // ISO 8601 format, e.g., "2023-10-01"
    end_date: string; // ISO 8601 format, e.g., "2023-10-01"
    status: "pending" | "diterima" | "ditolak";
    created_at: string; // ISO 8601 format
}