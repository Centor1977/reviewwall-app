import { createClient } from "@supabase/supabase-js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = publicClient();

  const { data: offre } = await supabase
    .from("offres")
    .select("id, titre")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (!offre) {
    return Response.json(
      { error: "Offre introuvable" },
      { status: 404, headers: CORS }
    );
  }

  const { data: avis } = await supabase
    .from("avis")
    .select("note, avis_texte, point_fort, profil, badge, created_at")
    .eq("offre_id", offre.id)
    .eq("publie", true)
    .order("created_at", { ascending: false })
    .limit(5);

  return Response.json(
    { offre: { titre: offre.titre }, avis: avis ?? [] },
    { headers: CORS }
  );
}
