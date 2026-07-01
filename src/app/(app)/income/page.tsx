import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouse } from "@/lib/house";
import { formatMoney, monthKey, monthRange } from "@/lib/format";
import type { Income } from "@/lib/types";
import MonthNav from "@/components/MonthNav";
import AddIncomeForm from "@/components/AddIncomeForm";
import StatCard from "@/components/StatCard";
import { deleteIncome } from "@/app/(app)/actions";

export default async function IncomePage({
  searchParams,
}: {
  searchParams: { m?: string };
}) {
  const { house } = await getActiveHouse();
  if (!house) return null;

  const month = searchParams.m ?? monthKey();
  const { start, end } = monthRange(month);
  const supabase = createClient();

  const { data } = await supabase
    .from("incomes")
    .select("*")
    .eq("house_id", house.id)
    .gte("received_on", start)
    .lte("received_on", end)
    .order("received_on", { ascending: false });
  const incomes = (data as Income[]) ?? [];
  const total = incomes.reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold text-slate-800">Income</h1>
        <MonthNav month={month} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <StatCard label="Total this month" value={formatMoney(total)} tone="positive" />
        <StatCard label="Entries" value={String(incomes.length)} />
      </div>

      <div className="card">
        <h2 className="mb-4 font-semibold text-slate-800">Add income</h2>
        <AddIncomeForm houseId={house.id} />
      </div>

      <div className="card">
        <h2 className="mb-3 font-semibold text-slate-800">This month</h2>
        {incomes.length === 0 ? (
          <p className="text-sm text-slate-400">No income recorded this month.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {incomes.map((i) => (
              <div key={i.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-700">{i.source}</p>
                  <p className="text-xs text-slate-400">
                    {i.received_on}
                    {i.note ? ` · ${i.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-emerald-600">
                    {formatMoney(i.amount)}
                  </span>
                  <form action={deleteIncome}>
                    <input type="hidden" name="id" value={i.id} />
                    <button
                      className="rounded-lg p-2 text-slate-300 hover:bg-red-50 hover:text-red-500"
                      aria-label="Delete income"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
