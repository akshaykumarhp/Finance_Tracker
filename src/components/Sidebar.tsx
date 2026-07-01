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
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Expenses", icon: Receipt },
  { href: "/income", label: "Income", icon: Wallet },
  { href: "/categories", label: "Sections", icon: Layers },
  { href: "/house", label: "House & Members", icon: Home },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col gap-1 border-b border-slate-200 bg-white p-3 md:h-screen md:w-60 md:border-b-0 md:border-r">
      <div className="mb-3 flex items-center gap-2 px-2 py-2 text-brand-700">
        <Wallet className="h-6 w-6" />
        <span className="font-bold">House Tracker</span>
      </div>

      <nav className="flex flex-1 flex-row gap-1 overflow-x-auto md:flex-col">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <form action={signOut} className="mt-1 hidden md:block">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-red-600">
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </form>
    </aside>
  );
}
