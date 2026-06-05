"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { X, Plus, Trash2, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { VERTICALS, type Vertical } from "@/config/verticals";
import { saveQuestionAction, type QuestionItem, type ValidationIA } from "@/app/(dashboard)/offres/[id]/questionsActions";

const TYPE_OPTIONS = [
  { value: "texte", label: "Texte libre" },
  { value: "note", label: "Note 1-5" },
  { value: "oui_non", label: "Oui / Non" },
  { value: "choix_unique", label: "Choix unique" },
  { value: "choix_multiple", label: "Choix multiple" },
] as const;

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

type Props = {
  offreId: string;
  verticalKey: Vertical;
  editItem?: QuestionItem | null;
  defaultVisibilite?: "publique" | "privee";
  onClose: () => void;
  onSaved: (item: QuestionItem) => void;
};

export function ModalQuestion({ offreId, verticalKey, editItem, defaultVisibilite = "publique", onClose, onSaved }: Props) {
  const question = editItem?.question;

  const [texte, setTexte] = useState(question?.texte ?? "");
  const [type, setType] = useState(question?.type_reponse ?? "texte");
  const [options, setOptions] = useState<string[]>(question?.options ?? ["", ""]);
  const [visibilite, setVisibilite] = useState<"publique" | "privee">(
    (editItem?.visibilite as "publique" | "privee") ?? defaultVisibilite
  );
  const [dimensionProfil, setDimensionProfil] = useState(question?.dimension_profil ?? "");
  const [utilisableMatching, setUtilisableMatching] = useState(question?.utilisable_matching ?? false);
  const [iaStatus, setIaStatus] = useState<ValidationIA | null>(question?.validation_ia ?? null);
  const [iaLoading, setIaLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastValidatedRef = useRef(question?.texte ?? "");

  // Clôture sur Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleTexteChange(value: string) {
    setTexte(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim() || value === lastValidatedRef.current) return;
    setIaLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/questions/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texte: value }),
        });
        const result: ValidationIA = await res.json();
        setIaStatus(result);
        lastValidatedRef.current = value;
      } catch {
        // silencieux
      } finally {
        setIaLoading(false);
      }
    }, 800);
  }

  function addOption() {
    if (options.length < 8) setOptions((o) => [...o, ""]);
  }
  function removeOption(i: number) {
    if (options.length > 2) setOptions((o) => o.filter((_, idx) => idx !== i));
  }
  function setOption(i: number, v: string) {
    setOptions((o) => o.map((x, idx) => (idx === i ? v : x)));
  }

  const needsOptions = type === "choix_unique" || type === "choix_multiple";
  const canSave =
    texte.trim().length > 0 &&
    (!needsOptions || options.filter((o) => o.trim()).length >= 2) &&
    iaStatus?.statut !== "error" &&
    !iaLoading;

  function handleSave() {
    setSaveError(null);
    startTransition(async () => {
      const res = await saveQuestionAction({
        id: question?.id,
        offreId,
        texte: texte.trim(),
        type_reponse: type,
        options: needsOptions ? options.filter((o) => o.trim()) : null,
        visibilite_defaut: visibilite,
        visibilite_pour_offre: visibilite,
        dimension_profil: visibilite === "publique" ? dimensionProfil || null : null,
        utilisable_matching: visibilite === "privee" ? utilisableMatching : false,
        validation_ia: iaStatus,
      });
      if (res.error) { setSaveError(res.error); return; }
      onSaved(res.item!);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            {question ? "Modifier la question" : "Nouvelle question"}
          </h2>
          <button onClick={onClose} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 transition">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto space-y-5 px-6 py-5">
          {/* Texte */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">
              Texte de la question
            </label>
            <textarea
              rows={3}
              value={texte}
              onChange={(e) => handleTexteChange(e.target.value)}
              placeholder="Ex : Quel était votre niveau au départ ?"
              className={cn(inputCls, "resize-none")}
            />
            {/* Statut validation IA */}
            <div className="mt-2 min-h-[22px]">
              {iaLoading && (
                <p className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Loader2 size={12} className="animate-spin" /> Validation en cours…
                </p>
              )}
              {!iaLoading && iaStatus?.statut === "ok" && (
                <p className="flex items-center gap-1.5 text-xs text-green-600">
                  <CheckCircle2 size={12} /> Question valide
                </p>
              )}
              {!iaLoading && iaStatus?.statut === "warning" && (
                <p className="flex items-center gap-1.5 text-xs text-amber-600">
                  <AlertTriangle size={12} /> Attention : {iaStatus.message}
                </p>
              )}
              {!iaLoading && iaStatus?.statut === "error" && (
                <p className="flex items-center gap-1.5 text-xs text-red-600">
                  <XCircle size={12} /> Non conforme : {iaStatus.message}
                </p>
              )}
            </div>
          </div>

          {/* Type de réponse */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Type de réponse</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Options (choix) */}
          {needsOptions && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">
                Options <span className="text-slate-400">({options.length}/8 — min. 2)</span>
              </label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={opt}
                      onChange={(e) => setOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      disabled={options.length <= 2}
                      className="shrink-0 rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                {options.length < 8 && (
                  <button type="button" onClick={addOption}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition">
                    <Plus size={13} /> Ajouter une option
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Visibilité */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Visibilité</label>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              {(["publique", "privee"] as const).map((v) => (
                <button key={v} type="button" onClick={() => setVisibilite(v)}
                  className={cn("flex-1 py-2 text-xs font-medium transition",
                    visibilite === v
                      ? v === "publique" ? "bg-blue-600 text-white" : "bg-slate-700 text-white"
                      : "bg-white text-slate-500 hover:bg-slate-50"
                  )}>
                  {v === "publique" ? "Publique" : "🔒 Privée"}
                </button>
              ))}
            </div>
          </div>

          {/* Dimension profil (si publique) */}
          {visibilite === "publique" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">
                Lier à une dimension profil <span className="text-slate-400">(optionnel)</span>
              </label>
              <select value={dimensionProfil} onChange={(e) => setDimensionProfil(e.target.value)} className={inputCls}>
                <option value="">— Aucun lien profil —</option>
                {VERTICALS[verticalKey].profil_fields.map((f) => (
                  <option key={f.key} value={`${verticalKey}.${f.key}`}>{f.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Matching (si privée) */}
          {visibilite === "privee" && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
              <input
                type="checkbox"
                checked={utilisableMatching}
                onChange={(e) => setUtilisableMatching(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-blue-600"
              />
              <div>
                <p className="text-sm font-medium text-slate-800">Utiliser pour le matching (anonyme)</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Améliore les recommandations sans exposer vos réponses
                </p>
              </div>
            </label>
          )}

          {saveError && (
            <p className="flex items-center gap-1.5 text-sm text-red-600">
              <XCircle size={13} />{saveError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between border-t border-slate-100 px-6 py-4">
          <button onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50">
            Annuler
          </button>
          <button onClick={handleSave} disabled={!canSave || isPending}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50">
            {isPending && <Loader2 size={13} className="animate-spin" />}
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
