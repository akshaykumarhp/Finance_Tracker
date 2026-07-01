import clsx from "clsx";
import { formatMoney } from "@/lib/format";

export default function BudgetBar({
  name,
  color,
  spent,
  budget,
  kind,
}: {
  name: string;
  color: string;
  spent: number;
  budget: number;
  kind: "commitment" | "spending";
}) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : spent > 0 ? 100 : 0;
  const over = budget > 0 && spent > budget;
  const remaining = budget - spent;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium text-slate-700">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          {name}
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
            {kind}
          </span>
        </span>
        <span className="text-slate-500">
          {formatMoney(spent)}
          {budget > 0 && (
            <span className="text-slate-400"> / {formatMoney(budget)}</span>
          )}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={clsx("h-full rounded-full transition-all", over && "!bg-red-500")}
          style={{ width: `${pct}%`, backgroundColor: over ? undefined : color }}
        />
      </div>
      {budget > 0 && (
        <p
          className={clsx(
            "mt-1 text-xs",
            over ? "text-red-500" : "text-slate-400",
          )}
        >
          {over
            ? `Over budget by ${formatMoney(Math.abs(remaining))}`
            : `${formatMoney(remaining)} left`}
        </p>
      )}
    </div>
  );
}
