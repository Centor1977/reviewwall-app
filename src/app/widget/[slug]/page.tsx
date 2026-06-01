import { createClient } from "@supabase/supabase-js";
import { Star } from "lucide-react";

export const revalidate = 1800;

type Avis = {
  note: number | null;
  avis_texte: string | null;
  point_fort: string | null;
  profil: Record<string, string> | null;
  badge: string;
  created_at: string;
};

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-px">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          className={
            i <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-gray-200"
          }
        />
      ))}
    </span>
  );
}

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = publicClient();

  const { data: offre } = await supabase
    .from("offres")
    .select("id, titre")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (!offre) {
    return (
      <div className="flex items-center justify-center p-6 text-xs text-gray-400">
        Offre introuvable.
      </div>
    );
  }

  const { data: avis } = await supabase
    .from("avis")
    .select("note, avis_texte, point_fort, profil, badge, created_at")
    .eq("offre_id", offre.id)
    .eq("publie", true)
    .order("created_at", { ascending: false })
    .limit(5);

  const list = (avis ?? []) as Avis[];

  return (
    <div className="bg-white px-4 py-3 font-sans text-sm text-gray-800">
      {/* En-tête */}
      <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3">
        <span className="font-semibold text-gray-900 leading-tight">
          {offre.titre}
        </span>
        <span className="text-xs text-gray-400">{list.length} avis</span>
      </div>

      {list.length === 0 ? (
        <p className="py-6 text-center text-xs text-gray-400">
          Aucun avis publié.
        </p>
      ) : (
        <ul className="space-y-3">
          {list.map((a, i) => {
            const date = new Intl.DateTimeFormat("fr-FR", {
              month: "short",
              year: "numeric",
            }).format(new Date(a.created_at));

            const profilStr = Object.values(a.profil ?? {})
              .filter(Boolean)
              .slice(0, 2)
              .join(" · ");

            return (
              <li
                key={i}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <Stars rating={a.note ?? 0} />
                  <span className="text-xs text-gray-400">{date}</span>
                </div>

                {profilStr && (
                  <p className="mb-1.5 text-xs text-gray-500">{profilStr}</p>
                )}

                {a.avis_texte && (
                  <p className="mb-1.5 line-clamp-3 text-xs leading-relaxed text-gray-700">
                    {a.avis_texte}
                  </p>
                )}

                {a.point_fort && (
                  <p className="text-xs text-gray-500">
                    <span className="font-medium text-green-600">+ </span>
                    {a.point_fort}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-3 text-center text-xs text-gray-300">
        Avis via ReviewWall
      </p>
    </div>
  );
}
