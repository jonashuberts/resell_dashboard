import { LoginForm } from "@/components/LoginForm";
import { Translate } from "@/components/Translate";
import { TrendingUp } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[20%] left-[30%] h-[450px] w-[450px] rounded-full bg-blue-600/[0.08] blur-[130px]" />
        <div className="absolute bottom-[20%] right-[30%] h-[400px] w-[400px] rounded-full bg-indigo-600/[0.06] blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-md apple-card p-8 sm:p-9 shadow-2xl overflow-hidden">
        <div className="apple-card-glow" />
        
        <div className="mb-7 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 shadow-[0_4px_16px_rgba(37,99,235,0.4),inset_0_1px_0_rgba(255,255,255,0.35)] border border-white/20 mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-white drop-shadow-sm stroke-[2.5]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            <Translate tKey="auth.login.title" />
          </h2>
          <p className="text-zinc-400 text-xs mt-1.5 font-normal tracking-tight">
            <Translate tKey="auth.login.desc" />
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
