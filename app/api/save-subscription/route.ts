import { createClient } from "@/lib/supabase/server";

export async function POST(req : any) {
  const sub = await req.json();
  const supabase = await createClient();

  await supabase.from("subscriptions").insert({ data: sub });

  return Response.json({ success: true });
}
