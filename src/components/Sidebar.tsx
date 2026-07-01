"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Layers,
  Home,
  LogOut,
} from "lucide-react";
import { signOut } from "@/app/(auth)/actions";

const links = [
  { href: "/dashboard", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { href: "/transactions", label: "Expenses", short: "Spend", icon: Receipt },
  { href: "/income", label: "Income", short: "Income", icon: Wallet },
  { href: "/categories", label: "Sections", short: "Sections", icon: Layers },
  { href: "/house", label: "House & Members", short: "House", icon: Home },
];

function useActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(href + "/");
}

// Left rail on tablet/desktop.
export function DesktopSidebar() {
  const isActive = useActive();

  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-1 border-r border-slate-200 bg-white p-3 md:flex md:h-screen md:sticky md:top-0">
      <div className="mb-3 flex items-center gap-2 px-2 py-2 text-brand-700">
        <Wallet className="h-6 w-6" />
        <span className="font-bold">House Tracker</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
              isActive(href)
                ? "bg-brand-50 text-brand-700"
                : "text-slate-600 hover:bg-slate-50",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <form action={signOut} className="mt-1">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-red-600">
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </form>
    </aside>
  );
}

// Fixed bottom tab bar on phones.
export function MobileNav() {
  const isActive = useActive();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
      {links.map(({ href, short, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={clsx(
            "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition",
            isActive(href) ? "text-brand-600" : "text-slate-400",
          )}
        >
          <Icon className="h-5 w-5" />
          {short}
        </Link>
      ))}
    </nav>
  );
}
