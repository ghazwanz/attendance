import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showToast } from '@/lib/utils/toast';

export function useScanAttendance() {
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleScan = async (decodedText: string) => {
        setIsLoading(true);
        try {
            const data = JSON.parse(decodedText);
            const { data: userData, error } = await supabase
                .from("users")
                .select("*")
                .eq("id", data.user_id)
                .single();

            if (error || !userData) {
                throw new Error("User tidak ditemukan");
            }

            return {
                user: userData,
                attendance: await getCurrentAttendance(userData.id),
                permission: await getCurrentPermission(userData.id)
            };

        } catch (err) {
            throw new Error((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const getCurrentAttendance = async (userId: string) => {
        const today = new Date().toISOString().split("T")[0];
        const { data } = await supabase
            .from("attendances")
            .select("*")
            .eq("user_id", userId)
            .eq("date", today)
            .single();

        return data;
    };

    const getCurrentPermission = async (userId: string) => {
        const today = new Date().toISOString().split("T")[0];
        const { data } = await supabase
            .from("permissions")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "pending")
            .eq("date", today)
            .maybeSingle();

        return data;
    };

    return {
        handleScan,
        isLoading
    };
}