import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || !body.subscription) {
      return new Response(JSON.stringify({ error: "No subscription provided" }), {
        status: 400
      });
    }

    const supabase = await createClient(); // pastikan pakai await kalau perlu

    const { error } = await supabase
      .from("push_subscriptions")
      .insert([{ subscription: body.subscription }]);

    if (error) {
      console.error("Supabase insert error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Server error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500
    });
  }
}
