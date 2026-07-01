import { Home } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {/* Ambient brand glow */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl dark:bg-brand-500/10" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-500/10" />

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-soft shadow-brand-600/30">
            <Home className="h-6 w-6" />
          </span>
          <div>
            <div className="text-lg font-bold tracking-tight text-ink-900 dark:text-white">
              Roost
            </div>
            <div className="text-sm text-ink-400">Budget under one roof.</div>
          </div>
        </div>
        <div className="card shadow-card-hover">{children}</div>
      </div>
    </div>
  );
}
