import type { Metadata } from "next";
import { BackToTop } from "@/components/BackToTop";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — ReviewWall",
};

const ARTICLES = [
  { id: "preambule", label: "Préambule" },
  { id: "article-1", label: "1. Définitions" },
  { id: "article-2", label: "2. Accès à la Plateforme" },
  { id: "article-3", label: "3. Conditions Prestataires" },
  { id: "article-4", label: "4. Conditions Utilisateurs" },
  { id: "article-5", label: "5. Modération" },
  { id: "article-6", label: "6. Propriété des données" },
  { id: "article-7", label: "7. Plans tarifaires" },
  { id: "article-8", label: "8. Propriété intellectuelle" },
  { id: "article-9", label: "9. Responsabilité" },
  { id: "article-10", label: "10. Données personnelles" },
  { id: "article-11", label: "11. Modifications" },
  { id: "article-12", label: "12. Dispositions diverses" },
];

export default function CguPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-1 text-3xl font-bold text-blue-600">
          Conditions Générales d&apos;Utilisation
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

          {/* Préambule */}
          <section id="preambule">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Préambule</h2>
            <p className="text-sm">
              ReviewWall (ci-après « la Plateforme ») est un service en ligne permettant
              aux prestataires (formateurs, organismes de formation, coachs, prestataires
              de services) de collecter des avis profilés auprès de leurs clients, et aux
              utilisateurs (apprenants, clients) de consulter ces avis, de gérer leur profil
              et de trouver des offres adaptées à leur situation.
            </p>
            <p className="mt-3 text-sm">
              La Plateforme est éditée par [RAISON SOCIALE À COMPLÉTER], [FORME JURIDIQUE],
              au capital de [MONTANT], immatriculée au RCS de [VILLE] sous le numéro
              [NUMÉRO], dont le siège social est situé au [ADRESSE] (ci-après « l&apos;Éditeur »).
            </p>
            <p className="mt-3 text-sm">
              Les présentes Conditions Générales d&apos;Utilisation (ci-après « CGU ») régissent
              l&apos;accès et l&apos;utilisation de la Plateforme par tout utilisateur. En accédant à
              la Plateforme, l&apos;utilisateur reconnaît avoir lu, compris et accepté sans réserve
              les présentes CGU.
            </p>
            <p className="mt-3 text-sm">
              Ces CGU sont complétées par notre{" "}
              <a href="/confidentialite" className="text-blue-600 hover:underline">
                Politique de Confidentialité
              </a>
              , disponible sur la Plateforme, qui décrit en détail le traitement des données
              personnelles.
            </p>
          </section>

          {/* Article 1 */}
          <section id="article-1">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 1 — Définitions
            </h2>
            <p className="mb-3 text-sm">Au sens des présentes CGU, les termes suivants désignent :</p>
            <dl className="space-y-3 text-sm">
              {[
                ["Plateforme", "Le site ReviewWall accessible à l'adresse [DOMAINE À COMPLÉTER] et ses éventuelles applications mobiles."],
                ["Prestataire", "Toute personne physique ou morale utilisant la Plateforme pour collecter des avis sur ses offres (formateur, organisme de formation, coach, prestataire de services)."],
                ["Utilisateur / Client", "Toute personne physique accédant à la Plateforme pour consulter des avis, déposer un avis ou gérer son espace personnel."],
                ["Offre", "Toute formation, prestation, accompagnement ou service référencé par un Prestataire sur la Plateforme."],
                ["Séance", "Une instance de délivrance d'une Offre à un groupe de participants à une date donnée."],
                ["Avis", "L'évaluation qu'un Utilisateur dépose sur une Offre via un lien ou QR code unique."],
                ["Profil", "L'ensemble des informations déclarées ou inférées caractérisant un Utilisateur (situation professionnelle, niveau, objectif, etc.)."],
                ["Token", "Identifiant unique à usage unique généré par le Prestataire et transmis à chaque participant pour accéder au formulaire de dépôt d'avis."],
                ["Widget", "Composant embarquable permettant d'afficher les avis d'une Offre sur un site externe."],
                ["Catalogue", "Vitrine publique de la Plateforme référençant les Offres ayant reçu au moins un avis vérifié."],
                ["Questions publiques", "Questions posées par le Prestataire dans le formulaire de collecte, dont les réponses sont visibles publiquement."],
                ["Questions privées", "Questions posées par le Prestataire dont les réponses sont réservées au Prestataire et à l'Utilisateur, jamais publiées."],
              ].map(([term, def]) => (
                <div key={term} className="flex gap-2">
                  <dt className="w-36 shrink-0 font-semibold text-slate-800">« {term} »</dt>
                  <dd className="flex-1 text-slate-700">{def}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Article 2 */}
          <section id="article-2">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 2 — Accès à la Plateforme
            </h2>
            <Subsection title="2.1 Accès sans inscription">
              La consultation du Catalogue, des fiches Offres et des avis publics est accessible
              à tout visiteur sans création de compte.
            </Subsection>
            <Subsection title="2.2 Compte Prestataire">
              La création d&apos;un compte Prestataire est nécessaire pour accéder au tableau de bord,
              créer des Offres, gérer des Séances et collecter des avis. L&apos;inscription requiert
              la fourniture d&apos;une adresse email valide et d&apos;un mot de passe, ou l&apos;utilisation
              d&apos;un prestataire d&apos;authentification tiers.
              <br /><br />
              Le Prestataire s&apos;engage à fournir des informations exactes et à les maintenir à jour.
              Tout compte créé avec des informations frauduleuses pourra être suspendu sans préavis.
            </Subsection>
            <Subsection title="2.3 Espace personnel Utilisateur">
              L&apos;Utilisateur peut créer un espace personnel via un lien de connexion magique
              (magic link) envoyé à son adresse email. Cet espace lui permet de consulter
              l&apos;ensemble de ses avis déposés, de gérer son profil et d&apos;exercer ses droits sur
              ses données personnelles.
              <br /><br />
              Un même compte peut cumuler les rôles de Prestataire et d&apos;Utilisateur.
            </Subsection>
            <Subsection title="2.4 Sécurité des comptes">
              L&apos;utilisateur est responsable de la confidentialité de ses identifiants. Toute
              utilisation de la Plateforme depuis son compte est réputée effectuée par
              l&apos;utilisateur lui-même. En cas de compromission, l&apos;utilisateur doit informer
              immédiatement l&apos;Éditeur à [EMAIL SUPPORT À COMPLÉTER].
            </Subsection>
          </section>

          {/* Article 3 */}
          <section id="article-3">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 3 — Conditions d&apos;utilisation pour les Prestataires
            </h2>
            <Subsection title="3.1 Création et gestion des Offres">
              Le Prestataire est seul responsable du contenu des fiches Offres qu&apos;il crée
              (titre, description, programme, objectifs pédagogiques, visuels). Il garantit
              que ces informations sont exactes, à jour et ne constituent pas une pratique
              commerciale trompeuse au sens du Code de la consommation.
            </Subsection>
            <Subsection title="3.2 Collecte des avis — Tokens à usage unique">
              La collecte d&apos;avis s&apos;effectue via des tokens à usage unique générés par la
              Plateforme. Chaque token ne peut être utilisé qu&apos;une seule fois. Le Prestataire
              s&apos;engage à ne distribuer les tokens qu&apos;à des participants ayant effectivement
              suivi son Offre.
              <br /><br />
              Toute tentative de manipulation des avis (distribution à des tiers n&apos;ayant pas
              suivi la formation, multiplication artificielle d&apos;avis, utilisation de comptes
              fictifs) constitue une violation grave des présentes CGU et entraîne la
              suppression immédiate du compte et de l&apos;ensemble des avis associés.
            </Subsection>
            <Subsection title="3.3 Questions formateur">
              Le Prestataire peut ajouter des questions personnalisées au formulaire de
              collecte, dans les limites définies par son plan tarifaire. Ces questions sont
              soumises à validation automatique par intelligence artificielle avant
              publication. La Plateforme se réserve le droit de refuser toute question :
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Portant sur des données sensibles au sens du RGPD (santé, origine ethnique, opinions politiques ou religieuses, orientation sexuelle, etc.)</li>
                <li>Discriminatoire ou contraire à la législation applicable</li>
                <li>Biaisée de manière à orienter artificiellement les réponses</li>
                <li>Sans lien avec l&apos;évaluation de l&apos;Offre</li>
              </ul>
              <br />
              Les réponses aux Questions publiques sont visibles publiquement et peuvent
              alimenter le profil de l&apos;Utilisateur avec son consentement explicite. Les
              réponses aux Questions privées sont accessibles au Prestataire et à
              l&apos;Utilisateur concerné, mais ne sont jamais publiées.
            </Subsection>
            <Subsection title="3.4 Règles relatives au Catalogue — Option de référencement permanent">
              La Plateforme applique les règles suivantes concernant la visibilité des Offres
              dans le Catalogue public :
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li><strong>Avant le premier avis vérifié :</strong> le Prestataire contrôle librement la visibilité de son Offre dans le Catalogue (publication volontaire).</li>
                <li><strong>Dès le premier avis vérifié :</strong> l&apos;Offre est automatiquement et définitivement référencée dans le Catalogue. Cette publication ne peut plus être annulée par le Prestataire.</li>
              </ul>
              <br />
              Cette règle a pour objet de protéger les Utilisateurs contre toute manipulation
              consistant à retirer du Catalogue une Offre ayant reçu des avis défavorables
              pour en créer une nouvelle vierge d&apos;avis. En s&apos;inscrivant sur la Plateforme et
              en collectant des avis, le Prestataire accepte expressément ce principe.
              <br /><br />
              Le Prestataire conserve à tout moment la possibilité de désactiver une Offre
              (qui ne recevra plus de nouveaux avis), mais les avis existants restent visibles
              sur la fiche publique et dans le Catalogue.
            </Subsection>
            <Subsection title="3.5 Réponse aux avis">
              Le Prestataire peut apporter une réponse publique à chaque avis reçu. Cette
              réponse doit respecter les règles de modération définies à l&apos;Article 5. Une seule
              réponse est autorisée par avis. La réponse est modifiable et supprimable par le
              Prestataire.
            </Subsection>
            <Subsection title="3.6 Obligations légales">
              Le Prestataire s&apos;engage à respecter l&apos;ensemble de la législation applicable à son
              activité, notamment en matière de droit de la formation professionnelle, de
              certification Qualiopi le cas échéant, de protection des consommateurs et de RGPD.
            </Subsection>
          </section>

          {/* Article 4 */}
          <section id="article-4">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 4 — Conditions d&apos;utilisation pour les Utilisateurs
            </h2>
            <Subsection title="4.1 Dépôt d'avis">
              Tout Utilisateur ayant reçu un token valide peut déposer un avis sur une Offre.
              En déposant un avis, l&apos;Utilisateur garantit :
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Avoir effectivement suivi ou participé à l&apos;Offre concernée</li>
                <li>Que l&apos;avis reflète son expérience personnelle et sincère</li>
                <li>Que l&apos;avis ne contient aucun contenu illicite, diffamatoire, injurieux ou contraire aux bonnes mœurs</li>
                <li>Ne pas avoir reçu de contrepartie (financière ou autre) pour la rédaction de l&apos;avis</li>
              </ul>
            </Subsection>
            <Subsection title="4.2 Persistance des avis">
              Les avis déposés sont permanents et demeurent sur la Plateforme même en cas de
              résiliation du compte Prestataire associé à l&apos;Offre. Cette règle garantit
              l&apos;intégrité de l&apos;information pour les futurs Utilisateurs.
              <br /><br />
              L&apos;Utilisateur peut modifier ou supprimer son avis depuis son espace personnel,
              dans les conditions prévues à l&apos;Article 6.
            </Subsection>
            <Subsection title="4.3 Profil Utilisateur">
              L&apos;Utilisateur peut créer et enrichir son profil, composé de deux niveaux :
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li><strong>Informations générales</strong> (prénom, nom, situation, tranche d&apos;âge, localisation) : valables toutes verticales confondues</li>
                <li><strong>Profil par domaine</strong> (niveau, objectif, contexte spécifique) : propre à chaque verticale (formation, coaching, etc.)</li>
              </ul>
              <br />
              Le profil peut être enrichi automatiquement par les réponses aux Questions
              publiques des Prestataires, sous réserve que la mention correspondante soit
              affichée dans le formulaire de collecte. L&apos;Utilisateur peut désactiver cet
              enrichissement depuis son espace personnel.
            </Subsection>
            <Subsection title="4.4 Espace personnel">
              L&apos;espace personnel de l&apos;Utilisateur lui permet de consulter l&apos;ensemble de ses
              avis (publics et privés), de modifier ses réponses, de gérer ses préférences
              de confidentialité et d&apos;exercer ses droits sur ses données personnelles.
            </Subsection>
          </section>

          {/* Article 5 */}
          <section id="article-5">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 5 — Modération
            </h2>
            <Subsection title="5.1 Principes">
              La Plateforme s&apos;engage à garantir l&apos;authenticité et la qualité des avis publiés.
              À ce titre, l&apos;Éditeur se réserve le droit de modérer, masquer ou supprimer tout
              contenu qui contreviendrait aux présentes CGU.
            </Subsection>
            <Subsection title="5.2 Contenus interdits">
              Sont interdits sur la Plateforme :
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Les contenus diffamatoires, injurieux, racistes, discriminatoires ou portant atteinte à la dignité humaine</li>
                <li>Les contenus portant atteinte à la vie privée d&apos;un tiers</li>
                <li>Les contenus à caractère publicitaire ou promotionnel déguisés</li>
                <li>Les faux avis ou avis rédigés contre contrepartie</li>
                <li>Les contenus portant atteinte aux droits de propriété intellectuelle de tiers</li>
                <li>Les contenus contraires à l&apos;ordre public et aux bonnes mœurs</li>
              </ul>
            </Subsection>
            <Subsection title="5.3 Signalement">
              Tout Utilisateur peut signaler un contenu qu&apos;il estime contraire aux présentes
              CGU via le mécanisme de signalement disponible sur la Plateforme. L&apos;Éditeur
              traitera les signalements dans les meilleurs délais.
            </Subsection>
            <Subsection title="5.4 Droit de réponse">
              Conformément à la législation sur les avis en ligne, le Prestataire dispose
              d&apos;un droit de réponse publique à chaque avis le concernant, dans les conditions
              définies à l&apos;Article 3.5.
            </Subsection>
          </section>

          {/* Article 6 */}
          <section id="article-6">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 6 — Propriété des données et droits des utilisateurs
            </h2>
            <Subsection title="6.1 Avis et données des Utilisateurs">
              Les avis déposés par les Utilisateurs leur appartiennent. L&apos;Utilisateur accorde
              à l&apos;Éditeur une licence non exclusive, mondiale et gratuite d&apos;utilisation,
              reproduction et affichage de ses avis sur la Plateforme et via le Widget, pour
              la durée de publication de l&apos;avis.
              <br /><br />
              L&apos;Utilisateur peut depuis son espace personnel :
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Modifier le contenu de son avis</li>
                <li>Supprimer son avis — l&apos;avis est alors retiré de l&apos;affichage public</li>
                <li>Consulter l&apos;intégralité de ses réponses, y compris aux Questions privées</li>
                <li>Gérer ses préférences d&apos;enrichissement de profil</li>
                <li>Demander la suppression de son compte (les avis sont alors anonymisés, non supprimés)</li>
              </ul>
            </Subsection>
            <Subsection title="6.2 Données des Prestataires">
              Les données des Offres créées par le Prestataire lui appartiennent. En cas de
              résiliation de son compte, le contenu des fiches Offres sera désactivé mais les
              avis associés resteront visibles conformément à l&apos;Article 3.4.
            </Subsection>
            <Subsection title="6.3 Droits RGPD">
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la
              loi Informatique et Libertés, tout utilisateur dispose des droits suivants sur
              ses données personnelles :
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li><strong>Droit d&apos;accès</strong> : obtenir une copie de ses données personnelles</li>
                <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
                <li><strong>Droit à l&apos;effacement</strong> : demander la suppression de ses données (sous réserve des obligations légales de conservation)</li>
                <li><strong>Droit à la portabilité</strong> : recevoir ses données dans un format structuré</li>
                <li><strong>Droit d&apos;opposition</strong> : s&apos;opposer au traitement de ses données à des fins de profilage</li>
                <li><strong>Droit de limitation</strong> : demander la suspension du traitement</li>
              </ul>
              <br />
              Ces droits s&apos;exercent depuis l&apos;espace personnel ou par email à [EMAIL DPO À
              COMPLÉTER]. L&apos;Éditeur s&apos;engage à répondre dans un délai d&apos;un mois.
            </Subsection>
          </section>

          {/* Article 7 */}
          <section id="article-7">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 7 — Plans tarifaires et facturation
            </h2>
            <Subsection title="7.1 Plans disponibles">
              La Plateforme propose les plans tarifaires suivants :
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li><strong>Freemium</strong> : accès gratuit avec fonctionnalités limitées (1 offre, widget basique, fiche catalogue)</li>
                <li><strong>Starter</strong> : formations illimitées, questions privées (3), analytics basiques — tarif mensuel ou annuel</li>
                <li><strong>Pro</strong> : toutes fonctionnalités Starter + questions publiques personnalisées, templates Qualiopi, widget matching, campagnes de relance — tarif mensuel ou annuel</li>
                <li><strong>Scale</strong> : toutes fonctionnalités Pro + questions privées illimitées, export CSV, API, webhooks, mode headless — tarif mensuel ou annuel</li>
              </ul>
              <br />
              Les tarifs en vigueur sont consultables sur la Plateforme. L&apos;Éditeur se réserve
              le droit de modifier ses tarifs sous réserve d&apos;un préavis de 30 jours.
            </Subsection>
            <Subsection title="7.2 Facturation">
              Les plans payants sont facturés mensuellement ou annuellement selon le choix du
              Prestataire. Le paiement est traité par Stripe, prestataire de paiement sécurisé.
              L&apos;Éditeur ne conserve aucune donnée de carte bancaire.
            </Subsection>
            <Subsection title="7.3 Résiliation">
              Le Prestataire peut résilier son abonnement à tout moment depuis son espace de
              paramètres. La résiliation prend effet à la fin de la période de facturation en
              cours. Aucun remboursement n&apos;est effectué pour la période entamée.
              <br /><br />
              En cas de résiliation, le compte passe automatiquement en plan Freemium. Les
              avis existants restent visibles conformément à l&apos;Article 3.4.
            </Subsection>
            <Subsection title="7.4 Offre beta">
              Les premiers formateurs partenaires bénéficient d&apos;un accès au plan Pro offert
              pendant 18 mois, sans engagement et sans carte bancaire. À l&apos;issue de cette
              période, le compte bascule sur le plan Freemium sauf souscription d&apos;un plan payant.
            </Subsection>
          </section>

          {/* Article 8 */}
          <section id="article-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 8 — Propriété intellectuelle
            </h2>
            <Subsection title="8.1 Droits de l'Éditeur">
              La Plateforme ReviewWall, son code source, son design, ses marques, logos,
              algorithmes (notamment le système de profil apprenant et le moteur de matching)
              sont la propriété exclusive de l&apos;Éditeur et sont protégés par le droit de la
              propriété intellectuelle. Toute reproduction, modification ou exploitation sans
              autorisation expresse est interdite.
            </Subsection>
            <Subsection title="8.2 Droits des Prestataires et Utilisateurs">
              Le contenu créé par les Prestataires (fiches Offres, questions) et les
              Utilisateurs (avis, réponses) reste la propriété de leurs auteurs respectifs.
              En publiant ce contenu sur la Plateforme, ils accordent à l&apos;Éditeur la licence
              décrite à l&apos;Article 6.1.
            </Subsection>
          </section>

          {/* Article 9 */}
          <section id="article-9">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 9 — Responsabilité
            </h2>
            <Subsection title="9.1 Responsabilité de l'Éditeur">
              L&apos;Éditeur s&apos;engage à mettre en œuvre tous les moyens raisonnables pour assurer
              la disponibilité et la sécurité de la Plateforme. Toutefois, l&apos;Éditeur ne peut
              être tenu responsable :
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Des interruptions de service dues à des opérations de maintenance ou à des événements extérieurs</li>
                <li>Du contenu publié par les Prestataires ou les Utilisateurs</li>
                <li>De la qualité effective des Offres référencées sur la Plateforme</li>
                <li>Des pertes indirectes résultant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser la Plateforme</li>
              </ul>
            </Subsection>
            <Subsection title="9.2 Responsabilité des Prestataires">
              Le Prestataire est seul responsable du contenu qu&apos;il publie sur la Plateforme,
              de la qualité de ses Offres et du respect de ses obligations légales (droit de
              la formation, Qualiopi, protection des consommateurs, RGPD).
            </Subsection>
            <Subsection title="9.3 Responsabilité des Utilisateurs">
              L&apos;Utilisateur est responsable des avis et contenus qu&apos;il publie sur la
              Plateforme. En cas de contenu illicite, l&apos;Utilisateur s&apos;expose aux sanctions
              prévues par la législation applicable.
            </Subsection>
          </section>

          {/* Article 10 */}
          <section id="article-10">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 10 — Données personnelles
            </h2>
            <p className="text-sm">
              Le traitement des données personnelles est régi par la{" "}
              <a href="/confidentialite" className="text-blue-600 hover:underline">
                Politique de Confidentialité
              </a>{" "}
              disponible sur la Plateforme, qui constitue un document distinct des
              présentes CGU.
            </p>
            <p className="mt-3 text-sm">
              Les principaux traitements effectués sont : gestion des comptes Prestataires
              et Utilisateurs, collecte et publication des avis, construction et enrichissement
              du profil Utilisateur, calcul des scores de similarité (matching), envoi de
              communications transactionnelles, analytics d&apos;utilisation de la Plateforme
              (anonymisées).
            </p>
            <p className="mt-3 text-sm">
              Les données sont hébergées dans l&apos;Union Européenne (région Frankfurt).
              L&apos;Éditeur s&apos;engage à ne pas transférer de données personnelles hors de l&apos;UE
              sans garanties appropriées.
            </p>
          </section>

          {/* Article 11 */}
          <section id="article-11">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 11 — Modification des CGU
            </h2>
            <p className="text-sm">
              L&apos;Éditeur se réserve le droit de modifier les présentes CGU à tout moment.
              Les utilisateurs seront informés de toute modification significative par email
              ou notification sur la Plateforme, avec un préavis minimum de 30 jours.
            </p>
            <p className="mt-3 text-sm">
              La poursuite de l&apos;utilisation de la Plateforme après l&apos;entrée en vigueur des
              nouvelles CGU vaut acceptation de celles-ci. En cas de désaccord, l&apos;utilisateur
              peut résilier son compte avant l&apos;entrée en vigueur des modifications.
            </p>
          </section>

          {/* Article 12 */}
          <section id="article-12">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Article 12 — Dispositions diverses
            </h2>
            <Subsection title="12.1 Droit applicable et juridiction">
              Les présentes CGU sont soumises au droit français. En cas de litige, les
              parties s&apos;engagent à rechercher une solution amiable avant tout recours
              judiciaire. À défaut, les tribunaux compétents seront ceux du ressort du
              siège social de l&apos;Éditeur.
              <br /><br />
              Les Utilisateurs consommateurs résidant dans l&apos;UE peuvent également recourir
              à la plateforme de Règlement en Ligne des Litiges (RLL) accessible à l&apos;adresse :{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                ec.europa.eu/consumers/odr
              </a>
            </Subsection>
            <Subsection title="12.2 Médiation">
              Conformément aux articles L.611-1 et suivants du Code de la consommation,
              le Prestataire et l&apos;Utilisateur peuvent recourir gratuitement à un médiateur
              de la consommation en vue de la résolution amiable du litige. Les coordonnées
              du médiateur compétent sont disponibles sur la Plateforme.
            </Subsection>
            <Subsection title="12.3 Nullité partielle">
              Si une clause des présentes CGU venait à être déclarée nulle ou inapplicable,
              les autres clauses demeureront en vigueur.
            </Subsection>
            <Subsection title="12.4 Contact">
              <ul className="space-y-1">
                <li>Pour toute question relative aux présentes CGU : [EMAIL CONTACT À COMPLÉTER]</li>
                <li>Pour toute question relative aux données personnelles : [EMAIL DPO À COMPLÉTER]</li>
              </ul>
            </Subsection>
          </section>

          <p className="border-t border-slate-200 pt-6 text-xs text-slate-400">
            ReviewWall — Conditions Générales d&apos;Utilisation — Version beta — À mettre à jour avant lancement public
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
