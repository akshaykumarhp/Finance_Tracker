import { CURRENCIES } from "@/lib/format";

// Plain <select> of supported currencies; works in server or client forms.
export default function CurrencySelect({
  defaultValue = "USD",
  name = "currency",
  id,
}: {
  defaultValue?: string;
  name?: string;
  id?: string;
}) {
  return (
    <select id={id} name={name} defaultValue={defaultValue} className="input">
      {CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.symbol} {c.code} — {c.name}
        </option>
      ))}
    </select>
  );
}
