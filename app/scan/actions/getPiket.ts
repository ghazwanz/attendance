import { createClient } from '@/lib/supabase/client'
import React from 'react'

const getPiket = async ({user_id}:{user_id:string}): Promise<boolean> => {
    const day = new Date().toLocaleDateString("id-ID",{ weekday:"long" }).toLowerCase()
    const supabase = createClient()

    const { data:piketData } = await supabase.from("piket")
    .select("user_id, schedules(day)")
    .eq("schedules.day",day)
    .eq("user_id",user_id)
    .maybeSingle()

    if (piketData?.schedules) return true
    return false
}

export default getPiket