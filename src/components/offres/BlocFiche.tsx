"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Plus, Lightbulb } from "lucide-react";
import {
  type CompletionResult,
  CHAMP_LABELS,
  CHAMP_ANCHORS,
} from "@/lib/offres/completion";

interface Props {
  completion: CompletionResult;
  offreId: string;
}

export function BlocFiche({ completion, offreId }: Props) {
  const router = useRouter();
  const { score, details } = completion;
  const isComplete = score === 100;
  const champs = Object.entries(details);

  return (
    <div
      className="mb-4 rounded-xl p-5"
      style={{
        background: "var(--color-white)",
        border: isComplete
          ? "1px solid var(--color-green-700)"
          : "1px solid var(--color-slate-200)",
      }}
    >
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="card-section-title text-sm font-semibold text-slate-900">
            Fiche de formation
          </h2>

          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={
              isComplete
                ? {
                    background: "var(--color-green-50)",
                    color: "var(--color-green-700)",
                  }
                : {
                    background: "var(--color-amber-50)",
                    color: "var(--color-amber-700)",
                  }
            }
          >
            {isComplete ? "Fiche complète ✓" : `${score}% complétée`}
          </span>

          <div
            className="h-1.5 w-24 overflow-hidden rounded-full"
            style={{ background: "var(--color-slate-200)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${score}%`,
                background: isComplete
                  ? "var(--color-green-700)"
                  : "var(--color-amber-700)",
              }}
            />
          </div>
        </div>

        {isComplete ? (
          <Link
            href={`/offres/${offreId}/modifier`}
            className="text-xs font-medium transition hover:underline"
            style={{ color: "var(--color-slate-500)" }}
          >
            Modifier
          </Link>
        ) : (
          <p className="text-xs" style={{ color: "var(--color-slate-500)" }}>
            Les champs manquants réduisent la visibilité dans le catalogue
          </p>
        )}
      </div>

      {/* Grille champs */}
      <div className="mb-4 grid grid-cols-6 gap-2">
        {champs.map(([champ, rempli]) => (
          <button
            key={champ}
            disabled={rempli}
            onClick={() =>
              !rempli &&
              router.push(
                `/offres/${offreId}/modifier${CHAMP_ANCHORS[champ] ?? ""}`
              )
            }
            className="flex flex-col items-center gap-1 rounded-lg p-2 text-center transition"
            style={
              rempli
                ? {
                    border: "0.5px solid var(--color-green-700)",
                    background: "var(--color-green-50)",
                    cursor: "default",
                  }
                : {
                    border: "0.5px dashed var(--color-amber-700)",
                    background: "var(--color-amber-50)",
                    cursor: "pointer",
                  }
            }
          >
            {rempli ? (
              <Check size={12} style={{ color: "var(--color-green-700)" }} />
            ) : (
              <Plus size={12} style={{ color: "var(--color-amber-700)" }} />
            )}
            <span
              className="text-[10px] leading-tight"
              style={{ color: "var(--color-slate-500)" }}
            >
              {CHAMP_LABELS[champ] ?? champ}
            </span>
          </button>
        ))}
      </div>

      {/* Footer tip — uniquement si incomplet */}
      {!isComplete && (
        <div className="flex items-center gap-2 pt-1">
          <Lightbulb
            size={12}
            style={{ color: "var(--color-amber-700)", flexShrink: 0 }}
          />
          <span className="text-xs" style={{ color: "var(--color-amber-700)" }}>
            Une fiche complète génère 3× plus de clics depuis le catalogue
          </span>
        </div>
      )}
    </div>
  );
}
