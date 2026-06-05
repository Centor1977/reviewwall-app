"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  BookOpen,
  HelpCircle,
  Calendar,
  Send,
  Code2,
  ChevronDown,
  Check,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { GuideProgress } from "@/lib/dashboard/guide-progress";

type StepStatus = "done" | "active" | "pending";

type StepDef = {
  key: keyof GuideProgress;
  titre: string;
  Icon: LucideIcon;
  duree: string;
  description: string;
  sousEtapes: string[];
  actionLabel?: string;
  actionKey?: "formation" | "offre";
  actionManuelle?: boolean;
};

const STEPS: StepDef[] = [
  {
    key: "compte_cree",
    titre: "Créer votre compte",
    Icon: User,
    duree: "2 min",
    description: "Compte créé avec succès.",
    sousEtapes: [],
  },
  {
    key: "formation_creee",
    titre: "Créer votre première formation",
    Icon: BookOpen,
    duree: "5 min",
    description:
      "Décrivez votre formation pour qu'elle soit identifiable dans le catalogue et générez automatiquement vos questions d'évaluation.",
    sousEtapes: [
      "Renseignez titre, catégorie, format et durée",
      'Ajoutez une description (ou utilisez "Générer avec l\'IA" pour la rédiger automatiquement)',
      "Complétez les objectifs pédagogiques, le programme et le public cible",
      "Une fiche complète améliore votre visibilité dans le catalogue",
    ],
    actionLabel: "Créer une formation →",
    actionKey: "formation",
  },
  {
    key: "questions_configurees",
    titre: "Configurer vos questions d'évaluation",
    Icon: HelpCircle,
    duree: "5 min",
    description:
      "Personnalisez le formulaire de collecte avec vos propres questions pour enrichir vos avis et votre dashboard.",
    sousEtapes: [
      "Questions publiques (max 3) : visibles sur les avis et dans le catalogue, enrichissent le profil des apprenants",
      "Questions privées (max 3) : réservées à votre dashboard, pour piloter la qualité en interne",
      "Chaque question est validée par l'IA avant publication (conformité RGPD)",
      "Réutilisez vos questions d'une formation à l'autre via la bibliothèque",
    ],
    actionLabel: "Configurer les questions →",
    actionKey: "offre",
  },
  {
    key: "seance_creee",
    titre: "Créer une séance et ajouter vos participants",
    Icon: Calendar,
    duree: "3 min",
    description:
      "Une séance = une session délivrée. Ajoutez vos participants pour générer leurs QR codes individuels et liens de collecte personnalisés.",
    sousEtapes: [
      "4 modes d'ajout : saisie manuelle (< 10 personnes), import CSV, génération anonyme, photo de feuille d'émargement (IA)",
      'Chaque participant reçoit un lien à usage unique → garantit l\'authenticité des avis (badge "Vérifié")',
      "Exportez les QR codes en PDF pour une distribution en salle",
    ],
    actionLabel: "Créer une séance →",
    actionKey: "offre",
  },
  {
    key: "lien_envoye",
    titre: "Envoyer les liens de collecte",
    Icon: Send,
    duree: "2 min",
    description:
      "Déclenchez l'envoi quand vous êtes prêt. Personnalisez votre message et relancez les participants qui n'ont pas encore répondu.",
    sousEtapes: [
      "Envoi par email depuis la plateforme, participant par participant ou en lot",
      "Personnalisez le message avec des variables : [prénom], [formation], [lien]",
      "Sauvegardez vos messages comme templates réutilisables",
      "Relancez les participants en attente depuis la page séance",
      "Ou imprimez les QR codes PDF pour une distribution physique en salle",
    ],
  },
  {
    key: "widget_integre",
    titre: "Intégrer le widget sur votre site",
    Icon: Code2,
    duree: "5 min",
    description:
      "Affichez vos avis en temps réel sur votre site web. Une seule ligne de code à copier-coller.",
    sousEtapes: [
      "Compatible avec tous les CMS : WordPress, Wix, Webflow, Systeme.io, Learnybox, page HTML...",
      "Le widget se met à jour automatiquement à chaque nouvel avis",
      "Retrouvez le code dans la page de chaque formation (section Diffusion)",
      "Vos visiteurs voient les avis les plus pertinents selon leur profil",
    ],
    actionLabel: "Voir le code →",
    actionKey: "offre",
    actionManuelle: true,
  },
];

interface Props {
  progress: GuideProgress;
  premierOffreId?: string | null;
}

