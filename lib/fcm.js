"use client";

import { messaging } from "./messaging";
import { getToken } from "firebase/messaging";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function requestNotificationPermission() {
  if (typeof window === "undefined") return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
    });

    if (!token) return null;

    await supabase.from("fcm_tokens").insert([{ token }]);

    return token;
  } catch (error) {
    console.error(error);
    return null;
  }
}
