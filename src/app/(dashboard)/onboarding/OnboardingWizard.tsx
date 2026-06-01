"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { appConfig } from "@/config/app";
import {
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  updateProfile,
  createOffreOnboarding,
  completeOnboarding,
} from "./actions";
import type { Prestataire } from "@/lib/supabase/ensure-prestataire";
import type { VerticalConfig } from "@/config/verticals";

// ── Shared UI ─────────────────────────────────────────────────────────────

const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

function inputCls(hasError: boolean) {
  return cn(
    "w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none transition-colors duration-150 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    hasError ? "border-red-400 bg-red-50" : "border-slate-200"
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function ErrBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
      <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}

// ── Steps ─────────────────────────────────────────────────────────────────

const STEPS = ["Votre profil", "Votre première offre", "Collectez des avis"];

// ── Step 0 — Profile ──────────────────────────────────────────────────────

const profileSchema = z.object({
  nom: z.string().min(2, "Nom requis"),
  organisme: z.string().optional(),
  site_web: z.string().url("URL invalide").or(z.literal("")).optional(),
  bio: z.string().max(280, "280 caractères maximum").optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

function ProfileStep({
  prestataire,
  onDone,
}: {
  prestataire: Prestataire;
  onDone: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nom: prestataire.nom,
      organisme: prestataire.organisme ?? "",
      site_web: prestataire.site_web ?? "",
      bio: prestataire.bio ?? "",
    },
  });

  async function onSubmit(data: ProfileData) {
    setServerError(null);
    const result = await updateProfile({
      prestataireId: prestataire.id,
      nom: data.nom,
      organisme: data.organisme ?? "",
      site_web: data.site_web ?? "",
      bio: data.bio ?? "",
    });
    if (result.error) {
      setServerError(result.error);
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Field label="Nom complet" required error={errors.nom?.message}>
        <input
          type="text"
          placeholder="Marie Dupont"
          {...register("nom")}
          className={inputCls(!!errors.nom)}
        />
      </Field>
      <Field label="Organisme / Entreprise" error={errors.organisme?.message}>
        <input
          type="text"
          placeholder="Optionnel"
          {...register("organisme")}
          className={inputCls(false)}
        />
      </Field>
      <Field label="Site web" error={errors.site_web?.message}>
        <input
          type="url"
          placeholder="https://mon-site.com"
          {...register("site_web")}
          className={inputCls(!!errors.site_web)}
        />
      </Field>
      <Field label="Bio courte" error={errors.bio?.message}>
        <textarea
          rows={3}
          placeholder="En quelques mots, présentez votre activité…"
          {...register("bio")}
          className={cn(inputCls(false), "resize-none")}
        />
      </Field>

      {serverError && <ErrBanner message={serverError} />}

      <button type="submit" disabled={isSubmitting} className={cn(primaryBtn, "w-full")}>
        {isSubmitting ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Enregistrement…
          </>
        ) : (
          <>
            Continuer
            <ChevronRight size={15} />
          </>
        )}
      </button>
    </form>
  );
}

// ── Step 1 — Offre ────────────────────────────────────────────────────────

const offreSchema = z.object({
  titre: z.string().min(3, "Titre requis (3 caractères minimum)"),
});

type OffreData = z.infer<typeof offreSchema>;

function OffreStep({
  prestataire,
  vertical,
  done,
  onDone,
  onNext,
}: {
  prestataire: Prestataire;
  vertical: VerticalConfig;
  done: boolean;
  onDone: () => void;
  onNext: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OffreData>({ resolver: zodResolver(offreSchema) });

  const offreLabel = vertical.offre.singular;

  async function onSubmit(data: OffreData) {
    setServerError(null);
    const result = await createOffreOnboarding({
      prestataireId: prestataire.id,
      titre: data.titre,
    });
    if (result.error) {
      setServerError(result.error);
      return;
    }
    onDone();
  }

  if (done) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle2 size={18} className="shrink-0 text-green-600" />
          <p className="text-sm font-medium text-green-700">
            {offreLabel.charAt(0).toUpperCase() + offreLabel.slice(1)} créée
            avec succès !
          </p>
        </div>
        <button onClick={onNext} className={cn(primaryBtn, "w-full")}>
          Continuer
          <ChevronRight size={15} />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Field
        label={`Titre de la ${offreLabel}`}
        required
        error={errors.titre?.message}
      >
        <input
          type="text"
          placeholder={`ex. : Ma première ${offreLabel}`}
          {...register("titre")}
          className={inputCls(!!errors.titre)}
        />
      </Field>

      {serverError && <ErrBanner message={serverError} />}

      <div className="flex items-center gap-4">
        <button type="submit" disabled={isSubmitting} className={cn(primaryBtn, "flex-1")}>
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Création…
            </>
          ) : (
            <>
              Créer la {offreLabel}
              <ChevronRight size={15} />
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="text-sm text-slate-400 transition-colors hover:text-slate-600"
        >
          Passer
        </button>
      </div>
    </form>
  );
}

// ── Step 2 — Collect ──────────────────────────────────────────────────────

function CollectStep({
  prestataire,
  vertical,
}: {
  prestataire: Prestataire;
  vertical: VerticalConfig;
}) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function finish() {
    setLoading(true);
    setServerError(null);
    const result = await completeOnboarding(prestataire.id);
    if (result?.error) {
      setServerError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {[
          {
            n: "1",
            title: "Générez un lien unique",
            desc: `Depuis la page d'une ${vertical.offre.singular}, cliquez sur "Générer un lien" pour obtenir un lien à usage unique.`,
          },
          {
            n: "2",
            title: "Envoyez-le à votre client",
            desc: `Partagez le lien par email à chaque ${vertical.client.singular} après votre prestation.`,
          },
          {
            n: "3",
            title: "Publiez et affichez",
            desc: "Les avis apparaissent sur votre page publique, intégrable sur votre site via un iframe.",
          },
        ].map((item) => (
          <div key={item.n} className="flex gap-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
              {item.n}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{item.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {serverError && <ErrBanner message={serverError} />}

      <button
        onClick={finish}
        disabled={loading}
        className={cn(primaryBtn, "w-full")}
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Finalisation…
          </>
        ) : (
          `Accéder à ${appConfig.name}`
        )}
      </button>
    </div>
  );
}

// ── Main Wizard ───────────────────────────────────────────────────────────

type Props = {
  prestataire: Prestataire;
  vertical: VerticalConfig;
};

export default function OnboardingWizard({ prestataire, vertical }: Props) {
  const [step, setStep] = useState(0);
  const [offreDone, setOffreDone] = useState(false);

  return (
    <div className="mx-auto max-w-lg">
      {/* Stepper */}
      <div className="mb-8 flex items-start">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-start">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-150",
                  i < step
                    ? "bg-blue-600 text-white"
                    : i === step
                    ? "border-2 border-blue-600 bg-white text-blue-600"
                    : "bg-slate-100 text-slate-400"
                )}
              >
                {i < step ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden w-20 text-center text-xs font-medium sm:block",
                  i === step ? "text-slate-900" : "text-slate-400"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 mt-4 h-px w-12 shrink-0",
                  i < step ? "bg-blue-600" : "bg-slate-200"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {STEPS[step]}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {step === 0 && "Ces informations seront visibles sur vos pages d'avis."}
            {step === 1 &&
              `Une ${vertical.offre.singular} vous permet de générer des liens de collecte personnalisés.`}
            {step === 2 && "Voici comment fonctionne la collecte d'avis."}
          </p>
        </div>

        {step === 0 && (
          <ProfileStep prestataire={prestataire} onDone={() => setStep(1)} />
        )}
        {step === 1 && (
          <OffreStep
            prestataire={prestataire}
            vertical={vertical}
            done={offreDone}
            onDone={() => setOffreDone(true)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <CollectStep prestataire={prestataire} vertical={vertical} />
        )}
      </div>
    </div>
  );
}
