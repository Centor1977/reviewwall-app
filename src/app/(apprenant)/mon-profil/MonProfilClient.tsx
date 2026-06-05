"use client";

import { useState, useTransition } from "react";
import { Star, Pencil, Plus, Trash2, X, Loader2, CheckCircle2, AlertCircle, Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { VERTICALS, type Vertical, type VerticalConfig, type ProfilField } from "@/config/verticals";
import {
  updateProfilAction, upsertProfilVerticalAction,
  deleteAvisAction, deleteAccountAction, updateConsentMatchingAction,
} from "./actions";
import { ModalModifierAvis } from "@/components/apprenant/ModalModifierAvis";

// ── Types ──────────────────────────────────────────────────────

type Apprenant = {
  id: string; prenom: string | null; nom: string | null;
  email: string | null; telephone: string | null;
  age_range: string | null; situation: string | null; localisation: string | null;
  consent_matching_prive: boolean | null;
};

export type ReponseRow = {
  id: string;
  avis_id: string;
  reponse_texte: string | null;
  reponse_note: number | null;
  reponse_booleen: boolean | null;
  reponse_choix: string[] | null;
  question: { id: string; texte: string; type_reponse: string; visibilite_defaut: string } | null;
};

type ProfilVertical = { id: string; vertical: string; profil: Record<string, string> };

type AvisRow = {
  id: string; note: number | null; recommande: boolean | null;
  avis_texte: string | null; point_fort: string | null;
  point_amelioration: string | null; created_at: string;
  offres: { titre: string; vertical: string | null } | null;
};

// ── Constants ──────────────────────────────────────────────────

const BADGE_CLS: Record<string, string> = {
  formation: "bg-blue-100 text-blue-700",
  coaching:  "bg-violet-100 text-violet-700",
  service:   "bg-green-100 text-green-700",
};

const AGE_RANGES = ["18-25", "26-35", "36-45", "46+"] as const;
const SITUATIONS = ["Salarié", "Indépendant", "Demandeur d'emploi", "Étudiant", "Autre"] as const;

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

// ── Small components ───────────────────────────────────────────

function Stars({ note }: { note: number | null }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13}
          className={i <= (note ?? 0) ? "fill-yellow-400 text-yellow-400" : "fill-none text-slate-200"} />
      ))}
    </div>
  );
}

function VerticalBadge({ vertical }: { vertical: string }) {
  const config = VERTICALS[vertical as Vertical];
  return (
    <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
      BADGE_CLS[vertical] ?? "bg-slate-100 text-slate-600")}>
      {config?.label ?? vertical}
    </span>
  );
}

// ── Vertical profil modal ──────────────────────────────────────

