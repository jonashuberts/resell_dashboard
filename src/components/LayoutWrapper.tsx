"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <>
      {!isLoginPage && <Sidebar />}
      <main className={`flex-1 overflow-y-auto ${isLoginPage ? 'bg-zinc-950' : 'bg-zinc-900/50'}`}>
        {children}
      </main>
    </>
  );
}
