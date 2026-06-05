"use client";

import { useState, useRef, useTransition } from "react";
import { Upload, Link as LinkIcon, Trash2, X, Loader2 } from "lucide-react";
import { getCategorieConfig } from "@/lib/categorie-icons";

type Props = {
  offreId: string;
  imageUrl: string | null;
  categorie: string | null;
};

export function OffreCoverImage({ offreId, imageUrl, categorie }: Props) {
  const [currentUrl, setCurrentUrl] = useState(imageUrl);
  const [showModal, setShowModal] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const config = getCategorieConfig(categorie);
  const Icon = config.icon;

  async function handleSaveUrl() {
    if (!urlInput.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/offres/${offreId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: urlInput.trim() }),
      });
      if (res.ok) {
        setCurrentUrl(urlInput.trim());
        setShowModal(false);
        setUrlInput("");
      } else {
        const d = await res.json() as { error?: string };
        setError(d.error ?? "Erreur");
      }
    });
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("offreId", offreId);
      const res = await fetch("/api/offres/upload-cover", { method: "POST", body: fd });
      const d = await res.json() as { url?: string; error?: string };
      if (res.ok && d.url) {
        setCurrentUrl(d.url);
        setShowModal(false);
      } else {
        setError(d.error ?? "Erreur upload");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/offres/${offreId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: null }),
      });
      if (res.ok) {
        setCurrentUrl(null);
        setShowModal(false);
      }
    });
  }

  return (
    <>
      <div
        className="relative shrink-0 cursor-pointer group overflow-hidden"
        style={{ width: 160, height: 160, flexShrink: 0 }}
        onClick={() => setShowModal(true)}
      >
        {currentUrl ? (
          <img src={currentUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(160deg, #1d4ed8 0%, #2563eb 100%)" }}
          >
            <Icon size={36} className="text-white" />
            {categorie && (
              <span style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.7)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                position: "absolute",
                bottom: 10,
              }}>
                {categorie}
              </span>
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
          <Upload size={16} className="text-white" />
          <span className="text-white text-xs font-medium">Changer</span>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={18} />
            </button>

            <h3 className="font-semibold text-slate-900 mb-5">Image de couverture</h3>

            <div className="mb-4">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-700">
                <LinkIcon size={12} /> Coller un lien image
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSaveUrl}
                  disabled={!urlInput.trim() || isPending}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-blue-700 transition"
                >
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : "OK"}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-700">
                <Upload size={12} /> Uploader une image
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full rounded-lg border-2 border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500 hover:border-blue-300 hover:text-blue-600 transition disabled:opacity-50"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Envoi…
                  </span>
                ) : (
                  "Choisir un fichier"
                )}
              </button>
            </div>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            {currentUrl && (
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition disabled:opacity-50"
              >
                <Trash2 size={13} /> Supprimer l&apos;image
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
