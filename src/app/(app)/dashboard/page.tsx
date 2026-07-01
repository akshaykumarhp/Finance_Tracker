import Link from "next/link";
import {
  Wallet,
  TrendingDown,
  PiggyBank,
  ClipboardList,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouse } from "@/lib/house";
import { formatMoney, monthKey, monthRange } from "@/lib/format";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <MonthNav month={month} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Income"
          value={formatMoney(totalIncome)}
          tone="positive"
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Spent"
          value={formatMoney(totalSpent)}
          tone="negative"
          icon={<TrendingDown className="h-5 w-5" />}
          sub={
            totalIncome > 0
              ? `${Math.round((totalSpent / totalIncome) * 100)}% of income`
              : undefined
          }
        />
        <StatCard
          label="Remaining"
          value={formatMoney(remaining)}
          tone={remaining >= 0 ? "brand" : "negative"}
          icon={<PiggyBank className="h-5 w-5" />}
          sub={remaining < 0 ? "You're over budget" : "Left to save or spend"}
        />
        <StatCard
          label="Planned commitments"
          value={formatMoney(totalPlanned)}
          icon={<ClipboardList className="h-5 w-5" />}
          sub="Total monthly budget across sections"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="card lg:col-span-2">
          <h2 className="mb-3 font-semibold text-slate-800">Where money went</h2>
          <SpendingDonut data={donut} />
        </div>

        <div className="card lg:col-span-3">
          <h2 className="mb-4 font-semibold text-slate-800">Budget vs actual</h2>
          {categories.length === 0 ? (
            <p className="text-sm text-slate-400">
              No sections yet.{" "}
              <Link href="/categories" className="text-brand-600 hover:underline">
                Create sections
              </Link>{" "}
              like Rent, Loan or Groceries to start planning.
            </p>
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
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Recent expenses</h2>
          <Link
            href="/transactions"
            className="text-sm text-brand-600 hover:underline"
          >
            View all
          </Link>
        </div>
        {expenses.length === 0 ? (
          <p className="text-sm text-slate-400">
            No expenses logged for this month yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {expenses.slice(0, 6).map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">
                    {e.description || catName(e.category_id)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {catName(e.category_id)} · {e.spent_on}
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-800">
                  {formatMoney(e.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
