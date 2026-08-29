"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";
import { Mail, Lock, Loader2, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "./LanguageContext";

export function LoginForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const supabase = createBrowserClient();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; isUnreachable?: boolean } | null>(null);

  const isNetworkOrPausedError = (err: any): boolean => {
    if (!err) return false;
    const msg = String(err.message || err.error_description || "").toLowerCase();
    const name = String(err.name || "").toLowerCase();
    const status = err.status;

    return (
      msg.includes("fetch") ||
      msg.includes("failed to fetch") ||
      msg.includes("network") ||
      msg.includes("enotfound") ||
      msg.includes("503") ||
      msg.includes("service unavailable") ||
      msg.includes("timeout") ||
      msg.includes("getaddrinfo") ||
      name.includes("authretryablefetcherror") ||
      status === 0 ||
      status === 503
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error("Login attempt error:", err);

      if (isNetworkOrPausedError(err)) {
        setError({
          message: t("auth.login.error.unreachable"),
          isUnreachable: true,
        });
      } else if (
        err.message?.includes("Invalid login credentials") ||
        err.message?.includes("invalid_grant")
      ) {
        setError({
          message: t("auth.login.error.invalid"),
          isUnreachable: false,
        });
      } else {
        setError({
          message: err.message || t("auth.login.error"),
          isUnreachable: false,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border p-3.5 rounded-xl text-xs space-y-2 ${
            error.isUnreachable
              ? "bg-amber-500/10 border-amber-500/25 text-amber-300"
              : "bg-rose-500/10 border-rose-500/25 text-rose-400"
          }`}
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${error.isUnreachable ? "text-amber-400" : "text-rose-400"}`} />
            <span className="leading-relaxed">{error.message}</span>
          </div>

          {error.isUnreachable && (
            <div className="pt-1.5 border-t border-amber-500/20 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-200 hover:text-white underline underline-offset-4 transition-colors"
              >
                <span>{t("auth.login.error.unpause")}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </motion.div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-300 ml-1">{t("auth.login.email")}</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl py-2.5 pl-9.5 pr-4 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
            placeholder="mail@example.com"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-300 ml-1">{t("auth.login.password")}</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl py-2.5 pl-9.5 pr-4 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
            placeholder="••••••••"
          />
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        type="submit"
        disabled={isLoading || !email || !password}
        className="apple-button-primary w-full text-white font-medium py-2.5 rounded-xl text-xs mt-3 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          t("auth.login.submit")
        )}
      </motion.button>

      <div className="relative pt-3 pb-1 flex items-center justify-center">
        <div className="border-t border-white/[0.08] w-full" />
        <span className="bg-zinc-950 px-2.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
          {t("settings.language.de") === "Deutsch" ? "Oder" : "Or"}
        </span>
        <div className="border-t border-white/[0.08] w-full" />
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        type="button"
        onClick={() => {
          document.cookie = "resell_demo=true; path=/; max-age=86400";
          router.push("/");
          router.refresh();
        }}
        className="apple-button-secondary w-full text-zinc-200 hover:text-white font-medium py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        <span>{t("auth.login.demo.btn")}</span>
      </motion.button>
    </form>
  );
}
