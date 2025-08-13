import { sendNotification } from "@/lib/notifications/NotificationSender";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const { subscription, title, message } = await req.json();
    await sendNotification(subscription, title, message);
    return new Response(JSON.stringify({ message: "Push sent." }), {});
}