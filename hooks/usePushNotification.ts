// hooks/usePushNotification.ts
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export const usePushNotification = () => {
    const supabase = createClient()
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            registerServiceWorker();
        }
    }, []);

    const registerServiceWorker = async () => {
        try {
            const registration = await navigator.serviceWorker.register('/custom-sw.js', {
                scope: '/',
                updateViaCache: 'none',
            });

            const sub = await registration.pushManager.getSubscription();
            setSubscription(sub);
            setIsSubscribed(!!sub);
        } catch (error) {
            console.error('Service worker registration failed:', error);
        }
    };

    const subscribeToPush = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            });

            // Save subscription to database
            const { error } = await supabase
                .from('subscriptions')
                .upsert({
                    user_id: user.id,
                    subscription: sub,
                    endpoint: sub.endpoint,
                });

            if (error) throw error;

            setSubscription(sub);
            setIsSubscribed(true);
            return sub;
        } catch (error) {
            console.error('Push subscription failed:', error);
            throw error;
        }
    };

    const unsubscribeFromPush = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            if (subscription) {
                await subscription.unsubscribe();
            }

            // Remove subscription from database
            await supabase
                .from('subscriptions')
                .delete()
                .eq('user_id', user.id);

            setSubscription(null);
            setIsSubscribed(false);
        } catch (error) {
            console.error('Push unsubscription failed:', error);
        }
    };

    return {
        isSupported,
        isSubscribed,
        subscription,
        subscribeToPush,
        unsubscribeFromPush,
    };
};