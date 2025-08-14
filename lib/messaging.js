"use client"; // pastikan hanya jalan di client

import { getMessaging } from "firebase/messaging";
import { app } from "./firebase";

export const messaging = getMessaging(app);
