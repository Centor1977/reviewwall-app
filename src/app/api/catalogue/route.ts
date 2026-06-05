import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PAGE_SIZE = 12;

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export type OffreCatalogue = {
  id: string; titre: string; slug: string;
  description_courte: string | null; image_url: string | null;
  niveau: string | null; format: string | null; duree: string | null;
  prix: number | null; tags: string[] | null; categorie: string | null;
  metadata_vertical: Record<string, unknown> | null;
  created_at: string;
  prestataires: { nom: string; organisme: string | null } | null;
  nb_avis: number; note_moyenne: number | null; pct_recommande: number | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q          = searchParams.get("q")?.trim() ?? "";
  const categories = searchParams.get("categorie")?.split(",").filter(Boolean) ?? [];
  const formats    = searchParams.get("format")?.split(",").filter(Boolean) ?? [];
  const niveaux    = searchParams.get("niveau")?.split(",").filter(Boolean) ?? [];
  const note_min   = parseFloat(searchParams.get("note_min") ?? "0") || 0;
  const cpf        = searchParams.get("cpf") === "true";
  const prix_range = searchParams.get("prix") ?? "";
  const tri        = searchParams.get("tri") ?? "pertinence";
  const page       = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  const supabase = publicClient();

  // ── Fetch all visible offres ──────────────────────────────
  let query = supabase
    .from("offres")
    .select("id, titre, slug, description_courte, image_url, niveau, format, duree, prix, tags, categorie, metadata_vertical, created_at, prestataires(nom, organisme)")
    .eq("catalogue_visible", true)
    .eq("active", true);

  const { data: offresRaw, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const offres = offresRaw ?? [];

  // ── Fetch avis stats for visible offres ───────────────────
  const offreIds = offres.map((o) => o.id);
  const { data: avisRaw } = offreIds.length > 0
    ? await supabase.from("avis").select("offre_id, note, recommande").in("offre_id", offreIds).eq("publie", true)
    : { data: [] as { offre_id: string; note: number | null; recommande: boolean | null }[] };

  const statsMap = new Map<string, { nb: number; sum: number; recommandes: number }>();
  for (const a of avisRaw ?? []) {
    if (!a.offre_id) continue;
    const s = statsMap.get(a.offre_id) ?? { nb: 0, sum: 0, recommandes: 0 };
    s.nb++; s.sum += a.note ?? 0; if (a.recommande) s.recommandes++;
    statsMap.set(a.offre_id, s);
  }

  // ── Enrich + filter ───────────────────────────────────────
  let enriched: OffreCatalogue[] = offres.map((o) => {
    const s = statsMap.get(o.id);
    return {
      ...o,
      tags: (o.tags as string[] | null) ?? null,
      metadata_vertical: (o.metadata_vertical as Record<string, unknown> | null) ?? null,
      prestataires: (Array.isArray(o.prestataires) ? o.prestataires[0] : o.prestataires) as OffreCatalogue["prestataires"],
      nb_avis: s?.nb ?? 0,
      note_moyenne: s && s.nb > 0 ? s.sum / s.nb : null,
      pct_recommande: s && s.nb > 0 ? Math.round(s.recommandes / s.nb * 100) : null,
    };
  });

  // Recherche texte
  if (q) {
    const ql = q.toLowerCase();
    enriched = enriched.filter((o) =>
      o.titre.toLowerCase().includes(ql) ||
      (o.description_courte ?? "").toLowerCase().includes(ql) ||
      (o.tags ?? []).some((t) => t.toLowerCase().includes(ql)) ||
      (o.categorie ?? "").toLowerCase().includes(ql)
    );
  }

  // Catégorie
  if (categories.length > 0) {
    enriched = enriched.filter((o) => o.categorie && categories.includes(o.categorie));
  }

  // Format
  if (formats.length > 0) {
    enriched = enriched.filter((o) => o.format && formats.includes(o.format));
  }

  // Niveau
  if (niveaux.length > 0) {
    enriched = enriched.filter((o) => o.niveau && niveaux.includes(o.niveau));
  }

  // Note minimum
  if (note_min > 0) {
    enriched = enriched.filter((o) => o.note_moyenne !== null && o.note_moyenne >= note_min);
  }

  // CPF
  if (cpf) {
    enriched = enriched.filter((o) => (o.metadata_vertical as Record<string, unknown> | null)?.cpf === true);
  }

  // Prix
  if (prix_range) {
    enriched = enriched.filter((o) => {
      const p = o.prix;
      if (prix_range === "gratuit")   return p === 0;
      if (prix_range === "moins_500") return p !== null && p > 0 && p < 500;
      if (prix_range === "500_1500")  return p !== null && p >= 500 && p <= 1500;
      if (prix_range === "plus_1500") return p !== null && p > 1500;
      if (prix_range === "nc")        return p === null;
      return true;
    });
  }

  // ── Tri ───────────────────────────────────────────────────
  if (tri === "mieux_notees") {
    enriched.sort((a, b) => (b.note_moyenne ?? 0) - (a.note_moyenne ?? 0));
  } else if (tri === "plus_avis") {
    enriched.sort((a, b) => b.nb_avis - a.nb_avis);
  } else if (tri === "recentes") {
    enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else {
    // pertinence : score combiné note * 0.7 + log(nb_avis+1) * 0.3
    enriched.sort((a, b) => {
      const scoreA = (a.note_moyenne ?? 0) * 0.7 + Math.log(a.nb_avis + 1) * 0.3;
      const scoreB = (b.note_moyenne ?? 0) * 0.7 + Math.log(b.nb_avis + 1) * 0.3;
      return scoreB - scoreA;
    });
  }

  // ── Pagination ────────────────────────────────────────────
  const total = enriched.length;
  const total_pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginated = enriched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return NextResponse.json({ offres: paginated, total, page, total_pages });
}
