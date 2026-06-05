import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensurePrestataire } from "@/lib/supabase/ensure-prestataire";
import { appConfig } from "@/config/app";
import { VERTICALS, DEFAULT_VERTICAL, type Vertical } from "@/config/verticals";
import { BookOpen, Star, TrendingUp, Plus } from "lucide-react";
import { GuideDemarrage } from "@/components/dashboard/GuideDemarrage";
import { getGuideProgress } from "@/lib/dashboard/guide-progress";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const prestataire = await ensurePrestataire(supabase, user!.id);
  if (!prestataire) redirect(appConfig.auth.loginUrl);

  // Redirect to onboarding only if flag is falsy AND no offres yet.
  // Double condition = robust against missing column (null/undefined).
  if (!prestataire.onboarding_completed) {
    const { count } = await supabase
      .from("offres")
      .select("*", { count: "exact", head: true })
      .eq("prestataire_id", prestataire.id);
    if ((count ?? 0) === 0) redirect("/onboarding");
  }

  const vertical =
    VERTICALS[(prestataire.vertical as Vertical) ?? DEFAULT_VERTICAL];

  // ── Stats ──────────────────────────────────────────────────────────────
  const { data: offres } = await supabase
    .from("offres")
    .select("id, active")
    .eq("prestataire_id", prestataire.id);

  const offreIds = (offres ?? []).map((o) => o.id);
  const formationsActives = (offres ?? []).filter((o) => o.active).length;

  let totalAvis = 0;
  let noteMoyenne: number | null = null;

  if (offreIds.length > 0) {
    const { data: avisData } = await supabase
      .from("avis")
      .select("note")
      .in("offre_id", offreIds);

    totalAvis = avisData?.length ?? 0;
    if (avisData && avisData.length > 0) {
      noteMoyenne =
        avisData.reduce((s, a) => s + (a.note ?? 0), 0) / avisData.length;
    }
  }

  const premierOffreId = (offres ?? [])[0]?.id ?? null;
  const guideProgress = await getGuideProgress(prestataire.id);

  const today = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Bonjour, {prestataire.nom.split(" ")[0]}
        </h1>
        <p className="mt-0.5 text-sm capitalize text-slate-500">{today}</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<BookOpen size={20} className="text-blue-600" />}
          label={`${vertical.offre.label}s actives`}
          value={String(formationsActives)}
        />
        <StatCard
          icon={<Star size={20} className="text-blue-600" />}
          label="Avis reçus"
          value={String(totalAvis)}
        />
        <StatCard
          icon={<TrendingUp size={20} className="text-blue-600" />}
          label="Note moyenne"
          value={noteMoyenne !== null ? `${noteMoyenne.toFixed(1)} / 5` : "—"}
        />
      </div>

      {/* Guide de démarrage */}
      <div className="mb-8">
        <GuideDemarrage progress={guideProgress} premierOffreId={premierOffreId} />
      </div>

      {/* Empty state */}
      {offreIds.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            className="mb-5 text-slate-200"
          >
            <rect
              x="6"
              y="14"
              width="44"
              height="28"
              rx="4"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M16 24h24M16 32h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="44" cy="12" r="6" fill="#2563EB" opacity="0.12" />
            <path
              d="M44 9v6M41 12h6"
              stroke="#2563EB"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <h2 className="text-base font-semibold text-slate-900">
            Commencez à collecter des avis
          </h2>
          <p className="mt-1.5 max-w-xs text-sm text-slate-500">
            Créez votre première {vertical.offre.singular} pour générer vos
            premiers liens de collecte.
          </p>
          <Link
            href="/offres/nouvelle"
            className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={16} />
            Créer ma première {vertical.offre.singular}
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-sm text-slate-500">{label}</p>
    </div>
  );
}
