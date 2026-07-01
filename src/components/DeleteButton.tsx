"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";

// Non-blocking delete: fires the server action inside a transition so the UI
// stays responsive, keeps scroll position, and shows an inline spinner —
// instead of a full form submit that reloads and jumps the page.
export default function DeleteButton({
  action,
  id,
  label,
  className = "rounded-lg p-2 text-ink-300 transition hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50",
  children,
}: {
  action: (formData: FormData) => Promise<void> | void;
  id: string;
  label: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      aria-label={label}
      disabled={pending}
      aria-busy={pending}
      className={className}
      onClick={() =>
        start(async () => {
          const fd = new FormData();
          fd.set("id", id);
          await action(fd);
        })
      }
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        children ?? <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}
