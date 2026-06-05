import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { appConfig } from "@/config/app";

export type ParticipantPDF = {
  id: string;
  prenom: string | null;
  nom: string | null;
  identifiant_anon: string | null;
  token: string;
};

export type SeancePDF = {
  titre: string;
  date_session: string | null;
  lieu: string | null;
};

export type OffrePDF = {
  titre: string;
};

// ── Couleurs ──────────────────────────────────────────────────
const BLUE   = "#2563EB";
const DARK   = "#0F172A";
const GRAY   = "#64748B";
const LIGHT  = "#E2E8F0";

// ── Mesures (mm, A4 portrait = 210 x 297) ────────────────────
const PAGE_W     = 210;
const MARGIN     = 12;
const CARD_W     = PAGE_W - MARGIN * 2;       // 186mm
const CARD_H     = 128;
const CARD1_Y    = 10;
const GAP        = 8;                          // espace entre 2 cartes
const CARD2_Y    = CARD1_Y + CARD_H + GAP;    // 146mm
const QR_SIZE    = 56;                         // mm
const QR_X       = MARGIN + 2;                // 14mm
const NAME_X     = MARGIN + QR_SIZE + 10;     // ~80mm
const NAME_W     = PAGE_W - NAME_X - MARGIN;  // ~116mm
const NAME_CENTER= NAME_X + NAME_W / 2;

function hex2rgb(hex: string) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ] as [number, number, number];
}

function fmtDate(d: string | null) {
  if (!d) return null;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(d));
}

function drawDashedLine(doc: jsPDF, x1: number, y: number, x2: number) {
  const dashLen = 3;
  const gapLen  = 2;
  let x = x1;
  doc.setLineWidth(0.3);
  doc.setDrawColor(...hex2rgb(LIGHT));
  while (x < x2) {
    doc.line(x, y, Math.min(x + dashLen, x2), y);
    x += dashLen + gapLen;
  }
}

async function drawCard(
  doc: jsPDF,
  participant: ParticipantPDF,
  seance: SeancePDF,
  offre: OffrePDF,
  yStart: number,
) {
  const url     = `${appConfig.url}/collect/${participant.token}`;
  const dateStr = fmtDate(seance.date_session);
  const name =
    [participant.prenom, participant.nom].filter(Boolean).join(" ").trim() ||
    participant.identifiant_anon ||
    "Participant";

  // ── Cadre de la carte ─────────────────────────────────────
  doc.setDrawColor(...hex2rgb(LIGHT));
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN, yStart, CARD_W, CARD_H, 3, 3, "S");

  // ── App name ──────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...hex2rgb(BLUE));
  doc.text(appConfig.name, PAGE_W / 2, yStart + 9, { align: "center" });

  // ── Offre titre ───────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...hex2rgb(DARK));
  doc.text(offre.titre, PAGE_W / 2, yStart + 18, { align: "center", maxWidth: CARD_W - 10 });

  // ── Séance + date + lieu ──────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...hex2rgb(GRAY));
  const seanceInfo = [seance.titre, dateStr, seance.lieu].filter(Boolean).join("  ·  ");
  doc.text(seanceInfo, PAGE_W / 2, yStart + 26, { align: "center", maxWidth: CARD_W - 10 });

  // ── Séparateur léger ──────────────────────────────────────
  doc.setDrawColor(...hex2rgb(LIGHT));
  doc.setLineWidth(0.3);
  doc.line(MARGIN + 4, yStart + 30, MARGIN + CARD_W - 4, yStart + 30);

  // ── QR code ───────────────────────────────────────────────
  const qrDataUrl = await QRCode.toDataURL(url, { width: 400, margin: 1, errorCorrectionLevel: "M" });
  const qrY = yStart + 35;
  doc.addImage(qrDataUrl, "PNG", QR_X, qrY, QR_SIZE, QR_SIZE);

  // ── Participant name ───────────────────────────────────────
  const nameY = qrY + QR_SIZE / 2 - 2;  // centré verticalement avec QR
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...hex2rgb(DARK));
  doc.text(name, NAME_CENTER, nameY, { align: "center", maxWidth: NAME_W });

  // ── Texte instruction ─────────────────────────────────────
  const instrY = yStart + CARD_H - 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...hex2rgb(GRAY));
  doc.text(
    "Scannez ce QR code pour donner votre avis",
    PAGE_W / 2, instrY, { align: "center" }
  );

  // ── URL courte ────────────────────────────────────────────
  doc.setFontSize(7);
  doc.setTextColor(...hex2rgb(LIGHT));
  // Afficher uniquement la partie token pour garder court
  doc.text(url, PAGE_W / 2, instrY + 7, { align: "center", maxWidth: CARD_W - 10 });
}

// ── Fonction principale ───────────────────────────────────────

export async function generateQRCodesPDF(
  participants: ParticipantPDF[],
  seance: SeancePDF,
  offre: OffrePDF,
): Promise<Buffer> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const total = Math.ceil(participants.length / 2);

  for (let i = 0; i < participants.length; i++) {
    const isEven     = i % 2 === 0;
    const pageIndex  = Math.floor(i / 2);

    if (i > 0 && isEven) doc.addPage();

    if (isEven) {
      // ── Carte 1 de la page ──────────────────────────────
      await drawCard(doc, participants[i], seance, offre, CARD1_Y);

      // ── Séparateur pointillé (même si pas de carte 2) ──
      const hasNext = i + 1 < participants.length;
      if (hasNext) {
        drawDashedLine(doc, MARGIN, CARD1_Y + CARD_H + GAP / 2, MARGIN + CARD_W);
      }
    } else {
      // ── Carte 2 de la page ──────────────────────────────
      await drawCard(doc, participants[i], seance, offre, CARD2_Y);
    }

    // ── Numéro de page (en bas, sur carte 1 ou 2) ──────────
    if (!isEven || i + 1 >= participants.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...hex2rgb(LIGHT));
      doc.text(`${pageIndex + 1} / ${total}`, PAGE_W / 2, 293, { align: "center" });
    }
  }

  return Buffer.from(doc.output("arraybuffer"));
}
