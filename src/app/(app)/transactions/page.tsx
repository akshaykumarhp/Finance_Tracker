import { ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouse } from "@/lib/house";
import { formatMoney, monthKey, monthRange } from "@/lib/format";
import type { Category, Expense } from "@/lib/types";
import MonthNav from "@/components/MonthNav";
import AddExpenseForm from "@/components/AddExpenseForm";
import StatCard from "@/components/StatCard";
import ExpenseRow from "@/components/ExpenseRow";
import ExpenseSort, { type ExpenseSortKey } from "@/components/ExpenseSort";

const SORT_CONFIG: Record<
  ExpenseSortKey,
  { column: "spent_on" | "amount"; ascending: boolean }
> = {
  date_desc: { column: "spent_on", ascending: false },
  date_asc: { column: "spent_on", ascending: true },
  amount_desc: { column: "amount", ascending: false },
  amount_asc: { column: "amount", ascending: true },
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { m?: string; sort?: string };
}) {
  const { house } = await getActiveHouse();
  if (!house) return null;

  const month = searchParams.m ?? monthKey();
  const { start, end } = monthRange(month);
  const sort: ExpenseSortKey =
    searchParams.sort && searchParams.sort in SORT_CONFIG
      ? (searchParams.sort as ExpenseSortKey)
      : "date_desc";
  const { column, ascending } = SORT_CONFIG[sort];

  const supabase = createClient();

  const [{ data: cats }, { data: exps }] = await Promise.all([
    supabase.from("categories").select("*").eq("house_id", house.id).order("name"),
    supabase
      .from("expenses")
      .select("*")
      .eq("house_id", house.id)
      .gte("spent_on", start)
      .lte("spent_on", end)
      .order(column, { ascending }),
  ]);
  const categories = (cats as Category[]) ?? [];
  const expenses = (exps as Expense[]) ?? [];
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

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
          <p className="mb-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-500/10 dark:text-amber-400">
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
        <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="section-title">This month</h2>
          {expenses.length > 0 && <ExpenseSort sort={sort} />}
        </div>
        {expenses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/50 dark:border-ink-700 dark:bg-ink-800/40 px-4 py-8 text-center text-sm text-ink-500">
            No expenses recorded this month.
          </div>
        ) : (
          <div className="divide-y divide-ink-100 dark:divide-ink-700">
            {expenses.map((e) => (
              <ExpenseRow
                key={e.id}
                expense={e}
                categories={categories}
                currency={house.currency}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
