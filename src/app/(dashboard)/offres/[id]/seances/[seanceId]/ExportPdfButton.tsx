"use client";

import { useState } from "react";
import { FileDown, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  seanceId: string;
  participantsWithToken: number;
  participantsWithoutToken: number;
};

type Toast = { type: "success" | "error"; message: string };

export function ExportPdfButton({ seanceId, participantsWithToken, participantsWithoutToken }: Props) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  function showToast(t: Toast) {
    setToast(t);
    setTimeout(() => setToast(null), 4000);
  }

  async function handleExport() {
    if (participantsWithToken === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/seances/${seanceId}/export-qr`);
      if (!res.ok) {
        const msg = await res.text();
        showToast({ type: "error", message: msg || "Erreur lors de la génération." });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      a.download = match?.[1] ?? "qrcodes.pdf";
      a.click();
      URL.revokeObjectURL(url);
      showToast({
        type: "success",
        message: `PDF généré — ${participantsWithToken} QR code${participantsWithToken > 1 ? "s" : ""}`,
      });
    } catch {
      showToast({ type: "error", message: "Erreur réseau. Réessayez." });
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || participantsWithToken === 0;
  const title = participantsWithoutToken > 0
    ? `${participantsWithoutToken} participant${participantsWithoutToken > 1 ? "s" : ""} sans lien généré`
    : undefined;

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={disabled}
        title={title}
        className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition",
          disabled
            ? "border-slate-200 text-slate-400 opacity-50 cursor-not-allowed"
            : "border-slate-200 text-slate-600 hover:bg-slate-50"
        )}
      >
        {loading
          ? <Loader2 size={14} className="animate-spin" />
          : <FileDown size={14} />
        }
        Exporter les QR codes PDF
      </button>

      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-white shadow-xl",
          toast.type === "success" ? "bg-slate-900" : "bg-red-600"
        )}>
          {toast.type === "success"
            ? <CheckCircle2 size={15} className="text-green-400" />
            : <AlertCircle size={15} className="text-white" />
          }
          {toast.message}
        </div>
      )}
    </div>
  );
}
