import { createBrowserClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export function createAdmin(){
  return createAdminClient(
    process.env.NEXT_PUBLIC_URL!,
    process.env.SUPABASE_SERVICE_ADMIN_KEY!,
    {
      auth:{
        autoRefreshToken:false,
        persistSession:false
      }
    }
  )
}