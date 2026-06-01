export type ProfilField =
  | { key: string; label: string; type: "chips"; options: readonly string[] }
  | { key: string; label: string; type: "text" };

export type VerticalConfig = {
  label: string;
  prestataire: { singular: string; label: string };
  offre: { singular: string; plural: string; label: string };
  client: { singular: string; label: string };
  profil_fields: readonly ProfilField[];
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
  },
} as const satisfies Record<string, VerticalConfig>;

export type Vertical = keyof typeof VERTICALS;

export const DEFAULT_VERTICAL: Vertical = "formation";
