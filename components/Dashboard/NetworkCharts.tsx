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

const SOURCE_COLORS: Record<string, string> = {
  manual: "#60a5fa",
  linkedin: "#0a66c2",
  gmail: "#ea4335",
  csv: "#34d399",
};

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual",
  linkedin: "LinkedIn",
  gmail: "Gmail",
  csv: "CSV Import",
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
          <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  const cityData = stats.topCities.map((c) => ({
    name: c.city,
    count: c.count,
  }));

  const sourceData = stats.bySource.map((s) => ({
    name: SOURCE_LABELS[s.source] ?? s.source,
    value: s.count,
    color: SOURCE_COLORS[s.source] ?? "#888",
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Top cities bar chart */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Top Cities</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={cityData} margin={{ left: -20, right: 10 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={50}
            />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, color: "#fff" }}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Source donut */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Connections by Source</h3>
        {sourceData.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-gray-500 text-sm">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {sourceData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                formatter={(value) => <span style={{ color: "#9ca3af", fontSize: 12 }}>{value}</span>}
              />
              <Tooltip
                contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
