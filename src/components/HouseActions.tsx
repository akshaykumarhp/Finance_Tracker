"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { Plus, Users } from "lucide-react";
import { createHouse, joinHouse } from "@/app/(app)/actions";
import SubmitButton from "@/components/SubmitButton";
import CurrencySelect from "@/components/CurrencySelect";

// Create-another / join-another house controls, shown collapsed by default.
export default function HouseActions() {
  const [open, setOpen] = useState(false);
  const [createState, createAction] = useFormState(createHouse, {} as { error?: string });
  const [joinState, joinAction] = useFormState(joinHouse, {} as { error?: string });

  if (!open) {
    return (
      <button className="btn-ghost" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Create or join another house
      </button>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-slate-100 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Plus className="h-4 w-4 text-brand-600" /> Create a new house
        </div>
        <form action={createAction} className="space-y-2">
          <input name="name" className="input" placeholder="House name" required />
          <CurrencySelect />
          {createState?.error && (
            <p className="text-sm text-red-600">{createState.error}</p>
          )}
          <SubmitButton className="btn-primary w-full">Create</SubmitButton>
        </form>
      </div>

      <div className="rounded-xl border border-slate-100 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Users className="h-4 w-4 text-brand-600" /> Join with a code
        </div>
        <form action={joinAction} className="space-y-2">
          <input
            name="code"
            className="input uppercase"
            placeholder="Join code"
            required
          />
          {joinState?.error && (
            <p className="text-sm text-red-600">{joinState.error}</p>
          )}
          <SubmitButton className="btn-primary w-full">Join</SubmitButton>
        </form>
      </div>
    </div>
  );
}
