import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Link,
  Preview,
} from "@react-email/components";
import { appConfig } from "@/config/app";

type Props = {
  appName: string;
  nomPrestataire: string;
  offreTitre: string;
  note: number;
  avisTexte: string;
};

const main = {
  backgroundColor: "#f8fafc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "40px auto",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  maxWidth: "560px",
  overflow: "hidden" as const,
};

const header = {
  backgroundColor: "#2563EB",
  padding: "28px 40px",
};

const headerText = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0",
};

const body = {
  padding: "32px 40px",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#475569",
  margin: "0 0 20px",
};

const avisBox = {
  backgroundColor: "#f1f5f9",
  borderRadius: "8px",
  padding: "20px 24px",
  margin: "0 0 28px",
};

const avisLabel = {
  fontSize: "11px",
  color: "#94a3b8",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  fontWeight: "600",
  margin: "0 0 6px",
};

const avisValue = {
  fontSize: "14px",
  color: "#1e293b",
  margin: "0 0 16px",
  lineHeight: "22px",
};

const avisValueLast = {
  fontSize: "14px",
  color: "#1e293b",
  margin: "0",
  lineHeight: "22px",
};

const button = {
  backgroundColor: "#2563EB",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
  display: "inline-block",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "28px 0 20px",
};

const footer = {
  fontSize: "12px",
  color: "#94a3b8",
  lineHeight: "20px",
  margin: "0",
};

function stars(note: number) {
  return "★".repeat(note) + "☆".repeat(5 - note);
}

export function NouvelAvisEmail({ appName, nomPrestataire, offreTitre, note, avisTexte }: Props) {
  const dashboardUrl = `${appConfig.url}/avis`;
  const extrait = avisTexte.length > 200 ? avisTexte.slice(0, 200) + "…" : avisTexte;

  return (
    <Html lang="fr">
      <Head />
      <Preview>
        Nouvel avis {stars(note)} sur &quot;{offreTitre}&quot;
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>{appName}</Text>
          </Section>

          <Section style={body}>
            <Text style={{ ...paragraph, margin: "0 0 24px", fontSize: "16px", color: "#1e293b" }}>
              Bonjour {nomPrestataire},
            </Text>

            <Text style={paragraph}>
              Vous avez reçu un nouvel avis sur votre offre{" "}
              <strong>&quot;{offreTitre}&quot;</strong>.
            </Text>

            <Section style={avisBox}>
              <Text style={avisLabel}>Note</Text>
              <Text style={avisValue}>
                {stars(note)} ({note}/5)
              </Text>

              <Text style={avisLabel}>Extrait</Text>
              <Text style={avisValueLast}>&quot;{extrait}&quot;</Text>
            </Section>

            <Button href={dashboardUrl} style={button}>
              Voir l&apos;avis complet
            </Button>

            <Hr style={hr} />

            <Text style={footer}>
              Vous recevez cet email car vous êtes prestataire sur {appName}.
              <br />
              <Link
                href={`${appConfig.url}/parametres`}
                style={{ color: "#64748b" }}
              >
                Gérer mes préférences email
              </Link>{" "}
              · {appConfig.supportEmail}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
