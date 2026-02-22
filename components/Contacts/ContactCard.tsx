import Link from "next/link";
import { Building2, MapPin } from "lucide-react";

interface ContactCardProps {
  id: string;
  firstName: string;
  lastName: string;
  company?: string | null;
  jobTitle?: string | null;
  city?: string | null;
  country?: string | null;
  avatarUrl?: string | null;
  lastInteraction?: { date: string | Date; type: string } | null;
  badge?: React.ReactNode;
}

export default function ContactCard({
  id,
  firstName,
  lastName,
  company,
  jobTitle,
  city,
  country,
  avatarUrl,
  lastInteraction,
  badge,
}: ContactCardProps) {
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();

  return (
    <Link
      href={`/contacts/${id}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/60 transition-colors group"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-300 font-semibold text-sm overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
        ) : (
          initials || "?"
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium group-hover:text-blue-300 transition-colors truncate">
            {firstName} {lastName}
          </span>
          {badge}
        </div>
        {(jobTitle || company) && (
          <div className="flex items-center gap-1 text-gray-400 text-xs truncate">
            <Building2 className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {[jobTitle, company].filter(Boolean).join(" · ")}
            </span>
          </div>
        )}
        {city && (
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>
              {[city, country].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
      </div>

      {lastInteraction && (
        <div className="flex-shrink-0 text-right">
          <div className="text-xs text-gray-500">
            {new Date(lastInteraction.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
          </div>
          <div className="text-xs text-gray-600 capitalize">{lastInteraction.type}</div>
        </div>
      )}
    </Link>
  );
}
