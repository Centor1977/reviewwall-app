"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

type Offre = { id: string; titre: string };

type Props = {
  offres: Offre[];
  current: string | undefined;
};

export function AvisFilter({ offres, current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("offre", value);
    } else {
      params.delete("offre");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={current ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors duration-150 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Toutes les formations</option>
      {offres.map((o) => (
        <option key={o.id} value={o.id}>
          {o.titre}
        </option>
      ))}
    </select>
  );
}
