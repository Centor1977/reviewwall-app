"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { appConfig } from "@/config/app";
import { VERTICALS } from "@/config/verticals";
import { cn } from "@/lib/utils";
import { MailCheck, AlertCircle, Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type FormData = z.infer<typeof schema>;

function translateAuthError(error: AuthError): string {
  switch (error.code) {
    case "email_not_confirmed":
      return "Votre email n'est pas encore confirmé. Vérifiez votre boîte mail.";
    case "invalid_credentials":
      return "Email ou mot de passe incorrect.";
    case "user_not_found":
      return "Aucun compte trouvé avec cet email.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Trop de tentatives. Attendez quelques minutes avant de réessayer.";
    default:
      return error.message;
  }
}

type Props = { message?: string; error?: string };

const inputCls = (hasError: boolean) =>
  cn(
    "w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none transition-colors duration-150 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    hasError ? "border-red-400 bg-red-50" : "border-slate-200"
  );

export default function LoginForm({ message, error: errorParam }: Props) {
  const router = useRouter();
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError("root", { message: translateAuthError(error) });
      return;
    }

    router.push(appConfig.auth.afterLoginUrl);
    router.refresh();
  }

  async function onResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resetEmail) return;
    setResetLoading(true);
    setResetError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setResetLoading(false);
    if (error) {
      setResetError(error.message);
    } else {
      setResetSent(true);
    }
  }

  if (forgotMode) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Mot de passe oublié</h1>
        <p className="mt-1 text-sm text-slate-500">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>

        {resetSent ? (
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <MailCheck size={17} className="mt-0.5 shrink-0 text-blue-500" />
            <p className="text-sm text-blue-700">
              Un lien de réinitialisation a été envoyé à <strong>{resetEmail}</strong>. Vérifiez votre boîte mail.
            </p>
          </div>
        ) : (
          <form onSubmit={onResetSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="reset-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                placeholder="vous@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className={inputCls(false)}
              />
            </div>

            {resetError && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
                <p className="text-sm text-red-700">{resetError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={resetLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resetLoading ? <><Loader2 size={15} className="animate-spin" />Envoi…</> : "Envoyer le lien"}
            </button>
          </form>
        )}

        <button
          onClick={() => { setForgotMode(false); setResetSent(false); setResetError(null); }}
          className="mt-6 text-sm text-slate-500 transition-colors hover:text-slate-800"
        >
          ← Retour à la connexion
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Connexion</h1>
      <p className="mt-1 text-sm text-slate-500">
        Accédez à votre espace {VERTICALS.formation.prestataire.singular}
      </p>

      {message === "check-email" && (
        <div className="mt-5 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <MailCheck size={17} className="mt-0.5 shrink-0 text-blue-500" />
          <p className="text-sm text-blue-700">
            Un email de confirmation a été envoyé. Cliquez sur le lien pour
            activer votre compte.
          </p>
        </div>
      )}

      {errorParam === "auth_callback_failed" && (
        <div className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={17} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">
            Le lien de confirmation est invalide ou a expiré. Essayez de vous
            inscrire à nouveau.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 space-y-5"
      >
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Email
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
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Mot de passe
            </label>
            <button
              type="button"
              onClick={() => setForgotMode(true)}
              className="text-xs text-blue-600 transition-colors hover:text-blue-700 hover:underline"
            >
              Mot de passe oublié ?
            </button>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className={inputCls(!!errors.password)}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
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
              Connexion…
            </>
          ) : (
            "Se connecter"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Pas encore de compte ?{" "}
        <Link
          href="/register"
          className="font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
