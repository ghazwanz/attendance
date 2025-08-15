import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton({size}:{size?: "sm" | "lg"} = { size: "sm" }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-4">
      <Link href={"/protected/settings"} className="text-sm text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-emerald-400 transition">
        Hey, {user.user_metadata.name || user.email}!
      </Link>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size={size} variant={"default"}>
        <Link href="/auth/login">Masuk</Link>
      </Button>
      <Button asChild size={size} variant={"destructive"}>
        <Link href="/auth/sign-up">daftar</Link>
      </Button>
    </div>
  );
}
