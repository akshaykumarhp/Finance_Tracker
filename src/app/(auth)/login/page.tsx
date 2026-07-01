"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { login } from "../actions";
import SubmitButton from "@/components/SubmitButton";

export default function LoginPage() {
  const [state, formAction] = useFormState(login, {} as { error?: string });

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-slate-800">Welcome back</h1>
      <p className="mb-5 text-sm text-slate-500">
        Sign in to your household dashboard.
      </p>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="input"
          />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <SubmitButton>Sign in</SubmitButton>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        No account?{" "}
        <Link href="/signup" className="font-medium text-brand-600 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
