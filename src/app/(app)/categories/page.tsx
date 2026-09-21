import { Save } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouse } from "@/lib/house";
import type { Category, CategoryBudget } from "@/lib/types";
import { formatMoney, currencySymbol, monthLabel } from "@/lib/format";
import { resolveMonth } from "@/lib/activeMonth";
import { effectiveBudget } from "@/lib/budgets";
import AddCategoryForm from "@/components/AddCategoryForm";
import DeleteButton from "@/components/DeleteButton";
import MonthNav from "@/components/MonthNav";
import { updateCategory, deleteCategory } from "@/app/(app)/actions";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: { m?: string };
}) {
  const { house } = await getActiveHouse();
  if (!house) return null;

  const month = resolveMonth(searchParams.m);
  const supabase = createClient();

  const [{ data: cats }, { data: budgetRows }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("house_id", house.id)
      .order("kind")
      .order("name"),
    supabase
      .from("category_budgets")
      .select("*")
      .eq("house_id", house.id)
      .eq("month", month),
  ]);
  const categories = (cats as Category[]) ?? [];
  const budgets = (budgetRows as CategoryBudget[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">Sections</h1>
          <p className="mt-0.5 text-sm text-ink-400">
            Organize spending into sections like Rent, Loans, Groceries. Budgets
            are set per month, so you can plan ahead for Oct, Nov, and beyond.
          </p>
        </div>
        <MonthNav month={month} />
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Add a section</h2>
        <AddCategoryForm
          houseId={house.id}
          currency={house.currency}
          existingColors={categories.map((c) => c.color)}
        />
      </div>

      <div className="card">
        <h2 className="section-title mb-4">
          Your sections ({categories.length}) · {monthLabel(month)}
        </h2>
        {categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/50 dark:border-ink-700 dark:bg-ink-800/40 px-4 py-8 text-center text-sm text-ink-500">
            No sections yet — add your first one above.
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((c) => {
              const budget = effectiveBudget(c, budgets, month);
              return (
                <div
                  key={c.id}
                  className="flex flex-col gap-3 rounded-xl border border-ink-200/70 bg-ink-50/30 p-3 transition hover:bg-ink-50/60 dark:border-ink-700/70 dark:bg-ink-800/30 dark:hover:bg-ink-800/60 sm:flex-row sm:items-end"
                >
                  <form
                    action={updateCategory}
                    className="grid flex-1 gap-3 sm:grid-cols-4"
                  >
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="house_id" value={house.id} />
                    <input type="hidden" name="month" value={month} />
                    <div className="sm:col-span-1">
                      <label className="label">Name</label>
                      <input name="name" defaultValue={c.name} className="input" />
                    </div>
                    <div>
                      <label className="label">Type</label>
                      <select name="kind" defaultValue={c.kind} className="input">
                        <option value="commitment">Commitment</option>
                        <option value="spending">Spending</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">
                        Budget for {monthLabel(month)} ({currencySymbol(house.currency)})
                      </label>
                      <input
                        name="monthly_budget"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={budget}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">Color</label>
                      <input
                        name="color"
                        type="color"
                        defaultValue={c.color}
                        className="h-[38px] w-full cursor-pointer rounded-lg border border-ink-300 dark:border-ink-600"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <button className="btn-ghost text-xs">
                        <Save className="h-3.5 w-3.5" />
                        Save changes
                      </button>
                      <span className="ml-3 text-xs text-ink-400">
                        {formatMoney(budget, house.currency)} for {monthLabel(month)}
                      </span>
                    </div>
                  </form>

                  <DeleteButton
                    action={deleteCategory}
                    id={c.id}
                    label="Delete section"
                    className="btn-danger"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
