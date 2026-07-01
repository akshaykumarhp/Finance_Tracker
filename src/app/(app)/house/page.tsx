import { Crown, LogOut, User as UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouse } from "@/lib/house";
import type { HouseMember, Profile } from "@/lib/types";
import CopyButton from "@/components/CopyButton";
import HouseActions from "@/components/HouseActions";
import { renameHouse, leaveHouse } from "@/app/(app)/actions";

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
      <h1 className="text-xl font-bold text-slate-800">House &amp; Members</h1>

      <div className="card space-y-4">
        <div>
          <h2 className="font-semibold text-slate-800">House name</h2>
          <form action={renameHouse} className="mt-2 flex gap-2">
            <input type="hidden" name="house_id" value={house.id} />
            <input name="name" defaultValue={house.name} className="input max-w-sm" />
            <button className="btn-primary">Save</button>
          </form>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h2 className="font-semibold text-slate-800">Invite people</h2>
          <p className="mb-3 text-sm text-slate-500">
            Share this code. Anyone who signs up and enters it joins this house and
            can view and add income and expenses.
          </p>
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-slate-100 px-4 py-2 font-mono text-lg font-bold tracking-widest text-slate-800">
              {house.join_code}
            </span>
            <CopyButton value={house.join_code} />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3 font-semibold text-slate-800">
          Members ({members.length})
        </h2>
        <div className="divide-y divide-slate-100">
          {members.map((m) => {
            const p = profileOf(m.user_id);
            const isYou = m.user_id === user?.id;
            return (
              <div key={m.user_id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {p?.display_name || p?.email || "Member"}
                      {isYou && <span className="text-slate-400"> (you)</span>}
                    </p>
                    <p className="text-xs text-slate-400">{p?.email}</p>
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
          <h2 className="font-semibold text-slate-800">Leave this house</h2>
          <p className="text-sm text-slate-500">
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
