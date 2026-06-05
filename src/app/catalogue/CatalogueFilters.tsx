"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES_OFFRE } from "@/lib/constants";

const FORMATS  = ["presentiel", "distanciel", "video", "blended", "mixte"] as const;
const FORMAT_LABELS: Record<string, string> = {
  presentiel: "Présentiel", distanciel: "Distanciel",
  video: "Vidéo", blended: "Blended", mixte: "Mixte",
};
const NIVEAUX = ["debutant", "intermediaire", "avance", "tous_niveaux"] as const;
const NIVEAU_LABELS: Record<string, string> = {
  debutant: "Débutant", intermediaire: "Intermédiaire",
  avance: "Avancé", tous_niveaux: "Tous niveaux",
};
const PRIX_OPTIONS = [
  { value: "gratuit",   label: "Gratuit" },
  { value: "moins_500", label: "< 500 €" },
  { value: "500_1500",  label: "500 – 1 500 €" },
  { value: "plus_1500", label: "> 1 500 €" },
  { value: "nc",        label: "Non renseigné" },
];

function CheckItem({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-0.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 rounded accent-blue-600" />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

function RadioItem({ label, value, current, onChange }: {
  label: string; value: string; current: string; onChange: (v: string) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-0.5">
      <input type="radio" checked={current === value} onChange={() => onChange(value)}
        className="h-3.5 w-3.5 accent-blue-600" />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-100 pb-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      {children}
    </div>
  );
}

export function CatalogueFilters() {
  const router   = useRouter();
  const pathname = usePathname();
  const sp       = useSearchParams();

  const update = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }, [router, pathname, sp]);

  function toggleMulti(key: string, value: string) {
    const current = sp.get(key)?.split(",").filter(Boolean) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    update(key, next.length > 0 ? next.join(",") : null);
  }

  const hasAnyFilter = sp.get("categorie") || sp.get("format") || sp.get("niveau") ||
    sp.get("note_min") || sp.get("cpf") || sp.get("prix");

  const cats    = sp.get("categorie")?.split(",").filter(Boolean) ?? [];
  const fmts    = sp.get("format")?.split(",").filter(Boolean) ?? [];
  const niveaux = sp.get("niveau")?.split(",").filter(Boolean) ?? [];
  const noteMin = sp.get("note_min") ?? "";
  const cpf     = sp.get("cpf") === "true";
  const prix    = sp.get("prix") ?? "";

  return (
    <aside className="w-56 shrink-0 space-y-4">
      <div className="sticky top-4 rounded-xl border border-slate-200 bg-white p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Filtres</p>
          {hasAnyFilter && (
            <button onClick={() => {
              const params = new URLSearchParams(sp.toString());
              ["categorie","format","niveau","note_min","cpf","prix"].forEach(k => params.delete(k));
              params.delete("page");
              router.replace(`${pathname}?${params.toString()}`);
            }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition">
              <X size={11} /> Réinitialiser
            </button>
          )}
        </div>

        <Section title="Catégorie">
          {CATEGORIES_OFFRE.map((c) => (
            <CheckItem key={c} label={c} checked={cats.includes(c)}
              onChange={() => toggleMulti("categorie", c)} />
          ))}
        </Section>

        <Section title="Format">
          {FORMATS.map((f) => (
            <CheckItem key={f} label={FORMAT_LABELS[f]} checked={fmts.includes(f)}
              onChange={() => toggleMulti("format", f)} />
          ))}
        </Section>

        <Section title="Niveau">
          {NIVEAUX.map((n) => (
            <CheckItem key={n} label={NIVEAU_LABELS[n]} checked={niveaux.includes(n)}
              onChange={() => toggleMulti("niveau", n)} />
          ))}
        </Section>

        <Section title="Note minimum">
          <RadioItem label="Toutes" value="" current={noteMin} onChange={(v) => update("note_min", v || null)} />
          <RadioItem label="⭐ 3 et plus" value="3" current={noteMin} onChange={(v) => update("note_min", v)} />
          <RadioItem label="⭐ 4 et plus" value="4" current={noteMin} onChange={(v) => update("note_min", v)} />
        </Section>

        <Section title="Prix">
          <RadioItem label="Tous" value="" current={prix} onChange={(v) => update("prix", v || null)} />
          {PRIX_OPTIONS.map((p) => (
            <RadioItem key={p.value} label={p.label} value={p.value} current={prix}
              onChange={(v) => update("prix", v)} />
          ))}
        </Section>

        <div>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={cpf}
              onChange={(e) => update("cpf", e.target.checked ? "true" : null)}
              className="h-3.5 w-3.5 rounded accent-green-600" />
            <span className="text-sm font-medium text-slate-700">Éligible CPF uniquement</span>
          </label>
        </div>
      </div>
    </aside>
  );
}
