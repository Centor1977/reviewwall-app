"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus, X, GripVertical, AlertCircle, Sparkles, Loader2, CheckCircle2,
} from "lucide-react";
import { cn, slugify } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES_OFFRE } from "@/lib/constants";
import { type Vertical, type VerticalConfig, type MetadataField } from "@/config/verticals";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => <div className="h-56 animate-pulse rounded-lg border border-slate-200 bg-slate-50" />,
});

// ── Types ─────────────────────────────────────────────────────

type ProgrammeSection = { id: string; titre: string; contenu: string };
type MetadataValue = string | boolean | string[] | ProgrammeSection[];

export type OffreInitial = {
  id: string; slug: string; titre: string; active: boolean;
  description_courte: string | null; description_longue: string | null;
  image_url: string | null; niveau: string | null; duree: string | null;
  format: string | null; langue: string | null; prix: number | null;
  tags: string[] | null; categorie: string | null; url_externe: string | null;
  metadata_vertical: Record<string, unknown> | null;
};

type Props = {
  mode: "creation" | "modification";
  prestataireId: string;
  verticalKey: Vertical;
  vertical: VerticalConfig;
  offre?: OffreInitial;
};

// ── Constants ─────────────────────────────────────────────────

const NIVEAUX = [
  { value: "tous_niveaux", label: "Tous niveaux" },
  { value: "debutant",     label: "Débutant" },
  { value: "intermediaire",label: "Intermédiaire" },
  { value: "avance",       label: "Avancé" },
];

const FORMATS = [
  { value: "presentiel", label: "Présentiel" },
  { value: "distanciel", label: "Distanciel" },
  { value: "blended",    label: "Blended" },
  { value: "video",      label: "Vidéo" },
  { value: "mixte",      label: "Mixte" },
];

const LANGUES = [
  { value: "fr",    label: "Français" },
  { value: "en",    label: "Anglais" },
  { value: "autre", label: "Autre" },
];

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

// ── Helpers ───────────────────────────────────────────────────

function shouldShow(field: MetadataField, meta: Record<string, MetadataValue>): boolean {
  if (!("condition" in field) || !field.condition) return true;
  const m = field.condition.match(/^(\w+)\s*===\s*(true|false)$/);
  return m ? meta[m[1]] === (m[2] === "true") : true;
}

function newId() { return Math.random().toString(36).slice(2); }

// ── TagsInput ─────────────────────────────────────────────────

function TagsInput({ value, onChange, placeholder }: {
  value: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [input, setInput] = useState("");

  function add() {
    const t = input.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput("");
  }

  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
      {value.map((tag) => (
        <span key={tag} className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700 hover:bg-slate-200 transition">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))}>
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
          if (e.key === "Backspace" && !input && value.length > 0) onChange(value.slice(0, -1));
        }}
        placeholder={value.length === 0 ? (placeholder ?? "Saisir + Entrée") : "Ajouter…"}
        className="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

// ── SortableListItem ──────────────────────────────────────────

function SortableListItem({ id, value, onChange, onRemove }: {
  id: string; value: string;
  onChange: (v: string) => void; onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-center gap-2", isDragging && "opacity-60")}>
      <button type="button" {...attributes} {...listeners}
        className="cursor-grab touch-none text-slate-300 hover:text-slate-500 active:cursor-grabbing">
        <GripVertical size={15} />
      </button>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "flex-1")} />
      <button type="button" onClick={onRemove}
        className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition">
        <X size={13} />
      </button>
    </div>
  );
}

// ── ListField ─────────────────────────────────────────────────

function ListField({ value, onChange, placeholder }: {
  value: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [ids] = useState<string[]>(() => value.map(() => newId()));
  const [stableIds, setStableIds] = useState(ids);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oi = stableIds.indexOf(active.id as string);
    const ni = stableIds.indexOf(over.id as string);
    setStableIds(arrayMove(stableIds, oi, ni));
    onChange(arrayMove(value, oi, ni));
  }

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={stableIds} strategy={verticalListSortingStrategy}>
          {value.map((item, i) => (
            <SortableListItem key={stableIds[i] ?? i} id={stableIds[i] ?? String(i)}
              value={item}
              onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))}
              onRemove={() => {
                onChange(value.filter((_, j) => j !== i));
                setStableIds(stableIds.filter((_, j) => j !== i));
              }}
            />
          ))}
        </SortableContext>
      </DndContext>
      <button type="button" onClick={() => {
        onChange([...value, ""]);
        setStableIds([...stableIds, newId()]);
      }}
        className="flex items-center gap-1.5 text-xs text-blue-600 transition hover:text-blue-700">
        <Plus size={13} /> Ajouter
      </button>
    </div>
  );
}

