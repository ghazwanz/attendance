import { createClient } from "@/lib/supabase/client";
import { Permission } from "../lib/types";
import toast from "react-hot-toast";

const supabase = createClient();

export const statusActions = {
    async updatePermissionStatus(
        permissionId: string,
        status: string,
        permission: Permission
    ): Promise<boolean> {
        try {
            const tanggal = new Date(permission.created_at).toISOString().split("T")[0];

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
                    toast.error("User sudah melakukan absensi di tanggal tersebut.");
                    return false;
                }

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

            // Update status permission
            const { error: updateError } = await supabase
                .from("permissions")
                .update({ status })
                .eq("id", permissionId);

            if (updateError) {
                toast.error("Gagal mengubah status.");
                return false;
            }

            toast.success("Status berhasil diperbarui.");
            return true;
        } catch (error) {
            toast.error("Terjadi kesalahan saat mengubah status.");
            return false;
        }
    },
};