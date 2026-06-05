import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Monitor, Video, Calendar, Users,
  Star, CheckCircle2, Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensurePrestataire } from "@/lib/supabase/ensure-prestataire";
import { appConfig } from "@/config/app";
import { cn } from "@/lib/utils";
import { ParticipantsManager } from "./ParticipantsManager";
import { ExportPdfButton } from "./ExportPdfButton";
import { clotureSeance } from "./actions";

type Params = { id: string; seanceId: string };

type ParticipantRow = {
  id: string;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  telephone: string | null;
  identifiant_anon: string | null;
  mode_ajout: string;
  statut_avis: string;
  dernier_envoi_at: string | null;
  collecte_tokens: { id: string; token: string } | null;
};

type TemplateRow = {
  id: string;
  nom: string;
  objet: string;
  corps: string;
};

const MODE_CONFIG = {
  presentiel: { label: "Présentiel", icon: <MapPin size={13} />, cls: "bg-blue-50 text-blue-700" },
  distance: { label: "À distance", icon: <Monitor size={13} />, cls: "bg-violet-50 text-violet-700" },
  video: { label: "Vidéo", icon: <Video size={13} />, cls: "bg-emerald-50 text-emerald-700" },
} as const;

const STATUT_CONFIG = {
  en_cours: { label: "En cours", cls: "bg-green-50 text-green-700" },
  cloturee: { label: "Clôturée", cls: "bg-slate-100 text-slate-500" },
  archivee: { label: "Archivée", cls: "bg-slate-100 text-slate-400" },
} as const;

function formatDate(d: string | null) {
  if (!d) return null;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(d));
}

export default async function SeancePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id, seanceId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const prestataire = await ensurePrestataire(supabase, user!.id);
  if (!prestataire) notFound();

  // Séance + offre
  const { data: seance } = await supabase
    .from("seances")
    .select(`
      id, titre, mode, date_session, lieu, statut, nb_participants_attendus, created_at,
      offres(id, titre, slug)
    `)
    .eq("id", seanceId)
    .maybeSingle();

  if (!seance) notFound();

  const offre = Array.isArray(seance.offres) ? seance.offres[0] : seance.offres;
  if (!offre || offre.id !== id) notFound();

  // Participants + tokens
  const { data: participantsRaw } = await supabase
    .from("participants")
    .select("id, prenom, nom, email, telephone, identifiant_anon, mode_ajout, statut_avis, dernier_envoi_at, collecte_tokens(id, token)")
    .eq("seance_id", seanceId)
    .order("created_at", { ascending: true });

  const participants = (participantsRaw ?? []) as unknown as ParticipantRow[];

  // Templates du prestataire pour le modal d'envoi
  const { data: templates } = await supabase
    .from("message_templates")
    .select("id, nom, objet, corps")
    .eq("prestataire_id", prestataire.id)
    .order("created_at", { ascending: false });

  const templateList = (templates ?? []) as TemplateRow[];

  // Stats
  const nbParticipants = participants.length;
  const nbSoumis = participants.filter((p) => p.statut_avis === "soumis").length;
  const pctCompletion = nbParticipants > 0 ? Math.round((nbSoumis / nbParticipants) * 100) : 0;

  // Note moyenne via avis
  const tokenIds = participants
    .map((p) => p.collecte_tokens?.id)
    .filter(Boolean) as string[];

  let noteMoyenne: number | null = null;
  if (tokenIds.length > 0) {
    const { data: avisNotes } = await supabase
      .from("avis")
      .select("note")
      .in("token_id", tokenIds);

    const notes = (avisNotes ?? []).map((a) => a.note).filter((n) => n !== null) as number[];
    if (notes.length > 0) {
      noteMoyenne = notes.reduce((s, n) => s + n, 0) / notes.length;
    }
  }

  const modeConf = MODE_CONFIG[seance.mode as keyof typeof MODE_CONFIG] ?? MODE_CONFIG.presentiel;
  const statutConf = STATUT_CONFIG[seance.statut as keyof typeof STATUT_CONFIG] ?? STATUT_CONFIG.en_cours;
  const isClosed = seance.statut !== "en_cours";

  async function handleCloture() {
    "use server";
    await clotureSeance(seanceId, id);
  }

  return (
    <div className="max-w-4xl">
      {/* Retour */}
      <Link
        href={`/offres/${id}`}
        className="mb-6 flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={15} />
        {offre.titre}
      </Link>

      {/* Header */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{seance.titre}</h1>
              <span className={cn("flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", modeConf.cls)}>
                {modeConf.icon}
                {modeConf.label}
              </span>
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", statutConf.cls)}>
                {statutConf.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              {seance.date_session && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  {formatDate(seance.date_session)}
                </span>
              )}
              {seance.lieu && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} />
                  {seance.lieu}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <ExportPdfButton
              seanceId={seanceId}
              participantsWithToken={participants.filter((p) => p.collecte_tokens?.token).length}
              participantsWithoutToken={participants.filter((p) => !p.collecte_tokens?.token).length}
            />
            {!isClosed && (
              <form action={handleCloture}>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100"
                >
                  <Lock size={14} />
                  Clôturer
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-4">
          <StatCard
            label="Participants"
            value={nbParticipants.toString()}
            sub={seance.nb_participants_attendus ? `/ ${seance.nb_participants_attendus} attendus` : undefined}
            icon={<Users size={15} className="text-blue-600" />}
          />
          <StatCard
            label="Avis reçus"
            value={nbSoumis.toString()}
            icon={<CheckCircle2 size={15} className="text-green-600" />}
          />
          <StatCard
            label="Complétion"
            value={`${pctCompletion}%`}
            icon={
              <div className="h-3 w-16 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${pctCompletion}%` }}
                />
              </div>
            }
          />
          <StatCard
            label="Note moyenne"
            value={noteMoyenne !== null ? noteMoyenne.toFixed(1) + " / 5" : "—"}
            icon={<Star size={15} className="text-yellow-400" />}
          />
        </div>
      </div>

      {/* Participants */}
      <div>
        <h2 className="mb-4 font-semibold text-slate-900">Participants</h2>
        <ParticipantsManager
          participants={participants}
          seanceId={seanceId}
          offreId={id}
          appUrl={appConfig.url}
          offreTitre={offre.titre}
          seanceTitre={seance.titre}
          nomPrestataire={prestataire.nom}
          templates={templateList}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="mb-1">{icon}</div>
      <p className="text-xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
