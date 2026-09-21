import { cookies } from "next/headers";
import { monthKey } from "@/lib/format";

export const ACTIVE_MONTH_COOKIE = "active_month";

// URL param wins (so links/bookmarks with ?m= still work), then whatever
// month was last picked on any page, then the current month.
export function resolveMonth(searchParamsMonth?: string): string {
  if (searchParamsMonth) return searchParamsMonth;
  return cookies().get(ACTIVE_MONTH_COOKIE)?.value ?? monthKey();
}
