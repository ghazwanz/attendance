import { createClient } from "@/lib/supabase/client";
import { Permission } from "../lib/types";
import toast from "react-hot-toast";
import { permissionActions } from "./permission-action";

const supabase = createClient();

export const statusActions = {
    async updatePermissionStatus(
        permissionId: string,
        status: string,
        permission: Permission,
    ): Promise<boolean> {
        try {
            const tanggal = new Date(permission.created_at).toISOString().split("T")[0];
            const user = await permissionActions.fetchCurrentUser()
            if (user?.role !== "admin")
                throw new Error("Hanya admin yang bisa mengubah status izin.");

            // Update status permission
            const { error: updateError } = await supabase
                .from("permissions")
                .update({ status, approved_by: user?.id })
                .eq("id", permissionId)
                .single();

            if (updateError) {
                toast.error("Gagal mengubah status.");
                return false;
            }

            // Cek jika status 'diterima', pastikan belum ada absensi hari itu
            if (status === "diterima") {
                const startDate = new Date(permission.exit_time);
                const endDate = new Date(permission.reentry_time);
            
                const attendanceInserts = [];
            
                for (
                    let date = new Date(startDate);
                    date <= endDate;
                    date.setDate(date.getDate() + 1)
                ) {
                    const tanggal = date.toISOString().split("T")[0];
            
                    const { data: existingAttendance } = await supabase
                        .from("attendances")
                        .select("*")
                        .eq("user_id", permission.user_id)
                        .eq("date", tanggal)
                        .maybeSingle();
            
                    if (existingAttendance) {
                        await supabase
                            .from("attendances")
                            .update({ status: "IZIN", notes: permission.reason, permission_id: permissionId })
                            .eq("id", existingAttendance.id);
                    } else {
                        attendanceInserts.push({
                            user_id: permission.user_id,
                            status: "IZIN",
                            notes: permission.reason,
                            date: tanggal,
                            permission_id: permissionId,
                        });
                    }
                }
            
                if (attendanceInserts.length > 0) {
                    await supabase.from("attendances").insert(attendanceInserts);
                }
            }            
            
            toast.success("Status berhasil diperbarui.");
            return true;
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat mengubah status.");
            return false;
        }
    },
};