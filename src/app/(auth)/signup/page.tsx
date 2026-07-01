"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { signup } from "../actions";
import SubmitButton from "@/components/SubmitButton";

export default function SignupPage() {
  const [state, formAction] = useFormState(
    signup,
    {} as { error?: string; message?: string },
  );

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-slate-800">
        Create your account
      </h1>
      <p className="mb-5 text-sm text-slate-500">
        Start tracking your household finances.
      </p>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="label" htmlFor="display_name">
            Name
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            required
            className="input"
            placeholder="Akshay"
          />
        </div>
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
            minLength={6}
            className="input"
            placeholder="At least 6 characters"
          />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        )}
        {state?.message && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {state.message}
          </p>
        )}

        <SubmitButton>Create account</SubmitButton>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
