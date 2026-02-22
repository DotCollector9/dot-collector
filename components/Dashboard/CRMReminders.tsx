"use client";

import { useEffect, useState } from "react";
import { AlertCircle, MessageSquarePlus } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface StaleContact {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  avatarUrl: string | null;
  interactions: { date: string; type: string }[];
}

interface Reminder {
  id: string;
  message: string;
  dueDate: string;
  contact: { id: string; firstName: string; lastName: string };
}

export default function CRMReminders() {
  const [stale, setStale] = useState<StaleContact[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [logging, setLogging] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/contacts?stale=true&limit=10")
      .then((r) => r.json())
      .then((d) => setStale(d.contacts))
      .catch(console.error);

    fetch("/api/reminders")
      .then((r) => r.json())
      .then(setReminders)
      .catch(console.error);
  }, []);

  const logInteraction = async (contactId: string) => {
    setLogging(contactId);
    await fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId, type: "note", notes: "Quick check-in" }),
    });
    setStale((prev) => prev.filter((c) => c.id !== contactId));
    setLogging(null);
  };

  const completeReminder = async (id: string) => {
    await fetch(`/api/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: true }),
    });
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Stale contacts */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-medium text-gray-300">
            No recent interaction{stale.length > 0 ? ` (${stale.length})` : ""}
          </h3>
          <span className="text-xs text-gray-500">— 3+ months ago</span>
        </div>

        {stale.length === 0 ? (
          <p className="text-gray-500 text-sm py-2 text-center">All caught up!</p>
        ) : (
          <div className="space-y-2">
            {stale.map((c) => {
              const lastDate = c.interactions[0]?.date;
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-orange-500/5 border border-orange-500/15"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-600/20 flex items-center justify-center text-orange-300 text-xs font-semibold flex-shrink-0">
                    {c.firstName[0]}{c.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/contacts/${c.id}`} className="text-white text-sm hover:text-blue-300 transition-colors font-medium">
                      {c.firstName} {c.lastName}
                    </Link>
                    {c.company && <p className="text-gray-500 text-xs truncate">{c.company}</p>}
                    <p className="text-orange-400/70 text-xs">
                      {lastDate
                        ? `Last contact ${formatDistanceToNow(new Date(lastDate), { addSuffix: true })}`
                        : "Never contacted"}
                    </p>
                  </div>
                  <button
                    onClick={() => logInteraction(c.id)}
                    disabled={logging === c.id}
                    className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-orange-600/20 hover:bg-orange-600/40 border border-orange-500/30 rounded-md text-orange-300 text-xs transition-colors disabled:opacity-50"
                  >
                    <MessageSquarePlus className="w-3 h-3" />
                    Log
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming reminders */}
      {reminders.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Upcoming Reminders</h3>
          <div className="space-y-2">
            {reminders.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg bg-blue-500/5 border border-blue-500/15">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{r.message}</p>
                  <p className="text-blue-400 text-xs">
                    <Link href={`/contacts/${r.contact.id}`} className="hover:underline">
                      {r.contact.firstName} {r.contact.lastName}
                    </Link>
                    {" · "}
                    {formatDistanceToNow(new Date(r.dueDate), { addSuffix: true })}
                  </p>
                </div>
                <button
                  onClick={() => completeReminder(r.id)}
                  className="flex-shrink-0 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-md text-blue-300 text-xs transition-colors"
                >
                  Done
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
