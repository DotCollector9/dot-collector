"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Globe" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/import", label: "Import" },
  { href: "/sync", label: "Sync" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-12 bg-background/80 backdrop-blur-md border-b border-border">
      {/* Wordmark */}
      <Link
        href="/"
        className="font-serif italic text-foreground text-lg tracking-tight leading-none select-none"
      >
        dot·collector
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-6">
        {links.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative text-xs tracking-widest uppercase pb-px transition-colors",
                active
                  ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
