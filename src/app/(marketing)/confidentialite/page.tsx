import type { Metadata } from "next";
import { BackToTop } from "@/components/BackToTop";

export const metadata: Metadata = {
  title: "Politique de Confidentialité — ReviewWall",
};

const ARTICLES = [
  { id: "introduction", label: "Introduction" },
  { id: "article-1", label: "1. Données collectées" },
  { id: "article-2", label: "2. Finalités et bases légales" },
  { id: "article-3", label: "3. Profil et matching" },
  { id: "article-4", label: "4. Partage des données" },
  { id: "article-5", label: "5. Durée de conservation" },
  { id: "article-6", label: "6. Vos droits" },
  { id: "article-7", label: "7. Cookies et traceurs" },
  { id: "article-8", label: "8. Sécurité" },
  { id: "article-9", label: "9. Transferts hors UE" },
  { id: "article-10", label: "10. Modifications" },
  { id: "article-11", label: "11. Contact et réclamations" },
];

export default function ConfidentialitePage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-1 text-3xl font-bold text-blue-600">
          Politique de Confidentialité
        </h1>
        <p className="mb-8 text-sm text-slate-400">
          ReviewWall — Version 1.0 — [DATE À COMPLÉTER]
        </p>

        {/* Navigation interne */}
        <nav className="mb-10 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Sommaire
          </p>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {ARTICLES.map((a) => (
              <li key={a.id}>
                <a
                  href={`#${a.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {a.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-12 text-justify leading-relaxed text-slate-700">

          {/* Introduction */}
          <section id="introduction">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Introduction</h2>
            <p className="text-sm">
              ReviewWall accorde une importance fondamentale à la protection de vos
              données personnelles. La présente Politique de Confidentialité décrit quelles
              données nous collectons, pourquoi nous les collectons, comment nous les
              utilisons et quels sont vos droits.
            </p>
            <p className="mt-3 text-sm">
              La Plateforme est éditée par [RAISON SOCIALE À COMPLÉTER], dont le siège
              social est situé au [ADRESSE À COMPLÉTER]. Pour toute question relative à vos
              données personnelles, vous pouvez nous contacter à : [EMAIL DPO À COMPLÉTER].
            </p>
            <p className="mt-3 text-sm">
              Les données sont hébergées dans l&apos;Union Européenne, sur des serveurs situés
              à Frankfurt (Allemagne), conformément aux exigences du Règlement Général sur
              la Protection des Données (RGPD).
            </p>
          </section>

          {/* Article 1 */}
          <section id="article-1">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 1 — Données collectées
            </h2>
            <Subsection title="1.1 Données des Prestataires">
              Lors de la création d&apos;un compte Prestataire, nous collectons : nom et prénom
              ou raison sociale, adresse email, nom de l&apos;organisme ou de l&apos;entreprise, URL
              du site web (optionnel), informations de facturation (traitées par Stripe —
              non stockées par nous).
              <br /><br />
              Dans le cadre de l&apos;utilisation de la Plateforme, nous collectons également
              les données liées à vos Offres, Séances, questions formateur et à l&apos;activité
              de votre compte.
            </Subsection>
            <Subsection title="1.2 Données des Utilisateurs (apprenants / clients)">
              Lors du dépôt d&apos;un avis, nous collectons : les réponses au formulaire de profil
              (niveau, situation, objectif, tranche d&apos;âge, domaine), le contenu de l&apos;avis
              (note, texte, points forts, points à améliorer), les réponses aux questions
              publiques et privées du Prestataire, l&apos;adresse email si fournie volontairement
              pour la création d&apos;un espace personnel.
              <br /><br />
              En cas de création d&apos;un espace personnel, nous collectons également : prénom,
              nom (optionnels), numéro de téléphone (optionnel), localisation (optionnelle),
              historique des avis déposés.
            </Subsection>
            <Subsection title="1.3 Données collectées automatiquement">
              Lors de votre navigation sur la Plateforme, nous collectons automatiquement :
              adresse IP (anonymisée après 24h), type de navigateur et système d&apos;exploitation,
              pages visitées et durée de visite, source de la visite.
              <br /><br />
              Ces données sont collectées via des outils d&apos;analyse respectueux de la vie
              privée (Plausible Analytics), sans cookies de traçage.
            </Subsection>
            <Subsection title="1.4 Données non collectées">
              Nous ne collectons jamais : données de santé, origine ethnique ou raciale,
              opinions politiques ou religieuses, orientation sexuelle, données biométriques,
              numéro de carte bancaire (traité exclusivement par Stripe).
            </Subsection>
          </section>

          {/* Article 2 */}
          <section id="article-2">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 2 — Finalités et bases légales
            </h2>
            <p className="mb-3 text-sm">
              Chaque traitement de données repose sur une base légale au sens du RGPD :
            </p>
            <Subsection title="2.1 Exécution du contrat">
              <ul className="list-disc space-y-1 pl-5">
                <li>Gestion des comptes Prestataires et Utilisateurs</li>
                <li>Collecte et publication des avis</li>
                <li>Envoi des communications transactionnelles (lien magic link, confirmation d&apos;avis, notification nouvel avis)</li>
                <li>Génération des tokens de collecte et QR codes</li>
              </ul>
            </Subsection>
            <Subsection title="2.2 Intérêt légitime">
              <ul className="list-disc space-y-1 pl-5">
                <li>Amélioration de la Plateforme et de l&apos;expérience utilisateur</li>
                <li>Détection et prévention des fraudes</li>
                <li>Sécurité de la Plateforme</li>
                <li>Analytics d&apos;utilisation anonymisées</li>
              </ul>
            </Subsection>
            <Subsection title="2.3 Consentement">
              <ul className="list-disc space-y-1 pl-5">
                <li>Enrichissement du profil Utilisateur via les réponses aux questions publiques des Prestataires</li>
                <li>Utilisation des réponses privées pour améliorer les recommandations (anonyme)</li>
                <li>Communications marketing (si vous y avez consenti)</li>
              </ul>
            </Subsection>
            <Subsection title="2.4 Obligation légale">
              <ul className="list-disc space-y-1 pl-5">
                <li>Conservation des données de facturation (10 ans)</li>
                <li>Réponse aux demandes des autorités compétentes</li>
              </ul>
            </Subsection>
          </section>

          {/* Article 3 */}
          <section id="article-3">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 3 — Le profil Utilisateur et le matching
            </h2>
            <Subsection title="3.1 Construction du profil">
              Votre profil se construit à partir de plusieurs sources :
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li><strong>Données déclarées</strong> : informations que vous saisissez directement (niveau, situation, objectif)</li>
                <li><strong>Réponses aux questions publiques des Prestataires</strong> : avec votre consentement explicite, ces réponses enrichissent votre profil</li>
                <li><strong>Réponses aux questions privées</strong> : si vous avez consenti à leur utilisation anonyme pour le matching</li>
              </ul>
              <br />
              À chaque point de collecte, la finalité est clairement indiquée. Vous pouvez
              à tout moment consulter l&apos;ensemble de vos réponses depuis votre espace
              personnel, y compris vos réponses aux questions privées.
            </Subsection>
            <Subsection title="3.2 Utilisation pour le matching">
              ReviewWall utilise votre profil pour calculer un score de similarité entre
              votre situation et celle des autres Utilisateurs ayant évalué une Offre. Ce
              score permet d&apos;afficher en priorité les avis les plus pertinents pour vous.
              <br /><br />
              Le calcul du matching est effectué côté serveur. Les scores individuels ne sont
              jamais transmis à des tiers ni exposés publiquement dans leur intégralité.
            </Subsection>
            <Subsection title="3.3 Transparence et contrôle">
              Depuis votre espace personnel, vous pouvez à tout moment :
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Consulter l&apos;intégralité de vos données de profil (déclarées et enrichies)</li>
                <li>Modifier vos informations déclarées</li>
                <li>Désactiver l&apos;enrichissement de profil via les questions publiques</li>
                <li>Désactiver l&apos;utilisation de vos réponses privées pour le matching</li>
                <li>Supprimer des dimensions spécifiques de votre profil</li>
              </ul>
            </Subsection>
            <Subsection title="3.4 Questions privées des Prestataires">
              Les réponses que vous apportez aux questions privées d&apos;un Prestataire sont :
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Visibles par le Prestataire dans son tableau de bord</li>
                <li>Visibles par vous dans votre espace personnel</li>
                <li>Jamais publiées publiquement</li>
                <li>Jamais transmises à d&apos;autres Prestataires</li>
                <li>Potentiellement utilisées de façon anonyme pour le matching si vous y avez consenti</li>
              </ul>
            </Subsection>
          </section>

          {/* Article 4 */}
          <section id="article-4">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 4 — Partage des données
            </h2>
            <Subsection title="4.1 Données jamais vendues">
              Nous ne vendons, ne louons et ne cédons jamais vos données personnelles à des
              tiers à des fins commerciales.
            </Subsection>
            <Subsection title="4.2 Sous-traitants techniques">
              Nous faisons appel à des sous-traitants pour l&apos;hébergement et le fonctionnement
              de la Plateforme. Chaque sous-traitant est lié par un accord de traitement des
              données (DPA) conforme au RGPD.
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="pb-2 pr-4 font-semibold">Sous-traitant</th>
                      <th className="pb-2 pr-4 font-semibold">Rôle</th>
                      <th className="pb-2 font-semibold">Localisation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      ["Supabase (Supabase Inc.)", "Base de données & authentification", "Frankfurt, UE"],
                      ["Vercel (Vercel Inc.)", "Hébergement frontend", "CDN mondial, traitement en UE"],
                      ["Stripe (Stripe Inc.)", "Paiement — conforme PCI DSS", "DPA signé"],
                      ["Resend (Resend Inc.)", "Emails transactionnels", "DPA signé"],
                      ["Anthropic (Anthropic PBC)", "IA — validation questions, génération contenu", "Sans conservation pour l'entraînement"],
                      ["Cloudflare (Cloudflare Inc.)", "Stockage fichiers (R2)", "UE"],
                    ].map(([name, role, loc]) => (
                      <tr key={name}>
                        <td className="py-2 pr-4 font-medium text-slate-700">{name}</td>
                        <td className="py-2 pr-4 text-slate-600">{role}</td>
                        <td className="py-2 text-slate-500">{loc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Subsection>
            <Subsection title="4.3 Données publiques">
              Les informations suivantes sont publiques sur la Plateforme : le contenu des
              avis (note, texte, points forts/faibles), les réponses aux questions publiques
              des Prestataires, le profil anonymisé de l&apos;Utilisateur (niveau, situation,
              objectif — jamais nom ni email), les fiches Offres créées par les Prestataires.
              <br /><br />
              Les avis sont publiés de façon pseudonymisée — jamais avec le nom complet ou
              l&apos;email de l&apos;Utilisateur.
            </Subsection>
            <Subsection title="4.4 Obligations légales">
              Nous pouvons être amenés à communiquer vos données aux autorités compétentes
              sur réquisition judiciaire ou pour répondre à une obligation légale.
            </Subsection>
          </section>

          {/* Article 5 */}
          <section id="article-5">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 5 — Durée de conservation
            </h2>
            <p className="mb-3 text-sm">
              Nous conservons vos données personnelles pour les durées suivantes :
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                    <th className="pb-2 pr-4 font-semibold">Type de donnée</th>
                    <th className="pb-2 font-semibold">Durée de conservation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {[
                    ["Compte Prestataire actif", "Durée du contrat + 3 ans après résiliation"],
                    ["Avis publiés", "Conservés indéfiniment (information publique)"],
                    ["Avis supprimés par l'Utilisateur", "Anonymisés immédiatement (contenu conservé sans identifiant)"],
                    ["Profil Utilisateur", "Durée du compte + 1 an après suppression"],
                    ["Données de facturation", "10 ans (obligation légale)"],
                    ["Logs de sécurité", "12 mois"],
                    ["Données analytics", "Anonymisées en temps réel, agrégats conservés 36 mois"],
                    ["Tokens de collecte utilisés", "90 jours après utilisation"],
                  ].map(([type, duration]) => (
                    <tr key={type}>
                      <td className="py-2 pr-4 text-slate-700">{type}</td>
                      <td className="py-2 text-slate-600">{duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Article 6 */}
          <section id="article-6">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 6 — Vos droits
            </h2>
            <p className="mb-4 text-sm">
              Conformément au RGPD et à la loi Informatique et Libertés, vous disposez
              des droits suivants :
            </p>
            <Subsection title="6.1 Droit d'accès">
              Vous pouvez obtenir une copie de l&apos;ensemble de vos données personnelles
              traitées par la Plateforme. Cette copie est disponible en format JSON depuis
              votre espace personnel ou sur demande à [EMAIL DPO À COMPLÉTER].
            </Subsection>
            <Subsection title="6.2 Droit de rectification">
              Vous pouvez corriger vos données inexactes ou incomplètes depuis votre espace
              personnel ou en nous contactant.
            </Subsection>
            <Subsection title="6.3 Droit à l'effacement">
              Vous pouvez demander la suppression de votre compte et de vos données
              personnelles. La suppression entraîne :
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Anonymisation immédiate de vos avis (le contenu est conservé sans identifiant)</li>
                <li>Suppression de votre profil et de vos préférences</li>
                <li>Conservation des données de facturation pour obligation légale</li>
              </ul>
              <br />
              Ce droit ne s&apos;applique pas aux avis qui constituent une information publique
              protégée par la liberté d&apos;expression et d&apos;information.
            </Subsection>
            <Subsection title="6.4 Droit à la portabilité">
              Vous pouvez récupérer vos données dans un format structuré (JSON) depuis
              votre espace personnel.
            </Subsection>
            <Subsection title="6.5 Droit d'opposition">
              Vous pouvez vous opposer au traitement de vos données à des fins de profilage
              ou de matching depuis votre espace personnel (section Préférences de
              confidentialité).
            </Subsection>
            <Subsection title="6.6 Droit de limitation">
              Vous pouvez demander la suspension temporaire du traitement de vos données en
              nous contactant.
            </Subsection>
            <Subsection title="6.7 Exercice de vos droits">
              Pour exercer vos droits, contactez-nous à : [EMAIL DPO À COMPLÉTER]. Nous
              répondons dans un délai maximum d&apos;un mois. En cas de réponse insatisfaisante,
              vous pouvez introduire une réclamation auprès de la CNIL (
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                www.cnil.fr
              </a>
              ).
            </Subsection>
          </section>

          {/* Article 7 */}
          <section id="article-7">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 7 — Cookies et traceurs
            </h2>
            <p className="mb-3 text-sm">
              La Plateforme utilise un nombre minimal de cookies, tous strictement
              nécessaires au fonctionnement :
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                    <th className="pb-2 pr-4 font-semibold">Cookie</th>
                    <th className="pb-2 pr-4 font-semibold">Finalité</th>
                    <th className="pb-2 font-semibold">Durée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  <tr>
                    <td className="py-2 pr-4 font-medium text-slate-700">Cookie de session</td>
                    <td className="py-2 pr-4 text-slate-600">Authentification et maintien de la connexion</td>
                    <td className="py-2 text-slate-500">Session</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium text-slate-700">Cookie de consentement</td>
                    <td className="py-2 pr-4 text-slate-600">Mémorisation de vos préférences RGPD</td>
                    <td className="py-2 text-slate-500">12 mois</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm">
              Nous n&apos;utilisons aucun cookie publicitaire, aucun cookie de tracking inter-sites
              et aucun outil d&apos;analyse avec cookies (nous utilisons Plausible Analytics, qui
              ne dépose aucun cookie).
            </p>
            <p className="mt-3 text-sm">
              Le Widget embarqué sur les sites des Prestataires peut déposer un cookie
              first-party pour mémoriser votre profil visiteur. Ce cookie n&apos;est activé
              qu&apos;avec votre consentement explicite.
            </p>
          </section>

          {/* Article 8 */}
          <section id="article-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 8 — Sécurité
            </h2>
            <p className="mb-3 text-sm">
              Nous mettons en œuvre les mesures techniques et organisationnelles suivantes
              pour protéger vos données :
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>Chiffrement des communications (HTTPS/TLS)</li>
              <li>Chiffrement des données au repos pour les informations sensibles</li>
              <li>Authentification par lien magique (pas de mot de passe stocké)</li>
              <li>Contrôle d&apos;accès strict par Row Level Security (RLS) en base de données</li>
              <li>Journalisation des actions sensibles (audit logs)</li>
              <li>Données hébergées exclusivement dans l&apos;Union Européenne</li>
              <li>Accès aux données de production limité au personnel strictement nécessaire</li>
            </ul>
          </section>

          {/* Article 9 */}
          <section id="article-9">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 9 — Transferts hors UE
            </h2>
            <p className="text-sm">
              Certains de nos sous-traitants (Vercel, Stripe, Anthropic, Resend) sont établis
              aux États-Unis. Ces transferts sont encadrés par :
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              <li>Des clauses contractuelles types (CCT) approuvées par la Commission européenne</li>
              <li>Des accords de traitement des données (DPA) conformes au RGPD</li>
              <li>Le cadre EU-US Data Privacy Framework pour les sous-traitants certifiés</li>
            </ul>
            <p className="mt-3 text-sm">
              Les données stockées en base (Supabase) et les fichiers (Cloudflare R2) restent
              en tout état de cause hébergés dans l&apos;Union Européenne.
            </p>
          </section>

          {/* Article 10 */}
          <section id="article-10">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 10 — Modifications
            </h2>
            <p className="text-sm">
              Nous pouvons modifier la présente Politique de Confidentialité à tout moment.
              En cas de modification significative, vous serez informé par email ou par
              notification sur la Plateforme avec un préavis de 30 jours.
            </p>
            <p className="mt-3 text-sm">
              La version en vigueur est toujours accessible à l&apos;adresse [DOMAINE]/confidentialite.
            </p>
          </section>

          {/* Article 11 */}
          <section id="article-11">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 11 — Contact et réclamations
            </h2>
            <p className="text-sm">
              Pour toute question relative à la présente Politique de Confidentialité ou à
              l&apos;exercice de vos droits :
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Email : [EMAIL DPO À COMPLÉTER]</li>
              <li>
                Courrier : [RAISON SOCIALE] — [ADRESSE] — À l&apos;attention du responsable des
                données personnelles
              </li>
            </ul>
            <p className="mt-4 text-sm">
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire
              une réclamation auprès de la Commission Nationale de l&apos;Informatique et des
              Libertés (CNIL) :
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                Site web :{" "}
                <a
                  href="https://www.cnil.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  www.cnil.fr
                </a>
              </li>
              <li>Adresse : 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07</li>
            </ul>
          </section>

          <p className="border-t border-slate-200 pt-6 text-xs text-slate-400">
            ReviewWall — Politique de Confidentialité — Version beta — À mettre à jour avant lancement public
          </p>
        </div>
      </div>

      <BackToTop />
    </div>
  );
}

function Subsection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <h3 className="mb-2 text-sm font-semibold text-slate-800">{title}</h3>
      <div className="text-sm text-slate-700">{children}</div>
    </div>
  );
}