export function GuideDemarrage({ progress: initialProgress, premierOffreId }: Props) {
  const [progress, setProgress] = useState(initialProgress);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [marking, setMarking] = useState(false);

  const completedCount = STEPS.filter((s) => progress[s.key]).length;
  const allDone = completedCount === STEPS.length;
  const pct = Math.round((completedCount / STEPS.length) * 100);
  const activeIndex = STEPS.findIndex((s) => !progress[s.key]);

  function toggle(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function isExpanded(i: number): boolean {
    if (!allDone && i === activeIndex) return true;
    return expanded.has(i);
  }

  function getStatus(i: number): StepStatus {
    if (progress[STEPS[i].key]) return "done";
    if (i === activeIndex) return "active";
    return "pending";
  }

  function getActionUrl(step: StepDef): string {
    if (step.actionKey === "formation") return "/offres/nouvelle";
    return premierOffreId ? `/offres/${premierOffreId}` : "/offres";
  }

  async function markWidgetDone() {
    setMarking(true);
    try {
      const res = await fetch("/api/prestataires/widget-integre", {
        method: "PATCH",
      });
      if (res.ok) setProgress((p) => ({ ...p, widget_integre: true }));
    } finally {
      setMarking(false);
    }
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{ border: "1px solid var(--color-slate-200)" }}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="mb-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {allDone ? "Votre guide de référence" : "Guide de démarrage"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {allDone
                ? "Retrouvez ici les étapes clés pour utiliser la plateforme"
                : `${completedCount} / ${STEPS.length} étapes complétées`}
            </p>
          </div>
          <span className="shrink-0 text-xs font-medium text-slate-400">{pct}%</span>
        </div>
        <div
          className="h-1 overflow-hidden rounded-full"
          style={{ background: "var(--color-slate-200)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: allDone
                ? "var(--color-green-700)"
                : "var(--color-blue-600)",
            }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-1.5">
        {STEPS.map((step, i) => {
          const status = getStatus(i);
          const open = isExpanded(i);
          const Icon = step.Icon;

          const borderColor =
            status === "done"
              ? "var(--color-green-700)"
              : status === "active"
                ? "var(--color-blue-600)"
                : "var(--color-slate-200)";

          const bgColor =
            status === "done"
              ? "var(--color-green-50)"
              : status === "active"
                ? "var(--color-blue-50)"
                : "var(--color-background-primary)";

          const iconColor =
            status === "done"
              ? "var(--color-green-700)"
              : status === "active"
                ? "var(--color-blue-600)"
                : "var(--color-slate-400)";

          return (
            <div
              key={step.key}
              className="overflow-hidden rounded-lg"
              style={{
                border: `1px solid ${borderColor}`,
                background: bgColor,
              }}
            >
              {/* En-tête de l'étape */}
              <button
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
                onClick={() => toggle(i)}
              >
                {/* Numéro / check */}
                <div
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                  style={{
                    border: `1.5px solid ${borderColor}`,
                    color: iconColor,
                  }}
                >
                  {status === "done" ? <Check size={11} /> : i + 1}
                </div>

                {/* Icône catégorie */}
                <Icon size={14} style={{ color: iconColor, flexShrink: 0 }} />

                {/* Titre */}
                <span
                  className="flex-1 text-sm font-medium leading-snug"
                  style={{
                    color:
                      status === "done"
                        ? "var(--color-slate-500)"
                        : "var(--color-text-primary)",
                    textDecoration:
                      status === "done" ? "line-through" : "none",
                    textDecorationColor: "var(--color-slate-500)",
                  }}
                >
                  {step.titre}
                </span>

                {/* Badge durée */}
                {status !== "done" && (
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px]"
                    style={{
                      background: "var(--color-slate-200)",
                      color: "var(--color-slate-500)",
                    }}
                  >
                    {step.duree}
                  </span>
                )}

                <ChevronDown
                  size={13}
                  className="shrink-0 transition-transform duration-200"
                  style={{
                    color: "var(--color-slate-400)",
                    transform: open ? "rotate(180deg)" : "rotate(0)",
                  }}
                />
              </button>

              {/* Contenu déroulé */}
              {open && (
                <div className="px-4 pb-4">
                  {step.description && (
                    <p
                      className="mb-3 text-xs leading-relaxed"
                      style={{ color: "var(--color-slate-500)" }}
                    >
                      {step.description}
                    </p>
                  )}

                  {step.sousEtapes.length > 0 && (
                    <div
                      className="mb-3 space-y-1.5 rounded-lg p-3"
                      style={{ background: "var(--color-background-secondary)" }}
                    >
                      {step.sousEtapes.map((se, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <span
                            className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                            style={{ background: "var(--color-slate-400)" }}
                          />
                          <span
                            className="text-xs leading-relaxed"
                            style={{ color: "var(--color-slate-500)" }}
                          >
                            {se}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {status !== "done" && (
                    <div className="flex items-center gap-2">
                      {step.actionLabel && step.actionKey && (
                        <Link
                          href={getActionUrl(step)}
                          className="rounded-lg px-4 py-2 text-xs font-medium transition hover:bg-black/15"
                          style={{
                            border: "1px solid rgba(255,255,255,0.18)",
                            color: "#e2e8f0",
                          }}
                        >
                          {step.actionLabel}
                        </Link>
                      )}
                      {step.actionManuelle && (
                        <button
                          onClick={markWidgetDone}
                          disabled={marking}
                          className="rounded-lg px-4 py-2 text-xs font-medium transition hover:bg-black/15 disabled:opacity-50"
                          style={{
                            border: "1px solid var(--color-green-700)",
                            color: "var(--color-green-700)",
                          }}
                        >
                          {marking ? "…" : "C'est fait ✓"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