function ProfilVerticalModal({ verticalKey, vertical, currentProfil, onClose, onSaved }: {
  verticalKey: string;
  vertical: VerticalConfig;
  currentProfil: Record<string, string>;
  onClose: () => void;
  onSaved: (profil: Record<string, string>) => void;
}) {
  const [profil, setProfil] = useState<Record<string, string>>(currentProfil);
  const [saving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function set(key: string, value: string) {
    setProfil((p) => ({ ...p, [key]: value }));
  }

  function handleSave() {
    setError(null);
    startSaving(async () => {
      const res = await upsertProfilVerticalAction(verticalKey, profil);
      if (res.error) { setError(res.error); return; }
      onSaved(profil);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="font-semibold text-slate-900">Profil {vertical.label}</h3>
          <button onClick={onClose} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 transition">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto space-y-4 px-5 py-4">
          {(vertical.profil_fields as readonly ProfilField[]).map((field) => (
            <div key={field.key}>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">{field.label}</label>
              {field.type === "chips" ? (
                <div className="flex flex-wrap gap-1.5">
                  {field.options.map((o) => (
                    <button key={o} type="button" onClick={() => set(field.key, o)}
                      className={cn("rounded-full border px-3 py-1 text-xs transition",
                        profil[field.key] === o
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 text-slate-600 hover:border-blue-300"
                      )}>
                      {o}
                    </button>
                  ))}
                </div>
              ) : (
                <input value={profil[field.key] ?? ""}
                  onChange={(e) => set(field.key, e.target.value)}
                  className={inputCls} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <p className="px-5 pb-2 flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle size={13} />{error}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50">
            Annuler
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60">
            {saving && <Loader2 size={13} className="animate-spin" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────

export function MonProfilClient({ apprenant, profilsVerticales, avisList, reponsesRaw, userEmail }: {
  apprenant: Apprenant;
  profilsVerticales: ProfilVertical[];
  avisList: AvisRow[];
  reponsesRaw: ReponseRow[];
  userEmail: string;
}) {
  // Section 1
  const [prenom, setPrenom] = useState(apprenant.prenom ?? "");
  const [nom, setNom] = useState(apprenant.nom ?? "");
  const [tel, setTel] = useState(apprenant.telephone ?? "");
  const [ageRange, setAgeRange] = useState(apprenant.age_range ?? "");
  const [situation, setSituation] = useState(apprenant.situation ?? "");
  const [localisation, setLocalisation] = useState(apprenant.localisation ?? "");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  // Section 2
  const [profilsState, setProfilsState] = useState<Record<string, Record<string, string>>>(
    Object.fromEntries(profilsVerticales.map((p) => [p.vertical, p.profil]))
  );
  const [editingVertical, setEditingVertical] = useState<string | null>(null);

  // Section 3
  const [activeTab, setActiveTab] = useState("tous");
  const [avis, setAvis] = useState<AvisRow[]>(avisList);
  const [editAvis, setEditAvis] = useState<AvisRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, startDeleting] = useTransition();

  // Compte
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isDeletingAccount, startDeletingAccount] = useTransition();
  const [consentMatching, setConsentMatching] = useState(apprenant.consent_matching_prive ?? true);
  const [isUpdatingConsent, startUpdatingConsent] = useTransition();

  // Réponses groupées par avis
  const reponsesByAvis = reponsesRaw.reduce<Record<string, ReponseRow[]>>((acc, r) => {
    if (!acc[r.avis_id]) acc[r.avis_id] = [];
    acc[r.avis_id].push(r);
    return acc;
  }, {});

  // ── Derived ──────────────────────────────────────────────────

  function getAvisVertical(a: AvisRow): string | null {
    const o = Array.isArray(a.offres) ? (a.offres as { titre: string; vertical: string | null }[])[0] : a.offres;
    return o?.vertical ?? null;
  }

  const verticalsWithAvis = [...new Set(avis.map(getAvisVertical).filter(Boolean))] as string[];

  const activeVerticals = Object.entries(VERTICALS).filter(([key]) =>
    verticalsWithAvis.includes(key) || Object.keys(profilsState[key] ?? {}).filter((k) => profilsState[key]?.[k]).length > 0
  );
  const inactiveVerticals = Object.entries(VERTICALS).filter(([key]) =>
    !verticalsWithAvis.includes(key) && Object.keys(profilsState[key] ?? {}).filter((k) => profilsState[key]?.[k]).length === 0
  );

  const filteredAvis = activeTab === "tous" ? avis : avis.filter((a) => getAvisVertical(a) === activeTab);

  // ── Handlers ─────────────────────────────────────────────────

  function handleSave() {
    setSaveError(null); setSaved(false);
    startSaving(async () => {
      const res = await updateProfilAction({ prenom, nom, telephone: tel, age_range: ageRange, situation, localisation });
      if (res.error) { setSaveError(res.error); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  const fmtDate = (d: string) =>
    new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(d));

  // ── Render ───────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ═══════════════════════════════════════════════════════
          Section 1 — Mes informations
      ════════════════════════════════════════════════════════ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-5 text-base font-semibold text-slate-900">Mes informations</h2>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Prénom</label>
              <input value={prenom} onChange={(e) => setPrenom(e.target.value)}
                className={inputCls} placeholder="Marie" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Nom</label>
              <input value={nom} onChange={(e) => setNom(e.target.value)}
                className={inputCls} placeholder="Dupont" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
            <input value={userEmail} disabled
              className={cn(inputCls, "bg-slate-50 text-slate-400 cursor-not-allowed")} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Téléphone</label>
            <input value={tel} onChange={(e) => setTel(e.target.value)}
              className={inputCls} placeholder="06 00 00 00 00" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Tranche d&apos;âge</label>
              <select value={ageRange} onChange={(e) => setAgeRange(e.target.value)}
                className={inputCls}>
                <option value="">— Choisir —</option>
                {AGE_RANGES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Situation</label>
              <select value={situation} onChange={(e) => setSituation(e.target.value)}
                className={inputCls}>
                <option value="">— Choisir —</option>
                {SITUATIONS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Localisation</label>
            <input value={localisation} onChange={(e) => setLocalisation(e.target.value)}
              className={inputCls} placeholder="Paris, Lyon…" />
          </div>

          {saveError && (
            <p className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle size={13} />{saveError}
            </p>
          )}

          <button onClick={handleSave} disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60">
            {isSaving ? <Loader2 size={13} className="animate-spin" /> : saved ? <CheckCircle2 size={13} /> : null}
            {saved ? "Enregistré !" : "Enregistrer"}
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          Section 2 — Mes profils par domaine
      ════════════════════════════════════════════════════════ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-5 text-base font-semibold text-slate-900">Mes profils par domaine</h2>

        <div className="space-y-3">
          {/* Verticales actives */}
          {activeVerticals.map(([key, config]) => {
            const profil = profilsState[key] ?? {};
            const filledFields = config.profil_fields.filter((f) => profil[f.key]);
            return (
              <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <VerticalBadge vertical={key} />
                    <div className="mt-2 space-y-0.5">
                      {filledFields.length > 0 ? filledFields.map((f) => (
                        <p key={f.key} className="text-sm text-slate-600">
                          <span className="font-medium">{f.label} :</span>{" "}
                          <span className="text-slate-500">{profil[f.key]}</span>
                        </p>
                      )) : (
                        <p className="text-sm italic text-slate-400">Profil non complété</p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setEditingVertical(key)}
                    className="shrink-0 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
                    <Pencil size={11} /> Modifier
                  </button>
                </div>
              </div>
            );
          })}

          {/* Verticales inactives */}
          {inactiveVerticals.map(([key, config]) => (
            <button key={key} onClick={() => setEditingVertical(key)}
              className="flex w-full items-center gap-2 rounded-lg border border-dashed border-slate-200 px-4 py-2.5 text-sm text-slate-400 transition hover:border-slate-300 hover:text-slate-600">
              <Plus size={14} />
              Compléter mon profil {config.label}
            </button>
          ))}
        </div>

        {editingVertical && VERTICALS[editingVertical as Vertical] && (
          <ProfilVerticalModal
            verticalKey={editingVertical}
            vertical={VERTICALS[editingVertical as Vertical]}
            currentProfil={profilsState[editingVertical] ?? {}}
            onClose={() => setEditingVertical(null)}
            onSaved={(profil) => {
              setProfilsState((prev) => ({ ...prev, [editingVertical]: profil }));
              setEditingVertical(null);
            }}
          />
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════
          Section 3 — Mes avis
      ════════════════════════════════════════════════════════ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Mes avis</h2>

        {/* Tabs */}
        {verticalsWithAvis.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {["tous", ...verticalsWithAvis].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn("rounded-full border px-3 py-1 text-xs font-medium transition",
                  activeTab === tab
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                )}>
                {tab === "tous" ? "Tous" : VERTICALS[tab as Vertical]?.label ?? tab}
              </button>
            ))}
          </div>
        )}

        {avis.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
            <Star size={28} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm text-slate-500">Vous n&apos;avez pas encore d&apos;avis enregistrés.</p>
          </div>
        ) : filteredAvis.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center">
            <p className="text-sm text-slate-400">Aucun avis dans cette catégorie.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAvis.map((a) => {
              const offreData = Array.isArray(a.offres)
                ? (a.offres as { titre: string; vertical: string | null }[])[0]
                : a.offres;
              const offreTitre = offreData?.titre ?? "—";
              const offreVertical = offreData?.vertical ?? null;

              return (
                <div key={a.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {offreVertical && (
                        <div className="mb-1">
                          <VerticalBadge vertical={offreVertical} />
                        </div>
                      )}
                      <p className="font-medium text-slate-900 truncate">{offreTitre}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Stars note={a.note} />
                        <span className="text-xs text-slate-400">{fmtDate(a.created_at)}</span>
                        {a.recommande !== null && (
                          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium",
                            a.recommande ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600")}>
                            {a.recommande ? "Recommande" : "Ne recommande pas"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <button onClick={() => setEditAvis(a)}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-50">
                        <Pencil size={13} />
                      </button>
                      {deleteId === a.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => startDeleting(async () => {
                              await deleteAvisAction(a.id);
                              setAvis((prev) => prev.filter((x) => x.id !== a.id));
                              setDeleteId(null);
                            })}
                            disabled={isDeleting}
                            className="flex items-center gap-1 rounded-lg bg-red-600 px-2 py-1.5 text-xs font-medium text-white">
                            {isDeleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                            Confirmer
                          </button>
                          <button onClick={() => setDeleteId(null)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-500">
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteId(a.id)}
                          className="rounded-lg border border-slate-200 p-1.5 text-red-400 transition hover:bg-red-50">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {a.avis_texte && (
                    <p className="text-sm text-slate-600 line-clamp-2">{a.avis_texte}</p>
                  )}

                  {/* Accordéon réponses aux questions */}
                  {(reponsesByAvis[a.id]?.length ?? 0) > 0 && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700 select-none">
                        Voir toutes mes réponses ({reponsesByAvis[a.id].length})
                      </summary>
                      <div className="mt-2 space-y-2 rounded-lg bg-slate-50 p-3">
                        {["publique", "privee"].map((vis) => {
                          const grouped = reponsesByAvis[a.id].filter(
                            (r) => r.question?.visibilite_defaut === vis
                          );
                          if (!grouped.length) return null;
                          return (
                            <div key={vis}>
                              <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
                                {vis === "publique" ? <><Globe size={10} /> Questions publiques</> : <><Lock size={10} /> Questions privées</>}
                              </p>
                              {grouped.map((r) => {
                                const rep = r.reponse_texte ?? r.reponse_choix?.join(", ")
                                  ?? (r.reponse_booleen != null ? (r.reponse_booleen ? "Oui" : "Non") : null)
                                  ?? (r.reponse_note != null ? `${r.reponse_note}/5` : "—");
                                return (
                                  <div key={r.id} className="flex gap-2 text-xs text-slate-600">
                                    <span className="shrink-0">›</span>
                                    <span><span className="text-slate-500">{r.question?.texte}</span> → <strong>{rep}</strong></span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════
          Mon compte
      ════════════════════════════════════════════════════════ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Mon compte</h2>

        {/* Toggle consentement matching */}
        <div className="mb-5 rounded-xl border border-slate-200 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Mes préférences de confidentialité
          </p>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={consentMatching}
              onChange={(e) => {
                const val = e.target.checked;
                setConsentMatching(val);
                startUpdatingConsent(async () => { await updateConsentMatchingAction(val); });
              }}
              disabled={isUpdatingConsent}
              className="mt-0.5 h-4 w-4 rounded accent-blue-600 disabled:opacity-60" />
            <div>
              <p className="text-sm font-medium text-slate-800">
                Utiliser mes réponses privées pour améliorer mes recommandations (anonyme)
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Vos réponses ne sont jamais communiquées à d'autres prestataires.
              </p>
            </div>
          </label>
        </div>

        {!showDeleteAccount ? (
          <button onClick={() => setShowDeleteAccount(true)}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50">
            Supprimer mon compte
          </button>
        ) : (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="mb-3 text-sm font-medium text-red-800">
              Confirmer la suppression ? Vos avis seront anonymisés (pas supprimés).
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => startDeletingAccount(async () => { await deleteAccountAction(); })}
                disabled={isDeletingAccount}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60">
                {isDeletingAccount && <Loader2 size={13} className="animate-spin" />}
                Oui, supprimer
              </button>
              <button onClick={() => setShowDeleteAccount(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50">
                Annuler
              </button>
            </div>
          </div>
        )}
      </section>

      {editAvis && (
        <ModalModifierAvis
          avis={editAvis}
          onClose={() => setEditAvis(null)}
          onSaved={(updated) => {
            setAvis((prev) => prev.map((a) => a.id === updated.id ? { ...a, ...updated } : a));
            setEditAvis(null);
          }}
        />
      )}
    </div>
  );
}
