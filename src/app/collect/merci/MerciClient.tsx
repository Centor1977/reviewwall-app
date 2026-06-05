"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

type Props = { email: string | null; appName: string; appUrl: string };

export function MerciClient({ email: initialEmail, appName, appUrl }: Props) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [editEmail, setEditEmail] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function handleCreate() {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Entrez un email valide.");
      return;
    }
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: `${appUrl}/auth/callback?next=/mon-profil` },
    });
    setLoading(false);
    if (otpError) { setError(otpError.message); return; }
    setSent(true);
    setCountdown(60);
  }

  async function handleResend() {
    if (countdown > 0) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${appUrl}/auth/callback?next=/mon-profil` },
    });
    setLoading(false);
    setCountdown(60);
  }

  if (sent && !editEmail) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle2 size={32} className="mx-auto mb-3 text-green-600" />
        <p className="font-semibold text-green-900">Lien envoyé à {email}</p>
        <p className="mt-1 text-sm text-green-700">Vérifiez votre boîte mail et cliquez sur le lien.</p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={handleResend}
            disabled={countdown > 0 || loading}
            className="text-sm text-green-700 underline disabled:no-underline disabled:text-green-400"
          >
            {countdown > 0 ? `Renvoyer dans ${countdown}s` : "Renvoyer le lien"}
          </button>
          <button
            onClick={() => { setSent(false); setEditEmail(true); }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Ce n&apos;est pas mon email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <span className="text-2xl">💡</span>
        <div>
          <p className="font-semibold text-gray-900">Accédez à votre espace personnel</p>
          <p className="mt-1 text-sm text-gray-500">
            Retrouvez vos avis, enrichissez votre profil et recevez des recommandations
            de formations adaptées.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
          Créer mon espace — gratuit
        </button>

        <div className="flex items-center justify-between pt-1 text-xs text-gray-400">
          <Link href="/connexion-apprenant" className="hover:text-gray-600 hover:underline">
            Déjà un compte ? Se connecter
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-gray-600"
          >
            Continuer sans compte <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
