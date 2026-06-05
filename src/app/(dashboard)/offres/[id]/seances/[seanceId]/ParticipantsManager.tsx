"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import {
  UserPlus, Upload, Users, Camera, Copy, Check, QrCode,
  ChevronLeft, ChevronRight, Loader2, AlertCircle, CheckCircle2, Clock,
  X, Download, Send, RefreshCw, Mail, PhoneCall, FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ModalEnvoi, type Template, type ParticipantEnvoi } from "@/components/envoi/ModalEnvoi";
import { createTemplateAction } from "@/app/(dashboard)/parametres/templateActions";
import {
  addParticipantManuel,
  addParticipantsCSV,
  addParticipantsAnonymous,
  addParticipantsFromSheet,
  analyzeSignatureSheet,
} from "./actions";

type Participant = {
  id: string;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  telephone: string | null;
  identifiant_anon: string | null;
  mode_ajout: string;
  statut_avis: string;
  dernier_envoi_at: string | null;
  collecte_tokens: { id: string; token: string } | null;
};

type ExtractedRow = {
  prenom: string | null;
  nom: string | null;
  email: string | null;
  telephone: string | null;
};

const PAGE_SIZE = 20;
const RELANCE_DAYS = 7;

// ── Helpers ────────────────────────────────────────────────────

function isRelancable(p: Participant): boolean {
  if (p.statut_avis !== "en_attente" || !p.email) return false;
  if (!p.dernier_envoi_at) return false;
  const sent = new Date(p.dernier_envoi_at).getTime();
  return Date.now() - sent > RELANCE_DAYS * 24 * 60 * 60 * 1000;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-50"
    >
      {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
      {copied ? "Copié" : "Copier"}
    </button>
  );
}

function IndividualQrButton({ seanceId, participantId }: { seanceId: string; participantId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/seances/${seanceId}/export-qr?participant_id=${participantId}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      a.download = match?.[1] ?? "qrcode.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleDownload} disabled={loading}
      title="Télécharger le QR code PDF"
      className="rounded border border-slate-200 p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-blue-600 disabled:opacity-40">
      {loading ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
    </button>
  );
}

function QrPopover({ url }: { url: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded border border-slate-200 p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
        title="Afficher le QR code"
      >
        <QrCode size={13} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
            <QRCodeCanvas value={url} size={120} />
          </div>
        </>
      )}
    </div>
  );
}

function StatutBadge({ statut }: { statut: string }) {
  if (statut === "soumis") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
        <CheckCircle2 size={10} />Soumis
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-600">
      <Clock size={10} />En attente
    </span>
  );
}

function ContactBadge({ p }: { p: Participant }) {
  if (p.email) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
        <Mail size={10} />{p.email}
      </span>
    );
  }
  if (p.telephone) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
        <PhoneCall size={10} />{p.telephone}
      </span>
    );
  }
  return <span className="text-xs text-slate-300">Sans contact</span>;
}

// ── Tabs d'ajout ───────────────────────────────────────────────

