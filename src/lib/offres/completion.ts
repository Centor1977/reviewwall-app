export interface Offre {
  titre?: string | null;
  categorie?: string | null;
  format?: string | null;
  duree?: string | null;
  description_courte?: string | null;
  description_longue?: string | null;
  metadata_vertical?: Record<string, unknown> | null;
  prix?: string | null;
  image_url?: string | null;
  tags?: string[] | null;
}

export interface CompletionResult {
  score: number;
  champsRemplis: string[];
  champsVides: string[];
  details: Record<string, boolean>;
}

export const CHAMP_LABELS: Record<string, string> = {
  titre: "Titre",
  categorie: "Catégorie",
  format_duree: "Format & durée",
  description_courte: "Description",
  description_longue: "Description longue",
  objectifs: "Objectifs",
  programme: "Programme",
  public_cible: "Public cible",
  prerequis: "Prérequis",
  prix: "Prix",
  image_url: "Image cover",
  tags: "Tags",
};

export const CHAMP_ANCHORS: Record<string, string> = {
  titre: "#titre",
  categorie: "#categorie",
  format_duree: "#format",
  description_courte: "#description",
  description_longue: "#description",
  objectifs: "#objectifs",
  programme: "#programme",
  public_cible: "#public_cible",
  prerequis: "#prerequis",
  prix: "#prix",
  image_url: "#image",
  tags: "#tags",
};

export function calculateCompletion(offre: Offre): CompletionResult {
  const meta = (offre.metadata_vertical ?? {}) as Record<string, unknown>;

  const details: Record<string, boolean> = {
    titre: Boolean(offre.titre?.trim()),
    categorie: Boolean(offre.categorie),
    format_duree: Boolean(offre.format && offre.duree),
    description_courte: Boolean(offre.description_courte?.trim()),
    description_longue: Boolean(offre.description_longue?.trim()),
    objectifs: Array.isArray(meta.objectifs) && (meta.objectifs as unknown[]).length > 0,
    programme: Array.isArray(meta.programme) && (meta.programme as unknown[]).length > 0,
    public_cible:
      typeof meta.public_cible === "string" && meta.public_cible.trim().length > 0,
    prerequis: Array.isArray(meta.prerequis) && (meta.prerequis as unknown[]).length > 0,
    prix: offre.prix !== null && offre.prix !== undefined,
    image_url: Boolean(offre.image_url),
    tags: Array.isArray(offre.tags) && offre.tags.length > 0,
  };

  const champsRemplis = Object.entries(details)
    .filter(([, v]) => v)
    .map(([k]) => k);
  const champsVides = Object.entries(details)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  const score = Math.round((champsRemplis.length / Object.keys(details).length) * 100);

  return { score, champsRemplis, champsVides, details };
}
