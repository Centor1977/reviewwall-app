import Link from "next/link";
import { appConfig } from "@/config/app";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* À propos */}
          <div>
            <p className="mb-2 text-sm font-bold text-white">{appConfig.name}</p>
            <p className="text-xs leading-relaxed text-slate-400">
              {appConfig.tagline}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              La preuve sociale qui convertit
            </p>
          </div>

          {/* Produit */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Produit
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/catalogue"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Catalogue
                </Link>
              </li>
              <li>
                <Link
                  href="/formateurs"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Pour les formateurs
                </Link>
              </li>
              <li>
                <Link
                  href="/formateurs#tarifs"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Tarifs
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Légal
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/cgu"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  CGU
                </Link>
              </li>
              <li>
                <Link
                  href="/confidentialite"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Contact
            </p>
            <a
              href={`mailto:${appConfig.supportEmail}`}
              className="text-sm text-slate-400 transition-colors hover:text-white"
            >
              {appConfig.supportEmail}
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-700 pt-6 text-center text-xs text-slate-500">
          © 2026 {appConfig.name} — Tous droits réservés
        </div>
      </div>
    </footer>
  );
}
