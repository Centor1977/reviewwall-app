"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Star, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  offreLabel: string;
};

export function SidebarNav({ offreLabel }: Props) {
  const pathname = usePathname();

  const items = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
    { href: "/offres", icon: BookOpen, label: offreLabel },
    { href: "/avis", icon: Star, label: "Avis" },
    { href: "/parametres", icon: Settings, label: "Paramètres" },
  ];

  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
      {items.map(({ href, icon: Icon, label }) => {
        const isActive =
          pathname === href ||
          (href !== "/dashboard" && pathname.startsWith(href));

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Icon size={16} className="shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
