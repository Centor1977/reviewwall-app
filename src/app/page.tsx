import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { appConfig } from "@/config/app";
import { Star, BarChart3, Link2, BookOpen } from "lucide-react";

const CATALOGUE_PUBLIC = process.env.CATALOGUE_PUBLIC === "true";

async function getTopOffres() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { data: offres } = await supabase
      .from("offres")
      .select("id, titre, slug, description_courte, image_url")
      .eq("catalogue_visible", true)
      .eq("active", true)
      .limit(3);
    return offres ?? [];
  } catch { return []; }
}

export default async function HomePage() {
  const name = appConfig.name;
  const topOffres = await getTopOffres();

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      {/* Nav */}
      <header className="border-b border-slate-100">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <span className="text-base font-semibold text-slate-900">{name}</span>
          <div className="flex items-center gap-3">
            {CATALOGUE_PUBLIC && (
              <Link
                href="/catalogue"
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Catalogue
              </Link>
            )}
            <Link
              href="/formateurs"
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              Pour les formateurs
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <span className="mb-4 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
          Bêta gratuite — places limitées
        </span>
        <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Des avis qui{" "}
          <span className="text-blue-600">parlent à vos futurs apprenants</span>
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-lg text-slate-500">
          {name} collecte des avis profilés sur vos formations — secteur, niveau,
          objectif déclaré. Vos prospects lisent des retours de gens qui leur
          ressemblent. Vous savez enfin qui réussit chez vous.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Essayer gratuitement →
          </Link>
          <Link
            href="/formateurs"
            className="rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Voir comment ça marche
          </Link>
        </div>

        {/* 3 bénéfices */}
        <div className="mx-auto mt-20 grid max-w-4xl gap-6 sm:grid-cols-3">
          {[
            {
              icon: <Star size={20} />,
              title: "Avis profilés",
              desc: "Chaque avis affiche le secteur, le niveau et l'objectif de l'apprenant. Vos prospects lisent des retours de gens qui leur ressemblent.",
            },
            {
              icon: <Link2 size={20} />,
              title: "Widget intelligent",
              desc: "Un snippet à copier-coller sur votre page de formation. Compatible WordPress, Teachizy, Systeme.io et tout site custom.",
            },
            {
              icon: <BarChart3 size={20} />,
              title: "Dashboard & leads",
              desc: "Segmentation par profil apprenant, taux de réussite par niveau et leads qualifiés générés depuis notre catalogue.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="flex flex-col items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-6 text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                {card.icon}
              </div>
              <h3 className="font-semibold text-slate-900">{card.title}</h3>
              <p className="text-sm text-slate-500">{card.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Catalogue section */}
      {CATALOGUE_PUBLIC && topOffres.length > 0 && (
        <section className="border-t border-slate-100 bg-slate-50 px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Parcourir le catalogue</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Des formations évaluées par de vrais apprenants
                </p>
              </div>
              <Link href="/catalogue"
                className="text-sm font-medium text-blue-600 hover:underline transition">
                Voir tout le catalogue →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {topOffres.map((o) => (
                <Link key={o.id} href={`/f/${o.slug}`}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-md">
                  {o.image_url ? (
                    <img src={o.image_url} alt={o.titre}
                      className="aspect-video w-full rounded-lg object-cover" />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-slate-100">
                      <BookOpen size={24} className="text-slate-300" />
                    </div>
                  )}
                  <p className="font-medium text-slate-900 line-clamp-2">{o.titre}</p>
                  {o.description_courte && (
                    <p className="text-xs text-slate-400 line-clamp-2">{o.description_courte}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {name} —{" "}
        <a
          href={`mailto:${appConfig.supportEmail}`}
          className="hover:text-slate-600 transition-colors"
        >
          {appConfig.supportEmail}
        </a>
        {" · "}
        <Link href="/formateurs" className="hover:text-slate-600 transition-colors">
          Pour les formateurs
        </Link>
      </footer>
    </div>
  );
}
