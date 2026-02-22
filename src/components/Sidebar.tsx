"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ArrowRightLeft, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const { t } = useLanguage();

  // On mount, auto-collapse on small screens
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, []);

  return (
    <div 
      className={`flex h-screen flex-col bg-zinc-950 text-zinc-100 border-r border-zinc-800 transition-all duration-300 ease-in-out relative ${
        isOpen ? "w-64" : "w-16 sm:w-20"
      }`}
    >
      <div className="flex relative h-16 items-center px-4 sm:px-6 border-b border-zinc-800">
        <h1 className={`text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent truncate transition-all ${isOpen ? "opacity-100" : "opacity-0 w-0 hidden"}`}>
          ResellDash
        </h1>
        {!isOpen && (
          <div className="w-full flex justify-center text-blue-500 font-bold">
            RD
          </div>
        )}
      </div>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-20 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-full p-1 shadow-md z-10 transition-colors hidden sm:flex items-center justify-center"
        title={isOpen ? "Einklappen" : "Ausklappen"}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      <nav className="flex-1 space-y-2 p-3 sm:p-4 overflow-x-hidden">
        <NavItem href="/" icon={<LayoutDashboard className="h-5 w-5 shrink-0" />} label={t("nav.dashboard")} isOpen={isOpen} isActive={pathname === "/"} />
        <NavItem href="/inventory" icon={<Package className="h-5 w-5 shrink-0" />} label={t("nav.inventory")} isOpen={isOpen} isActive={pathname?.startsWith("/inventory")} />
        <NavItem href="/transactions" icon={<ArrowRightLeft className="h-5 w-5 shrink-0" />} label={t("nav.transactions")} isOpen={isOpen} isActive={pathname?.startsWith("/transactions")} />
      </nav>

      <div className="p-3 sm:p-4 border-t border-zinc-800 overflow-x-hidden">
        <NavItem href="/settings" icon={<Settings className="h-5 w-5 shrink-0" />} label={t("nav.settings")} isOpen={isOpen} isActive={pathname?.startsWith("/settings")} />
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, isOpen, isActive }: { href: string, icon: React.ReactNode, label: string, isOpen: boolean, isActive?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center rounded-lg px-3 py-2.5 transition-colors ${
        isActive 
          ? "bg-blue-600/10 text-blue-400 font-medium" 
          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
      } ${!isOpen ? "justify-center" : "space-x-3"}`}
      title={!isOpen ? label : undefined}
    >
      {icon}
      {isOpen && <span className="truncate whitespace-nowrap">{label}</span>}
    </Link>
  );
}
