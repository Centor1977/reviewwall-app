import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";

type Props = {
  currentRole: "prestataire" | "apprenant";
};

export function RoleSwitcher({ currentRole }: Props) {
  const href = currentRole === "prestataire" ? "/mon-profil" : "/dashboard";
  const label =
    currentRole === "prestataire" ? "Mon espace apprenant" : "Mon dashboard formateur";

  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
    >
      <ArrowLeftRight size={12} />
      {label}
    </Link>
  );
}
