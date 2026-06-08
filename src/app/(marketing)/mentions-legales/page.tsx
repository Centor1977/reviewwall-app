import type { Metadata } from "next";
import { BackToTop } from "@/components/BackToTop";

export const metadata: Metadata = {
  title: "Mentions légales — ReviewWall",
};

const SECTIONS = [
  { id: "editeur", label: "Éditeur" },
  { id: "hebergement", label: "Hébergement" },
  { id: "propriete", label: "Propriété intellectuelle" },
  { id: "responsabilite", label: "Responsabilité" },
  { id: "donnees", label: "Données personnelles" },
  { id: "contact", label: "Contact" },
];

export default function MentionsLegalesPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-2 text-3xl font-bold text-blue-600">
          Mentions légales
        </h1>
        <p className="mb-8 text-sm text-slate-400">
          Conformément aux articles 6-III et 19 de la Loi n° 2004-575 du 21 juin
          2004 pour la Confiance dans l&apos;Économie Numérique (LCEN).
        </p>

        {/* Navigation interne */}
        <nav className="mb-10 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Sommaire
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="prose-legal space-y-10 text-justify leading-relaxed text-slate-700">

          {/* Éditeur */}
          <section id="editeur">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Éditeur du site</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="w-44 shrink-0 font-medium text-slate-600">Raison sociale</dt>
                <dd>RUB CONSEIL</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-44 shrink-0 font-medium text-slate-600">Forme juridique</dt>
                <dd>SAS</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-44 shrink-0 font-medium text-slate-600">SIRET</dt>
                <dd>792 792 053 0001</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-44 shrink-0 font-medium text-slate-600">Siège social</dt>
                <dd>Rue Ducourouble 59000 Lille</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-44 shrink-0 font-medium text-slate-600">Directeur de publication</dt>
                <dd>Souchot David</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-44 shrink-0 font-medium text-slate-600">Email de contact</dt>
                <dd>support%@%reviewwall%.%fr</dd>
              </div>
            </dl>
          </section>

          {/* Hébergement */}
          <section id="hebergement">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Hébergement</h2>
            <p className="mb-4 text-sm">
              Le site est hébergé par les prestataires suivants :
            </p>
            <div className="space-y-4 text-sm">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="font-semibold text-slate-800">Frontend & déploiement</p>
                <p className="mt-1 text-slate-600">
                  Vercel Inc.<br />
                  340 Pine Street, Suite 701<br />
                  San Francisco, CA 94104, États-Unis<br />
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="font-semibold text-slate-800">Base de données & authentification</p>
                <p className="mt-1 text-slate-600">
                  Supabase Inc.<br />
                  970 Toa Payoh North, Singapour<br />
                  Données hébergées à Frankfurt, Allemagne (Union Européenne)<br />
                </p>
              </div>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section id="propriete">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Propriété intellectuelle
            </h2>
            <p className="text-sm">
              L&apos;ensemble des éléments constituant le site ReviewWall, code source,
              design, marques, logos, algorithmes, textes et contenus éditoriaux,
              est la propriété exclusive de RUB CONSEIL et est
              protégé par les lois françaises et internationales relatives à la
              propriété intellectuelle.
            </p>
            <p className="mt-3 text-sm">
              Toute reproduction, représentation, modification, publication,
              transmission ou dénaturation de ces éléments, totale ou partielle,
              est interdite sans l&apos;autorisation écrite préalable de l&apos;éditeur.
              Toute exploitation non autorisée du site ou de ses contenus constituerait
              une contrefaçon susceptible d&apos;engager la responsabilité civile et
              pénale de son auteur.
            </p>
            <p className="mt-3 text-sm">
              Les avis et contenus publiés par les utilisateurs restent la propriété
              de leurs auteurs, qui accordent à l&apos;éditeur une licence d&apos;utilisation
              telle que définie dans les Conditions Générales d&apos;Utilisation.
            </p>
            {/* Crédits photos si applicable */}
            {/* <p className="mt-3 text-sm">Crédits photos : [À COMPLÉTER]</p> */}
          </section>

          {/* Responsabilité */}
          <section id="responsabilite">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Responsabilité</h2>
            <p className="text-sm">
              L&apos;éditeur s&apos;efforce de fournir des informations aussi précises que
              possible. Toutefois, il ne pourra être tenu responsable des omissions,
              inexactitudes et carences dans la mise à jour, qu&apos;elles soient de son
              fait ou du fait des tiers partenaires qui lui fournissent ces
              informations.
            </p>
            <p className="mt-3 text-sm">
              Les informations présentes sur le site ReviewWall sont données à titre
              indicatif et sont susceptibles d&apos;évoluer. Par ailleurs, les
              renseignements figurant sur ce site ne sont pas exhaustifs. Ils sont
              donnés sous réserve de modifications ayant été apportées depuis leur
              mise en ligne.
            </p>
          </section>

          {/* Données personnelles */}
          <section id="donnees">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Données personnelles
            </h2>
            <p className="text-sm">
              Le traitement des données personnelles collectées via la Plateforme est
              décrit dans notre{" "}
              <a href="/confidentialite" className="text-blue-600 hover:underline">
                Politique de Confidentialité
              </a>
              . Conformément au Règlement Général sur la Protection des Données (RGPD),
              vous disposez de droits sur vos données personnelles, exercables à
              l&apos;adresse : support%@%reviewwall%.%.fr.
            </p>
          </section>

          {/* Contact */}
          <section id="contact">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Contact</h2>
            <p className="text-sm">
              Pour toute question relative au présent site ou pour signaler un
              contenu illicite :
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                Email : support%@%reviewwall%.%.fr
              </li>
              <li>
                Courrier : RUB CONSEIL - 19 rue ducourouble 5900 Lille
              </li>
            </ul>
          </section>

        </div>
      </div>

      <BackToTop />
    </div>
  );
}
