"use client";

import { useFormState } from "react-dom";
import { Home, Users, Wallet } from "lucide-react";
import { createHouse, joinHouse } from "@/app/(app)/actions";
import SubmitButton from "@/components/SubmitButton";
import CurrencySelect from "@/components/CurrencySelect";
import { signOut } from "@/app/(auth)/actions";

export default function Onboarding() {
  const [createState, createAction] = useFormState(createHouse, {} as { error?: string });
  const [joinState, joinAction] = useFormState(joinHouse, {} as { error?: string });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-slate-100 px-4 py-10">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-soft shadow-brand-600/30">
              <Wallet className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-ink-900">
              House Expense Tracker
            </span>
          </div>
          <p className="text-ink-500">
            Create a household to start, or join one a family member already made.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="card">
            <div className="mb-3 flex items-center gap-2 section-title">
              <Home className="h-5 w-5 text-brand-600" />
              Create a house
            </div>
            <form action={createAction} className="space-y-3">
              <div>
                <label className="label" htmlFor="name">
                  House name
                </label>
                <input
                  id="name"
                  name="name"
                  className="input"
                  placeholder="e.g. The Kumar Household"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="currency">
                  Currency
                </label>
                <CurrencySelect id="currency" />
              </div>
              {createState?.error && (
                <p className="text-sm text-red-600">{createState.error}</p>
              )}
              <SubmitButton>Create house</SubmitButton>
            </form>
          </div>

          <div className="card">
            <div className="mb-3 flex items-center gap-2 section-title">
              <Users className="h-5 w-5 text-brand-600" />
              Join a house
            </div>
            <form action={joinAction} className="space-y-3">
              <div>
                <label className="label" htmlFor="code">
                  Join code
                </label>
                <input
                  id="code"
                  name="code"
                  className="input uppercase"
                  placeholder="6-character code"
                  required
                />
              </div>
              {joinState?.error && (
                <p className="text-sm text-red-600">{joinState.error}</p>
              )}
              <SubmitButton>Join house</SubmitButton>
            </form>
          </div>
        </div>

        <form action={signOut} className="mt-6 text-center">
          <button className="text-sm text-ink-400 hover:text-slate-600">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
