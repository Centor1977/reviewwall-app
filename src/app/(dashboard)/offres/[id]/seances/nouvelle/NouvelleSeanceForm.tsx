"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Monitor, MapPin, Video, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createSeance } from "./actions";

type Mode = "presentiel" | "distance" | "video";

const MODES: { value: Mode; label: string; icon: React.ReactNode; color: string }[] = [
  {
    value: "presentiel",
    label: "Présentiel",
    icon: <MapPin size={20} />,
    color: "border-blue-500 bg-blue-50 text-blue-700",
  },
  {
    value: "distance",
    label: "À distance",
    icon: <Monitor size={20} />,
    color: "border-violet-500 bg-violet-50 text-violet-700",
  },
  {
    value: "video",
    label: "Vidéo",
    icon: <Video size={20} />,
    color: "border-emerald-500 bg-emerald-50 text-emerald-700",
  },
];

const inputCls = cn(
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900",
  "outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
);

export function NouvelleSeanceForm({ offreId }: { offreId: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("presentiel");
  const [titre, setTitre] = useState("");
  const [date, setDate] = useState("");
  const [lieu, setLieu] = useState("");
  const [nbParticipants, setNbParticipants] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titre.trim()) { setError("Le titre est requis."); return; }
    setError(null);
    setLoading(true);

    const result = await createSeance(offreId, {
      titre,
      mode,
      date_session: date || null,
      lieu: lieu || null,
      nb_participants_attendus: nbParticipants ? parseInt(nbParticipants, 10) : null,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // redirect handled by server action
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Titre */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Titre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Ex : Session Paris — Juin 2026"
          className={inputCls}
          required
        />
      </div>

      {/* Mode */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Mode</label>
        <div className="grid grid-cols-3 gap-3">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all",
                mode === m.value
                  ? m.color
                  : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      {(mode === "presentiel" || mode === "distance") && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Date et heure
          </label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputCls}
          />
        </div>
      )}

      {/* Lieu */}
      {mode === "presentiel" && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Lieu</label>
          <input
            type="text"
            value={lieu}
            onChange={(e) => setLieu(e.target.value)}
            placeholder="Ex : Paris 11e, salle A"
            className={inputCls}
          />
        </div>
      )}

      {/* Nb participants */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Nombre de participants attendus{" "}
          <span className="font-normal text-slate-400">(optionnel)</span>
        </label>
        <input
          type="number"
          min="1"
          value={nbParticipants}
          onChange={(e) => setNbParticipants(e.target.value)}
          placeholder="Ex : 15"
          className={cn(inputCls, "max-w-[160px]")}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={15} className="shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Créer la séance
        </button>
      </div>
    </form>
  );
}
