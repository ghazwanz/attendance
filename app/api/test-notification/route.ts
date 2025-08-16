// app/api/test-notification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';

webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:you@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Get user's subscription
        const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !subscription) {
            return NextResponse.json(
                { error: 'No subscription found for user' },
                { status: 404 }
            );
        }

        const testPayload = {
            title: '🧪 Test Notification',
            body: 'This is a test notification. Your morning notifications are working!',
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            url: '/',
        };

        await webpush.sendNotification(
            subscription.subscription,
            JSON.stringify(testPayload)
        );

        return NextResponse.json({
            message: 'Test notification sent successfully',
            timestamp: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('Error sending test notification:', error);
        return NextResponse.json(
            { error: 'Failed to send test notification', message: error.message },
            { status: 500 }
        );
    }
}