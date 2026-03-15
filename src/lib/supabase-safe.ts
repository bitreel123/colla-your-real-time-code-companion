import type { SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;
let loadPromise: Promise<SupabaseClient | null> | null = null;

export async function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (cachedClient) return cachedClient;
  if (loadPromise) return loadPromise;

  loadPromise = import("@/integrations/supabase/client")
    .then(({ supabase }) => {
      cachedClient = supabase;
      return supabase;
    })
    .catch((e) => {
      console.warn("Supabase client failed to initialize:", e);
      return null;
    })
    .finally(() => {
      loadPromise = null;
    });

  return loadPromise;
}
