import type { Category, CategoryBudget } from "@/lib/types";

// A category's budget for a given month: the per-month override if one
// exists, otherwise its recurring default (categories.monthly_budget).
export function effectiveBudget(
  category: Category,
  overrides: CategoryBudget[],
  month: string,
): number {
  const override = overrides.find(
    (o) => o.category_id === category.id && o.month === month,
  );
  return override ? Number(override.amount) : Number(category.monthly_budget);
}
