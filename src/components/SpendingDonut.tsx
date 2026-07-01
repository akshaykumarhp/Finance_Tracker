"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatMoney } from "@/lib/format";

export interface Slice {
  name: string;
  value: number;
  color: string;
}

export default function SpendingDonut({
  data,
  currency,
}: {
  data: Slice[];
  currency: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const [hovering, setHovering] = useState(false);

  if (total === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-ink-400">
        No spending recorded yet this month.
      </div>
    );
  }

  return (
    <div className="relative h-56" onMouseLeave={() => setHovering(false)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            stroke="none"
            onMouseEnter={() => setHovering(true)}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatMoney(value, currency)}
            // Lift the tooltip above the centered total label.
            wrapperStyle={{ zIndex: 20, outline: "none" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e5e9f0",
              background: "#ffffff",
              boxShadow: "0 8px 24px -8px rgba(15,23,42,0.2)",
              padding: "6px 10px",
            }}
            itemStyle={{ color: "#1e293b", fontWeight: 500 }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center label — hidden while hovering a slice so it never overlaps the tooltip. */}
      {!hovering && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-ink-400">Total spent</span>
          <span className="tnum text-lg font-bold text-ink-900">
            {formatMoney(total, currency)}
          </span>
        </div>
      )}
    </div>
  );
}
