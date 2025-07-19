import Image from "next/image";
import { NextLogo } from "./next-logo";
import { SupabaseLogo } from "./supabase-logo";

export function Hero() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <Image
        src="/logo1.png"
        width={150}
        height={150}
        className="dark:invert-0 invert"
        alt="Logo"
      />
      <h1 className="sr-only">Supabase and Next.js Starter Template</h1>
      <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
        Selamat Datang di Sistem Absensi{" "}
        <a
          href="https://mahative.com"
          target="_blank"
          className="font-bold hover:underline"
          rel="noreferrer"
        >
          Maha
        </a>
        {""}
        tive{" "}
        <a
          href="https://mahative.com"
          target="_blank"
          className="font-bold hover:underline"
          rel="noreferrer"
        >
          Studio
        </a>
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
    </div>
  );
}
