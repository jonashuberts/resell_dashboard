"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "./LanguageContext";

export function LoginForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const supabase = createBrowserClient();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || t("auth.login.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 p-3 rounded-xl text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
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
    </form>
  );
}
