// lib/types.ts
export interface Permission {
    id: string;
    user_id: string;
    exit_time: string;
    reentry_time: string;
    reason: string;
    status: "pending" | "diterima" | "ditolak";
    created_at: string;
    users?: {
        name: string;
    };
}

export interface User {
    id: string;
    name: string;
    role: string;
}

export interface PermissionForm {
    user_id: string;
    exit_time: string;
    reentry_time: string;
    reason: string;
}