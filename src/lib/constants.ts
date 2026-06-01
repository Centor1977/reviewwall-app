export const CATEGORIES_OFFRE = [
  "Développement web",
  "Développement mobile",
  "Design & UX",
  "Marketing digital",
  "Business & entrepreneuriat",
  "Data & IA",
  "Langues",
  "Développement personnel",
  "Autre",
] as const;

export type CategorieOffre = (typeof CATEGORIES_OFFRE)[number];
