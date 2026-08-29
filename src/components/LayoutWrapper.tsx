"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#09090b] text-zinc-100 selection:bg-blue-500/30 selection:text-blue-200">
      {/* Ambient background glow for translucent depth */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[25%] left-[20%] h-[500px] w-[500px] rounded-full bg-blue-600/[0.04] blur-[128px]" />
        <div className="absolute top-[30%] -right-[10%] h-[450px] w-[450px] rounded-full bg-indigo-600/[0.03] blur-[140px]" />
        <div className="absolute -bottom-[20%] left-[40%] h-[600px] w-[600px] rounded-full bg-emerald-600/[0.02] blur-[150px]" />
      </div>

      {!isLoginPage && <Sidebar />}
      <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
