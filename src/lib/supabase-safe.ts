import type { SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;
let loadingClient: Promise<SupabaseClient | null> | null = null;

const hasBackendConfig = () =>
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

export async function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (!hasBackendConfig()) return null;
  if (cachedClient) return cachedClient;

  if (!loadingClient) {
    loadingClient = import("@/integrations/supabase/client")
      .then(({ supabase }) => {
        cachedClient = supabase;
        return cachedClient;
      })
      .catch(() => null);
  }

  return loadingClient;
}
