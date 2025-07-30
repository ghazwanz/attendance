import { createClient } from "@/lib/supabase/client";
import { Permission, PermissionForm } from "../lib/types";

const supabase = createClient();

export const permissionActions = {
    async fetchUsers() {
        const { data, error } = await supabase.from("users").select("id, name, role");
        if (error) throw error;
        return data || [];
    },

    async fetchCurrentUser(): Promise<{ id: string; role: string; user_metadata: string } | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile, error } = await supabase
            .from("users")
            .select("id, role")
            .eq("id", user.id)
            .single();

        if (error) throw error;
        return { id: profile.id, role: profile.role, user_metadata: user.user_metadata.role };
    },

    async fetchPermissions(currentUser: { id: string; role: string } | null) {
        if (!currentUser) return [];

        const query = supabase
            .from("permissions")
            .select(`
                *,
                user:users!permissions_user_id_fkey(id, name, role),
                approver:users!permissions_approved_by_fkey(id, name, role)`)
            .order("created_at", { ascending: false });

        // Filter by user_id if not admin
        if (currentUser.role !== "admin") {
            query.eq("user_id", currentUser.id);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async createPermission(form: PermissionForm) {
        const { error } = await supabase
            .from("permissions")
            .insert({ ...form, status: "pending" });

        if (error) throw error;
    },

    async updatePermission(id: string, form: PermissionForm) {
        const { error } = await supabase
            .from("permissions")
            .update(form)
            .eq("id", id);

        if (error) throw error;
    },

    async deletePermission(id: string) {
        const { error } = await supabase
            .from("permissions")
            .delete()
            .eq("id", id);

        if (error) throw error;
    }
};