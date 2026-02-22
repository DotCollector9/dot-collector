"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, LayoutDashboard, Upload, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NavBar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Globe", icon: Globe },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/import", label: "Import", icon: Upload },
    { href: "/sync", label: "Sync Gmail", icon: RefreshCw },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-gray-900/90 backdrop-blur border-b border-gray-700">
      <Link href="/" className="text-white font-bold text-lg tracking-tight">
        dot<span className="text-blue-400">collector</span>
      </Link>
      <div className="flex items-center gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              pathname === href
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
