import { Trash2, ArrowUpRight, Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouse } from "@/lib/house";
import { formatMoney, formatDate, monthKey, monthRange } from "@/lib/format";
import type { Category, Expense } from "@/lib/types";
import MonthNav from "@/components/MonthNav";
import AddExpenseForm from "@/components/AddExpenseForm";
import StatCard from "@/components/StatCard";
import { deleteExpense } from "@/app/(app)/actions";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { m?: string };
}) {
  const { house } = await getActiveHouse();
  if (!house) return null;

  const month = searchParams.m ?? monthKey();
  const { start, end } = monthRange(month);
  const supabase = createClient();

  const [{ data: cats }, { data: exps }] = await Promise.all([
    supabase.from("categories").select("*").eq("house_id", house.id).order("name"),
    supabase
      .from("expenses")
      .select("*")
      .eq("house_id", house.id)
      .gte("spent_on", start)
      .lte("spent_on", end)
      .order("spent_on", { ascending: false }),
  ]);
  const categories = (cats as Category[]) ?? [];
  const expenses = (exps as Expense[]) ?? [];
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const catName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name ?? "Uncategorized";
  const catColor = (id: string | null) =>
    categories.find((c) => c.id === id)?.color ?? "#94a3b8";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="mt-0.5 text-sm text-ink-400">Every spend, logged by hand.</p>
        </div>
        <MonthNav month={month} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:max-w-md sm:gap-4">
        <StatCard
          label="Total this month"
          value={formatMoney(total, house.currency)}
          tone="negative"
          icon={<ArrowUpRight className="h-4 w-4" />}
        />
        <StatCard label="Entries" value={String(expenses.length)} />
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Add expense</h2>
        {categories.length === 0 && (
          <p className="mb-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
            Tip: create sections (Rent, Groceries…) first so expenses roll up into
            budgets. You can still log uncategorized expenses below.
          </p>
        )}
        <AddExpenseForm
          houseId={house.id}
          categories={categories}
          currency={house.currency}
        />
      </div>

      <div className="card">
        <h2 className="section-title mb-3">This month</h2>
        {expenses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/50 px-4 py-8 text-center text-sm text-ink-500">
            No expenses recorded this month.
          </div>
        ) : (
          <div className="divide-y divide-ink-100">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center gap-3 py-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${catColor(e.category_id)}1a`,
                    color: catColor(e.category_id),
                  }}
                >
                  <Receipt className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink-800">
                    {e.description || catName(e.category_id)}
                  </p>
                  <p className="text-xs text-ink-400">
                    {catName(e.category_id)} · {formatDate(e.spent_on)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="tnum font-semibold text-ink-900">
                    {formatMoney(e.amount, house.currency)}
                  </span>
                  <form action={deleteExpense}>
                    <input type="hidden" name="id" value={e.id} />
                    <button
                      className="rounded-lg p-2 text-ink-300 transition hover:bg-rose-50 hover:text-rose-500"
                      aria-label="Delete expense"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
