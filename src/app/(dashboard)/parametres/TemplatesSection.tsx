"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Loader2, AlertCircle, Check, X, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createTemplateAction,
  updateTemplateAction,
  deleteTemplateAction,
} from "./templateActions";

type Template = {
  id: string;
  nom: string;
  objet: string;
  corps: string;
  created_at: string;
};

type FormState = { nom: string; objet: string; corps: string };

const EMPTY_FORM: FormState = { nom: "", objet: "", corps: "" };

const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

function TemplateForm({
  initial,
  onSave,
  onCancel,
  submitLabel,
}: {
  initial: FormState;
  onSave: (data: FormState) => Promise<{ error?: string }>;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nom.trim() || !form.objet.trim() || !form.corps.trim()) {
      setError("Tous les champs sont requis.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await onSave(form);
      if (res.error) { setError(res.error); return; }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Nom du template</label>
        <input value={form.nom} onChange={set("nom")} placeholder="Ex : Relance standard" className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Objet</label>
        <input value={form.objet} onChange={set("objet")} placeholder="Ex : Votre avis sur [formation] nous intéresse" className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Corps</label>
        <p className="mb-1.5 text-xs text-slate-400">Variables : [prénom] [nom] [formation] [séance] [lien]</p>
        <textarea
          value={form.corps}
          onChange={set("corps")}
          rows={5}
          className={cn(inputCls, "resize-y font-mono text-xs")}
          placeholder="Bonjour [prénom],&#10;&#10;..."
        />
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle size={12} /> {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {isPending ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

export function TemplatesSection({ templates: initial }: { templates: Template[] }) {
  const [templates, setTemplates] = useState<Template[]>(initial);
  const [showNew, setShowNew] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleCreate(data: FormState) {
    const res = await createTemplateAction(data);
    if (res.error) return res;
    setTemplates((prev) => [
      ...prev,
      { id: res.id!, ...data, created_at: new Date().toISOString() },
    ]);
    setShowNew(false);
    return {};
  }

  async function handleUpdate(id: string, data: FormState) {
    const res = await updateTemplateAction(id, data);
    if (res.error) return res;
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    setEditId(null);
    return {};
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteTemplateAction(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setDeleteId(null);
    });
  }

  const fmt = (d: string) =>
    new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(d));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Mes templates de messages</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Réutilisez vos messages lors de l&apos;envoi des liens de collecte.
          </p>
        </div>
        <button
          onClick={() => { setShowNew(true); setEditId(null); }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={13} />
          Nouveau template
        </button>
      </div>

      {/* Formulaire nouveau template */}
      {showNew && (
        <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <h3 className="mb-3 text-sm font-medium text-slate-800">Nouveau template</h3>
          <TemplateForm
            initial={EMPTY_FORM}
            onSave={handleCreate}
            onCancel={() => setShowNew(false)}
            submitLabel="Créer"
          />
        </div>
      )}

      {templates.length === 0 && !showNew ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Mail size={24} className="mb-2 text-slate-300" />
          <p className="text-sm text-slate-500">Aucun template pour l&apos;instant.</p>
          <button
            onClick={() => setShowNew(true)}
            className="mt-3 text-xs text-blue-600 hover:underline"
          >
            Créer le premier template
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="rounded-xl border border-slate-200 p-4">
              {editId === t.id ? (
                <TemplateForm
                  initial={{ nom: t.nom, objet: t.objet, corps: t.corps }}
                  onSave={(data) => handleUpdate(t.id, data)}
                  onCancel={() => setEditId(null)}
                  submitLabel="Enregistrer"
                />
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{t.nom}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        Email
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{t.objet}</p>
                    <p className="mt-0.5 text-xs text-slate-400">Créé le {fmt(t.created_at)}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => { setEditId(t.id); setShowNew(false); }}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-50"
                      title="Modifier"
                    >
                      <Pencil size={13} />
                    </button>

                    {deleteId === t.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={isPending}
                          className="flex items-center gap-1 rounded-lg bg-red-600 px-2 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
                        >
                          {isPending ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                          Confirmer
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-50"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteId(t.id)}
                        className="rounded-lg border border-slate-200 p-1.5 text-red-400 transition hover:bg-red-50"
                        title="Supprimer"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
