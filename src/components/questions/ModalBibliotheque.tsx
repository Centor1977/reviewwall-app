"use client";

import { useState, useTransition, useEffect } from "react";
import { X, CheckCircle2, AlertTriangle, XCircle, Loader2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getQuestionsBibliothequeAction,
  addQuestionsToOffreAction,
  type QuestionBiblio,
  type QuestionItem,
} from "@/app/(dashboard)/offres/[id]/questionsActions";

const TYPE_LABELS: Record<string, string> = {
  texte: "Texte",
  note: "Note",
  oui_non: "Oui/Non",
  choix_unique: "Choix unique",
  choix_multiple: "Choix multiple",
};

type FilterVis = "toutes" | "publique" | "privee";
type FilterVal = "toutes" | "validees" | "non_validees";

type Props = {
  offreId: string;
  alreadyLinked: string[]; // question IDs déjà associés
  onClose: () => void;
  onAdded: (items: QuestionItem[]) => void;
  onEditQuestion: (q: QuestionBiblio) => void;
};

export function ModalBibliotheque({ offreId, alreadyLinked, onClose, onAdded, onEditQuestion }: Props) {
  const [questions, setQuestions] = useState<QuestionBiblio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVis, setFilterVis] = useState<FilterVis>("toutes");
  const [filterVal, setFilterVal] = useState<FilterVal>("toutes");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getQuestionsBibliothequeAction().then(({ questions: qs }) => {
      setQuestions(qs);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const filtered = questions.filter((q) => {
    if (filterVis !== "toutes" && q.visibilite_defaut !== filterVis) return false;
    if (filterVal === "validees" && !q.validee) return false;
    if (filterVal === "non_validees" && q.validee) return false;
    return true;
  });

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      const res = await addQuestionsToOffreAction({ offreId, questionIds: [...selected] });
      if (res.error) { setError(res.error); return; }
      onAdded(res.items ?? []);
    });
  }

  const selectable = filtered.filter((q) => !alreadyLinked.includes(q.id));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
          <h2 className="font-semibold text-slate-900">Ma bibliothèque de questions</h2>
          <button onClick={onClose} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 transition">
            <X size={16} />
          </button>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 px-6 py-3 shrink-0">
          {(["toutes", "publique", "privee"] as FilterVis[]).map((v) => (
            <button key={v} onClick={() => setFilterVis(v)}
              className={cn("rounded-full border px-3 py-1 text-xs font-medium transition",
                filterVis === v ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"
              )}>
              {v === "toutes" ? "Toutes" : v === "publique" ? "Publiques" : "Privées"}
            </button>
          ))}
          <div className="mx-1 h-5 w-px bg-slate-200 self-center" />
          {(["toutes", "validees", "non_validees"] as FilterVal[]).map((v) => (
            <button key={v} onClick={() => setFilterVal(v)}
              className={cn("rounded-full border px-3 py-1 text-xs font-medium transition",
                filterVal === v ? "border-slate-700 bg-slate-700 text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"
              )}>
              {v === "toutes" ? "Toutes" : v === "validees" ? "Validées IA" : "Non validées"}
            </button>
          ))}
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-slate-300" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Aucune question trouvée.</p>
          ) : (
            filtered.map((q) => {
              const linked = alreadyLinked.includes(q.id);
              const sel = selected.has(q.id);
              return (
                <div key={q.id}
                  className={cn("flex items-start gap-3 rounded-xl border p-4 transition",
                    linked ? "border-slate-100 bg-slate-50 opacity-50" :
                    sel ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
                  )}>
                  <input type="checkbox" checked={sel} disabled={linked}
                    onChange={() => toggle(q.id)}
                    className="mt-0.5 h-4 w-4 rounded accent-blue-600 cursor-pointer disabled:cursor-not-allowed" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 line-clamp-2">{q.texte}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        {TYPE_LABELS[q.type_reponse] ?? q.type_reponse}
                      </span>
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium",
                        q.visibilite_defaut === "publique"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      )}>
                        {q.visibilite_defaut === "publique" ? "Publique" : "🔒 Privée"}
                      </span>
                      {/* Statut IA */}
                      {q.validation_ia?.statut === "ok" && (
                        <CheckCircle2 size={13} className="text-green-500" />
                      )}
                      {q.validation_ia?.statut === "warning" && (
                        <AlertTriangle size={13} className="text-amber-500" />
                      )}
                      {q.validation_ia?.statut === "error" && (
                        <XCircle size={13} className="text-red-500" />
                      )}
                      <span className="text-xs text-slate-400">
                        {q.nb_offres} offre{q.nb_offres !== 1 ? "s" : ""}
                      </span>
                      {linked && <span className="text-xs text-slate-400 italic">Déjà ajoutée</span>}
                    </div>
                  </div>
                  <button onClick={() => onEditQuestion(q)}
                    className="shrink-0 rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50 transition">
                    <Pencil size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 shrink-0">
          {error && <p className="text-xs text-red-600">{error}</p>}
          {!error && <p className="text-xs text-slate-400">{selected.size} sélectionnée{selected.size !== 1 ? "s" : ""}</p>}
          <div className="flex gap-2">
            <button onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50">
              Annuler
            </button>
            <button onClick={handleAdd} disabled={selected.size === 0 || isPending}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50">
              {isPending && <Loader2 size={13} className="animate-spin" />}
              Ajouter {selected.size > 0 ? `(${selected.size})` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
