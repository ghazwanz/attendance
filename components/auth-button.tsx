import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton({size = "lg"}: { size?: "sm" | "lg" } = {}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.user_metadata.name}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size={size} variant={"outline"}>
        <Link href="/auth/login">Masuk</Link>
      </Button>
      <Button asChild size={size} variant={"default"}>
        <Link href="/auth/sign-up">Daftar</Link>
      </Button>
    </div>
  );
}
