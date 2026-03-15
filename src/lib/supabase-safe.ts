import type { SupabaseClient } from "@supabase/supabase-js";

let safeClient: SupabaseClient | null = null;

try {
  // Static import - no top-level await needed
  const { supabase } = require("@/integrations/supabase/client");
  safeClient = supabase;
} catch (e) {
  console.warn("Supabase client failed to initialize:", e);
}

export { safeClient as supabase };
