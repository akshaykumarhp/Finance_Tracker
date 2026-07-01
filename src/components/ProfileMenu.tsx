"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import clsx from "clsx";
import { ChevronDown, KeyRound, LogOut, Loader2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { resetPassword, signOut } from "@/app/(auth)/actions";

export default function ProfileMenu({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(
    null,
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initial = name.charAt(0).toUpperCase();

  function handleReset() {
    setNotice(null);
    start(async () => {
      const res = await resetPassword();
      if (res?.error) {
        setNotice({ kind: "error", text: res.error });
      } else if (res?.message) {
        setNotice({ kind: "ok", text: res.message });
      }
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open profile menu"
        className="flex items-center gap-2 rounded-full border border-ink-200 bg-white py-1 pl-1 pr-2 text-sm font-semibold text-ink-700 shadow-sm transition hover:border-ink-300 hover:bg-ink-50 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-200 dark:hover:border-ink-500 dark:hover:bg-ink-700"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-xs font-bold uppercase text-white">
          {initial}
        </span>
        <span className="hidden max-w-[8rem] truncate sm:inline">{name}</span>
        <ChevronDown
          className={clsx(
            "hidden h-4 w-4 text-ink-400 transition sm:block",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-2xl border border-ink-200/70 bg-white p-1.5 shadow-card-hover dark:border-ink-700 dark:bg-ink-800"
        >
          {/* Profile section */}
          <div className="flex items-center gap-3 rounded-xl px-2.5 py-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-sm font-bold uppercase text-white">
              {initial}
            </span>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-semibold text-ink-900 dark:text-white">
                {name}
              </div>
              {email && (
                <div className="truncate text-xs text-ink-400">{email}</div>
              )}
            </div>
          </div>

          <button
            onClick={handleReset}
            disabled={pending}
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm text-ink-600 transition hover:bg-ink-50 disabled:opacity-60 dark:text-ink-200 dark:hover:bg-ink-700"
          >
            {pending ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin text-ink-400" />
            ) : (
              <KeyRound className="h-[18px] w-[18px] text-ink-400" />
            )}
            Reset password
          </button>

          {notice && (
            <p
              className={clsx(
                "mx-1 my-1 rounded-lg px-2.5 py-2 text-xs",
                notice.kind === "ok"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
              )}
            >
              {notice.text}
            </p>
          )}

          <div className="my-1 h-px bg-ink-100 dark:bg-ink-700" />

          {/* Theme toggle */}
          <div className="flex items-center justify-between rounded-xl px-2.5 py-2 text-sm text-ink-600 dark:text-ink-200">
            <span>Theme</span>
            <ThemeToggle />
          </div>

          <div className="my-1 h-px bg-ink-100 dark:bg-ink-700" />

          {/* Sign out */}
          <form action={signOut}>
            <button
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm font-medium text-ink-500 transition hover:bg-rose-50 hover:text-rose-600 dark:text-ink-300 dark:hover:bg-rose-950 dark:hover:text-rose-400"
            >
              <LogOut className="h-[18px] w-[18px]" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
