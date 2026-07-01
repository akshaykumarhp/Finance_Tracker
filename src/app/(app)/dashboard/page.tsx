import Link from "next/link";
import clsx from "clsx";
import {
  Wallet,
  TrendingDown,
  PiggyBank,
  ClipboardList,
  Receipt,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouse } from "@/lib/house";
import { formatMoney, formatDate, monthKey, monthRange } from "@/lib/format";
import type { Category, Expense, Income } from "@/lib/types";
import MonthNav from "@/components/MonthNav";
import StatCard from "@/components/StatCard";
import SpendingDonut from "@/components/SpendingDonut";
import BudgetBar from "@/components/BudgetBar";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { m?: string };
}) {
  const { house } = await getActiveHouse();
  if (!house) return null;

  const month = searchParams.m ?? monthKey();
  const { start, end } = monthRange(month);
  const supabase = createClient();

  const [{ data: cats }, { data: incs }, { data: exps }] = await Promise.all([
    supabase.from("categories").select("*").eq("house_id", house.id).order("name"),
    supabase
      .from("incomes")
      .select("*")
      .eq("house_id", house.id)
      .gte("received_on", start)
      .lte("received_on", end),
    supabase
      .from("expenses")
      .select("*")
      .eq("house_id", house.id)
      .gte("spent_on", start)
      .lte("spent_on", end)
      .order("spent_on", { ascending: false }),
  ]);

  const categories = (cats as Category[]) ?? [];
  const incomes = (incs as Income[]) ?? [];
  const expenses = (exps as Expense[]) ?? [];

  const totalIncome = incomes.reduce((s, i) => s + Number(i.amount), 0);
  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const remaining = totalIncome - totalSpent;
  const totalPlanned = categories.reduce((s, c) => s + Number(c.monthly_budget), 0);

  // Spend per category.
  const spentByCat = new Map<string, number>();
  for (const e of expenses) {
    const key = e.category_id ?? "uncat";
    spentByCat.set(key, (spentByCat.get(key) ?? 0) + Number(e.amount));
  }

  const donut = categories
    .map((c) => ({
      name: c.name,
      value: spentByCat.get(c.id) ?? 0,
      color: c.color,
    }))
    .filter((s) => s.value > 0);

  const uncategorized = spentByCat.get("uncat") ?? 0;
  if (uncategorized > 0) {
    donut.push({ name: "Uncategorized", value: uncategorized, color: "#94a3b8" });
  }

  const catName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name ?? "Uncategorized";
  const catColor = (id: string | null) =>
    categories.find((c) => c.id === id)?.color ?? "#94a3b8";

  const spentPct = totalIncome > 0 ? Math.min((totalSpent / totalIncome) * 100, 100) : 0;
  const savingsRate =
    totalIncome > 0 ? Math.round((remaining / totalIncome) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="mt-0.5 text-sm text-ink-400">
            Your household money at a glance.
          </p>
        </div>
        <MonthNav month={month} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Income"
          value={formatMoney(totalIncome, house.currency)}
          tone="positive"
          icon={<Wallet className="h-4 w-4" />}
          sub="Total received this month"
        />
        <StatCard
          label="Spent"
          value={formatMoney(totalSpent, house.currency)}
          tone="negative"
          icon={<TrendingDown className="h-4 w-4" />}
          sub={
            totalIncome > 0
              ? `${Math.round((totalSpent / totalIncome) * 100)}% of income`
              : "No income logged yet"
          }
        />
        <StatCard
          label="Remaining"
          value={formatMoney(remaining, house.currency)}
          tone={remaining >= 0 ? "brand" : "negative"}
          icon={<PiggyBank className="h-4 w-4" />}
          sub={
            remaining < 0
              ? "Over budget this month"
              : totalIncome > 0
                ? `${savingsRate}% savings rate`
                : "Left to save or spend"
          }
        />
        <StatCard
          label="Planned"
          value={formatMoney(totalPlanned, house.currency)}
          icon={<ClipboardList className="h-4 w-4" />}
          sub="Budgeted across sections"
        />
      </div>

      {/* Income usage bar */}
      {totalIncome > 0 && (
        <div className="card">
          <div className="mb-2 flex items-end justify-between">
            <span className="section-title">This month&apos;s income usage</span>
            <span className="tnum text-sm text-ink-500">
              <span className="font-semibold text-ink-800 dark:text-ink-100">
                {formatMoney(totalSpent, house.currency)}
              </span>{" "}
              of {formatMoney(totalIncome, house.currency)}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-700">
            <div
              className={clsx(
                "h-full rounded-full transition-all",
                spentPct >= 100
                  ? "bg-rose-500"
                  : spentPct > 80
                    ? "bg-amber-500"
                    : "bg-gradient-to-r from-brand-500 to-violet-500",
              )}
              style={{ width: `${Math.max(spentPct, 2)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-ink-400">
            {remaining >= 0
              ? `You've kept ${formatMoney(remaining, house.currency)} (${savingsRate}%) so far.`
              : `You're ${formatMoney(Math.abs(remaining), house.currency)} over your income this month.`}
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
        <div className="card lg:col-span-2">
          <h2 className="section-title mb-3">Where money went</h2>
          <SpendingDonut data={donut} currency={house.currency} />
        </div>

        <div className="card lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Budget vs actual</h2>
            <Link
              href="/categories"
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Manage
            </Link>
          </div>
          {categories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/50 dark:border-ink-700 dark:bg-ink-800/40 px-4 py-8 text-center">
              <p className="text-sm text-ink-500">No sections yet.</p>
              <Link href="/categories" className="btn-primary btn-sm mt-3">
                Create your first section
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((c) => (
                <BudgetBar
                  key={c.id}
                  name={c.name}
                  color={c.color}
                  kind={c.kind}
                  spent={spentByCat.get(c.id) ?? 0}
                  budget={Number(c.monthly_budget)}
                  currency={house.currency}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">Recent expenses</h2>
          <Link
            href="/transactions"
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            View all
          </Link>
        </div>
        {expenses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/50 dark:border-ink-700 dark:bg-ink-800/40 px-4 py-8 text-center">
            <p className="text-sm text-ink-500">No expenses logged this month yet.</p>
            <Link href="/transactions" className="btn-primary btn-sm mt-3">
              Log an expense
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-ink-100 dark:divide-ink-700">
            {expenses.slice(0, 6).map((e) => (
              <div key={e.id} className="flex items-center gap-3 py-2.5">
                <span
                  className="h-9 w-9 shrink-0 rounded-xl"
                  style={{ backgroundColor: `${catColor(e.category_id)}1a` }}
                >
                  <span
                    className="flex h-full w-full items-center justify-center"
                    style={{ color: catColor(e.category_id) }}
                  >
                    <Receipt className="h-4 w-4" />
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">
                    {e.description || catName(e.category_id)}
                  </p>
                  <p className="text-xs text-ink-400">
                    {catName(e.category_id)} · {formatDate(e.spent_on)}
                  </p>
                </div>
                <span className="tnum text-sm font-semibold text-ink-900 dark:text-white">
                  {formatMoney(e.amount, house.currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
