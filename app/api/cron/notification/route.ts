// app/api/cron/morning-notification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';

// Configure web-push with VAPID details
webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:you@example.com',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    // Verify this is coming from Vercel cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get all active subscriptions from the database
        const { data: subscriptions, error } = await supabase
            .from('subscriptions')
            .select('*')
            .not('subscription', 'is', null);

        if (error) {
            throw error;
        }

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({
                message: 'No subscriptions found',
                sent: 0
            });
        }

        const notificationPayload = {
            title: '🌅 Pengingat Absensi Masuk!',
            body: 'Jangan lupa untuk melakukan absensi!',
            icon: '/icons/icon-192x192.png',
            badge: '/icon/icon-192x192.png',
            url: '/',
        };

        const sendPromises = subscriptions.map(async (sub) => {
            try {
                await webpush.sendNotification(
                    sub.subscription,
                    JSON.stringify(notificationPayload)
                );
                return { success: true, userId: sub.user_id };
            } catch (error: any) {
                console.log(`Gagal mengirim notifikasi ke user ${sub.user_id}:`, error);

                // If subscription is invalid, remove it from database
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await supabase
                        .from('subscriptions')
                        .delete()
                        .eq('user_id', sub.user_id);
                }

                return { success: false, userId: sub.user_id, error: error.message };
            }
        });

        const results = await Promise.allSettled(sendPromises);
        const successful = results.filter(
            (result) => result.status === 'fulfilled' && result.value.success
        ).length;

        const failed = results.length - successful;

        return NextResponse.json({
            message: 'Notifikasi pagi berhasil dikirim',
            total: subscriptions.length,
            successful,
            failed,
            timestamp: new Date().toISOString(),
        });

    } catch (error: any) {
        console.log('Error di notifikasi pagi cron:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    // Allow manual trigger for testing
    return GET(request);
}