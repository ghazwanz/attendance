import { createClient } from '@/lib/supabase/client'
import React from 'react'

const getPiket = async ({user_id}:{user_id:string}): Promise<boolean> => {
    console.log(user_id)
    const supabase = createClient()
    const { data } = await supabase.from("piket")
    .select("user_id,schedules(day)")
    .eq("user_id",user_id)
    .single()

    if (data) return true
    return false
}

export default getPiket