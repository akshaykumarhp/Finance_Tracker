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

function Logo() {
  return (
    <div className="flex items-center gap-2.5 px-2 py-1">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-soft shadow-brand-600/30">
        <Wallet className="h-5 w-5" />
      </span>
      <div className="leading-tight">
        <div className="text-sm font-bold text-ink-900">House Tracker</div>
        <div className="text-[11px] text-ink-400">Household finances</div>
      </div>
    </div>
  );
}

export function DesktopSidebar() {
  const isActive = useActive();

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-1 border-r border-ink-200/70 bg-white/70 p-3 backdrop-blur md:sticky md:top-0 md:flex md:h-screen">
      <div className="mb-4 mt-1">
        <Logo />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-brand-50 text-brand-700 shadow-sm shadow-brand-600/5"
                  : "text-ink-500 hover:bg-ink-50 hover:text-ink-800",
              )}
            >
              <Icon
                className={clsx(
                  "h-[18px] w-[18px] transition",
                  active ? "text-brand-600" : "text-ink-400 group-hover:text-ink-600",
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <form action={signOut} className="mt-1 border-t border-ink-100 pt-2">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-400 transition hover:bg-rose-50 hover:text-rose-600">
          <LogOut className="h-[18px] w-[18px]" />
          Sign out
        </button>
      </form>
    </aside>
  );
}

export function MobileNav() {
  const isActive = useActive();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 flex border-t border-ink-200/70 bg-white/90 shadow-[0_-4px_20px_-8px_rgba(15,23,42,0.15)] backdrop-blur md:hidden">
      {links.map(({ href, short, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition",
              active ? "text-brand-600" : "text-ink-400",
            )}
          >
            {active && (
              <span className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-600" />
            )}
            <Icon className="h-5 w-5" />
            {short}
          </Link>
        );
      })}
    </nav>
  );
}
