"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { Plus } from "lucide-react";
import { addIncome } from "@/app/(app)/actions";
import SubmitButton from "@/components/SubmitButton";

export default function AddIncomeForm({ houseId }: { houseId: string }) {
  const [state, action] = useFormState(addIncome, {} as { error?: string; ok?: boolean });
  const ref = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="house_id" value={houseId} />
      <div>
        <label className="label">Source</label>
        <input name="source" className="input" placeholder="Salary" required />
      </div>
      <div>
        <label className="label">Amount ($)</label>
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0"
          className="input"
          placeholder="0.00"
          required
        />
      </div>
      <div>
        <label className="label">Date</label>
        <input name="received_on" type="date" defaultValue={today} className="input" />
      </div>
      <div>
        <label className="label">Note (optional)</label>
        <input name="note" className="input" placeholder="Monthly paycheck" />
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        {state?.error && <p className="mb-2 text-sm text-red-600">{state.error}</p>}
        <SubmitButton className="btn-primary">
          <Plus className="h-4 w-4" />
          Add income
        </SubmitButton>
      </div>
    </form>
  );
}
