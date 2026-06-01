import { Fragment } from "react";
import Link from "next/link";
import { appConfig } from "@/config/app";

export const metadata = {
  title: `${appConfig.name} — Pour les formateurs`,
  description:
    "Collectez des avis profilés sur vos formations, affichez-les avec un widget intelligent et couvrez vos indicateurs Qualiopi.",
};

export default function FormateursPage() {
  const name = appConfig.name;

  return (
    <div className="mx-auto max-w-3xl bg-white">
      {/* HERO */}
      <section className="border-b border-slate-100 px-6 pb-10 pt-12">
        <span className="mb-3 inline-block rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
          Pour les formateurs et organismes de formation
        </span>
        <h1 className="mb-3 text-3xl font-medium leading-tight text-slate-900">
          La preuve sociale qui convertit —{" "}
          <span className="text-blue-600">vos formations le méritent</span>
        </h1>
        <p className="mb-8 max-w-xl text-[15px] leading-relaxed text-slate-500">
          {name} collecte des avis profilés sur vos formations —{" "}
          <strong className="font-medium text-slate-900">
            secteur d'origine, niveau de départ, objectif déclaré.
          </strong>{" "}
          Vos futurs apprenants lisent des retours de gens qui leur ressemblent.
          Vous savez enfin qui réussit chez vous.
        </p>
        <div className="mb-8 flex flex-wrap gap-2">
          {[
            "Avis sur les formations, pas les organismes",
            "Sans carte bancaire",
            "Compte en 3 minutes",
            "Collecte Qualiopi incluse (Pro)",
          ].map((pill) => (
            <span
              key={pill}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-600"
            >
              <span className="font-semibold text-emerald-600">✓</span>
              {pill}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/register"
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
          >
            Rejoindre la beta gratuite →
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50 transition-colors"
          >
            Voir comment ça marche
          </Link>
        </div>
      </section>

      {/* PROBLÈME */}
      <section className="bg-slate-50 px-6 py-10">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-slate-400">
          Le problème
        </p>
        <h2 className="mb-4 text-xl font-medium text-slate-900">
          Votre Google Form ne travaille pas pour vous
        </h2>
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-6">
          <p className="mb-3.5 flex items-center gap-1.5 text-sm font-medium text-amber-900">
            ↔ {name} remplace votre Google Form de fin de formation
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                Avec Google Form
              </p>
              {[
                "Données inutilisables pour vos prospects",
                "Aucune preuve sociale générée",
                "Pas de couverture Qualiopi",
                "Taux de réponse faible",
                "Aucun insight par profil apprenant",
              ].map((item) => (
                <div key={item} className="mb-1 flex items-start gap-1.5 text-xs text-amber-800">
                  <span className="mt-0.5 shrink-0 font-bold text-red-600">✕</span>
                  {item}
                </div>
              ))}
            </div>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                Avec {name}
              </p>
              {[
                "Avis profilés visibles sur votre site",
                "Preuve sociale qui convertit",
                "Collecte Qualiopi intégrée (Pro)",
                "Collecte automatisée J+7 / J+30",
                "Dashboard segmentation par profil",
              ].map((item) => (
                <div key={item} className="mb-1 flex items-start gap-1.5 text-xs text-emerald-800">
                  <span className="mt-0.5 shrink-0 font-bold text-emerald-600">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4 VALEURS */}
      <section className="px-6 py-10">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-slate-400">
          Ce que vous obtenez
        </p>
        <h2 className="mb-5 text-xl font-medium text-slate-900">
          Quatre raisons de choisir {name}
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            {
              num: "01",
              accent: "bg-blue-600",
              title: "Avis profilés sur vos formations",
              desc: "Chaque avis affiche le profil déclaré de l'apprenant — secteur, niveau, objectif. Vos prospects lisent des retours de gens qui leur ressemblent exactement.",
            },
            {
              num: "02",
              accent: "bg-indigo-700",
              bg: "bg-indigo-50 border-indigo-200",
              titleColor: "text-indigo-900",
              descColor: "text-indigo-700",
              title: "Collecte Qualiopi sans friction",
              desc: "Templates de collecte conformes au référentiel Qualiopi pour vos indicateurs de résultats (indicateur 2). Dashboard exportable pour vos audits.",
            },
            {
              num: "03",
              accent: "bg-emerald-600",
              title: "Widget intelligent sur votre site",
              desc: "Copier-coller, compatible tous CMS. Remonte automatiquement les avis les plus pertinents pour chaque visiteur selon son profil détecté.",
            },
            {
              num: "04",
              accent: "bg-blue-900",
              title: "Leads depuis notre catalogue",
              desc: `Votre formation est référencée sur ${name.toLowerCase()}.fr. Chaque avis collecté améliore votre position et génère du trafic qualifié vers vous.`,
            },
          ].map((card) => (
            <div
              key={card.num}
              className={`relative overflow-hidden rounded-xl border border-slate-200 p-5 ${card.bg ?? "bg-white"}`}
            >
              <div className={`absolute left-0 top-0 h-full w-0.5 ${card.accent}`} />
              <div className="pl-2.5">
                <p className="mb-2 text-[11px] font-semibold tracking-widest text-slate-300">
                  {card.num}
                </p>
                <p className={`mb-1 text-sm font-semibold ${card.titleColor ?? "text-slate-900"}`}>
                  {card.title}
                </p>
                <p className={`text-xs leading-relaxed ${card.descColor ?? "text-slate-500"}`}>
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WIDGET VISUEL */}
      <section className="bg-slate-50 px-6 py-10">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-slate-400">
          Outil n°1
        </p>
        <h2 className="mb-2 text-xl font-medium text-slate-900">
          Le widget — vos avis sur votre site, enfin utiles
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-slate-500">
          Un snippet à copier-coller sur votre page de formation. Compatible
          WordPress, Teachizy, Systeme.io, Learnybox et tout site custom. En
          plan Pro : le widget détecte le profil du visiteur et remonte
          silencieusement les avis les plus pertinents — sans aucun score visible
          qui créerait du doute.
        </p>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
          <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2.5">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <span className="ml-2 text-[11px] text-slate-400">
              votre-site.fr/ma-formation
            </span>
          </div>
          <div className="p-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Formation développeur web
                  </p>
                  <p className="text-sm text-amber-600">★★★★★</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    4,8 · 38 avis profilés vérifiés
                  </p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-800">
                  ✦ Certifié {name}
                </span>
              </div>
              {[
                {
                  stars: "★★★★★",
                  text: `"Reconversion réussie en 10 semaines depuis le secteur santé. Zéro base au départ, app complète à la fin. Les projets hebdomadaires ont été décisifs dans ma progression."`,
                  tags: ["Santé → Dev", "Débutant complet", "Reconversion"],
                },
                {
                  stars: "★★★★☆",
                  text: `"Intensif mais efficace. Venant de l'industrie avec quelques bases, j'ai décroché un poste dev junior en 2 mois. Prévoir 2 semaines de prépa si débutant complet."`,
                  tags: ["Industrie → Dev", "Quelques bases"],
                },
              ].map((avis, i) => (
                <div
                  key={i}
                  className="mb-1.5 last:mb-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5"
                >
                  <p className="mb-1 text-[11px] text-amber-600">{avis.stars}</p>
                  <p className="mb-1.5 text-xs leading-relaxed text-slate-900">
                    {avis.text}
                  </p>
                  <div className="mb-1 flex flex-wrap gap-1">
                    {avis.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                    ✓ Vérifié LMS
                  </span>
                </div>
              ))}
              <p className="mt-2.5 border-t border-slate-200 pt-2 text-center text-[10px] text-indigo-400">
                Propulsé par {name} · Voir les 38 avis →
              </p>
            </div>
            <p className="mt-2.5 text-center text-xs italic text-slate-400">
              Tri silencieux par profil visiteur (Pro) — aucun score affiché,
              conversion maximale
            </p>
          </div>
        </div>
      </section>

      {/* DASHBOARD VISUEL */}
      <section className="px-6 py-10">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-slate-400">
          Outil n°2
        </p>
        <h2 className="mb-2 text-xl font-medium text-slate-900">
          Le dashboard — ce que vos avis vous apprennent vraiment
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-slate-500">
          Segmentation par profil, taux de réussite par niveau, leads générés
          depuis le catalogue. Et depuis la v2 : insights sur les dimensions
          inférées par IA — ce que vos apprenants ne vous disent pas mais que
          leurs réponses révèlent.
        </p>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
          <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2.5">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <span className="ml-2 text-[11px] text-slate-400">
              app.{name.toLowerCase()}.fr · Dashboard formateur
            </span>
          </div>
          <div className="p-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  Formation développeur web · Capsule Lille
                </p>
                <span className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-500">
                  30 derniers jours
                </span>
              </div>
              <div className="mb-3 grid grid-cols-4 gap-1.5">
                {[
                  { val: "38", color: "text-blue-600", label: "avis profilés" },
                  { val: "4,8", color: "text-slate-900", label: "note moyenne" },
                  { val: "14", color: "text-emerald-600", label: "leads catalogue" },
                  { val: "94%", color: "text-blue-900", label: "taux complétion" },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-center"
                  >
                    <p className={`text-xl font-semibold ${kpi.color}`}>
                      {kpi.val}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-tight text-slate-400">
                      {kpi.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    title: "Note par secteur d'origine",
                    bars: [
                      { label: "Santé", pct: 96, val: "4,8", color: "bg-blue-500" },
                      { label: "Services", pct: 92, val: "4,6", color: "bg-blue-500" },
                      { label: "Industrie", pct: 88, val: "4,4", color: "bg-blue-500" },
                      { label: "Admin", pct: 84, val: "4,2", color: "bg-blue-500" },
                    ],
                  },
                  {
                    title: "Réussite par niveau de départ",
                    bars: [
                      { label: "Intermédiaire", pct: 98, val: "98%", color: "bg-emerald-500" },
                      { label: "Quelques bases", pct: 94, val: "94%", color: "bg-emerald-500" },
                      { label: "Zéro base", pct: 78, val: "78%", color: "bg-emerald-500" },
                    ],
                  },
                ].map((chart) => (
                  <div
                    key={chart.title}
                    className="rounded-lg border border-slate-200 bg-white p-2.5"
                  >
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {chart.title}
                    </p>
                    {chart.bars.map((bar) => (
                      <div
                        key={bar.label}
                        className="mb-1.5 flex items-center gap-1.5"
                      >
                        <span className="w-16 shrink-0 text-[10px] leading-tight text-slate-500">
                          {bar.label}
                        </span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-1.5 rounded-full ${bar.color}`}
                            style={{ width: `${bar.pct}%` }}
                          />
                        </div>
                        <span className="w-7 text-right text-[10px] font-semibold text-slate-900">
                          {bar.val}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-2.5 text-center text-xs italic text-slate-400">
              Ces données permettent d'adapter vos prérequis, votre page de vente
              et vos campagnes de collecte.
            </p>
          </div>
        </div>
      </section>

      {/* QUESTIONS IA */}
      <section className="bg-slate-50 px-6 py-10">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-slate-400">
          Outil n°3
        </p>
        <h2 className="mb-2 text-xl font-medium text-slate-900">
          Questions formateurs — validées par IA en 2 secondes
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-slate-500">
          Ajoutez vos propres questions au formulaire d'avis. Chaque question est
          analysée par l'IA avant publication : biais de formulation, conformité
          RGPD, redondance avec le profil {name}. Et les réponses enrichissent
          silencieusement le profil de matching de vos apprenants.
        </p>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
          <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2.5">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <span className="ml-2 text-[11px] text-slate-400">
              app.{name.toLowerCase()}.fr · Questions formateurs
            </span>
          </div>
          <div className="p-5">
            <div className="mb-3.5 rounded-lg border-l-4 border-blue-500 bg-slate-100 px-3 py-2.5 text-xs leading-relaxed text-slate-500">
              ✦ Vos questions enrichissent le profil de matching de l'apprenant — sans jamais lui en demander plus.
            </div>

            <div className="mb-2.5">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Question soumise par le formateur
              </p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900">
                "Cette formation était-elle adaptée à votre niveau ?"
              </div>
            </div>
            <div className="mb-1 flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-2 text-[11px] font-semibold text-amber-800">
              ⚠ Attention · Formulation orientée positivement
            </div>
            <div className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-2 text-[11px] leading-relaxed text-indigo-800">
              <strong className="block font-semibold">
                Suggestion de reformulation automatique :
              </strong>
              "Le niveau de cette formation par rapport à vous, c'était ?" — Options : Trop simple / Bien calibré / Challengeant / Trop difficile
            </div>

            <div className="mb-1 mt-1">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Deuxième question
              </p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900">
                "Quel est votre secteur d'activité ?"
              </div>
            </div>
            <div className="mb-4 flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-2 text-[11px] font-semibold text-emerald-800">
              ✓ Valide · Enrichit le profil apprenant · Non redondante
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  badge: "Publique",
                  badgeCls: "bg-indigo-100 text-indigo-800",
                  title: "Visible sur l'avis",
                  desc: `Enrichit le profil + badge affiché sur l'avis public. Starter : 1 (bibliothèque), Pro : 3 (custom).`,
                },
                {
                  badge: "Privée feedback",
                  badgeCls: "bg-blue-100 text-blue-800",
                  title: "Dashboard uniquement",
                  desc: "Vos questions de satisfaction. Remplace votre Google Form. Starter : 3, Pro : 7, Scale : illimitées.",
                },
                {
                  badge: "Qualiopi",
                  badgeCls: "bg-emerald-100 text-emerald-800",
                  title: "Templates conformes",
                  desc: "Collecte structurée pour l'indicateur 2 (résultats). Taux d'abandon calculé automatiquement. Pro uniquement.",
                },
              ].map((qt) => (
                <div
                  key={qt.badge}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-2.5"
                >
                  <span
                    className={`mb-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${qt.badgeCls}`}
                  >
                    {qt.badge}
                  </span>
                  <p className="mb-1 text-xs font-semibold text-slate-900">
                    {qt.title}
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    {qt.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AGRÉGATEUR */}
      <section className="bg-slate-50 px-6 py-10">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-slate-400">
          Double valeur
        </p>
        <h2 className="mb-4 text-xl font-medium text-slate-900">
          Chaque avis travaille deux fois pour vous
        </h2>
        <div className="rounded-xl border-2 border-blue-200 bg-white p-6">
          <span className="mb-2.5 inline-block rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-800">
            Exclusif {name}
          </span>
          <h3 className="mb-1.5 text-[15px] font-semibold text-slate-900">
            Widget sur votre site + référencement sur notre catalogue
          </h3>
          <p className="mb-4 text-sm leading-relaxed text-slate-500">
            En collectant des avis avec {name}, vous alimentez automatiquement
            votre fiche sur {name.toLowerCase()}.fr — notre catalogue de
            formations profilées. Les apprenants qui cherchent une formation
            trouvent les vôtres, lisent vos avis, et cliquent vers vous. Plus
            vous avez d'avis profilés, meilleure est votre position dans le
            catalogue.
          </p>
          <div className="flex flex-wrap items-center gap-1">
            {[
              { label: "Vous collectez", sub: "un avis profilé" },
              { label: "Fiche enrichie", sub: `sur ${name.toLowerCase()}.fr` },
              { label: "Apprenant qualifié", sub: "vous trouve" },
              { label: "Lead qualifié", sub: "vers votre page" },
            ].map((step, i, arr) => (
              <Fragment key={step.label}>
                <div
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-[11px]"
                >
                  <strong className="block text-xs font-semibold text-slate-900">
                    {step.label}
                  </strong>
                  <span className="text-slate-500">{step.sub}</span>
                </div>
                {i < arr.length - 1 && (
                  <span className="shrink-0 text-slate-300">→</span>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARATIF */}
      <section className="bg-slate-50 px-6 py-10">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-slate-400">
          Comparatif
        </p>
        <h2 className="mb-2 text-xl font-medium text-slate-900">
          {name} face aux alternatives du marché
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-slate-500">
          Les outils existants ne sont pas pensés pour la spécificité de la
          formation en ligne. Voici ce qui distingue {name} — et ce qui manque
          ailleurs.
        </p>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <div className="grid min-w-[640px]" style={{ gridTemplateColumns: "1.4fr repeat(4,1fr) 1.2fr" }}>
              {/* Header */}
              {["Critère", "Google Form", "Trustpilot", "Satisfyy", "Digiforma", name].map(
                (h, i) => (
                  <div
                    key={h}
                    className={`border-r border-slate-800 px-3 py-3.5 text-center text-[11px] font-semibold leading-tight ${
                      i === 0
                        ? "bg-slate-900 text-left text-white pl-3.5"
                        : i === 5
                        ? "border-r-0 bg-indigo-800 text-white"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    {i === 5 && (
                      <span className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wider text-indigo-300">
                        ✦ Recommandé
                      </span>
                    )}
                    {h}
                    {i === 1 && <span className="mt-0.5 block text-[10px] font-normal text-slate-400">DIY</span>}
                    {i === 2 && <span className="mt-0.5 block text-[10px] font-normal text-slate-400">Avis génériques</span>}
                    {i === 3 && <span className="mt-0.5 block text-[10px] font-normal text-slate-400">Avis formation</span>}
                    {i === 4 && <span className="mt-0.5 block text-[10px] font-normal text-slate-400">Gestion OF</span>}
                    {i === 5 && <span className="mt-0.5 block text-[10px] font-normal text-indigo-300">La solution dédiée</span>}
                  </div>
                )
              )}
              {/* Rows */}
              {[
                {
                  crit: "Avis sur la formation, pas sur l'organisme",
                  cols: ["—", "✕", "~", "✕", "✓"],
                  subs: ["", "Notation entité", "Partiel", "", "Cœur du modèle"],
                },
                {
                  crit: "Profil apprenant déclaré sous chaque avis",
                  cols: ["✕", "✕", "✕", "✕", "✓"],
                  subs: ["", "", "", "", "35 dimensions"],
                },
                {
                  crit: "Conformité Qualiopi indicateur 2",
                  cols: ["—", "✕", "~", "✓", "✓"],
                  subs: ["À construire", "", "Selon plan", "Module dédié", "Inclus (Pro)"],
                },
                {
                  crit: "Widget de matching dynamique par visiteur",
                  cols: ["✕", "~", "~", "✕", "✓"],
                  subs: ["", "Widget statique", "Widget statique", "", "Unique sur le marché"],
                },
                {
                  crit: "Catalogue agrégateur générateur de leads",
                  cols: ["✕", "✕", "✕", "✕", "✓"],
                  subs: ["", "Pas formation", "", "Outil interne", `${name.toLowerCase()}.fr`],
                },
                {
                  crit: "Anti-fraude renforcé",
                  cols: ["✕", "~", "~", "~", "✓"],
                  subs: ["", "Avis achetables", "", "", "Token unique + IA"],
                },
                {
                  crit: "Spécialisation formation en ligne francophone",
                  cols: ["—", "✕", "✓", "✓", "✓"],
                  subs: ["", "Généraliste", "", "OF français", "100% formation"],
                },
                {
                  crit: "Modèle économique accessible aux indépendants",
                  cols: ["✓", "✕", "~", "✕", "✓"],
                  subs: ["Gratuit mais limité", "~99 €+/mois", "49-149 €/mois", "59-119 €/mois", "Freemium + Starter"],
                },
              ].map((row, ri) =>
                [row.crit, ...row.cols].map((cell, ci) => (
                  <div
                    key={`${ri}-${ci}`}
                    className={`flex items-center justify-center border-b border-r border-slate-100 px-2 py-3 text-[11px] leading-tight ${
                      ci === 0
                        ? "justify-start pl-3.5 font-medium text-slate-900"
                        : ci === 5
                        ? "border-r-0 bg-indigo-50 font-semibold text-indigo-900"
                        : "text-slate-500"
                    }`}
                  >
                    <span className="flex flex-col items-center gap-0.5">
                      <span
                        className={
                          cell === "✓"
                            ? "text-[15px] font-bold text-emerald-600"
                            : cell === "✕"
                            ? "text-sm font-semibold text-slate-300"
                            : cell === "~"
                            ? "text-sm font-semibold text-amber-600"
                            : ""
                        }
                      >
                        {ci === 0 ? cell : cell}
                      </span>
                      {ci > 0 && row.subs[ci - 1] && (
                        <span className="text-[9.5px] text-slate-400">
                          {row.subs[ci - 1]}
                        </span>
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="border-t border-slate-100 bg-slate-50 px-3.5 py-3.5 text-[11px] italic leading-relaxed text-slate-500">
            Le constat est simple : aucun outil existant ne combine avis profilés,
            widget intelligent, conformité Qualiopi et catalogue générateur de
            leads. {name} n'est ni un Trustpilot bis ni un Digiforma — c'est une
            catégorie pensée pour la spécificité de la formation en ligne.
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] italic text-slate-400">
          Positionnement marché vérifié au moment du lancement — mai 2026.
        </p>
      </section>

      {/* PLANS */}
      <section className="px-6 py-10">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-slate-400">
          L'offre
        </p>
        <h2 className="mb-4 text-xl font-medium text-slate-900">
          Quatre plans, une seule logique : la valeur d'abord
        </h2>

        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
          <span className="shrink-0 text-sm">✦</span>
          <p className="text-xs leading-relaxed text-amber-900">
            <strong>Tarification en cours d'arbitrage</strong> avec les 10
            premiers formateurs partenaires. Les beta-testeurs gardent un accès
            Pro offert pendant 18 mois, et leur feedback détermine la grille
            finale. Aucun prix n'est figé tant que le produit n'est pas validé
            sur le terrain.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            {
              badge: "Gratuit",
              badgeCls: "bg-slate-100 text-slate-500",
              name: "Freemium",
              desc: "Pour découvrir sans engagement",
              items: [
                { ok: true, star: false, text: "1 formation" },
                { ok: true, star: false, text: "Widget basique" },
                { ok: true, star: false, text: "Fiche catalogue" },
                { ok: false, star: false, text: "Questions privées" },
                { ok: false, star: false, text: "Questions publiques" },
                { ok: false, star: false, text: "Collecte Qualiopi" },
              ],
              pro: false,
            },
            {
              badge: "Starter",
              badgeCls: "bg-blue-100 text-blue-800",
              name: "Starter",
              desc: "Formateurs indépendants",
              items: [
                { ok: true, star: false, text: "Formations illimitées" },
                { ok: true, star: false, text: "1 question publique (bibliothèque)" },
                { ok: true, star: false, text: "3 questions privées" },
                { ok: true, star: false, text: "Analytics basiques" },
                { ok: true, star: false, text: "Badges détaillés" },
                { ok: false, star: false, text: "Collecte Qualiopi" },
              ],
              pro: false,
            },
            {
              badge: "Pro ✦",
              badgeCls: "bg-indigo-100 text-indigo-800",
              name: "Pro",
              desc: "OF certifiés Qualiopi",
              items: [
                { ok: true, star: false, text: "Tout Starter" },
                { ok: false, star: true, text: "3 questions publiques (custom + IA)" },
                { ok: false, star: true, text: "7 questions privées" },
                { ok: false, star: true, text: "Collecte Qualiopi (indicateur 2)" },
                { ok: false, star: true, text: "Widget matching dynamique" },
                { ok: false, star: true, text: "Badge Certifié " + name },
                { ok: false, star: true, text: "Campagnes J+7 / J+30" },
                { ok: false, star: true, text: "Analytics profilés avancés" },
              ],
              pro: true,
            },
            {
              badge: "Scale",
              badgeCls: "bg-emerald-100 text-emerald-800",
              name: "Scale",
              desc: "Grands organismes",
              items: [
                { ok: true, star: false, text: "Tout Pro" },
                { ok: true, star: false, text: "Questions privées illimitées" },
                { ok: true, star: false, text: "Export CSV segmenté" },
                { ok: true, star: false, text: "API + webhooks" },
                { ok: true, star: false, text: "Mode headless" },
                { ok: true, star: false, text: "CSM dédié" },
              ],
              pro: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-4 ${
                plan.pro
                  ? "border-2 border-indigo-400 shadow-lg shadow-indigo-100"
                  : "border-slate-200 bg-white"
              }`}
            >
              {plan.pro && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white whitespace-nowrap">
                  ★ Le plus complet
                </span>
              )}
              <span
                className={`mb-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${plan.badgeCls}`}
              >
                {plan.badge}
              </span>
              <p className="text-sm font-semibold text-slate-900">{plan.name}</p>
              <p className="mb-2.5 text-[11px] leading-tight text-slate-400">
                {plan.desc}
              </p>
              {plan.items.map((item) => (
                <div
                  key={item.text}
                  className="mb-1 flex items-start gap-1 text-[11px] leading-tight text-slate-500"
                >
                  <span
                    className={`mt-0.5 shrink-0 text-xs ${
                      item.star
                        ? "text-blue-500"
                        : item.ok
                        ? "text-emerald-500"
                        : "text-slate-300"
                    }`}
                  >
                    {item.star ? "★" : item.ok ? "✓" : "✕"}
                  </span>
                  {item.text}
                </div>
              ))}
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-400">
          → Les beta-formateurs accèdent au plan Pro complet, offert pendant 18 mois
        </p>
      </section>

      {/* BETA */}
      <section className="bg-slate-50 px-6 py-10">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-slate-400">
          Accès anticipé · L'offre concrète
        </p>
        <h2 className="mb-4 text-xl font-medium text-slate-900">
          Devenez l'un des 10 formateurs qui construisent {name}
        </h2>
        <div className="rounded-xl bg-slate-900 p-6 text-white">
          <span className="mb-3 inline-block rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white">
            Beta — places limitées
          </span>
          <h3 className="mb-2 text-base font-medium">
            Plan Pro complet, offert 18 mois. Vous co-construisez le produit.
          </h3>
          <p className="mb-4 text-sm leading-relaxed text-slate-400">
            Le produit est en développement actif. Plutôt que de figer une grille
            tarifaire dans le vide, nous construisons l'offre avec ceux qui vont
            l'utiliser. Les 10 premiers formateurs partenaires obtiennent un accès
            Pro offert sur 18 mois, et leur retour détermine la grille définitive.
          </p>
          <div className="mb-4 grid grid-cols-2 gap-1.5">
            {[
              "18 mois de plan Pro offerts (sans plafond)",
              "Tarif grandfathered à vie après la beta",
              "Accès prioritaire à toutes les nouvelles fonctionnalités",
              "Voix directe sur le développement produit",
              "Support direct du fondateur (Slack privé)",
              "Référencement prioritaire dans le catalogue",
            ].map((av) => (
              <div key={av} className="flex items-start gap-1.5 text-xs text-slate-300">
                <span className="shrink-0 font-bold text-blue-400">✦</span>
                {av}
              </div>
            ))}
          </div>
          <div className="mb-4 flex items-center justify-between rounded-lg bg-slate-800 px-3.5 py-2.5">
            <span className="text-xs text-slate-400">Places disponibles sur 10</span>
            <span className="text-sm font-semibold text-indigo-300">
              7 places restantes
            </span>
          </div>
          <Link
            href="/register"
            className="block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Je candidate →
          </Link>
          <p className="mt-2 text-center text-[11px] text-slate-600">
            Sans engagement · Sans carte bancaire · Réponse sous 24h · Entretien de 20 min ensuite
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-10">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-slate-400">
          Questions fréquentes
        </p>
        <h2 className="mb-4 text-xl font-medium text-slate-900">
          On répond aux objections habituelles
        </h2>
        <div className="divide-y divide-slate-100">
          {[
            {
              q: `Quelle différence avec Google Avis ou Trustpilot ?`,
              a: `Google et Trustpilot notent les entreprises. ${name} note les formations — chaque avis est attaché à une formation précise, pas à votre organisme. Et chaque avis affiche le profil déclaré de l'apprenant : secteur d'origine, niveau de départ, objectif visé.`,
            },
            {
              q: `Est-ce que ${name} couvre vraiment Qualiopi ?`,
              a: `Oui — le plan Pro inclut des templates de collecte conformes au référentiel Qualiopi, notamment pour documenter vos indicateurs de résultats (indicateur 2). Les données sont stockées dans votre dashboard, le taux d'abandon est calculé automatiquement, et tout est exportable pour vos audits.`,
            },
            {
              q: `Que se passe-t-il avec les réponses à mes questions privées ?`,
              a: `Vos questions privées vous appartiennent — les réponses brutes restent dans votre dashboard et ne sont jamais transmises à d'autres formateurs. Mais l'IA en extrait des signaux de profil qui enrichissent silencieusement le profil de matching de l'apprenant.`,
            },
            {
              q: `L'IA valide mes questions — concrètement ça fait quoi ?`,
              a: `En moins de 2 secondes, chaque question soumise est analysée sur 5 axes : biais de formulation, données sensibles RGPD, hors sujet formation, format non exploitable, redondance avec le profil ${name} existant. Si un problème est détecté, une reformulation vous est proposée automatiquement.`,
            },
            {
              q: `Pourquoi aucun prix n'est affiché sur cette page ?`,
              a: `Parce que nous n'avons pas encore validé la grille définitive sur le terrain. La tarification se construit avec les 10 premiers formateurs partenaires — ils ont l'accès Pro offert pendant 18 mois, et leur retour détermine les prix.`,
            },
            {
              q: `En quoi ${name} est-il différent de Digiforma ou Satisfyy ?`,
              a: `Digiforma est un outil de gestion d'organisme de formation — il couvre Qualiopi, mais ne gère ni les avis profilés, ni le matching dynamique, ni le catalogue agrégateur. Satisfyy collecte des avis formation mais sans profil apprenant déclaré et sans canal d'acquisition. ${name} combine les trois axes que ces outils traitent séparément.`,
            },
            {
              q: `Mes apprenants doivent-ils créer un compte pour laisser un avis ?`,
              a: `Non — ils reçoivent un lien unique par email et répondent en 2 minutes sans inscription. La création de compte est optionnelle et enrichit leur profil pour les prochains avis.`,
            },
            {
              q: `Combien de temps pour intégrer le widget ?`,
              a: `5 minutes — un snippet JS à copier-coller, compatible WordPress, Teachizy, Systeme.io, Learnybox et tout site custom.`,
            },
            {
              q: `Le produit existe déjà ?`,
              a: `${name} est en développement actif. Les formateurs qui rejoignent la beta maintenant co-construisent le produit et obtiennent 18 mois de plan Pro offerts en échange de leur retour.`,
            },
          ].map((faq) => (
            <div key={faq.q} className="py-3">
              <p className="mb-1 text-sm font-semibold text-slate-900">{faq.q}</p>
              <p className="text-xs leading-relaxed text-slate-500">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="border-t border-slate-100 bg-slate-50 px-6 py-10 text-center">
        <h2 className="mb-2 text-xl font-medium text-slate-900">
          Prêt à transformer vos avis en moteur de croissance ?
        </h2>
        <p className="mb-6 text-sm text-slate-500">
          Rejoignez les formateurs qui co-construisent {name} — 18 mois de plan Pro offerts.
        </p>
        <Link
          href="/register"
          className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Rejoindre la beta gratuite →
        </Link>
      </section>
    </div>
  );
}
