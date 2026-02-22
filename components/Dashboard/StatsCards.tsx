"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalContacts: number;
  totalCities: number;
  totalCompanies: number;
  interactionsThisMonth: number;
}

export default function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/contacts/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const cards = [
    { label: "Contacts", value: stats?.totalContacts },
    { label: "Cities", value: stats?.totalCities },
    { label: "Companies", value: stats?.totalCompanies },
    { label: "Interactions this month", value: stats?.interactionsThisMonth },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-lg overflow-hidden">
      {cards.map(({ label, value }) => (
        <div
          key={label}
          className="bg-card px-6 py-5 flex flex-col gap-1"
        >
          <div className="font-serif text-4xl text-foreground tracking-tight leading-none">
            {value ?? <span className="text-muted-foreground/40">—</span>}
          </div>
          <div className="section-label mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}
