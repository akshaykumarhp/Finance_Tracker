"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { Plus } from "lucide-react";
import { createCategory } from "@/app/(app)/actions";
import SubmitButton from "@/components/SubmitButton";
import { currencySymbol } from "@/lib/format";
import { pickCategoryColor } from "@/lib/colors";

export default function AddCategoryForm({
  houseId,
  currency,
  existingColors,
}: {
  houseId: string;
  currency: string;
  existingColors: string[];
}) {
  const [state, action] = useFormState(createCategory, {} as { error?: string; ok?: boolean });
  const ref = useRef<HTMLFormElement>(null);
  const nextColor = pickCategoryColor(existingColors);

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
        <div className="sm:col-span-2">
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
      </div>

      <div className="flex items-center gap-2 text-xs text-ink-400">
        <span
          className="inline-block h-3 w-3 rounded-full ring-2 ring-white dark:ring-ink-800"
          style={{ backgroundColor: nextColor, boxShadow: `0 0 0 1px ${nextColor}33` }}
        />
        Color is assigned automatically so sections never repeat.
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton className="btn-primary">
        <Plus className="h-4 w-4" />
        Add section
      </SubmitButton>
    </form>
  );
}
