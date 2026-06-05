import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ensurePrestataire } from "@/lib/supabase/ensure-prestataire";
import { VERTICALS, DEFAULT_VERTICAL, type Vertical } from "@/config/verticals";
import { QuestionsSection } from "@/app/(dashboard)/offres/[id]/QuestionsSection";
import type { QuestionItem } from "@/app/(dashboard)/offres/[id]/questionsActions";

type Params = { id: string };

export default async function QuestionsOffrePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const prestataire = await ensurePrestataire(supabase, user!.id);
  if (!prestataire) notFound();

  const { data: offre } = await supabase
    .from("offres")
    .select("id, titre")
    .eq("id", id)
    .eq("prestataire_id", prestataire.id)
    .maybeSingle();

  if (!offre) notFound();

  const { data: offreQuestionsRaw } = await supabase
    .from("offre_questions")
    .select(
      "id, ordre, visibilite, question:questions_bibliotheque(id, texte, type_reponse, options, visibilite_defaut, dimension_profil, utilisable_matching, validee, validation_ia)"
    )
    .eq("offre_id", id)
    .order("ordre", { ascending: true });

  const allQuestions = (offreQuestionsRaw ?? []) as unknown as QuestionItem[];
  const questionsPubliques = allQuestions.filter((q) => q.visibilite === "publique");
  const questionsPrivees = allQuestions.filter((q) => q.visibilite === "privee");

  const verticalKey = (prestataire.vertical as Vertical) ?? DEFAULT_VERTICAL;
  const vertical = VERTICALS[verticalKey];

  return (
    <div className="max-w-2xl">
      <nav className="mb-4 text-sm text-slate-400">
        <Link href="/offres" className="transition hover:text-slate-600">
          Mes {vertical.offre.plural}
        </Link>
        <span className="mx-1">›</span>
        <Link href={`/offres/${id}`} className="transition hover:text-slate-600">
          {offre.titre}
        </Link>
        <span className="mx-1">›</span>
        <span className="text-slate-600">Questions</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Questions du formulaire</h1>
        <p className="mt-0.5 text-sm text-slate-500">{offre.titre}</p>
      </div>

      <QuestionsSection
        offreId={id}
        verticalKey={verticalKey}
        initialPubliques={questionsPubliques}
        initialPrivees={questionsPrivees}
      />
    </div>
  );
}
