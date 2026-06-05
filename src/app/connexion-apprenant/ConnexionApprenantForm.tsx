"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { appConfig } from "@/config/app";
import { Loader2, Mail, CheckCircle2, Lock, EyeOff, ShieldCheck } from "lucide-react";

export default function ConnexionApprenantForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: `${appConfig.url}/auth/callback?next=/mon-profil` },
    });
    setLoading(false);
    if (otpError) { setError(otpError.message); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm text-center">
          <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500" />
          <h1 className="mb-2 text-xl font-semibold text-slate-900">Lien envoyé !</h1>
          <p className="text-sm text-slate-500">
            Vérifiez votre boîte mail à <strong>{email}</strong> et cliquez sur le lien pour accéder à votre espace.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-base font-bold text-slate-900">{appConfig.name}</span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Accédez à votre espace personnel</h1>
          <p className="mt-1 text-sm text-slate-500">
            Retrouvez tous vos avis, gérez votre profil.
          </p>
        </div>

        {/* Stepper */}
        <div className="mt-6 mb-10 flex items-start justify-between">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white ring-4 ring-blue-100">1</div>
            <span className="text-xs font-semibold text-slate-800">Email</span>
          </div>
          <div className="mt-5 h-px flex-1 mx-3 bg-slate-200" />
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-400">2</div>
            <span className="text-center text-xs text-slate-400">Lien magique</span>
          </div>
          <div className="mt-5 h-px flex-1 mx-3 bg-slate-200" />
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-400">3</div>
            <span className="text-center text-xs text-slate-400">C'est parti !</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@example.com"
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
            Recevoir mon lien
          </button>

          <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3">
            <Lock size={13} className="mt-0.5 shrink-0 text-slate-400" />
            <p className="text-xs leading-relaxed text-slate-500">
              Vous recevrez un lien sécurisé par email.<br />
              Pas de mot de passe à mémoriser.
            </p>
          </div>
        </form>

        {/* Trust badges */}
        <div className="mt-8 flex items-start justify-center gap-6 border-t border-slate-100 pt-8">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50">
              <Lock size={18} className="text-blue-600" />
            </div>
            <span className="text-center text-xs font-medium text-slate-600">Email privé</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50">
              <ShieldCheck size={18} className="text-green-600" />
            </div>
            <span className="text-center text-xs font-medium text-slate-600">Avis vérifié</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
              <EyeOff size={18} className="text-slate-500" />
            </div>
            <span className="text-center text-xs font-medium text-slate-600">Profil<br />anonymisable</span>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Vous proposez des services ?{" "}
          <Link href="/" className="font-medium text-slate-500 hover:underline">
            En savoir plus →
          </Link>
        </p>
      </div>
    </div>
  );
}
