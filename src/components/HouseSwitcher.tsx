"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import clsx from "clsx";
import { ChevronDown, Check, Home, Loader2 } from "lucide-react";
import type { House } from "@/lib/types";
import { switchHouse } from "@/app/(app)/actions";

export default function HouseSwitcher({
  houses,
  activeId,
}: {
  houses: House[];
  activeId: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const active = houses.find((h) => h.id === activeId);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-semibold text-ink-700 shadow-sm transition hover:border-ink-300 hover:bg-ink-50"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Home className="h-3.5 w-3.5" />
          )}
        </span>
        <span className="max-w-[10rem] truncate">{active?.name ?? "Select house"}</span>
        <ChevronDown
          className={clsx(
            "h-4 w-4 text-ink-400 transition",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-2 w-60 overflow-hidden rounded-2xl border border-ink-200/70 bg-white p-1.5 shadow-card-hover">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
            Your houses
          </div>
          {houses.map((h) => {
            const on = h.id === activeId;
            return (
              <button
                key={h.id}
                onClick={() => {
                  setOpen(false);
                  start(() => switchHouse(h.id));
                }}
                className={clsx(
                  "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-sm transition",
                  on ? "bg-brand-50 font-semibold text-brand-700" : "hover:bg-ink-50",
                )}
              >
                <span className="truncate">{h.name}</span>
                {on && <Check className="h-4 w-4 text-brand-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
