"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthLabel, shiftMonth, monthKey } from "@/lib/format";

export default function MonthNav({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const go = (m: string) => {
    const next = new URLSearchParams(params);
    next.set("m", m);
    router.push(`${pathname}?${next.toString()}`);
  };

  const isCurrent = month === monthKey();

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-ink-200 bg-white p-1 shadow-sm">
      <button
        onClick={() => go(shiftMonth(month, -1))}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition hover:bg-ink-50 hover:text-ink-800"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="min-w-[8.5rem] text-center text-sm font-semibold text-ink-800">
        {monthLabel(month)}
      </span>
      <button
        onClick={() => go(shiftMonth(month, 1))}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition hover:bg-ink-50 hover:text-ink-800 disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="Next month"
        disabled={isCurrent}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
