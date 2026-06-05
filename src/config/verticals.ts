export type ProfilField =
  | { key: string; label: string; type: "chips"; options: readonly string[] }
  | { key: string; label: string; type: "text" };

export type MetadataField =
  | { key: string; label: string; type: "list";      placeholder?: string; help?: string }
  | { key: string; label: string; type: "text";      placeholder?: string; help?: string; condition?: string }
  | { key: string; label: string; type: "boolean" }
  | { key: string; label: string; type: "tags";      placeholder?: string; help?: string }
  | { key: string; label: string; type: "programme"; placeholder?: string; help?: string };

export type VerticalConfig = {
  label: string;
  prestataire: { singular: string; label: string };
  offre: { singular: string; plural: string; label: string };
  client: { singular: string; label: string };
  profil_fields: readonly ProfilField[];
  metadata_fields: readonly MetadataField[];
};

export const VERTICALS = {
  formation: {
    label: "Formation",
    prestataire: { singular: "formateur", label: "Formateur" },
    offre: { singular: "formation", plural: "formations", label: "Formation" },
    client: { singular: "apprenant", label: "Apprenant" },
    profil_fields: [
      { key: "niveau", label: "Niveau", type: "chips", options: ["débutant", "intermédiaire", "avancé"] },
      { key: "objectif", label: "Objectif principal", type: "chips", options: ["reconversion", "montée en compétence", "curiosité", "pro"] },
      { key: "situation", label: "Situation professionnelle", type: "chips", options: ["salarié", "indépendant", "demandeur d'emploi", "étudiant"] },
      { key: "age_range", label: "Tranche d'âge", type: "chips", options: ["18-25", "26-35", "36-45", "46+"] },
      { key: "domaine_avant", label: "Domaine avant la formation", type: "text" },
    ],
    metadata_fields: [
      { key: "objectifs",             label: "Objectifs pédagogiques",   type: "list",      placeholder: "Ex : Maîtriser les tableaux croisés dynamiques", help: "Listez ce que l'apprenant saura faire à l'issue" },
      { key: "prerequis",             label: "Prérequis",                type: "list",      placeholder: "Ex : Notions de base en informatique",           help: "Laissez vide si aucun prérequis" },
      { key: "public_cible",          label: "Public cible",             type: "text",      placeholder: "Ex : Professionnels souhaitant gagner en productivité" },
      { key: "programme",             label: "Programme",                type: "programme", placeholder: "Ex : Module 1 — Introduction" },
      { key: "competences",           label: "Compétences acquises",     type: "tags",      placeholder: "Ex : Tableaux croisés dynamiques" },
      { key: "cpf",                   label: "Éligible CPF",             type: "boolean" },
      { key: "opco",                  label: "Financement OPCO possible", type: "boolean" },
      { key: "certification",         label: "Formation certifiante",    type: "boolean" },
      { key: "certification_detail",  label: "Détail certification",     type: "text",      placeholder: "Ex : Certification TOSA Excel", condition: "certification === true" },
    ],
  },
  coaching: {
    label: "Coaching",
    prestataire: { singular: "coach", label: "Coach" },
    offre: { singular: "programme", plural: "programmes", label: "Programme" },
    client: { singular: "coaché", label: "Coaché" },
    profil_fields: [
      { key: "objectif", label: "Objectif du coaching", type: "chips", options: ["développement personnel", "carrière", "leadership", "bien-être"] },
      { key: "situation", label: "Situation", type: "chips", options: ["salarié", "indépendant", "demandeur d'emploi"] },
      { key: "age_range", label: "Tranche d'âge", type: "chips", options: ["18-25", "26-35", "36-45", "46+"] },
    ],
    metadata_fields: [
      { key: "objectifs",    label: "Objectifs du coaching",       type: "list", placeholder: "Ex : Développer son leadership" },
      { key: "public_cible", label: "Public cible",                type: "text", placeholder: "Ex : Managers en transition professionnelle" },
      { key: "prerequis",    label: "Prérequis",                   type: "list", placeholder: "Ex : Expérience managériale souhaitée", help: "Laissez vide si aucun prérequis" },
      { key: "competences",  label: "Compétences développées",     type: "tags", placeholder: "Ex : Leadership" },
    ],
  },
  service: {
    label: "Service",
    prestataire: { singular: "prestataire", label: "Prestataire" },
    offre: { singular: "service", plural: "services", label: "Service" },
    client: { singular: "client", label: "Client" },
    profil_fields: [
      { key: "type_client", label: "Type de client", type: "chips", options: ["particulier", "TPE/PME", "grande entreprise", "collectivité"] },
      { key: "secteur", label: "Secteur d'activité", type: "text" },
    ],
    metadata_fields: [
      { key: "objectifs",    label: "Objectifs",              type: "list", placeholder: "Ex : Optimiser votre processus RH" },
      { key: "public_cible", label: "Public cible",           type: "text", placeholder: "Ex : TPE/PME souhaitant externaliser leur RH" },
      { key: "competences",  label: "Livrables / Résultats",  type: "tags", placeholder: "Ex : Audit RH complet" },
    ],
  },
} as const satisfies Record<string, VerticalConfig>;

export type Vertical = keyof typeof VERTICALS;

export const DEFAULT_VERTICAL: Vertical = "formation";
