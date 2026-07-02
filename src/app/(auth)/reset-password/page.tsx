"use client";

import { useFormState } from "react-dom";
import { updatePassword } from "../actions";
import SubmitButton from "@/components/SubmitButton";
import PasswordInput from "@/components/PasswordInput";

export default function ResetPasswordPage() {
  const [state, formAction] = useFormState(
    updatePassword,
    {} as { error?: string },
  );

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-ink-900 dark:text-white">
        Set a new password
      </h1>
      <p className="mb-5 text-sm text-ink-400">
        Choose a new password for your account.
      </p>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="label" htmlFor="password">
            New password
          </label>
          <PasswordInput
            id="password"
            name="password"
            required
            minLength={6}
            placeholder="At least 6 characters"
          />
        </div>
        <div>
          <label className="label" htmlFor="confirm">
            Confirm password
          </label>
          <PasswordInput
            id="confirm"
            name="confirm"
            required
            minLength={6}
            placeholder="Re-enter new password"
          />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            {state.error}
          </p>
        )}

        <SubmitButton>Update password</SubmitButton>
      </form>
    </div>
  );
}
