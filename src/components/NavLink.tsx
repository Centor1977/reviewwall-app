"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  children: React.ReactNode;
};

export function NavLink({ href, children }: Props) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors duration-150",
        isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
      )}
    >
      {children}
    </Link>
  );
}
