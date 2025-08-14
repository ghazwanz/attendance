import { createClient } from "@/lib/supabase/client";
import { Permission, PermissionForm } from "../lib/types";
import toast from "react-hot-toast";

const supabase = createClient();

export const permissionActions = {
  // Ambil semua user
  async fetchUsers() {
    const { data, error } = await supabase.from("users").select("id, name, role");
    if (error) throw error;
    return data || [];
  },

  // Ambil user yang sedang login
  async fetchCurrentUser(): Promise<{ id: string; role: string; user_metadata: string, name:string } | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from("users")
      .select("id, role, name")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    return { id: profile.id, role: profile.role, user_metadata: user.user_metadata.role, name:profile.name };
  },

  // Ambil daftar izin
  async fetchPermissions(currentUser: { id: string; role: string } | null) {
    if (!currentUser) return [];

    const query = supabase
      .from("permissions")
      .select(`
        *,
        user:users!permissions_user_id_fkey(id, name, role),
        approver:users!permissions_approved_by_fkey(id, name, role)
      `)
      .order("created_at", { ascending: false });

    if (currentUser.role !== "admin") {
      query.eq("user_id", currentUser.id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Buat izin baru, batasi 1 kali per hari berdasarkan exit_time
  async createPermission(form: PermissionForm) {
    const toastId = toast.loading("⏳ Mengecek data izin...");

    try {
      const izinDate = new Date(form.exit_time);
      izinDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(izinDate);
      nextDay.setDate(izinDate.getDate() + 1);

      const { data: existingPermissions, error: fetchError } = await supabase
        .from("permissions")
        .select("id")
        .eq("user_id", form.user_id)
        .gte("exit_time", izinDate.toISOString())
        .lt("exit_time", nextDay.toISOString());

      if (fetchError) {
        toast.error("❌ Gagal mengecek data izin sebelumnya.", {
          id: toastId,
          style: { background: "#ff4d4f", color: "white", fontWeight: "bold" },
          iconTheme: { primary: "white", secondary: "#ff4d4f" },
        });
        return;
      }

      if (existingPermissions && existingPermissions.length > 0) {
        toast.error("⚠️ Kamu sudah mengajukan izin untuk tanggal tersebut.", {
          id: toastId,
          style: { background: "#ff4d4f", color: "white", fontWeight: "bold" },
          iconTheme: { primary: "white", secondary: "#ff4d4f" },
        });
        return;
      }

      const { error } = await supabase
        .from("permissions")
        .insert({ ...form, status: "pending" });

      if (error) {
        toast.error("❌ Gagal menyimpan izin: " + error.message, {
          id: toastId,
          style: { background: "#ff4d4f", color: "white", fontWeight: "bold" },
          iconTheme: { primary: "white", secondary: "#ff4d4f" },
        });
        return;
      }

      toast.success("✅ Izin berhasil diajukan!", {
        id: toastId,
        style: { background: "#22c55e", color: "white", fontWeight: "bold" },
        iconTheme: { primary: "white", secondary: "#22c55e" },
      });
    } catch (err: any) {
      toast.error("🚨 Terjadi kesalahan: " + err.message, {
        id: toastId,
        style: { background: "#ff4d4f", color: "white", fontWeight: "bold" },
        iconTheme: { primary: "white", secondary: "#ff4d4f" },
      });
    }
  },

  // Update izin
  async updatePermission(id: string, form: PermissionForm) {
    const { error } = await supabase
      .from("permissions")
      .update(form)
      .eq("id", id);

    if (error) throw error;
  },

  // Hapus izin
  async deletePermission(id: string) {
    const { error } = await supabase
      .from("permissions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
