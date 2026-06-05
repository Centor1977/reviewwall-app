import { render } from "@react-email/render";
import { appConfig } from "@/config/app";
import { resend } from "./resend";
import { BienvenueEmail } from "./templates/bienvenue";
import { NouvelAvisEmail } from "./templates/nouvel-avis";
import { ConfirmationApprenantEmail } from "./templates/confirmation-apprenant";
import { LienCollecteEmail } from "./templates/lien-collecte";
import { SignalementAdminEmail } from "./templates/signalement-admin";

const FROM = process.env.RESEND_FROM_EMAIL ?? appConfig.noreplyEmail;
const APP_NAME = appConfig.name;

export async function sendBienvenue({ email, nom }: { email: string; nom: string }) {
  const html = await render(BienvenueEmail({ appName: APP_NAME, nom }));
  const { error } = await resend.emails.send({
    from: FROM, to: email,
    subject: `Bienvenue sur ${APP_NAME} !`,
    html,
  });
  if (error) console.error("[email] bienvenue failed", error);
}

export async function sendNouvelAvis({
  email, nomPrestataire, offreTitre, note, avisTexte,
}: {
  email: string; nomPrestataire: string; offreTitre: string;
  note: number; avisTexte: string;
}) {
  const html = await render(
    NouvelAvisEmail({ appName: APP_NAME, nomPrestataire, offreTitre, note, avisTexte })
  );
  const { error } = await resend.emails.send({
    from: FROM, to: email,
    subject: `Vous avez reçu un nouvel avis ⭐ — ${offreTitre}`,
    html,
  });
  if (error) console.error("[email] nouvel-avis failed", error);
}

export async function sendConfirmationApprenant({
  email, offreTitre, prestataireSlug,
}: {
  email: string; offreTitre: string; prestataireSlug: string;
}) {
  const html = await render(
    ConfirmationApprenantEmail({ appName: APP_NAME, offreTitre, prestataireSlug })
  );
  const { error } = await resend.emails.send({
    from: FROM, to: email,
    subject: `Merci pour votre avis sur "${offreTitre}" !`,
    html,
  });
  if (error) console.error("[email] confirmation-apprenant failed", error);
}

export async function sendLienCollecte({
  email, prenom, corps, collectUrl, nomFormateur, objet,
}: {
  email: string; prenom: string; corps: string;
  collectUrl: string; nomFormateur: string; objet: string;
}) {
  const html = await render(
    LienCollecteEmail({ appName: APP_NAME, prenom, corps, collectUrl, nomFormateur })
  );
  const { error } = await resend.emails.send({
    from: FROM, to: email, subject: objet, html,
  });
  if (error) {
    console.error("[email] lien-collecte failed", error);
    throw new Error(
      typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : JSON.stringify(error)
    );
  }
}

export async function sendSignalementAdmin({
  avisId,
  avisExtrait,
  raison,
  detail,
}: {
  avisId: string;
  avisExtrait: string;
  raison: string;
  detail: string;
}) {
  const adminEmail =
    process.env.ADMIN_EMAIL ?? appConfig.supportEmail;
  const adminUrl = `${appConfig.url}/admin/signalements`;
  const html = await render(
    SignalementAdminEmail({
      appName: APP_NAME,
      avisId,
      avisExtrait,
      raison,
      detail,
      adminUrl,
    })
  );
  const { error } = await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `[${APP_NAME}] Nouveau signalement d'avis`,
    html,
  });
  if (error) console.error("[email] signalement-admin failed", error);
}
