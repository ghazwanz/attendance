import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

webpush.setVapidDetails(
  "mailto:you@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!!,
  process.env.VAPID_PRIVATE_KEY!!
);

export async function GET() {
  const supabase = await createClient();
  const { data: subs } = await supabase.from("subscriptions").select("data");

  await Promise.all(
    (subs ?? []).map((row) =>
      webpush.sendNotification(
        row.data,
        JSON.stringify({
          title: "Pengumuman Harian",
          body: "Ini notifikasi terjadwal dari PWA Next.js 🚀"
        })
      )
    )
  );

  return Response.json({ success: true });
}
