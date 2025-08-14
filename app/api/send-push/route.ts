import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

webpush.setVapidDetails(
  "mailto:you@example.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  const { title, body } = await req.json();
  const supabase = await createClient();
const { data: subs } = await supabase
  .from("push_subscriptions")
  .select("subscription");


  if (!subs) return new Response("No subs", { status: 404 });

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        sub.subscription,
        JSON.stringify({ title, body })
      );
    } catch (err) {
      console.error("Push error:", err);
    }
  }

  return new Response("Sent", { status: 200 });
}
