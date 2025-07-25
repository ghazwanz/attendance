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

export async function handleSignup(prevState: any, formData: FormData): Promise<{ success: boolean; message: string, error:boolean}> {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const retype = formData.get('repeat-password') as string;
    const role = "employee";

    if (!email || !password) {
        return { success: false, message: "Email and password are required.", error:true };
    }

    if (password !== retype)
        return { success: false, message: "Passwords do not match.", error:true };

    const supabase = await createClient();

    const datas = supabase.auth.signUp({
        email,
        password,
        options:{
            data:{
                name,
                role
            },
        }
    });

    const { error } = await datas;

    if (error) {
        return { success: false, message: error.message, error:true };
    }
    
    revalidatePath("/");
    redirect("/")
}
