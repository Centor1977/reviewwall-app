"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, ChevronRight, ChevronLeft, AlertCircle } from "lucide-react";
import type { VerticalConfig } from "@/config/verticals";
import { submitAvis } from "./actions";
import { cn } from "@/lib/utils";

// ── Schéma ─────────────────────────────────────────────────
// profil est un Record<string, string> libre — la validation
// des champs requis se fait manuellement dans goNext().
const schema = z.object({
  profil: z.record(z.string(), z.string()).default({}),
  note: z.number({ error: "Donnez une note" }).min(1).max(5),
  recommande: z.boolean({ error: "Répondez à cette question" }),
  avis_texte: z.string().min(50, "50 caractères minimum"),
  point_fort: z.string().min(1, "Ce champ est requis"),
  point_amelioration: z.string().min(1, "Ce champ est requis"),
});

type FormData = z.infer<typeof schema>;

// ── Composants UI ──────────────────────────────────────────
function Chips({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm transition",
            value === o
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function StarRating({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (n: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
        >
          <Star
            size={36}
            className={cn(
              "transition",
              n <= (hovered || value || 0)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-none text-gray-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}

// ── Composant principal ────────────────────────────────────
type Props = {
  token: string;
  offreId: string;
  vertical: VerticalConfig;
};

export default function CollectForm({ token, offreId, vertical }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: "onTouched" });

  const avisTexte = watch("avis_texte") ?? "";
  const profilWatch = watch("profil") ?? {};

  async function goNext() {
    setStep1Error(null);
    const missing = vertical.profil_fields.filter(
      (f) => !getValues(`profil.${f.key}`)?.trim()
    );
    if (missing.length > 0) {
      setStep1Error(
        `Veuillez renseigner : ${missing.map((f) => f.label).join(", ")}`
      );
      return;
    }
    setStep(2);
  }

  async function onSubmit(data: FormData) {
    const result = await submitAvis(token, offreId, data);
    if (result?.error) {
      setError("root", { message: result.error });
    }
  }

  const fieldClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Étapes */}
      <div className="mb-6 flex items-center gap-3">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                step === s
                  ? "bg-blue-600 text-white"
                  : s < step
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-400"
              )}
            >
              {s}
            </div>
            <span className={cn("text-sm", step === s ? "font-medium text-gray-900" : "text-gray-400")}>
              {s === 1 ? "Votre profil" : "Votre avis"}
            </span>
            {s < 2 && <ChevronRight size={14} className="text-gray-300" />}
          </div>
        ))}
      </div>

      {/* ── ÉTAPE 1 — Profil dynamique ── */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
            {vertical.profil_fields.map((field) => (
              <div key={field.key}>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  {field.label}
                </p>
                {field.type === "chips" ? (
                  <Chips
                    options={field.options}
                    value={profilWatch[field.key]}
                    onChange={(v) => setValue(`profil.${field.key}`, v)}
                  />
                ) : (
                  <input
                    type="text"
                    value={profilWatch[field.key] ?? ""}
                    onChange={(e) => setValue(`profil.${field.key}`, e.target.value)}
                    className={fieldClass}
                  />
                )}
              </div>
            ))}
          </div>

          {step1Error && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-500" />
              <p className="text-sm text-amber-700">{step1Error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={goNext}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Étape suivante
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── ÉTAPE 2 — Avis ── */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
            {/* Note */}
            <div>
              <p className="mb-3 text-sm font-medium text-gray-700">Note globale</p>
              <Controller
                name="note"
                control={control}
                render={({ field }) => (
                  <StarRating value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.note && (
                <p className="mt-1 text-xs text-red-500">{errors.note.message}</p>
              )}
            </div>

            {/* Recommande */}
            <div>
              <p className="mb-3 text-sm font-medium text-gray-700">
                Recommanderiez-vous cette {vertical.offre.singular} ?
              </p>
              <Controller
                name="recommande"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-3">
                    {[
                      { label: "👍 Oui", value: true },
                      { label: "👎 Non", value: false },
                    ].map((opt) => (
                      <button
                        key={String(opt.value)}
                        type="button"
                        onClick={() => field.onChange(opt.value)}
                        className={cn(
                          "flex-1 rounded-lg border py-3 text-sm font-medium transition",
                          field.value === opt.value
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.recommande && (
                <p className="mt-1 text-xs text-red-500">{errors.recommande.message}</p>
              )}
            </div>

            {/* Avis texte */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Votre avis</label>
                <span className={cn("text-xs", avisTexte.length >= 50 ? "text-green-600" : "text-gray-400")}>
                  {avisTexte.length}/50 min
                </span>
              </div>
              <textarea
                rows={4}
                placeholder="Partagez votre expérience…"
                {...register("avis_texte")}
                className={cn(fieldClass, "resize-none", errors.avis_texte && "border-red-400 bg-red-50")}
              />
              {errors.avis_texte && (
                <p className="mt-1 text-xs text-red-500">{errors.avis_texte.message}</p>
              )}
            </div>

            {/* Point fort */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Point fort principal</label>
              <input
                type="text"
                placeholder="ex. : pédagogie claire…"
                {...register("point_fort")}
                className={cn(fieldClass, errors.point_fort && "border-red-400 bg-red-50")}
              />
              {errors.point_fort && (
                <p className="mt-1 text-xs text-red-500">{errors.point_fort.message}</p>
              )}
            </div>

            {/* Point à améliorer */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Point à améliorer</label>
              <input
                type="text"
                placeholder="ex. : manque d'exemples…"
                {...register("point_amelioration")}
                className={cn(fieldClass, errors.point_amelioration && "border-red-400 bg-red-50")}
              />
              {errors.point_amelioration && (
                <p className="mt-1 text-xs text-red-500">{errors.point_amelioration.message}</p>
              )}
            </div>
          </div>

          {errors.root && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{errors.root.message}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              <ChevronLeft size={15} />
              Retour
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Envoi…" : "Envoyer mon avis"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
