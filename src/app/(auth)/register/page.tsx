"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { appConfig } from "@/config/app";
import { cn, slugify } from "@/lib/utils";
import { AlertCircle, Loader2 } from "lucide-react";
import { sendWelcomeEmail } from "./actions";

const schema = z.object({
  nom: z.string().min(2, "Nom requis (2 caractères minimum)"),
  organisme: z.string().optional(),
  email: z.string().email("Adresse email invalide"),
  password: z
    .string()
    .min(8, "8 caractères minimum")
    .regex(/[A-Z]/, "Au moins une majuscule")
    .regex(/[0-9]/, "Au moins un chiffre"),
});

type FormData = z.infer<typeof schema>;

const inputCls = (hasError: boolean) =>
  cn(
    "w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none transition-colors duration-150 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    hasError ? "border-red-400 bg-red-50" : "border-slate-200"
  );

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: searchParams.get("email") ?? "" },
  });

  async function onSubmit(data: FormData) {
    const supabase = createClient();

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}${appConfig.auth.callbackUrl}`,
        data: { nom: data.nom, organisme: data.organisme ?? null },
      },
    });

    if (signUpError) {
      setError("root", { message: signUpError.message });
      return;
    }

    if (!authData.user) {
      setError("root", { message: "Erreur inattendue, veuillez réessayer." });
      return;
    }

    if (!authData.user.identities || authData.user.identities.length === 0) {
      setError("email", {
        message: "Un compte existe déjà avec cette adresse. Connectez-vous ou réinitialisez votre mot de passe.",
      });
      return;
    }

    if (authData.session) {
      const { error: insertError } = await supabase
        .from("prestataires")
        .insert({
          user_id: authData.user.id,
          nom: data.nom,
          slug: slugify(data.nom),
          organisme: data.organisme ?? null,
          email: data.email,
        });

      if (insertError) {
        setError("root", {
          message:
            "Compte créé, mais erreur lors de la création du profil. Contactez le support.",
        });
        return;
      }

      sendWelcomeEmail(data.email, data.nom).catch(console.error);
      router.push(appConfig.auth.afterLoginUrl);
      router.refresh();
    } else {
      router.push(`/login?message=check-email&email=${encodeURIComponent(data.email)}`);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Créer un compte</h1>
      <p className="mt-1 text-sm text-slate-500">
        Rejoignez {appConfig.name} gratuitement
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="nom"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Nom complet <span className="text-red-500">*</span>
            </label>
            <input
              id="nom"
              type="text"
              autoComplete="name"
              placeholder="Marie Dupont"
              {...register("nom")}
              className={inputCls(!!errors.nom)}
            />
            {errors.nom && (
              <p className="mt-1 text-xs text-red-600">{errors.nom.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="organisme"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Organisme
            </label>
            <input
              id="organisme"
              type="text"
              autoComplete="organization"
              placeholder="Optionnel"
              {...register("organisme")}
              className={inputCls(false)}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="vous@example.com"
            {...register("email")}
            className={inputCls(!!errors.email)}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Mot de passe <span className="text-red-500">*</span>
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
            className={inputCls(!!errors.password)}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-400">
            8 caractères min., une majuscule, un chiffre
          </p>
        </div>

        {errors.root && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm text-red-700">{errors.root.message}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Création en cours…
            </>
          ) : (
            "Créer mon compte"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Déjà un compte ?{" "}
        <Link
          href="/login"
          className="font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
