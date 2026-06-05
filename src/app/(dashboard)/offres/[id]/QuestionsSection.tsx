"use client";

import { useState, useTransition } from "react";
import {
  DndContext, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus, Library, GripVertical, Trash2, CheckCircle2, AlertTriangle,
  XCircle, Lock, Globe, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type Vertical } from "@/config/verticals";
import { ModalQuestion } from "@/components/questions/ModalQuestion";
import { ModalBibliotheque } from "@/components/questions/ModalBibliotheque";
import {
  removeQuestionFromOffreAction,
  updateVisibiliteOffreAction,
  reorderQuestionsAction,
  type QuestionItem,
  type QuestionBiblio,
} from "./questionsActions";

const TYPE_LABELS: Record<string, string> = {
  texte: "Texte",
  note: "Note 1-5",
  oui_non: "Oui/Non",
  choix_unique: "Choix unique",
  choix_multiple: "Choix multiple",
};

// ── Sortable item ─────────────────────────────────────────────

function SortableQuestion({
  item, offreId, onRemove, onToggleVisibilite,
}: {
  item: QuestionItem;
  offreId: string;
  onRemove: (id: string) => void;
  onToggleVisibilite: (id: string, current: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const q = item.question;
  const isPublique = item.visibilite === "publique";

  return (
    <div ref={setNodeRef} style={style}
      className={cn("flex items-start gap-3 rounded-xl border bg-white p-4 transition",
        isDragging ? "shadow-lg border-blue-200 opacity-80" : "border-slate-200"
      )}>
      {/* Drag handle */}
      <button {...attributes} {...listeners}
        className="mt-0.5 cursor-grab touch-none text-slate-300 hover:text-slate-500 transition active:cursor-grabbing">
        <GripVertical size={16} />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-900">{q.texte}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {/* Type */}
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
            {TYPE_LABELS[q.type_reponse] ?? q.type_reponse}
          </span>

          {/* Visibilité */}
          <button
            onClick={() => onToggleVisibilite(item.id, item.visibilite)}
            className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition hover:opacity-80",
              isPublique ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
            )}>
            {isPublique ? <><Globe size={10} /> Publique</> : <><Lock size={10} /> Privée</>}
          </button>

          {/* Dimension profil */}
          {q.dimension_profil && (
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
              Profil : {q.dimension_profil.split(".")[1]}
            </span>
          )}

          {/* Matching */}
          {q.utilisable_matching && (
            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-700">
              Matching
            </span>
          )}

          {/* Validation IA */}
          {q.validation_ia?.statut === "ok" && <CheckCircle2 size={13} className="text-green-500" />}
          {q.validation_ia?.statut === "warning" && (
            <AlertTriangle size={13} className="text-amber-500" aria-label={q.validation_ia.message} />
          )}
          {q.validation_ia?.statut === "error" && (
            <XCircle size={13} className="text-red-500" aria-label={q.validation_ia.message} />
          )}
        </div>
      </div>

      <RemoveButton offreQuestionId={item.id} offreId={offreId} onRemoved={() => onRemove(item.id)} />
    </div>
  );
}

