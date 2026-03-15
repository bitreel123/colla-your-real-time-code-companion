import { supabase } from "@/integrations/supabase/client";

export function getSupabaseClient() {
  try {
    if (!supabase) return null;
    return supabase;
  } catch {
    return null;
  }
}
