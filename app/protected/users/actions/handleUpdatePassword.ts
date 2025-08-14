import { createClient } from "@/lib/supabase/client";

export async function handleUpdatePassword(prevState: any, formData: FormData): Promise<{ success: boolean; message: string }> {
    const password = formData.get('password') as string;
    const newPass = formData.get('new-password') as string;

    if (!newPass || !password) {
        return { success: false, message: "Isi input password." };
    }

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id

    const datas = await supabase.rpc("changepassword", { 'current_plain_password': password, 'new_plain_password': newPass, 'current_id': userId })
    if (datas.data === "success") return {success:true, message:"Password berhasil diubah"}
    return { success: false, message: "Gagal Update Password, password salah" }
}