function RemoveButton({ offreQuestionId, offreId, onRemoved }: {
  offreQuestionId: string; offreId: string; onRemoved: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirm) {
    return (
      <div className="flex shrink-0 gap-1">
        <button onClick={() => startTransition(async () => {
          await removeQuestionFromOffreAction({ offreQuestionId, offreId });
          onRemoved();
        })} disabled={isPending}
          className="flex items-center gap-1 rounded-lg bg-red-600 px-2 py-1.5 text-xs font-medium text-white">
          {isPending ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
          Retirer
        </button>
        <button onClick={() => setConfirm(false)}
          className="rounded-lg border border-slate-200 p-1.5 text-slate-400">
          ✕
        </button>
      </div>
    );
  }
  return (
    <button onClick={() => setConfirm(true)}
      className="shrink-0 rounded-lg border border-slate-200 p-1.5 text-red-400 transition hover:bg-red-50">
      <Trash2 size={13} />
    </button>
  );
}

// ── Section principale ────────────────────────────────────────

type ModalState =
  | { type: "none" }
  | { type: "createPublique" }
  | { type: "createPrivee" }
  | { type: "biblio" }
  | { type: "edit"; item: QuestionItem }
  | { type: "editBiblio"; question: QuestionBiblio };

type Props = {
  offreId: string;
  verticalKey: Vertical;
  initialPubliques: QuestionItem[];
  initialPrivees: QuestionItem[];
};

export function QuestionsSection({ offreId, verticalKey, initialPubliques, initialPrivees }: Props) {
  const [publiques, setPubliques] = useState<QuestionItem[]>(initialPubliques);
  const [privees, setPrivees] = useState<QuestionItem[]>(initialPrivees);
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent, list: "pub" | "priv") {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const items = list === "pub" ? publiques : privees;
    const setItems = list === "pub" ? setPubliques : setPrivees;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({ ...item, ordre: idx }));
    setItems(reordered);
    reorderQuestionsAction({ offreId, ordres: reordered.map((i) => ({ offreQuestionId: i.id, ordre: i.ordre })) });
  }

  function handleToggleVisibilite(id: string, current: string) {
    const next = current === "publique" ? "privee" : "publique";
    // Déplace entre les deux listes
    if (current === "publique") {
      const item = publiques.find((i) => i.id === id);
      if (!item) return;
      setPubliques((p) => p.filter((i) => i.id !== id));
      setPrivees((p) => [...p, { ...item, visibilite: next }]);
    } else {
      const item = privees.find((i) => i.id === id);
      if (!item) return;
      setPrivees((p) => p.filter((i) => i.id !== id));
      setPubliques((p) => [...p, { ...item, visibilite: next }]);
    }
    updateVisibiliteOffreAction({ offreQuestionId: id, offreId, visibilite: next });
  }

  function handleSaved(item: QuestionItem) {
    const upsert = (list: QuestionItem[]) => {
      const idx = list.findIndex((i) => i.id === item.id || i.question.id === item.question.id);
      return idx >= 0 ? list.map((i, j) => (j === idx ? item : i)) : [...list, item];
    };
    if (item.visibilite === "publique") {
      setPubliques(upsert);
      setPrivees((p) => p.filter((i) => i.id !== item.id));
    } else {
      setPrivees(upsert);
      setPubliques((p) => p.filter((i) => i.id !== item.id));
    }
    setModal({ type: "none" });
  }

  function handleAdded(items: QuestionItem[]) {
    for (const item of items) {
      if (item.visibilite === "publique") {
        setPubliques((p) => (p.some((i) => i.id === item.id) ? p : [...p, item]));
      } else {
        setPrivees((p) => (p.some((i) => i.id === item.id) ? p : [...p, item]));
      }
    }
    setModal({ type: "none" });
  }

  const allLinked = [...publiques, ...privees].map((i) => i.question.id);

  return (
    <div className="space-y-4">
      {/* ── Questions publiques ── */}
      <QuestionsList
        title="Questions publiques"
        count={publiques.length}
        items={publiques}
        offreId={offreId}
        onRemove={(id) => setPubliques((p) => p.filter((i) => i.id !== id))}
        onToggleVisibilite={handleToggleVisibilite}
        onDragEnd={(e) => handleDragEnd(e, "pub")}
        sensors={sensors}
        onCreateNew={() => setModal({ type: "createPublique" })}
        onOpenBiblio={() => setModal({ type: "biblio" })}
        isPublique
      />

      {/* ── Questions privées ── */}
      <QuestionsList
        title="Questions privées"
        count={privees.length}
        items={privees}
        offreId={offreId}
        onRemove={(id) => setPrivees((p) => p.filter((i) => i.id !== id))}
        onToggleVisibilite={handleToggleVisibilite}
        onDragEnd={(e) => handleDragEnd(e, "priv")}
        sensors={sensors}
        onCreateNew={() => setModal({ type: "createPrivee" })}
        onOpenBiblio={() => setModal({ type: "biblio" })}
        isPublique={false}
      />

      {/* ── Modals ── */}
      {modal.type === "createPublique" && (
        <ModalQuestion offreId={offreId} verticalKey={verticalKey} defaultVisibilite="publique"
          onClose={() => setModal({ type: "none" })} onSaved={handleSaved} />
      )}
      {modal.type === "createPrivee" && (
        <ModalQuestion offreId={offreId} verticalKey={verticalKey} defaultVisibilite="privee"
          onClose={() => setModal({ type: "none" })} onSaved={handleSaved} />
      )}
      {modal.type === "edit" && (
        <ModalQuestion offreId={offreId} verticalKey={verticalKey} editItem={modal.item}
          onClose={() => setModal({ type: "none" })} onSaved={handleSaved} />
      )}
      {modal.type === "editBiblio" && (
        <ModalQuestion
          offreId={offreId} verticalKey={verticalKey}
          editItem={{ id: "", ordre: 0, visibilite: modal.question.visibilite_defaut, question: modal.question }}
          onClose={() => setModal({ type: "none" })} onSaved={handleSaved} />
      )}
      {modal.type === "biblio" && (
        <ModalBibliotheque
          offreId={offreId} alreadyLinked={allLinked}
          onClose={() => setModal({ type: "none" })}
          onAdded={handleAdded}
          onEditQuestion={(q) => setModal({ type: "editBiblio", question: q })}
        />
      )}
    </div>
  );
}

function QuestionsList({
  title, count, items, offreId, onRemove, onToggleVisibilite, onDragEnd, sensors,
  onCreateNew, onOpenBiblio, isPublique,
}: {
  title: string; count: number; items: QuestionItem[]; offreId: string;
  onRemove: (id: string) => void;
  onToggleVisibilite: (id: string, current: string) => void;
  onDragEnd: (e: DragEndEvent) => void;
  sensors: ReturnType<typeof useSensors>;
  onCreateNew: () => void;
  onOpenBiblio: () => void;
  isPublique: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isPublique && <Lock size={14} className="text-slate-500" />}
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            {count}
          </span>
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-400">
                Aucune question {isPublique ? "publique" : "privée"} pour cette offre.
              </p>
            )}
            {items.map((item) => (
              <SortableQuestion key={item.id} item={item} offreId={offreId}
                onRemove={onRemove} onToggleVisibilite={onToggleVisibilite} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={onOpenBiblio}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
          <Library size={13} /> Depuis ma bibliothèque
        </button>
        <button onClick={onCreateNew}
          className="flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50">
          <Plus size={13} /> Créer une question
        </button>
      </div>
    </div>
  );
}