function TabManuel({ seanceId, offreId }: { seanceId: string; offreId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(0);
  const inputCls = "flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  async function handleAdd() {
    if (!prenom.trim() && !nom.trim()) { setError("Indiquez au moins un prénom ou un nom."); return; }
    setError(null);
    startTransition(async () => {
      const result = await addParticipantManuel(seanceId, offreId, { prenom, nom, email, telephone: tel });
      if (result.error) { setError(result.error); return; }
      setPrenom(""); setNom(""); setEmail(""); setTel("");
      setAdded((n) => n + 1);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} className={inputCls} />
        <input placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} className={inputCls} />
        <input placeholder="Email (optionnel)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        <input placeholder="Téléphone (optionnel)" value={tel} onChange={(e) => setTel(e.target.value)} className={inputCls} />
      </div>
      {error && <p className="flex items-center gap-1.5 text-sm text-red-600"><AlertCircle size={13} />{error}</p>}
      <div className="flex items-center gap-3">
        <button onClick={handleAdd} disabled={isPending} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60">
          {isPending ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
          Ajouter
        </button>
        {added > 0 && <span className="text-sm text-green-600">{added} ajouté{added > 1 ? "s" : ""}</span>}
      </div>
    </div>
  );
}

function TabCSV({ seanceId, offreId }: { seanceId: string; offreId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<ExtractedRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.trim().split("\n");
      const headers = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/"/g, ""));
      const rows: ExtractedRow[] = lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.trim().replace(/"/g, ""));
        const get = (key: string) => { const i = headers.indexOf(key); return i >= 0 && cols[i] ? cols[i] : null; };
        return { prenom: get("prenom") ?? get("prénom"), nom: get("nom"), email: get("email"), telephone: get("telephone") ?? get("téléphone") ?? get("tel") };
      }).filter((r) => r.prenom || r.nom);
      setPreview(rows); setError(null);
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-4">
      <div className="cursor-pointer rounded-xl border-2 border-dashed border-slate-200 p-8 text-center transition hover:border-blue-400 hover:bg-blue-50/50" onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
        <Upload size={24} className="mx-auto mb-2 text-slate-300" />
        <p className="text-sm text-slate-500">Glissez un CSV ou cliquez pour parcourir</p>
        <p className="mt-1 text-xs text-slate-400">Colonnes : prenom, nom, email, telephone</p>
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
      <a href="data:text/csv;charset=utf-8,prenom,nom,email,telephone%0AMarie,Dupont,marie@ex.com,0601020304" download="modele_participants.csv" className="flex w-fit items-center gap-1.5 text-xs text-blue-600 hover:underline">
        <Download size={11} />Télécharger un modèle CSV
      </a>
      {preview.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">{preview.length} participant{preview.length > 1 ? "s" : ""} détecté{preview.length > 1 ? "s" : ""}</p>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs"><thead className="bg-slate-50 text-slate-500"><tr>{["Prénom","Nom","Email","Tél"].map((h) => <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">{preview.map((r, i) => <tr key={i}><td className="px-3 py-1.5">{r.prenom ?? "—"}</td><td className="px-3 py-1.5">{r.nom ?? "—"}</td><td className="px-3 py-1.5 text-slate-400">{r.email ?? "—"}</td><td className="px-3 py-1.5 text-slate-400">{r.telephone ?? "—"}</td></tr>)}</tbody></table>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button onClick={() => { startTransition(async () => { const res = await addParticipantsCSV(seanceId, offreId, preview); if (res.error) { setError(res.error); return; } setPreview([]); router.refresh(); }); }} disabled={isPending} className="mt-3 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60">
            {isPending && <Loader2 size={13} className="animate-spin" />}Importer {preview.length} participant{preview.length > 1 ? "s" : ""}
          </button>
        </div>
      )}
    </div>
  );
}

function TabAnonyme({ seanceId, offreId }: { seanceId: string; offreId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [count, setCount] = useState("10");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Génère des tokens anonymes numérotés. Idéal pour distribution de QR codes en séance.</p>
      <div className="flex items-center gap-3">
        <input type="number" min="1" max="500" value={count} onChange={(e) => setCount(e.target.value)} className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
        <button onClick={() => { const n = parseInt(count, 10); if (!n || n < 1 || n > 500) { setError("Entre 1 et 500."); return; } setError(null); setDone(null); startTransition(async () => { const res = await addParticipantsAnonymous(seanceId, offreId, n); if (res.error) { setError(res.error); return; } setDone(res.count ?? n); router.refresh(); }); }} disabled={isPending} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60">
          {isPending ? <Loader2 size={13} className="animate-spin" /> : <Users size={13} />}Générer {count || "N"} tokens
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {done !== null && <p className="flex items-center gap-1.5 text-sm text-green-600"><CheckCircle2 size={14} />{done} token{done > 1 ? "s" : ""} généré{done > 1 ? "s" : ""}</p>}
    </div>
  );
}

function TabPhoto({ seanceId, offreId }: { seanceId: string; offreId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState("image/jpeg");
  const [extracted, setExtracted] = useState<ExtractedRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setMediaType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (e) => { const d = e.target?.result as string; setPreview(d); setBase64(d.split(",")[1]); setExtracted(null); setError(null); };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-4">
      <div className="cursor-pointer rounded-xl border-2 border-dashed border-slate-200 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50/50" onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
        {preview ? <img src={preview} alt="" className="mx-auto max-h-48 rounded-lg object-contain" /> : <><Camera size={24} className="mx-auto mb-2 text-slate-300" /><p className="text-sm text-slate-500">Photo de la feuille d&apos;émargement</p><p className="mt-1 text-xs text-slate-400">JPG, PNG ou PDF</p></>}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
      {preview && !extracted && <button onClick={() => { setAnalyzing(true); setError(null); startTransition(async () => { const res = await analyzeSignatureSheet(base64!, mediaType); setAnalyzing(false); if (res.error) { setError(res.error); return; } setExtracted(res.participants ?? []); }); }} disabled={analyzing || isPending} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60">{analyzing ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}Analyser avec l&apos;IA</button>}
      {error && <p className="flex items-center gap-1.5 text-sm text-red-600"><AlertCircle size={13} />{error}</p>}
      {extracted && (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">{extracted.length} participant{extracted.length > 1 ? "s" : ""} extrait{extracted.length > 1 ? "s" : ""}</p>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs"><thead className="bg-slate-50"><tr>{["Prénom","Nom","Email","Tél"].map((h) => <th key={h} className="px-3 py-2 text-left font-medium text-slate-500">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">{extracted.map((r, i) => <tr key={i}><td className="px-3 py-1.5">{r.prenom ?? "—"}</td><td className="px-3 py-1.5">{r.nom ?? "—"}</td><td className="px-3 py-1.5 text-slate-400">{r.email ?? "—"}</td><td className="px-3 py-1.5 text-slate-400">{r.telephone ?? "—"}</td></tr>)}</tbody></table>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => { startTransition(async () => { const res = await addParticipantsFromSheet(seanceId, offreId, extracted); if (res.error) { setError(res.error); return; } setPreview(null); setBase64(null); setExtracted(null); router.refresh(); }); }} disabled={isPending} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60">
              {isPending && <Loader2 size={13} className="animate-spin" />}Confirmer et importer
            </button>
            <button onClick={() => { setExtracted(null); setPreview(null); setBase64(null); }} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"><X size={13} />Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Composant principal ─────────────────────────────────────────

const TABS = [
  { key: "manuel", label: "Saisie manuelle", icon: <UserPlus size={14} /> },
  { key: "csv", label: "Import CSV", icon: <Upload size={14} /> },
  { key: "anonyme", label: "Génération anonyme", icon: <Users size={14} /> },
  { key: "photo", label: "Feuille d'émargement", icon: <Camera size={14} /> },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export function ParticipantsManager({
  participants,
  seanceId,
  offreId,
  appUrl,
  offreTitre,
  seanceTitre,
  nomPrestataire,
  templates,
}: {
  participants: Participant[];
  seanceId: string;
  offreId: string;
  appUrl: string;
  offreTitre: string;
  seanceTitre: string;
  nomPrestataire: string;
  templates: Template[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"tous" | "en_attente" | "soumis">("tous");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>("manuel");
  const [showAdd, setShowAdd] = useState(false);

  // Modal état
  const [modalParticipants, setModalParticipants] = useState<ParticipantEnvoi[] | null>(null);
  const [tplList, setTplList] = useState<Template[]>(templates);

  const filtered = participants.filter((p) => {
    if (filter === "en_attente") return p.statut_avis === "en_attente";
    if (filter === "soumis") return p.statut_avis === "soumis";
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Bulk helpers
  const avecEmail = participants.filter((p) => p.email && p.statut_avis === "en_attente");
  const aRelancer = participants.filter(isRelancable);

  function displayName(p: Participant) {
    if (p.identifiant_anon) return p.identifiant_anon;
    return [p.prenom, p.nom].filter(Boolean).join(" ") || "—";
  }

  function collectUrl(token: string) { return `${appUrl}/collect/${token}`; }

  function fmtDate(d: string | null) {
    if (!d) return null;
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(d));
  }

  async function handleSaveTemplate(data: { nom: string; objet: string; corps: string }) {
    const res = await createTemplateAction(data);
    if (!res.error && res.id) {
      setTplList((prev) => [{ id: res.id!, ...data }, ...prev]);
    }
  }

  return (
    <div className="space-y-4">
      {/* Boutons bulk envoi */}
      {(avecEmail.length > 0 || aRelancer.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {avecEmail.length > 0 && (
            <button
              onClick={() => setModalParticipants(avecEmail.map((p) => ({ id: p.id, prenom: p.prenom, nom: p.nom, email: p.email })))}
              className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
            >
              <Send size={14} />
              Envoyer à tous ({avecEmail.length} avec email)
            </button>
          )}
          {aRelancer.length > 0 && (
            <button
              onClick={() => setModalParticipants(aRelancer.map((p) => ({ id: p.id, prenom: p.prenom, nom: p.nom, email: p.email })))}
              className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100"
            >
              <RefreshCw size={14} />
              Relancer les {aRelancer.length} en attente
            </button>
          )}
        </div>
      )}

      {/* Filter + Add */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          {(["tous", "en_attente", "soumis"] as const).map((f) => {
            const count = f === "tous" ? participants.length : participants.filter((p) => p.statut_avis === f).length;
            const labels = { tous: "Tous", en_attente: "En attente", soumis: "Soumis" };
            return (
              <button key={f} onClick={() => { setFilter(f); setPage(1); }} className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition", filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                {labels[f]} ({count})
              </button>
            );
          })}
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
          <UserPlus size={14} />Ajouter des participants
        </button>
      </div>

      {/* Panel d'ajout */}
      {showAdd && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-5 flex gap-1 overflow-x-auto border-b border-slate-200">
            {TABS.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn("flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition", activeTab === tab.key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700")}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
          {activeTab === "manuel" && <TabManuel seanceId={seanceId} offreId={offreId} />}
          {activeTab === "csv" && <TabCSV seanceId={seanceId} offreId={offreId} />}
          {activeTab === "anonyme" && <TabAnonyme seanceId={seanceId} offreId={offreId} />}
          {activeTab === "photo" && <TabPhoto seanceId={seanceId} offreId={offreId} />}
        </div>
      )}

      {/* Tableau participants */}
      {paged.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center">
          <Users size={28} className="mb-2 text-slate-300" />
          <p className="text-sm text-slate-500">
            {filter === "tous" ? "Aucun participant pour l'instant." : `Aucun participant ${filter === "soumis" ? "ayant soumis" : "en attente"}.`}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {["Participant", "Contact", "Statut avis", "Dernier envoi", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paged.map((p) => {
                const token = p.collecte_tokens?.token;
                const url = token ? collectUrl(token) : null;
                const canRelance = isRelancable(p);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-900">{displayName(p)}</td>
                    <td className="px-4 py-3"><ContactBadge p={p} /></td>
                    <td className="px-4 py-3"><StatutBadge statut={p.statut_avis} /></td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {p.dernier_envoi_at ? fmtDate(p.dernier_envoi_at) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {url && p.statut_avis === "en_attente" && (
                          <>
                            <CopyBtn text={url} />
                            <QrPopover url={url} />
                            <IndividualQrButton seanceId={seanceId} participantId={p.id} />
                          </>
                        )}
                        {p.email && p.statut_avis === "en_attente" && (
                          <button
                            onClick={() => setModalParticipants([{ id: p.id, prenom: p.prenom, nom: p.nom, email: p.email }])}
                            className={cn(
                              "flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition",
                              canRelance
                                ? "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                                : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                            )}
                          >
                            {canRelance ? <RefreshCw size={11} /> : <Send size={11} />}
                            {canRelance ? "Relancer" : "Envoyer"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
              <span className="text-xs text-slate-400">{filtered.length} participant{filtered.length > 1 ? "s" : ""}</span>
              <div className="flex items-center gap-1">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"><ChevronLeft size={13} /></button>
                <span className="px-2 text-xs text-slate-500">{page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"><ChevronRight size={13} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal d'envoi */}
      {modalParticipants && (
        <ModalEnvoi
          participants={modalParticipants}
          seanceId={seanceId}
          offreTitre={offreTitre}
          seanceTitre={seanceTitre}
          templates={tplList}
          onClose={() => setModalParticipants(null)}
          onSent={() => router.refresh()}
          onSaveTemplate={handleSaveTemplate}
        />
      )}
    </div>
  );
}
