import { Trash2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouse } from "@/lib/house";
import type { Category } from "@/lib/types";
import { formatMoney, currencySymbol } from "@/lib/format";
import AddCategoryForm from "@/components/AddCategoryForm";
import { updateCategory, deleteCategory } from "@/app/(app)/actions";

export default async function CategoriesPage() {
  const { house } = await getActiveHouse();
  if (!house) return null;

  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("house_id", house.id)
    .order("kind")
    .order("name");
  const categories = (data as Category[]) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Sections</h1>
        <p className="mt-0.5 text-sm text-ink-400">
          Organize spending into sections like Rent, Loans, Groceries. Set a
          monthly budget to track how much is left.
        </p>
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Add a section</h2>
        <AddCategoryForm houseId={house.id} currency={house.currency} />
      </div>

      <div className="card">
        <h2 className="section-title mb-4">
          Your sections ({categories.length})
        </h2>
        {categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/50 px-4 py-8 text-center text-sm text-ink-500">
            No sections yet — add your first one above.
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-3 rounded-xl border border-ink-200/70 bg-ink-50/30 p-3 transition hover:bg-ink-50/60 sm:flex-row sm:items-end"
              >
                <form
                  action={updateCategory}
                  className="grid flex-1 gap-3 sm:grid-cols-4"
                >
                  <input type="hidden" name="id" value={c.id} />
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
                      Budget ({currencySymbol(house.currency)})
                    </label>
                    <input
                      name="monthly_budget"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={Number(c.monthly_budget)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Color</label>
                    <input
                      name="color"
                      type="color"
                      defaultValue={c.color}
                      className="h-[38px] w-full cursor-pointer rounded-lg border border-slate-300"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <button className="btn-ghost text-xs">
                      <Save className="h-3.5 w-3.5" />
                      Save changes
                    </button>
                    <span className="ml-3 text-xs text-slate-400">
                      Budget: {formatMoney(c.monthly_budget, house.currency)} / month
                    </span>
                  </div>
                </form>

                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="btn-danger" aria-label="Delete section">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
