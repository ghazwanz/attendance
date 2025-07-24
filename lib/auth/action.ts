"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";
import { redirect } from "next/navigation";

export async function handleLogin(prevState: any, formData: FormData): Promise<{ success: boolean; message: string, error:boolean}> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { success: false, message: "Email and password are required.", error:true };
    }

    const supabase = await createClient();

    const datas = supabase.auth.signInWithPassword({
        email,
        password,
    });

    const { error } = await datas;

    if (error) {
        return { success: false, message: error.message, error:true };
    }
    
    revalidatePath("/");
    redirect("/")
}
