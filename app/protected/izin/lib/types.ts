// lib/types.ts

export interface Permission {
  id: string;
  user_id: string;
  exit_time: string;
  reentry_time: string;
  reason: string;
  status: "pending" | "diterima" | "ditolak";
  created_at: string;

  // Relasi ke user yang mengajukan izin
  users?: {
    name: string;
  };

  // Relasi ke admin yang menyetujui izin
  approved_by?: string | null;
  approved_by_user?: {
    name: string;
  } | null;
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
