"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Globe, Lock } from "lucide-react";
import { type Vertical } from "@/config/verticals";
import { ModalQuestion } from "@/components/questions/ModalQuestion";
import { type QuestionItem } from "@/app/(dashboard)/offres/[id]/questionsActions";

const TYPE_LABELS: Record<string, string> = {
  texte: "Texte",
  note: "Note",
  oui_non: "Oui/Non",
  choix_unique: "Choix",
  choix_multiple: "Choix",
};

type Props = {
  offreId: string;
  verticalKey: Vertical;
  questions: QuestionItem[];
};

export function BlocQuestions({ offreId, verticalKey, questions: initial }: Props) {
  const [questions, setQuestions] = useState(initial);
  const [showModal, setShowModal] = useState(false);

  const publiques = questions.filter((q) => q.visibilite === "publique");
  const privees = questions.filter((q) => q.visibilite === "privee");
  const preview = questions.slice(0, 5);

  function handleSaved(item: QuestionItem) {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === item.id);
      if (idx >= 0) return prev.map((q, i) => (i === idx ? item : q));
      return [...prev, item];
    });
    setShowModal(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="card-section-title font-semibold text-slate-900">Questions</h2>
        <Link href={`/offres/${offreId}/questions`} className="text-xs text-blue-600 hover:underline">
          Gérer →
        </Link>
      </div>

      <p className="mb-3 text-xs text-slate-400">
        Publiques {publiques.length}/3 · Privées {privees.length}/3
      </p>

      {preview.length > 0 ? (
        <ul className="mb-4 space-y-1.5">
          {preview.map((q) => (
            <li key={q.id} className="flex items-center gap-2">
              {q.visibilite === "publique" ? (
                <Globe size={12} className="shrink-0 text-blue-500" />
              ) : (
                <Lock size={12} className="shrink-0 text-slate-400" />
              )}
              <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                {q.question.texte}
              </span>
              <span className="shrink-0 text-xs text-slate-400">
                {TYPE_LABELS[q.question.type_reponse] ?? q.question.type_reponse}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 py-3 text-center text-sm text-slate-400">
          Aucune question configurée
        </p>
      )}

      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 transition hover:text-blue-800"
      >
        <Plus size={13} />
        Ajouter une question
      </button>

      {showModal && (
        <ModalQuestion
          offreId={offreId}
          verticalKey={verticalKey}
          defaultVisibilite="publique"
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
