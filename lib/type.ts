export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
  created_at: string; // ISO 8601 format
};

export type Schedule = {
    id?: string;
    day: string;
    start_time: string;
    end_time: string;
    mulai_istirahat?: string;
  selesai_istirahat?: string;
    is_active: boolean; // New field to indicate if the schedule is active
}

export type Attendance = {
    id: string;
    user_id: string;
    schedule_id: string;
    date: string; // ISO 8601 format, e.g., "2023-10-01"
    check_in: string; // ISO 8601 format, e.g., "2023-10-01T08:00:00Z"
    check_out: string; // ISO 8601 format, e.g., "2023-10-01T08:00:00Z"
    status: "HADIR" | "TERLAMBAT" | "IZIN" | "SAKIT" | "ALPA";
    notes?: string; // Optional field for additional notes
    created_at: string; // ISO 8601 format
    users:{
        name: string; // Reference to User
    }
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

export type Reminder = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  jadwal: string;
  type: "reminder" | "alert";
};

export interface UserLocationMapProps {
  isOutside: boolean;
  setIsOutside: (isOutside: boolean) => void;
}

export interface UserLocationSectionProps {
  isOutside: boolean;
  setIsOutside: (isOutside: boolean) => void;
}

export interface QRScannerProps {
  onScanSuccess: () => void;
  onScanError: (error: string) => void;
  isOutside: boolean; // Add this prop
  setIsOutside: (isOutside: boolean) => void;
}