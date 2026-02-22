"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Stats {
  topCities: { city: string; country: string | null; count: number }[];
  bySource: { source: string; count: number }[];
}

// Gold-toned palette for charts
const SOURCE_COLORS: Record<string, string> = {
  manual: "#c4a35a",
  linkedin: "#a07840",
  gmail: "#e8c87a",
  csv: "#7a6030",
};

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual",
  linkedin: "LinkedIn",
  gmail: "Gmail",
  csv: "CSV Import",
};

const TOOLTIP_STYLE = {
  background: "hsl(228 22% 8%)",
  border: "1px solid hsl(228 18% 15%)",
  borderRadius: 4,
  color: "hsl(38 20% 90%)",
  fontSize: 12,
};

export default function NetworkCharts() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/contacts/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="card p-5 h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  const cityData = stats.topCities.map((c) => ({ name: c.city, count: c.count }));
  const sourceData = stats.bySource.map((s) => ({
    name: SOURCE_LABELS[s.source] ?? s.source,
    value: s.count,
    color: SOURCE_COLORS[s.source] ?? "#8a7050",
  }));

  const tickStyle = { fill: "hsl(228 8% 50%)", fontSize: 11 };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Top cities */}
      <div className="card p-5">
        <p className="section-label mb-4">Top Cities</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={cityData} margin={{ left: -24, right: 8 }}>
            <XAxis
              dataKey="name"
              tick={tickStyle}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={50}
            />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar dataKey="count" fill="hsl(42 52% 56%)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* By source */}
      <div className="card p-5">
        <p className="section-label mb-4">By Source</p>
        {sourceData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            No data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {sourceData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                formatter={(value) => (
                  <span style={{ color: "hsl(228 8% 50%)", fontSize: 11 }}>{value}</span>
                )}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
