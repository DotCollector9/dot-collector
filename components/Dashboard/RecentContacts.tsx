"use client";

import { useEffect, useState } from "react";
import ContactCard from "@/components/Contacts/ContactCard";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  jobTitle: string | null;
  city: string | null;
  country: string | null;
  avatarUrl: string | null;
  interactions: { date: string; type: string }[];
}

export default function RecentContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contacts?limit=10")
      .then((r) => r.json())
      .then((d) => setContacts(d.contacts))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <p className="section-label">Recent Contacts</p>
      </div>

      {loading ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-secondary/50 rounded animate-pulse" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">No contacts yet.</p>
      ) : (
        <div className="divide-y divide-border/50">
          {contacts.map((c) => (
            <ContactCard
              key={c.id}
              id={c.id}
              firstName={c.firstName}
              lastName={c.lastName}
              company={c.company}
              jobTitle={c.jobTitle}
              city={c.city}
              country={c.country}
              avatarUrl={c.avatarUrl}
              lastInteraction={c.interactions[0] ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
