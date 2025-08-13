"use client";
import { useNotification } from "@/lib/notifications/useNotification";
import React from "react";
import { NotificationSubscriptionForm } from "./NotificationSubscriptionForm";
import { UnsupportedNotificationMessage } from "./UnsupportedNotificationMessage";
import NotificationSubscriptionStatus from "./NotificationSubscriptionStatus";

const NotificationWrapper = () => {
    const { isSupported, isSubscribed } = useNotification();

    return (
        <div className="flex flex-col items-center justify-center bg-gray-100 p-4">
            {!isSupported ? (
                <UnsupportedNotificationMessage />
            ) : (
                <NotificationSubscriptionStatus />
            )}

            {isSubscribed && (
                <NotificationSubscriptionForm />
            )}
        </div>
    );
};

export default NotificationWrapper;