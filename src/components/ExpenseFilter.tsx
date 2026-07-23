"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter, Loader2 } from "lucide-react";
import clsx from "clsx";
import type { Category } from "@/lib/types";

// value is "all" (default, no filter), "uncat" (no section), or a category id.
export default function ExpenseFilter({
  categories,
  value,
}: {
  categories: Category[];
  value: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = new URLSearchParams(params);
    if (e.target.value === "all") {
      next.delete("cat");
    } else {
      next.set("cat", e.target.value);
    }
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
        <Filter className="h-4 w-4 shrink-0 text-ink-400" />
      )}
      <select
        value={value}
        onChange={onChange}
        aria-label="Filter expenses by section"
        className="bg-transparent text-sm font-medium text-ink-700 outline-none dark:text-ink-200"
      >
        <option value="all">All sections</option>
        <option value="uncat">Uncategorized</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
