import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User, Session, SupabaseClient } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const hasSupabaseConfig = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

let supabaseClient: SupabaseClient | null = null;

async function getClient(): Promise<SupabaseClient | null> {
  if (!hasSupabaseConfig) return null;
  if (supabaseClient) return supabaseClient;
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    supabaseClient = supabase;
    return supabase;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(hasSupabaseConfig);

  useEffect(() => {
    if (!hasSupabaseConfig) return;

    let sub: { unsubscribe: () => void } | null = null;

    getClient().then((client) => {
      if (!client) { setLoading(false); return; }

      const { data: { subscription } } = client.auth.onAuthStateChange((_event, sess) => {
        setSession(sess);
        setUser(sess?.user ?? null);
        setLoading(false);
      });
      sub = subscription;

      client.auth.getSession().then(({ data: { session: sess } }) => {
        setSession(sess);
        setUser(sess?.user ?? null);
        setLoading(false);
      });
    });

    return () => sub?.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const client = await getClient();
    if (!client) return { error: new Error("Backend not configured") };
    const { error } = await client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const client = await getClient();
    if (!client) return { error: new Error("Backend not configured") };
    const { error } = await client.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    const client = await getClient();
    if (client) await client.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