// ── ProgrammeField ────────────────────────────────────────────

function ProgrammeField({ value, onChange, placeholder }: {
  value: ProgrammeSection[]; onChange: (v: ProgrammeSection[]) => void; placeholder?: string;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oi = value.findIndex((s) => s.id === active.id);
    const ni = value.findIndex((s) => s.id === over.id);
    onChange(arrayMove(value, oi, ni));
  }

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={value.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {value.map((section, i) => (
            <SortableProgrammeSection key={section.id} section={section}
              onChange={(updated) => onChange(value.map((s, j) => (j === i ? updated : s)))}
              onRemove={() => onChange(value.filter((_, j) => j !== i))}
            />
          ))}
        </SortableContext>
      </DndContext>
      <button type="button"
        onClick={() => onChange([...value, { id: newId(), titre: "", contenu: "" }])}
        className="flex items-center gap-1.5 text-xs text-blue-600 transition hover:text-blue-700">
        <Plus size={13} /> Ajouter une section
      </button>
    </div>
  );
}

function SortableProgrammeSection({ section, onChange, onRemove }: {
  section: ProgrammeSection;
  onChange: (s: ProgrammeSection) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("rounded-lg border border-slate-200 bg-white p-4", isDragging && "shadow-md opacity-80")}>
      <div className="mb-2 flex items-center gap-2">
        <button type="button" {...attributes} {...listeners}
          className="cursor-grab touch-none text-slate-300 hover:text-slate-500 active:cursor-grabbing">
          <GripVertical size={15} />
        </button>
        <input
          value={section.titre}
          onChange={(e) => onChange({ ...section, titre: e.target.value })}
          placeholder="Titre de la section"
          className={cn(inputCls, "flex-1")}
        />
        <button type="button" onClick={onRemove}
          className="rounded-lg border border-slate-200 p-1.5 text-red-400 hover:bg-red-50 transition">
          <X size={13} />
        </button>
      </div>
      <textarea
        rows={2}
        value={section.contenu}
        onChange={(e) => onChange({ ...section, contenu: e.target.value })}
        placeholder="Contenu de la section"
        className={cn(inputCls, "resize-none")}
      />
    </div>
  );
}

// ── MetadataSection (onglet 3) ────────────────────────────────

