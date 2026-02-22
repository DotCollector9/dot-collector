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
    <div className="absolute top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur border-l border-gray-700 shadow-2xl flex flex-col z-20 animate-in slide-in-from-right">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div>
          <h2 className="text-white font-semibold text-base">{city.city}</h2>
          <p className="text-gray-400 text-xs">
            {city.count} connection{city.count !== 1 ? "s" : ""}
            {city.country ? ` · ${city.country}` : ""}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
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
