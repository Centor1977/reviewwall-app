"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react";
import { updateProfileAction, sendPasswordResetAction } from "./actions";
import type { Prestataire } from "@/lib/supabase/ensure-prestataire";

// ── Shared UI ─────────────────────────────────────────────────────────────

const inputCls = (hasError: boolean) =>
  cn(
    "w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none transition-colors duration-150 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500",
    hasError ? "border-red-400 bg-red-50" : "border-slate-200"
  );

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 border-b border-slate-100 pb-4">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {description && (
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
}

// ── Profile section ───────────────────────────────────────────────────────

const profileSchema = z.object({
  nom: z.string().min(2, "Nom requis"),
  organisme: z.string().optional(),
  site_web: z.string().url("URL invalide").or(z.literal("")).optional(),
  bio: z.string().max(280, "280 caractères maximum").optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

function ProfileSection({ prestataire }: { prestataire: Prestataire }) {
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
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
    setSaved(false);
    setServerError(null);
    const result = await updateProfileAction({
      nom: data.nom,
      organisme: data.organisme ?? "",
      site_web: data.site_web ?? "",
      bio: data.bio ?? "",
    });
    if (result.error) {
      setServerError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <SectionHeader
        title="Mon profil"
        description="Informations visibles sur vos pages d'avis publiques."
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom complet" error={errors.nom?.message}>
            <input
              type="text"
              {...register("nom")}
              className={inputCls(!!errors.nom)}
            />
          </Field>
          <Field label="Organisme / Entreprise">
            <input
              type="text"
              placeholder="Optionnel"
              {...register("organisme")}
              className={inputCls(false)}
            />
          </Field>
        </div>

        <Field label="Site web" error={errors.site_web?.message}>
          <input
            type="url"
            placeholder="https://mon-site.com"
            {...register("site_web")}
            className={inputCls(!!errors.site_web)}
          />
        </Field>

        <Field
          label="Bio courte"
          hint={`${0} / 280 caractères`}
          error={errors.bio?.message}
        >
          <textarea
            rows={3}
            placeholder="En quelques mots, présentez votre activité…"
            {...register("bio")}
            className={cn(inputCls(false), "resize-none")}
          />
        </Field>

        <Field
          label="Slug (URL publique)"
          hint={`Votre URL : /f/[slug]`}
        >
          <input
            type="text"
            value={prestataire.slug}
            disabled
            className={inputCls(false)}
          />
        </Field>

        {serverError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Enregistrement…
              </>
            ) : (
              "Enregistrer"
            )}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle2 size={15} />
              Enregistré
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

// ── Account section ───────────────────────────────────────────────────────

function AccountSection({ email }: { email: string }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePasswordReset() {
    setLoading(true);
    setError(null);
    const result = await sendPasswordResetAction();
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <SectionHeader
        title="Mon compte"
        description="Informations de connexion."
      />

      <div className="space-y-4">
        <Field label="Adresse email" hint="L'email ne peut pas être modifié.">
          <input
            type="email"
            value={email}
            disabled
            className={inputCls(false)}
          />
        </Field>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">
            Mot de passe
          </p>
          {sent ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 size={15} />
              Email de réinitialisation envoyé à {email}
            </div>
          ) : (
            <button
              onClick={handlePasswordReset}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition-colors duration-150 hover:bg-slate-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Mail size={14} />
              )}
              Changer mon mot de passe
            </button>
          )}
          {error && (
            <p className="mt-1.5 text-xs text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────

type Props = {
  prestataire: Prestataire;
  email: string;
};

export function ProfileForm({ prestataire, email }: Props) {
  return (
    <div className="space-y-6">
      <ProfileSection prestataire={prestataire} />
      <AccountSection email={email} />
    </div>
  );
}
