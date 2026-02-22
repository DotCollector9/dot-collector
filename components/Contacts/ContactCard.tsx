import Link from "next/link";

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
      className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/60 transition-colors group"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-primary text-xs font-medium overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
        ) : (
          initials || "?"
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-sm font-medium group-hover:text-primary transition-colors truncate">
            {firstName} {lastName}
          </span>
          {badge}
        </div>
        {(jobTitle || company) && (
          <p className="text-muted-foreground text-xs truncate">
            {[jobTitle, company].filter(Boolean).join(" · ")}
          </p>
        )}
        {city && (
          <p className="text-muted-foreground/60 text-xs truncate">
            {[city, country].filter(Boolean).join(", ")}
          </p>
        )}
      </div>

      {lastInteraction && (
        <div className="flex-shrink-0 text-right">
          <div className="text-xs text-muted-foreground">
            {new Date(lastInteraction.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
          </div>
          <div className="text-[10px] text-muted-foreground/60 capitalize">{lastInteraction.type}</div>
        </div>
      )}
    </Link>
  );
}
