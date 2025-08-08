import { createClient } from '@/lib/supabase/client'
interface MessageProps {
    title:string,
    message:string,
}
export default async function getMessage(type:string):Promise<MessageProps|null> {
    console.log(type)
    const supabase = createClient()
    const { data } = await supabase.from("reminder")
    .select("title ,message, is_active, type")
    .eq("type", type)
    .eq("is_active", true)
    .single()
    if (!data) return null
    return {title:data?.title ,message :data?.message}
}