import { Crown, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouse } from "@/lib/house";
import type { HouseMember, Profile } from "@/lib/types";
import CopyButton from "@/components/CopyButton";
import HouseActions from "@/components/HouseActions";
import CurrencySelect from "@/components/CurrencySelect";
import { renameHouse, leaveHouse, updateHouseCurrency } from "@/app/(app)/actions";

export default async function HousePage() {
  const { house } = await getActiveHouse();
  if (!house) return null;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memberRows } = await supabase
    .from("house_members")
    .select("*")
    .eq("house_id", house.id);
  const members = (memberRows as HouseMember[]) ?? [];

  const ids = members.map((m) => m.user_id);
  const { data: profileRows } = await supabase
    .from("profiles")
    .select("*")
    .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  const profiles = (profileRows as Profile[]) ?? [];
  const profileOf = (id: string) => profiles.find((p) => p.id === id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">House &amp; Members</h1>
        <p className="mt-0.5 text-sm text-ink-400">
          Manage your household, currency, and who can collaborate.
        </p>
      </div>

      <div className="card space-y-4">
        <div>
          <h2 className="section-title">House name</h2>
          <form action={renameHouse} className="mt-2 flex gap-2">
            <input type="hidden" name="house_id" value={house.id} />
            <input name="name" defaultValue={house.name} className="input max-w-sm" />
            <button className="btn-primary">Save</button>
          </form>
        </div>

        <div className="border-t border-ink-100 pt-4">
          <h2 className="section-title">Currency</h2>
          <p className="mb-2 text-sm text-ink-500">
            Applies to all amounts and dashboards for this house.
          </p>
          <form action={updateHouseCurrency} className="flex flex-col gap-2 sm:flex-row">
            <input type="hidden" name="house_id" value={house.id} />
            <div className="max-w-sm flex-1">
              <CurrencySelect defaultValue={house.currency} />
            </div>
            <button className="btn-primary">Save</button>
          </form>
        </div>

        <div className="border-t border-ink-100 pt-4">
          <h2 className="section-title">Invite people</h2>
          <p className="mb-3 text-sm text-ink-500">
            Share this code. Anyone who signs up and enters it joins this house and
            can view and add income and expenses.
          </p>
          <div className="flex items-center gap-3">
            <span className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-2 font-mono text-lg font-bold tracking-[0.3em] text-brand-700">
              {house.join_code}
            </span>
            <CopyButton value={house.join_code} />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3 section-title">
          Members ({members.length})
        </h2>
        <div className="divide-y divide-ink-100">
          {members.map((m) => {
            const p = profileOf(m.user_id);
            const isYou = m.user_id === user?.id;
            return (
              <div key={m.user_id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-sm font-bold uppercase text-white">
                    {(p?.display_name || p?.email || "M").charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-800">
                      {p?.display_name || p?.email || "Member"}
                      {isYou && <span className="text-ink-400"> (you)</span>}
                    </p>
                    <p className="text-xs text-ink-400">{p?.email}</p>
                  </div>
                </div>
                {m.role === "owner" && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
                    <Crown className="h-3.5 w-3.5" /> Owner
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card space-y-4">
        <HouseActions />
      </div>

      <div className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="section-title">Leave this house</h2>
          <p className="text-sm text-ink-500">
            You&apos;ll lose access to its data unless you rejoin with the code.
          </p>
        </div>
        <form action={leaveHouse}>
          <input type="hidden" name="house_id" value={house.id} />
          <button className="btn-danger">
            <LogOut className="h-4 w-4" />
            Leave house
          </button>
        </form>
      </div>
    </div>
  );
}
