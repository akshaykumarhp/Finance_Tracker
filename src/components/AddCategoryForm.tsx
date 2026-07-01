"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { Plus } from "lucide-react";
import { createCategory } from "@/app/(app)/actions";
import SubmitButton from "@/components/SubmitButton";
import { currencySymbol } from "@/lib/format";

const COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6",
];

export default function AddCategoryForm({
  houseId,
  currency,
}: {
  houseId: string;
  currency: string;
}) {
  const [state, action] = useFormState(createCategory, {} as { error?: string; ok?: boolean });
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="house_id" value={houseId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Section name</label>
          <input name="name" className="input" placeholder="e.g. Rent" required />
        </div>
        <div>
          <label className="label">Type</label>
          <select name="kind" className="input" defaultValue="commitment">
            <option value="commitment">Fixed commitment</option>
            <option value="spending">Variable spending</option>
          </select>
        </div>
        <div>
          <label className="label">
            Monthly budget / plan ({currencySymbol(currency)})
          </label>
          <input
            name="monthly_budget"
            type="number"
            step="0.01"
            min="0"
            className="input"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="label">Color</label>
          <div className="flex flex-wrap gap-2 pt-1">
            {COLORS.map((c, i) => (
              <label key={c} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={c}
                  defaultChecked={i === 0}
                  className="peer sr-only"
                />
                <span
                  className="block h-7 w-7 rounded-full ring-offset-2 peer-checked:ring-2 peer-checked:ring-slate-400"
                  style={{ backgroundColor: c }}
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton className="btn-primary">
        <Plus className="h-4 w-4" />
        Add section
      </SubmitButton>
    </form>
  );
}
