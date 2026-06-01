"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify, cn } from "@/lib/utils";
import { CATEGORIES_OFFRE } from "@/lib/constants";
import { AlertCircle } from "lucide-react";
import type { VerticalConfig } from "@/config/verticals";

const schema = z.object({
  titre: z.string().min(3, "Titre requis (3 caractères minimum)"),
  description: z.string().optional(),
  categorie: z.string().optional(),
  url_externe: z.string().url("URL invalide").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

type Props = {
  prestataireId: string;
  vertical: VerticalConfig;
};

export default function NouvelleOffreForm({ prestataireId, vertical }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    const supabase = createClient();
    const slug = slugify(data.titre);

    const { error } = await supabase.from("offres").insert({
      prestataire_id: prestataireId,
      titre: data.titre,
      slug,
      description: data.description ?? null,
      categorie: data.categorie ?? null,
      url_externe: data.url_externe || null,
    });

    if (error) {
      setError("root", { message: "Erreur lors de la création. Veuillez réessayer." });
      return;
    }

    router.push("/offres");
    router.refresh();
  }

  const offreLabel = vertical.offre.singular;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
          Titre <span className="text-red-400">*</span>
        </label>
        <input
          id="titre"
          type="text"
          placeholder={`ex. : Titre de la ${offreLabel}`}
          {...register("titre")}
          className={cn(
            "w-full rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            errors.titre ? "border-red-400 bg-red-50" : "border-gray-300"
          )}
        />
        {errors.titre && (
          <p className="mt-1 text-xs text-red-500">{errors.titre.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 mb-1">
          Catégorie
        </label>
        <select
          id="categorie"
          {...register("categorie")}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">— Sélectionner —</option>
          {CATEGORIES_OFFRE.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder={`Présentez brièvement votre ${offreLabel}…`}
          {...register("description")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label htmlFor="url_externe" className="block text-sm font-medium text-gray-700 mb-1">
          URL de la {offreLabel}
        </label>
        <input
          id="url_externe"
          type="url"
          placeholder="https://mon-site.com/..."
          {...register("url_externe")}
          className={cn(
            "w-full rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            errors.url_externe ? "border-red-400 bg-red-50" : "border-gray-300"
          )}
        />
        {errors.url_externe && (
          <p className="mt-1 text-xs text-red-500">{errors.url_externe.message}</p>
        )}
      </div>

      {errors.root && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{errors.root.message}</p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Création…" : `Créer la ${offreLabel}`}
        </button>
        <a href="/offres" className="text-sm text-gray-500 hover:text-gray-900 transition">
          Annuler
        </a>
      </div>
    </form>
  );
}
