"use client";

import { useEffect, useState } from "react";
import { Users, MapPin, Building2, MessageSquare } from "lucide-react";

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
    {
      label: "Total Contacts",
      value: stats?.totalContacts ?? "-",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Cities",
      value: stats?.totalCities ?? "-",
      icon: MapPin,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Companies",
      value: stats?.totalCompanies ?? "-",
      icon: Building2,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Interactions This Month",
      value: stats?.interactionsThisMonth ?? "-",
      icon: MessageSquare,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center gap-4"
        >
          <div className={`${bg} p-3 rounded-lg`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-gray-400">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
