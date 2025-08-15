import { createClient } from "@/lib/supabase/client";

export async function handleEditName(
    prevState: any,
    formData: FormData
): Promise<{ success: boolean; message: string; }> {
    const name = formData.get("name") as string;

    if (!name) {
        return { success: false, message: "Nama diperlukan." };
    }

    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
        return { success: false, message: "Pengguna tidak ditemukan." };
    }

    const { error } = await supabase.auth.updateUser({
        data: {
            name: name
        }
    });

    if (error) {
        return { success: false, message: "Gagal merubah nama" };
    }

    const { error: updateError } = await supabase
        .from('users')
        .update({ name })
        .eq('id', authUser?.id);

    if (updateError) {
        return { success: false, message: "Gagal merubah nama" };
    }

    return { success: true, message: "Nama berhasil diubah." };
}

export async function handleEditEmail(
    prevState: any,
    formData: FormData
): Promise<{ success: boolean; message: string; }> {
    const email = formData.get("email") as string;

    if (!email) {
        return { success: false, message: "Email diperlukan." };
    }

    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
        return { success: false, message: "Pengguna tidak ditemukan." };
    }

    const { error } = await supabase.auth.updateUser({
        email:email,
    },{
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/protected/settings`
    });

    if (error) {
        return { success: false, message: "Gagal merubah email" };
    }

    return { success: true, message: "Email berhasil diubah, konfirmasi email untuk melanjutkan perubahan" };
}