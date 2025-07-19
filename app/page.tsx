import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/protected");

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <Link href={"/protected"}>
              <div className="flex items-center gap-3">
                <Image
                  src="/logo1.png"
                  width={32}
                  height={32}
                  className="dark:invert-0 invert"
                  alt="Logo"
                />
                <span className="font-semibold md:text-lg text-sm tracking-wide text-gray-900 dark:text-white">
                  Mahative Studio
                </span>
              </div>
            </Link>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton size="sm" />}
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-8 max-w-5xl p-5">
          <Hero />
          <main className="flex-1 flex flex-col items-center gap-6 px-4">
            {<AuthButton/>}
          </main>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-4">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
