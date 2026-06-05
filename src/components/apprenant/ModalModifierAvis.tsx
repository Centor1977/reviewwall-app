"use client";

import { useState, useTransition } from "react";
import { X, Star, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateAvisAction } from "@/app/(apprenant)/mon-profil/actions";

type AvisData = {
  id: string; note: number | null; recommande: boolean | null;
  avis_texte: string | null; point_fort: string | null; point_amelioration: string | null;
};

type Props = {
  avis: AvisData;
  onClose: () => void;
  onSaved: (updated: Partial<AvisData>) => void;
};

const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hov, setHov] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}
          onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}>
          <Star size={32} className={cn("transition",
            n <= (hov || value) ? "fill-yellow-400 text-yellow-400" : "fill-none text-slate-300")} />
        </button>
      ))}
    </div>
  );
}

export function ModalModifierAvis({ avis, onClose, onSaved }: Props) {
  const [note, setNote] = useState(avis.note ?? 0);
  const [recommande, setRecommande] = useState(avis.recommande ?? true);
  const [texte, setTexte] = useState(avis.avis_texte ?? "");
  const [fort, setFort] = useState(avis.point_fort ?? "");
  const [amelio, setAmelio] = useState(avis.point_amelioration ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!note) { setError("Donnez une note."); return; }
    if (texte.length < 50) { setError("L'avis doit faire au moins 50 caractères."); return; }
    setError(null);
    startTransition(async () => {
      const res = await updateAvisAction(avis.id, {
        note, recommande, avis_texte: texte, point_fort: fort, point_amelioration: amelio,
      });
      if (res.error) { setError(res.error); return; }
      onSaved({ note, recommande, avis_texte: texte, point_fort: fort, point_amelioration: amelio });
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Modifier mon avis</h2>
          <button onClick={onClose} className="rounded p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto space-y-5 px-6 py-5">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Note</p>
            <StarPicker value={note} onChange={setNote} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Recommandez-vous ?</p>
            <div className="flex gap-3">
              {[{ label: "👍 Oui", val: true }, { label: "👎 Non", val: false }].map((o) => (
                <button key={String(o.val)} type="button" onClick={() => setRecommande(o.val)}
                  className={cn("flex-1 rounded-lg border py-2.5 text-sm font-medium transition",
                    recommande === o.val
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300")}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between">
              <label className="text-sm font-medium text-slate-700">Votre avis</label>
              <span className={cn("text-xs", texte.length >= 50 ? "text-green-600" : "text-slate-400")}>
                {texte.length}/50 min
              </span>
            </div>
            <textarea rows={4} value={texte} onChange={(e) => setTexte(e.target.value)}
              className={cn(inputCls, "resize-none")} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Point fort</label>
            <input value={fort} onChange={(e) => setFort(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Point à améliorer</label>
            <input value={amelio} onChange={(e) => setAmelio(e.target.value)} className={inputCls} />
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle size={13} />{error}
            </p>
          )}
        </div>

        <div className="flex justify-between border-t border-slate-100 px-6 py-4">
          <button onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50">
            Annuler
          </button>
          <button onClick={handleSave} disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60">
            {isPending && <Loader2 size={13} className="animate-spin" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