function MetadataSection({ vertical, metadata, onChange }: {
  vertical: VerticalConfig;
  metadata: Record<string, MetadataValue>;
  onChange: (meta: Record<string, MetadataValue>) => void;
}) {
  function set(key: string, value: MetadataValue) {
    onChange({ ...metadata, [key]: value });
  }

  return (
    <div className="space-y-6">
      {vertical.metadata_fields.map((field) => {
        if (!shouldShow(field, metadata)) return null;

        const label = (
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {field.label}
            {"help" in field && field.help && (
              <span className="ml-1 text-xs font-normal text-slate-400">{field.help}</span>
            )}
          </label>
        );

        if (field.type === "boolean") {
          return (
            <div key={field.key} id={field.key}>
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox"
                  checked={(metadata[field.key] as boolean | undefined) ?? false}
                  onChange={(e) => set(field.key, e.target.checked)}
                  className="h-4 w-4 rounded accent-blue-600"
                />
                <span className="text-sm font-medium text-slate-700">{field.label}</span>
              </label>
            </div>
          );
        }

        if (field.type === "text") {
          return (
            <div key={field.key} id={field.key}>
              {label}
              <textarea rows={2}
                value={(metadata[field.key] as string | undefined) ?? ""}
                onChange={(e) => set(field.key, e.target.value)}
                placeholder={"placeholder" in field ? field.placeholder : undefined}
                className={cn(inputCls, "resize-none")}
              />
            </div>
          );
        }

        if (field.type === "list") {
          return (
            <div key={field.key} id={field.key}>
              {label}
              <ListField
                value={(metadata[field.key] as string[] | undefined) ?? []}
                onChange={(v) => set(field.key, v)}
                placeholder={"placeholder" in field ? field.placeholder : undefined}
              />
            </div>
          );
        }

        if (field.type === "tags") {
          return (
            <div key={field.key} id={field.key}>
              {label}
              <TagsInput
                value={(metadata[field.key] as string[] | undefined) ?? []}
                onChange={(v) => set(field.key, v)}
                placeholder={"placeholder" in field ? field.placeholder : undefined}
              />
            </div>
          );
        }

        if (field.type === "programme") {
          return (
            <div key={field.key} id={field.key}>
              {label}
              <ProgrammeField
                value={(metadata[field.key] as ProgrammeSection[] | undefined) ?? []}
                onChange={(v) => set(field.key, v)}
                placeholder={"placeholder" in field ? field.placeholder : undefined}
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

// ── OffreForm ─────────────────────────────────────────────────

type Tab = "general" | "description" | "vertical";

export function OffreForm({ mode, prestataireId, verticalKey, vertical, offre }: Props) {
  const router = useRouter();

  // Tab 1 state
  const [titre, setTitre]           = useState(offre?.titre ?? "");
  const [descCourte, setDescCourte] = useState(offre?.description_courte ?? "");
  const [categorie, setCategorie]   = useState(offre?.categorie ?? "");
  const [niveau, setNiveau]         = useState(offre?.niveau ?? "");
  const [format, setFormat]         = useState(offre?.format ?? "");
  const [duree, setDuree]           = useState(offre?.duree ?? "");
  const [langue, setLangue]         = useState(offre?.langue ?? "fr");
  const [prix, setPrix]             = useState(offre?.prix?.toString() ?? "");
  const [tags, setTags]             = useState<string[]>((offre?.tags as string[] | null) ?? []);
  const [urlExterne, setUrlExterne] = useState(offre?.url_externe ?? "");
  const [imageUrl, setImageUrl]     = useState(offre?.image_url ?? "");
  const [active, setActive]         = useState(offre?.active ?? true);

  // Tab 2 state
  const [descLongue, setDescLongue] = useState(offre?.description_longue ?? "");

  // Tab 3 state — convert programme items to include id
  const [metadata, setMetadata] = useState<Record<string, MetadataValue>>(() => {
    const raw = (offre?.metadata_vertical ?? {}) as Record<string, unknown>;
    const result: Record<string, MetadataValue> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (Array.isArray(v) && v.length > 0 && typeof v[0] === "object" && v[0] !== null && "titre" in v[0]) {
        result[k] = (v as { titre: string; contenu: string }[]).map((s) => ({ ...s, id: newId() }));
      } else {
        result[k] = v as MetadataValue;
      }
    }
    return result;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [error, setError]         = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showConfirmAI, setShowConfirmAI] = useState(false);
  const [toast, setToast]         = useState(false);

  // Anchor navigation depuis BlocFiche "Compléter la fiche"
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const hashToTab: Record<string, Tab> = {
      "#titre": "general", "#categorie": "general", "#format": "general",
      "#prix": "general", "#image": "general", "#tags": "general",
      "#description": "general",
      "#objectifs": "vertical", "#programme": "vertical",
      "#public_cible": "vertical", "#prerequis": "vertical",
    };
    const tab = hashToTab[hash];
    if (tab) {
      setActiveTab(tab);
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, []);

  // ── Completion indicators ─────────────────────────────────
  const tab1Complete = titre.trim().length >= 3;
  const tab2Complete = descLongue.trim().length > 0;
  const tab3Complete = vertical.metadata_fields.some((f) => {
    const v = metadata[f.key];
    if (f.type === "boolean") return v === true;
    if (Array.isArray(v)) return (v as string[]).length > 0;
    return typeof v === "string" && v.trim().length > 0;
  });

  // ── Save ──────────────────────────────────────────────────
  async function handleSave() {
    if (!titre.trim()) { setError("Le titre est requis."); setActiveTab("general"); return; }
    setError(null);
    setSaving(true);

    const supabase = createClient();

    // Strip internal ids from programme sections before saving
    const cleanMeta: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(metadata)) {
      if (Array.isArray(v) && v.length > 0 && typeof v[0] === "object" && "id" in (v[0] as object)) {
        cleanMeta[k] = (v as ProgrammeSection[]).map(({ titre, contenu }) => ({ titre, contenu }));
      } else {
        cleanMeta[k] = v;
      }
    }

    const payload = {
      titre: titre.trim(),
      description: descCourte || null,
      description_courte: descCourte || null,
      description_longue: descLongue || null,
      image_url: imageUrl || null,
      niveau: niveau || null,
      duree: duree || null,
      format: format || null,
      langue: langue || "fr",
      prix: prix ? parseFloat(prix) : null,
      tags,
      categorie: categorie || null,
      url_externe: urlExterne || null,
      active,
      metadata_vertical: cleanMeta,
    };

    if (mode === "creation") {
      const { error: err } = await supabase.from("offres").insert({
        prestataire_id: prestataireId,
        slug: slugify(titre),
        ...payload,
      });
      if (err) { setError("Erreur lors de la création."); setSaving(false); return; }
      router.push("/offres");
      router.refresh();
    } else {
      const { error: err } = await supabase.from("offres").update(payload).eq("id", offre!.id);
      if (err) { setError("Erreur lors de la sauvegarde."); setSaving(false); return; }
      router.push(`/offres/${offre!.id}`);
      router.refresh();
    }
    setSaving(false);
  }

  // ── AI generation ─────────────────────────────────────────
  async function generateWithAI() {
    setGenerating(true);
    setShowConfirmAI(false);
    try {
      const res = await fetch("/api/offres/generer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titre, categorie, format, niveau, vertical: verticalKey }),
      });
      const data = await res.json();
      if (data.description_courte) setDescCourte(data.description_courte);
      if (data.description_longue) setDescLongue(data.description_longue);
      const newMeta = { ...metadata };
      if (data.objectifs)    newMeta.objectifs    = data.objectifs as string[];
      if (data.prerequis)    newMeta.prerequis    = data.prerequis as string[];
      if (data.public_cible) newMeta.public_cible = data.public_cible as string;
      if (data.competences)  newMeta.competences  = data.competences as string[];
      if (data.programme)    newMeta.programme    = (data.programme as { titre: string; contenu: string }[]).map((s) => ({ ...s, id: newId() }));
      setMetadata(newMeta);
      setToast(true);
      setTimeout(() => setToast(false), 4000);
    } catch {
      setError("Erreur lors de la génération IA.");
    } finally {
      setGenerating(false);
    }
  }

  const offreLabel = vertical.offre.singular;

  // ── Tabs ──────────────────────────────────────────────────
  const tabs: { key: Tab; label: string; complete: boolean }[] = [
    { key: "general",     label: "Informations générales",     complete: tab1Complete },
    { key: "description", label: "Description détaillée",      complete: tab2Complete },
    { key: "vertical",    label: `Infos ${vertical.label}`,    complete: tab3Complete },
  ];

  const AIButton = (
    <button type="button" onClick={() => setShowConfirmAI(true)} disabled={generating}
      className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-60">
      {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
      {generating ? "Génération…" : "Générer avec l'IA"}
    </button>
  );

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 flex border-b border-slate-200">
        {tabs.map((tab) => (
          <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
            className={cn("flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition",
              activeTab === tab.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}>
            {tab.label}
            {tab.complete && (
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            )}
          </button>
        ))}
      </div>

      {/* ── Onglet 1 ── */}
      {activeTab === "general" && (
        <div className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Titre <span className="text-red-400">*</span>
            </label>
            <input id="titre" value={titre} onChange={(e) => setTitre(e.target.value)}
              placeholder={`Titre de la ${offreLabel}`}
              className={cn(inputCls, !titre.trim() && titre !== "" && "border-red-400 bg-red-50")} />
          </div>

          <div id="description">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Description courte
              <span className={cn("ml-1.5 text-xs font-normal", descCourte.length > 200 ? "text-red-500" : "text-slate-400")}>
                {descCourte.length}/200
              </span>
            </label>
            <textarea rows={2} value={descCourte} onChange={(e) => setDescCourte(e.target.value)}
              placeholder={`Accroche en 1-2 phrases pour votre ${offreLabel}`}
              className={cn(inputCls, "resize-none", descCourte.length > 200 && "border-red-400 bg-red-50")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div id="categorie">
              <label className="mb-1 block text-sm font-medium text-slate-700">Catégorie</label>
              <select value={categorie} onChange={(e) => setCategorie(e.target.value)} className={inputCls}>
                <option value="">— Sélectionner —</option>
                {CATEGORIES_OFFRE.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Niveau</label>
              <select value={niveau} onChange={(e) => setNiveau(e.target.value)} className={inputCls}>
                <option value="">— Sélectionner —</option>
                {NIVEAUX.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
              </select>
            </div>
            <div id="format">
              <label className="mb-1 block text-sm font-medium text-slate-700">Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className={inputCls}>
                <option value="">— Sélectionner —</option>
                {FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Durée</label>
              <input value={duree} onChange={(e) => setDuree(e.target.value)}
                placeholder='Ex : "14h", "2 jours"' className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Langue</label>
              <select value={langue} onChange={(e) => setLangue(e.target.value)} className={inputCls}>
                {LANGUES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div id="prix">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Prix <span className="text-slate-400">(optionnel)</span>
              </label>
              <div className="flex items-center gap-1">
                <input type="number" min="0" step="0.01" value={prix}
                  onChange={(e) => setPrix(e.target.value)}
                  placeholder="0.00" className={cn(inputCls, "flex-1")} />
                <span className="text-sm text-slate-500">€</span>
              </div>
            </div>
          </div>

          <div id="tags">
            <label className="mb-1 block text-sm font-medium text-slate-700">Tags</label>
            <TagsInput value={tags} onChange={setTags} placeholder="Excel, Bureautique… + Entrée" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              URL de la {offreLabel} <span className="text-slate-400">(optionnel)</span>
            </label>
            <input value={urlExterne} onChange={(e) => setUrlExterne(e.target.value)}
              type="url" placeholder="https://…" className={inputCls} />
          </div>

          <div id="image">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Image de couverture <span className="text-slate-400">(URL)</span>
            </label>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
              type="url" placeholder="https://…/image.jpg" className={inputCls} />
            {imageUrl && (
              <img src={imageUrl} alt="Aperçu" className="mt-2 h-24 w-full rounded-lg object-cover" />
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <div className={cn("relative inline-flex h-5 w-9 rounded-full transition", active ? "bg-blue-600" : "bg-slate-200")}
              onClick={() => setActive(!active)}>
              <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", active ? "left-4" : "left-0.5")} />
            </div>
            <span className="text-sm font-medium text-slate-700">
              {active ? "Active — visible sur la fiche publique" : "Inactive"}
            </span>
          </label>
        </div>
      )}

      {/* ── Onglet 2 ── */}
      {activeTab === "description" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Description longue (Markdown)</label>
            {AIButton}
          </div>
          <div data-color-mode="light">
            <MDEditor value={descLongue} onChange={(v) => setDescLongue(v ?? "")}
              height={320} preview="live" />
          </div>
        </div>
      )}

      {/* ── Onglet 3 ── */}
      {activeTab === "vertical" && (
        <div className="space-y-1">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Champs spécifiques à votre activité {vertical.label}.
            </p>
            {AIButton}
          </div>
          <MetadataSection vertical={vertical} metadata={metadata} onChange={setMetadata} />
        </div>
      )}

      {/* Errors */}
      {error && (
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Save */}
      <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
        <button type="button" onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50">
          {saving && <Loader2 size={14} className="animate-spin" />}
          {mode === "creation" ? `Créer la ${offreLabel}` : "Sauvegarder"}
        </button>
        <a href={mode === "modification" ? `/offres/${offre!.id}` : "/offres"}
          className="text-sm text-slate-500 transition hover:text-slate-900">
          Annuler
        </a>
      </div>

      {/* Modal confirmation IA */}
      {showConfirmAI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-2 font-semibold text-slate-900">Générer avec l'IA ?</h3>
            <p className="mb-5 text-sm text-slate-500">
              La génération va remplacer les champs existants (description, objectifs, programme…). Continuer ?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowConfirmAI(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition">
                Annuler
              </button>
              <button onClick={generateWithAI}
                className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition">
                <Sparkles size={14} /> Générer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">
          <CheckCircle2 size={15} className="text-green-400" />
          Contenu généré — vérifiez et adaptez selon votre {offreLabel}.
        </div>
      )}
    </div>
  );
}
