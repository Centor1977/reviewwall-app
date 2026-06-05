"use client";

import { useState, useRef, useTransition, useCallback } from "react";
import {
  X, Send, Loader2, ChevronDown, Save, AlertCircle, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type Template = {
  id: string;
  nom: string;
  objet: string;
  corps: string;
};

export type ParticipantEnvoi = {
  id: string;
  prenom: string | null;
  nom: string | null;
  email: string | null;
};

type Props = {
  participants: ParticipantEnvoi[];
  seanceId: string;
  offreTitre: string;
  seanceTitre: string;
  templates: Template[];
  onClose: () => void;
  onSent?: () => void;
  onSaveTemplate?: (tpl: { nom: string; objet: string; corps: string }) => Promise<void>;
};

const DEFAULT_OBJET = "Votre avis sur [formation] nous intéresse";
const DEFAULT_CORPS =
  "Suite à votre participation à [séance], nous souhaiterions avoir votre retour sur [formation].\n\nVotre avis nous aidera à améliorer notre accompagnement et guidera les futurs participants dans leur choix.\n\nCela ne prend que 3 minutes :\n[lien]";

const VARIABLES = ["[prénom]", "[nom]", "[formation]", "[séance]", "[lien]"] as const;

const EXAMPLE_VARS: Record<string, string> = {
  "[prénom]": "Marie",
  "[nom]": "Dupont",
  "[formation]": "Formation React avancé",
  "[séance]": "Session Paris — Juin 2026",
  "[lien]": "https://example.com/collect/abc123",
};

function previewText(text: string, offreTitre: string, seanceTitre: string): string {
  return text
    .replaceAll("[prénom]", "Marie")
    .replaceAll("[nom]", "Dupont")
    .replaceAll("[formation]", offreTitre || EXAMPLE_VARS["[formation]"])
    .replaceAll("[séance]", seanceTitre || EXAMPLE_VARS["[séance]"])
    .replaceAll("[lien]", EXAMPLE_VARS["[lien]"]);
}

const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export function ModalEnvoi({
  participants,
  seanceId,
  offreTitre,
  seanceTitre,
  templates,
  onClose,
  onSent,
  onSaveTemplate,
}: Props) {
  const [objet, setObjet] = useState(
    DEFAULT_OBJET.replaceAll("[formation]", offreTitre || "[formation]")
  );
  const [corps, setCorps] = useState(DEFAULT_CORPS);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [showSave, setShowSave] = useState(false);
  const [templateNom, setTemplateNom] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    envoyes: number;
    echecs: number;
    echecsDetails?: { participant: string; raison: string }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const eligibles = participants.filter((p) => p.email);
  const nbDestinataires = eligibles.length;

  const insertVariable = useCallback((variable: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const next = corps.slice(0, start) + variable + corps.slice(end);
    setCorps(next);
    requestAnimationFrame(() => {
      ta.selectionStart = start + variable.length;
      ta.selectionEnd = start + variable.length;
      ta.focus();
    });
  }, [corps]);

  function applyTemplate(id: string) {
    setSelectedTemplate(id);
    const tpl = templates.find((t) => t.id === id);
    if (tpl) { setObjet(tpl.objet); setCorps(tpl.corps); }
  }

  async function handleSaveTemplate() {
    if (!templateNom.trim() || !onSaveTemplate) return;
    setSavingTemplate(true);
    await onSaveTemplate({ nom: templateNom.trim(), objet, corps });
    setSavingTemplate(false);
    setShowSave(false);
    setTemplateNom("");
  }

  function handleSend() {
    if (!nbDestinataires) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/envois", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seance_id: seanceId,
          participant_ids: eligibles.map((p) => p.id),
          objet,
          corps,
          canal: "email",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur lors de l'envoi."); return; }
      setResult({ envoyes: data.envoyes, echecs: data.echecs, echecsDetails: data.echecsDetails });
      onSent?.();
    });
  }

  // ── Après envoi ────────────────────────────────────────────
  if (result) {
    return (
      <Overlay onClose={onClose}>
        <div className="flex flex-col items-center py-8 text-center">
          <CheckCircle2 size={40} className="mb-4 text-green-500" />
          <h2 className="mb-1 text-lg font-semibold text-slate-900">
            {result.envoyes} email{result.envoyes > 1 ? "s" : ""} envoyé{result.envoyes > 1 ? "s" : ""}
          </h2>
          {result.echecs > 0 && (
            <div className="mt-3 w-full text-left">
              <p className="mb-2 text-sm font-medium text-orange-600">
                {result.echecs} échec{result.echecs > 1 ? "s" : ""}
              </p>
              {result.echecsDetails?.map((d, i) => (
                <div key={i} className="rounded-lg border border-orange-100 bg-orange-50 px-3 py-2 text-xs text-orange-800 mb-1">
                  <strong>{d.participant}</strong> — {d.raison}
                </div>
              ))}
            </div>
          )}
          <button onClick={onClose} className="mt-6 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
            Fermer
          </button>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h2 className="font-semibold text-slate-900">Envoyer le lien de collecte</h2>
          <p className="mt-0.5 text-xs text-slate-400">
            {nbDestinataires} destinataire{nbDestinataires > 1 ? "s" : ""}
            {participants.length > nbDestinataires && (
              <span className="ml-1 text-orange-500">
                ({participants.length - nbDestinataires} sans email ignoré{participants.length - nbDestinataires > 1 ? "s" : ""})
              </span>
            )}
          </p>
        </div>
        <button onClick={onClose} className="rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
          <X size={16} />
        </button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
        {/* Template selector */}
        {templates.length > 0 && (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Utiliser un template</label>
            <div className="relative">
              <select
                value={selectedTemplate}
                onChange={(e) => applyTemplate(e.target.value)}
                className={cn(inputCls, "appearance-none pr-8")}
              >
                <option value="">— Sélectionner un template —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.nom}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        )}

        {/* Objet */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Objet</label>
          <input type="text" value={objet} onChange={(e) => setObjet(e.target.value)} className={inputCls} />
        </div>

        {/* Variables chips */}
        <div className="mb-3">
          <p className="mb-2 text-xs text-slate-400">Variables — cliquez pour insérer dans le corps :</p>
          <div className="flex flex-wrap gap-1.5">
            {VARIABLES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => insertVariable(v)}
                className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-mono font-medium text-blue-700 transition hover:bg-blue-100"
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Corps */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Corps</label>
          <textarea
            ref={textareaRef}
            value={corps}
            onChange={(e) => setCorps(e.target.value)}
            rows={7}
            className={cn(inputCls, "resize-y font-mono text-xs leading-relaxed")}
          />
        </div>

        {/* Prévisualisation */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700"
          >
            <ChevronDown size={12} className={cn("transition-transform", showPreview && "rotate-180")} />
            {showPreview ? "Masquer" : "Voir"} la prévisualisation
          </button>
          {showPreview && (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="mb-1 text-xs font-medium text-slate-400">Objet :</p>
              <p className="mb-3 text-sm text-slate-700">{previewText(objet, offreTitre, seanceTitre)}</p>
              <p className="mb-1 text-xs font-medium text-slate-400">Corps :</p>
              <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {previewText(corps, offreTitre, seanceTitre)}
              </div>
            </div>
          )}
        </div>

        {/* Sauvegarder template */}
        {onSaveTemplate && (
          <div className="mb-2">
            {!showSave ? (
              <button
                type="button"
                onClick={() => setShowSave(true)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700"
              >
                <Save size={11} />
                Sauvegarder comme template
              </button>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-medium text-slate-700">Nom du template</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={templateNom}
                    onChange={(e) => setTemplateNom(e.target.value)}
                    placeholder="Ex : Template relance standard"
                    className={cn(inputCls, "flex-1")}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveTemplate()}
                  />
                  <button
                    onClick={handleSaveTemplate}
                    disabled={savingTemplate || !templateNom.trim()}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {savingTemplate && <Loader2 size={11} className="animate-spin" />}
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => { setShowSave(false); setTemplateNom(""); }}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 transition hover:bg-slate-100"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
            <AlertCircle size={13} className="shrink-0 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
        <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50">
          Annuler
        </button>
        <button
          onClick={handleSend}
          disabled={isPending || !nbDestinataires}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Envoyer à {nbDestinataires} destinataire{nbDestinataires > 1 ? "s" : ""}
        </button>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {children}
      </div>
    </div>
  );
}
