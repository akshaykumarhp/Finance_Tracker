export interface CurrencyDef {
  code: string;
  name: string;
  symbol: string;
}

// Currencies offered in the picker. `symbol` is used for compact labels;
// full formatting is delegated to Intl for correct grouping/decimals.
export const CURRENCIES: CurrencyDef[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$" },
  { code: "AUD", name: "Australian Dollar", symbol: "$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "$" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
];

export const DEFAULT_CURRENCY = "USD";

const formatters = new Map<string, Intl.NumberFormat>();

function formatterFor(code: string): Intl.NumberFormat {
  let f = formatters.get(code);
  if (!f) {
    try {
      f = new Intl.NumberFormat("en-US", { style: "currency", currency: code });
    } catch {
      f = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
    }
    formatters.set(code, f);
  }
  return f;
}

export function currencySymbol(code = DEFAULT_CURRENCY): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$";
}

export function formatMoney(
  value: number | string | null | undefined,
  currency = DEFAULT_CURRENCY,
): string {
  const n = typeof value === "string" ? parseFloat(value) : value ?? 0;
  return formatterFor(currency).format(
    Number.isFinite(n as number) ? (n as number) : 0,
  );
}

// A month key like "2026-06".
export function monthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

// First and last day (inclusive) of a given month key, as YYYY-MM-DD strings.
export function monthRange(key: string): { start: string; end: string } {
  const [y, m] = key.split("-").map(Number);
  const start = `${key}-01`;
  const last = new Date(y, m, 0).getDate();
  const end = `${key}-${String(last).padStart(2, "0")}`;
  return { start, end };
}

// Formats a YYYY-MM-DD date string as e.g. "Jun 12" without timezone drift.
export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return monthKey(d);
}
