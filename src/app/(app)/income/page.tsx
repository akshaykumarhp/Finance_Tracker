import { ArrowDownRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouse } from "@/lib/house";
import { formatMoney, formatDate, monthKey, monthRange } from "@/lib/format";
import type { Income } from "@/lib/types";
import MonthNav from "@/components/MonthNav";
import AddIncomeForm from "@/components/AddIncomeForm";
import StatCard from "@/components/StatCard";
import DeleteButton from "@/components/DeleteButton";
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
        <div>
          <h1 className="page-title">Income</h1>
          <p className="mt-0.5 text-sm text-ink-400">Money coming in this month.</p>
        </div>
        <MonthNav month={month} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:max-w-md sm:gap-4">
        <StatCard
          label="Total this month"
          value={formatMoney(total, house.currency)}
          tone="positive"
          icon={<ArrowDownRight className="h-4 w-4" />}
        />
        <StatCard label="Entries" value={String(incomes.length)} />
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Add income</h2>
        <AddIncomeForm houseId={house.id} currency={house.currency} />
      </div>

      <div className="card">
        <h2 className="section-title mb-3">This month</h2>
        {incomes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/50 px-4 py-8 text-center text-sm text-ink-500">
            No income recorded this month.
          </div>
        ) : (
          <div className="divide-y divide-ink-100">
            {incomes.map((i) => (
              <div key={i.id} className="flex items-center gap-3 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ArrowDownRight className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink-800">{i.source}</p>
                  <p className="text-xs text-ink-400">
                    {formatDate(i.received_on)}
                    {i.note ? ` · ${i.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="tnum font-semibold text-emerald-600">
                    +{formatMoney(i.amount, house.currency)}
                  </span>
                  <DeleteButton
                    action={deleteIncome}
                    id={i.id}
                    label="Delete income"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
