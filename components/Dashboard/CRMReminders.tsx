"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
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
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <p className="section-label">Overdue — 3+ months</p>
          {stale.length > 0 && (
            <span className="text-[10px] tabular-nums text-muted-foreground">{stale.length}</span>
          )}
        </div>

        {stale.length === 0 ? (
          <p className="text-muted-foreground text-sm py-6 text-center">All caught up.</p>
        ) : (
          <div className="divide-y divide-border/50">
            {stale.map((c) => {
              const lastDate = c.interactions[0]?.date;
              const initials = `${c.firstName[0]}${c.lastName[0]}`.toUpperCase();
              return (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-primary text-xs font-medium flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/contacts/${c.id}`}
                      className="text-foreground text-sm hover:text-primary transition-colors"
                    >
                      {c.firstName} {c.lastName}
                    </Link>
                    {c.company && (
                      <p className="text-muted-foreground text-xs truncate">{c.company}</p>
                    )}
                    <p className="text-muted-foreground/60 text-xs">
                      {lastDate
                        ? formatDistanceToNow(new Date(lastDate), { addSuffix: true })
                        : "Never contacted"}
                    </p>
                  </div>
                  <button
                    onClick={() => logInteraction(c.id)}
                    disabled={logging === c.id}
                    className="flex-shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary border border-border hover:border-primary/40 px-2.5 py-1 rounded transition-colors disabled:opacity-40"
                  >
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
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <p className="section-label">Reminders</p>
          </div>
          <div className="divide-y divide-border/50">
            {reminders.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm">{r.message}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    <Link href={`/contacts/${r.contact.id}`} className="hover:text-primary transition-colors">
                      {r.contact.firstName} {r.contact.lastName}
                    </Link>
                    {" · "}
                    {formatDistanceToNow(new Date(r.dueDate), { addSuffix: true })}
                  </p>
                </div>
                <button
                  onClick={() => completeReminder(r.id)}
                  className="flex-shrink-0 w-7 h-7 rounded-full border border-border hover:border-primary/50 hover:text-primary text-muted-foreground flex items-center justify-center transition-colors"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
