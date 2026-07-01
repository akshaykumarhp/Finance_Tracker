import { Wallet } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-brand-700">
          <Wallet className="h-7 w-7" />
          <span className="text-xl font-bold">House Expense Tracker</span>
        </div>
        <div className="card">{children}</div>
      </div>
    </div>
  );
}
