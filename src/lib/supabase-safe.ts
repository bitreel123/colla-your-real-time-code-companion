import type { SupabaseClient } from "@supabase/supabase-js";

let safeClient: SupabaseClient | null = null;

try {
  const { supabase } = await import("@/integrations/supabase/client");
  safeClient = supabase;
} catch (e) {
  console.warn("Supabase client failed to initialize:", e);
}

export const supabase = safeClient;
