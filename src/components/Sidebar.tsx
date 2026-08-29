"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ArrowRightLeft, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/components/LanguageContext";
import { createBrowserClient } from "@/lib/supabase-browser";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const supabase = createBrowserClient();

  // On mount, auto-collapse on small screens
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, []);

  return (
    <motion.aside
      animate={{ width: isOpen ? 256 : 76 }}
      transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
      className="relative z-30 flex h-screen flex-col border-r border-white/[0.08] bg-zinc-950/70 backdrop-blur-2xl text-zinc-200 select-none shadow-[4px_0_24px_rgba(0,0,0,0.3)]"
    >
      {/* Top Header / Branding */}
      <div className="flex h-16 items-center px-4.5 border-b border-white/[0.06] justify-between relative overflow-hidden">
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 shadow-[0_2px_12px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] border border-white/20 transition-transform group-hover:scale-105 active:scale-95">
            <svg className="h-4.5 w-4.5 text-white drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col min-w-0"
              >
                <span className="text-sm font-semibold tracking-tight text-white truncate">
                  Resell Dashboard
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Collapse Toggle Button (Apple style floating pill) */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-20 z-40 hidden sm:flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 border border-white/20 text-zinc-300 shadow-lg hover:text-white hover:border-white/30 backdrop-blur-md transition-colors"
        title={isOpen ? t("nav.collapse") : t("nav.expand")}
      >
        {isOpen ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </motion.button>

      {/* Navigation list */}
      <nav className="flex-1 space-y-1.5 p-3 overflow-x-hidden">
        <NavItem 
          href="/" 
          icon={<LayoutDashboard className="h-4.5 w-4.5 shrink-0" />} 
          label={t("nav.dashboard")} 
          isOpen={isOpen} 
          isActive={pathname === "/"} 
        />
        <NavItem 
          href="/inventory" 
          icon={<Package className="h-4.5 w-4.5 shrink-0" />} 
          label={t("nav.inventory")} 
          isOpen={isOpen} 
          isActive={pathname?.startsWith("/inventory")} 
        />
        <NavItem 
          href="/transactions" 
          icon={<ArrowRightLeft className="h-4.5 w-4.5 shrink-0" />} 
          label={t("nav.transactions")} 
          isOpen={isOpen} 
          isActive={pathname?.startsWith("/transactions")} 
        />
      </nav>

      {/* Footer / Settings & Logout */}
      <div className="p-3 border-t border-white/[0.06] space-y-1.5">
        <NavItem 
          href="/settings" 
          icon={<Settings className="h-4.5 w-4.5 shrink-0" />} 
          label={t("nav.settings")} 
          isOpen={isOpen} 
          isActive={pathname?.startsWith("/settings")} 
        />
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.97 }}
          onClick={async () => {
            document.cookie = "resell_demo=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            await supabase.auth.signOut();
            router.push("/login");
            router.refresh();
          }}
          className={`flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all ${
            !isOpen ? "justify-center" : "space-x-3"
          }`}
          title={!isOpen ? t("nav.logout") : undefined}
        >
          <LogOut className="h-4.5 w-4.5 shrink-0 text-zinc-400 group-hover:text-rose-400 transition-colors" />
          {isOpen && <span className="truncate">{t("nav.logout")}</span>}
        </motion.button>
      </div>
    </motion.aside>
  );
}

function NavItem({ 
  href, 
  icon, 
  label, 
  isOpen, 
  isActive 
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  isOpen: boolean; 
  isActive?: boolean;
}) {
  return (
    <Link 
      href={href} 
      className="relative flex items-center rounded-xl px-3 py-2.5 text-xs font-medium transition-colors focus:outline-none group"
      title={!isOpen ? label : undefined}
    >
      {/* Sliding background pill indicator */}
      {isActive && (
        <motion.div
          layoutId="sidebarActivePill"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="absolute inset-0 rounded-xl bg-white/[0.09] border border-white/[0.12] shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.15)]"
        />
      )}

      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative z-10 flex items-center ${!isOpen ? "w-full justify-center" : "space-x-3"} ${
          isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
        }`}
      >
        <span className={`${isActive ? "text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "text-zinc-400 group-hover:text-zinc-200"} transition-colors`}>
          {icon}
        </span>
        {isOpen && <span className="truncate tracking-tight">{label}</span>}
      </motion.div>
    </Link>
  );
}
