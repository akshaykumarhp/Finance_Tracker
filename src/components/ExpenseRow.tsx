"use client";

import { useState, useTransition } from "react";
import { Receipt, Pencil, Check, X, Loader2 } from "lucide-react";
import { formatMoney, formatDate } from "@/lib/format";
import type { Category, Expense } from "@/lib/types";
import { updateExpense, deleteExpense } from "@/app/(app)/actions";
import DeleteButton from "@/components/DeleteButton";

export default function ExpenseRow({
  expense,
  categories,
  currency,
}: {
  expense: Expense;
  categories: Category[];
  currency: string;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();

  const catName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name ?? "Uncategorized";
  const catColor = (id: string | null) =>
    categories.find((c) => c.id === id)?.color ?? "#94a3b8";

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          start(async () => {
            await updateExpense(fd);
            setEditing(false);
          });
        }}
        className="grid gap-3 py-3 sm:grid-cols-4"
      >
        <input type="hidden" name="id" value={expense.id} />
        <div>
          <label className="label">Section</label>
          <select
            name="category_id"
            defaultValue={expense.category_id ?? ""}
            className="input"
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Amount</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            defaultValue={Number(expense.amount)}
            required
            className="input"
          />
        </div>
        <div>
          <label className="label">Date</label>
          <input
            name="spent_on"
            type="date"
            defaultValue={expense.spent_on}
            className="input"
          />
        </div>
        <div>
          <label className="label">Description</label>
          <input
            name="description"
            defaultValue={expense.description ?? ""}
            className="input"
          />
        </div>
        <div className="flex items-center gap-2 sm:col-span-4">
          <button
            type="submit"
            disabled={pending}
            className="btn-primary btn-sm"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Save
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setEditing(false)}
            className="btn-ghost btn-sm"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3 py-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          backgroundColor: `${catColor(expense.category_id)}1a`,
          color: catColor(expense.category_id),
        }}
      >
        <Receipt className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink-800 dark:text-ink-100">
          {expense.description || catName(expense.category_id)}
        </p>
        <p className="text-xs text-ink-400">
          {catName(expense.category_id)} · {formatDate(expense.spent_on)}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <span className="tnum font-semibold text-ink-900 dark:text-white">
          {formatMoney(expense.amount, currency)}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="Edit expense"
          className="rounded-lg p-2 text-ink-300 transition hover:bg-brand-50 hover:text-brand-600 dark:text-ink-600 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <DeleteButton action={deleteExpense} id={expense.id} label="Delete expense" />
      </div>
    </div>
  );
}
