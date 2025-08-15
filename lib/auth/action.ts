"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";
import { redirect } from "next/navigation";

/* =========================
    LOGIN
========================= */
export async function handleLogin(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message: string; error: boolean }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Email and password are required.", error: true };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: error.message, error: true };
  }

  revalidatePath("/");
  redirect("/");
}

/* =========================
    SIGN UP
========================= */
export async function handleSignup(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message: string; error: boolean }> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const retype = formData.get("repeat-password") as string;
  const role = "employee";

  if (!email || !password) {
    return { success: false, message: "Email and password are required.", error: true };
  }

  if (password !== retype) {
    return { success: false, message: "Passwords do not match.", error: true };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/protected`,
    },
  });

  if (error) {
    return { success: false, message: error.message, error: true };
  }

  redirect("/auth/sign-up-success");
}

/* =========================
    REQUEST RESET PASSWORD
========================= */
export async function handleResetPassword(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message: string; error: boolean }> {
  const email = formData.get("email") as string;

  if (!email) {
    return { success: false, message: "Email is required.", error: true };
  }

  const supabase = await createClient();

  // Kirim email untuk reset password
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`, // halaman update password
  });

  if (error) {
    return { success: false, message: error.message, error: true };
  }

  return { success: true, message: "Password reset email sent! Check your inbox.", error: false };
}

/* =========================
    UPDATE PASSWORD
========================= */
export async function handleUpdatePassword(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message: string; error: boolean }> {
  const password = formData.get("password") as string;
  const retype = formData.get("repeat-password") as string;

  if (!password) {
    return { success: false, message: "Password is required.", error: true };
  }

  if (password !== retype) {
    return { success: false, message: "Passwords do not match.", error: true };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { success: false, message: error.message, error: true };
  }

  redirect("/auth/update-success");
}
