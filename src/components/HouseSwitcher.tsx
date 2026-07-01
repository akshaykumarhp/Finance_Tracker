"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Home } from "lucide-react";
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
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <Home className="h-4 w-4 text-brand-600" />
        {active?.name ?? "Select house"}
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute left-0 z-20 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          {houses.map((h) => (
            <button
              key={h.id}
              onClick={() => {
                setOpen(false);
                switchHouse(h.id);
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
            >
              <span className="truncate">{h.name}</span>
              {h.id === activeId && <Check className="h-4 w-4 text-brand-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
