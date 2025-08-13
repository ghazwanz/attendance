import webpush, { PushSubscription } from "web-push";

webpush.setVapidDetails(
    process.env.VAPID_EMAIL??"",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
    process.env.VAPID_PRIVATE_KEY ?? ""
);

export const sendNotification = async (subscription: PushSubscription, title: string, message: string) => {
    const pushPayload: any = {
        title: title,
        body: message,
        //image: "/logo.png", if you want to add an image
        icon: "/icons/icons-512.png",
        url: process.env.NOTIFICATION_URL ?? "/",
        badge: "/icons/icons-192.jpg",
    };

    webpush
        .sendNotification(subscription, JSON.stringify(pushPayload))
        .then(() => {
            console.log("Notification sent");
        })
        .catch((error) => {
            console.error("Error sending notification", error);
        });
};