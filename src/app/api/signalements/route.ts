import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSignalementAdmin } from "@/lib/email/send";

const RAISONS_VALIDES = ["spam", "faux_avis", "contenu_inapproprie", "autre"];

// Rate limiting léger — 5 signalements par IP par heure
// Stocké en mémoire : fonctionne en dev ; sur Vercel multi-instance, remplacer par Upstash Redis.
const ipCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipCounts.get(ip);
  if (!entry || entry.resetAt < now) {
    ipCounts.set(ip, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Trop de signalements. Réessayez dans une heure." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }

  const { avisId, raison, detail } = body as Record<string, unknown>;

  if (typeof avisId !== "string" || !avisId) {
    return NextResponse.json({ error: "avisId requis." }, { status: 400 });
  }
  if (typeof raison !== "string" || !RAISONS_VALIDES.includes(raison)) {
    return NextResponse.json({ error: "Raison invalide." }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  // Vérifie que l'avis existe et récupère l'extrait pour l'email
  const { data: avis } = await supabase
    .from("avis")
    .select("id, avis_texte")
    .eq("id", avisId)
    .maybeSingle();

  if (!avis) {
    return NextResponse.json({ error: "Avis introuvable." }, { status: 404 });
  }

  const { error } = await supabase.from("signalements").insert({
    avis_id: avisId,
    raison,
    detail: typeof detail === "string" ? detail : null,
  });

  if (error) {
    console.error("[signalements] insert failed", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

  // Notification email admin — fire-and-forget
  sendSignalementAdmin({
    avisId,
    avisExtrait: avis.avis_texte?.slice(0, 200) ?? "",
    raison,
    detail: typeof detail === "string" ? detail : "",
  }).catch((e) => console.error("[signalements] email failed", e));

  return NextResponse.json({ ok: true });
}
