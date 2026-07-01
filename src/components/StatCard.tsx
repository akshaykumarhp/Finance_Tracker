import clsx from "clsx";

const tones = {
  default: {
    value: "text-ink-900 dark:text-white",
    chip: "bg-ink-100 text-ink-500 dark:bg-ink-700 dark:text-ink-300",
  },
  positive: {
    value: "text-emerald-600 dark:text-emerald-400",
    chip: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  negative: {
    value: "text-rose-600 dark:text-rose-400",
    chip: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  },
  brand: {
    value: "text-brand-600 dark:text-brand-300",
    chip: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300",
  },
} as const;

export default function StatCard({
  label,
  value,
  sub,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: keyof typeof tones;
  icon?: React.ReactNode;
}) {
  const t = tones[tone];
  return (
    <div className="card-interactive">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
          {label}
        </span>
        {icon && (
          <span
            className={clsx(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              t.chip,
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <div className={clsx("tnum mt-2 text-2xl font-bold tracking-tight", t.value)}>
        {value}
      </div>
      {sub && <p className="mt-1 text-xs text-ink-400">{sub}</p>}
    </div>
  );
}
