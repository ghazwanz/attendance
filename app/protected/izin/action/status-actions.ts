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
                const { data: existingAttendance, error: checkError } = await supabase
                    .from("attendances")
                    .select("*")
                    .eq("user_id", permission.user_id)
                    .eq("date", tanggal)
                    .maybeSingle();

                if (checkError) {
                    toast.error("Gagal memeriksa data absensi.");
                    return false;
                }

                if (existingAttendance) {
                    const { error: updateError } = await supabase
                        .from("attendances")
                        .update({ status: "IZIN", notes: permission.reason, permission_id: permissionId })
                        .eq("id", existingAttendance.id);
                    if (updateError) {
                        toast.error("Gagal mengupdate ke absensi.");
                        return false;
                    }
                }
                else {
                    // Simpan ke attendances
                    const { error: insertError } = await supabase.from("attendances").insert({
                        user_id: permission.user_id,
                        status: "IZIN",
                        notes: permission.reason,
                        date: tanggal,
                    });

                    if (insertError) {
                        toast.error("Gagal menyimpan ke absensi.");
                        return false;
                    }
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