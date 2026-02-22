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
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-2">10 Most Recent</h3>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-700/40 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <p className="text-gray-500 text-sm py-4 text-center">No contacts yet.</p>
      ) : (
        <div>
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
