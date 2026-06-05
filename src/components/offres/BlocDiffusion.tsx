"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, Code2, ExternalLink, Lock, Copy, Check } from "lucide-react";

type Props = {
  offreId: string;
  offreSlug: string;
  publicUrl: string;
  catalogueVisible: boolean;
  catalogueForce: boolean;
  iframeCode: string;
};

export function BlocDiffusion({
  offreId,
  offreSlug,
  publicUrl,
  catalogueVisible,
  catalogueForce,
  iframeCode,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="card-section-title mb-4 font-semibold text-slate-900">Diffusion</h2>

      <ul className="space-y-0 divide-y divide-slate-100">
        {/* Catalogue */}
        <li className="flex items-start gap-3 py-3 first:pt-0">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50">
            <LayoutGrid size={14} className="text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">Catalogue public</p>
            {catalogueForce ? (
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Référencée définitivement
                </span>
                <Lock size={11} className="text-slate-400" />
              </div>
            ) : catalogueVisible ? (
              <div className="mt-0.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Publiée dans le catalogue
                </span>
                <a
                  href="/catalogue"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Voir →
                </a>
              </div>
            ) : (
              <div className="mt-0.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  Non publiée
                </span>
                <Link
                  href={`/offres/${offreId}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Publier →
                </Link>
              </div>
            )}
          </div>
        </li>

        {/* Widget */}
        <li className="flex items-start gap-3 py-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50">
            <Code2 size={14} className="text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">Widget embarqué</p>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Actif
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline transition"
              >
                {copied ? (
                  <>
                    <Check size={11} className="text-green-500" />
                    <span className="text-green-600">Copié</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    Copier le code
                  </>
                )}
              </button>
            </div>
          </div>
        </li>

        {/* Fiche publique */}
        <li className="flex items-start gap-3 py-3 last:pb-0">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50">
            <ExternalLink size={14} className="text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">Fiche publique</p>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-xs text-slate-400 truncate">/f/{offreSlug}</span>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-xs text-blue-600 hover:underline"
              >
                Ouvrir →
              </a>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}
