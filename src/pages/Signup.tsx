import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Loader2, UserPlus } from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-10 py-4">
        <Link to="/" className="font-display text-2xl uppercase tracking-tight text-foreground hover:text-foreground/70 transition-colors">
          COLLA
        </Link>
        <Link to="/search" className="text-xs font-body font-medium text-muted-foreground hover:text-foreground transition-colors">
          ← Back
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 -mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <h1 className="font-display text-4xl tracking-tight text-foreground mb-2">Create account</h1>
          <p className="font-body text-sm text-muted-foreground mb-8">Start analyzing code in real-time</p>

          {success ? (
            <div className="p-4 rounded-md border border-accent/30 bg-accent/5">
              <p className="font-body text-sm text-foreground font-medium mb-1">Check your email</p>
              <p className="font-body text-xs text-muted-foreground">
                We sent a verification link to <strong>{email}</strong>. Click it to activate your account, then{" "}
                <Link to="/login" className="text-foreground underline underline-offset-2">sign in</Link>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-body font-medium text-muted-foreground mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-md border border-input bg-card text-foreground font-body text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-body font-medium text-muted-foreground mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-md border border-input bg-card text-foreground font-body text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                />
              </div>

              {error && <p className="text-xs text-destructive font-body">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-primary text-primary-foreground font-body text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Create account
              </button>
            </form>
          )}

          {!success && (
            <p className="mt-6 text-center text-xs font-body text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-foreground underline underline-offset-2 hover:text-foreground/70">
                Sign in
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
