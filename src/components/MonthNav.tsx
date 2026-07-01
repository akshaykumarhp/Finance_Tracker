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
    <div className="flex items-center gap-2">
      <button
        onClick={() => go(shiftMonth(month, -1))}
        className="btn-ghost px-2 py-2"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="min-w-[9rem] text-center text-sm font-semibold text-slate-700">
        {monthLabel(month)}
      </span>
      <button
        onClick={() => go(shiftMonth(month, 1))}
        className="btn-ghost px-2 py-2"
        aria-label="Next month"
        disabled={isCurrent}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
