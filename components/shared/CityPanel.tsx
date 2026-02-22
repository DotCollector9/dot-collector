"use client";

import { X } from "lucide-react";
import ContactCard from "@/components/Contacts/ContactCard";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  jobTitle: string | null;
  avatarUrl: string | null;
}

interface CityPanelProps {
  city: {
    city: string;
    country: string | null;
    count: number;
    contacts: Contact[];
  };
  onClose: () => void;
}

export default function CityPanel({ city, onClose }: CityPanelProps) {
  return (
    <div className="absolute top-0 right-0 h-full w-72 bg-card/95 backdrop-blur-md border-l border-border shadow-2xl flex flex-col z-20 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="font-serif text-lg text-foreground leading-tight">{city.city}</h2>
          <p className="section-label mt-0.5">
            {city.count} connection{city.count !== 1 ? "s" : ""}
            {city.country ? ` · ${city.country}` : ""}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors mt-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Contacts list */}
      <div className="flex-1 overflow-y-auto py-1">
        {city.contacts.map((c) => (
          <ContactCard
            key={c.id}
            id={c.id}
            firstName={c.firstName}
            lastName={c.lastName}
            company={c.company}
            jobTitle={c.jobTitle}
            avatarUrl={c.avatarUrl}
          />
        ))}
      </div>
    </div>
  );
}
