import clsx from "clsx";
import { formatMoney } from "@/lib/format";

export default function BudgetBar({
  name,
  color,
  spent,
  budget,
  kind,
  currency,
}: {
  name: string;
  color: string;
  spent: number;
  budget: number;
  kind: "commitment" | "spending";
  currency: string;
}) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : spent > 0 ? 100 : 0;
  const over = budget > 0 && spent > budget;
  const remaining = budget - spent;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium text-ink-800">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white"
            style={{ backgroundColor: color, boxShadow: `0 0 0 1px ${color}33` }}
          />
          {name}
          <span className="chip">{kind}</span>
        </span>
        <span className="tnum text-ink-500">
          <span className="font-semibold text-ink-800">
            {formatMoney(spent, currency)}
          </span>
          {budget > 0 && (
            <span className="text-ink-400"> / {formatMoney(budget, currency)}</span>
          )}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
        <div
          className={clsx("h-full rounded-full transition-all", over && "!bg-rose-500")}
          style={{ width: `${pct}%`, backgroundColor: over ? undefined : color }}
        />
      </div>
      {budget > 0 && (
        <p
          className={clsx(
            "mt-1.5 text-xs font-medium",
            over ? "text-rose-500" : "text-ink-400",
          )}
        >
          {over
            ? `Over budget by ${formatMoney(Math.abs(remaining), currency)}`
            : `${formatMoney(remaining, currency)} left`}
        </p>
      )}
    </div>
  );
}
