"use client";

import { Sun, Moon } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggle}
      className={clsx(
        "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition-colors duration-200",
        isDark
          ? "border-ink-600 bg-ink-700"
          : "border-ink-200 bg-ink-100",
        className,
      )}
    >
      <span
        className={clsx(
          "flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 dark:bg-ink-900",
          isDark ? "translate-x-[26px]" : "translate-x-1",
        )}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-brand-300" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-amber-500" />
        )}
      </span>
    </button>
  );
}
