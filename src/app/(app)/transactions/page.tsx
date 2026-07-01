import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouse } from "@/lib/house";
import { formatMoney, monthKey, monthRange } from "@/lib/format";
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
        <h1 className="text-xl font-bold text-slate-800">Expenses</h1>
        <MonthNav month={month} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <StatCard label="Total this month" value={formatMoney(total)} tone="negative" />
        <StatCard label="Entries" value={String(expenses.length)} />
      </div>

      <div className="card">
        <h2 className="mb-4 font-semibold text-slate-800">Add expense</h2>
        {categories.length === 0 && (
          <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Tip: create sections (Rent, Groceries…) first so expenses roll up into
            budgets. You can still log uncategorized expenses below.
          </p>
        )}
        <AddExpenseForm houseId={house.id} categories={categories} />
      </div>

      <div className="card">
        <h2 className="mb-3 font-semibold text-slate-800">This month</h2>
        {expenses.length === 0 ? (
          <p className="text-sm text-slate-400">No expenses recorded this month.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: catColor(e.category_id) }}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-700">
                      {e.description || catName(e.category_id)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {catName(e.category_id)} · {e.spent_on}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-800">
                    {formatMoney(e.amount)}
                  </span>
                  <form action={deleteExpense}>
                    <input type="hidden" name="id" value={e.id} />
                    <button
                      className="rounded-lg p-2 text-slate-300 hover:bg-red-50 hover:text-red-500"
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
