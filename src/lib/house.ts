import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { House } from "@/lib/types";

export const ACTIVE_HOUSE_COOKIE = "active_house";

// Returns every house the current user belongs to (ordered by name).
export async function getMyHouses(): Promise<House[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("houses")
    .select("*")
    .order("created_at", { ascending: true });
  return (data as House[]) ?? [];
}

// Resolves the active house: the cookie value if still valid, otherwise the
// first house the user belongs to. Returns null if they have no house yet.
export async function getActiveHouse(): Promise<{
  house: House | null;
  houses: House[];
}> {
  const houses = await getMyHouses();
  if (houses.length === 0) return { house: null, houses };

  const cookieId = cookies().get(ACTIVE_HOUSE_COOKIE)?.value;
  const active = houses.find((h) => h.id === cookieId) ?? houses[0];
  return { house: active, houses };
}
