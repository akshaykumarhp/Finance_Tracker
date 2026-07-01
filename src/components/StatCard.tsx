import clsx from "clsx";

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
  tone?: "default" | "positive" | "negative" | "brand";
  icon?: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {icon && <span className="text-slate-300">{icon}</span>}
      </div>
      <div
        className={clsx("mt-2 text-2xl font-bold", {
          "text-slate-800": tone === "default",
          "text-emerald-600": tone === "positive",
          "text-red-600": tone === "negative",
          "text-brand-600": tone === "brand",
        })}
      >
        {value}
      </div>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
