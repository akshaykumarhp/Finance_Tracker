"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowUpDown, Loader2 } from "lucide-react";
import clsx from "clsx";

export type ExpenseSortKey = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

export default function ExpenseSort({ sort }: { sort: ExpenseSortKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = new URLSearchParams(params);
    next.set("sort", e.target.value);
    start(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  return (
    <div
      className={clsx(
        "flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-2.5 py-1.5 shadow-sm transition-opacity dark:border-ink-600 dark:bg-ink-800",
        pending && "opacity-60",
      )}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-ink-400" />
      ) : (
        <ArrowUpDown className="h-4 w-4 shrink-0 text-ink-400" />
      )}
      <select
        value={sort}
        onChange={onChange}
        aria-label="Sort expenses"
        className="bg-transparent text-sm font-medium text-ink-700 outline-none dark:text-ink-200"
      >
        <option value="date_desc">Newest first</option>
        <option value="date_asc">Oldest first</option>
        <option value="amount_desc">Highest amount</option>
        <option value="amount_asc">Lowest amount</option>
      </select>
    </div>
  );
}
