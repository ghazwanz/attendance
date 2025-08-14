import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { createClient } from "@supabase/supabase-js";

const firebaseConfig = {
  apiKey: "API_KEY_KAMU",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
  storageBucket: "PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "VAPID_KEY_KAMU" // ambil dari Firebase → Project Settings → Cloud Messaging
      });
      if (token) {
        await supabase.from("fcm_tokens").insert([{ token }]);
        console.log("Token saved to Supabase:", token);
      }
    }
  } catch (error) {
    console.error("Error getting FCM token", error);
  }
}
