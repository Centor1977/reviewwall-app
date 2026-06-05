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
  offreTitre: string;
  prestataireSlug: string;
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

const thankBox = {
  backgroundColor: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "8px",
  padding: "20px 24px",
  margin: "0 0 28px",
};

const thankText = {
  fontSize: "14px",
  color: "#166534",
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

export function ConfirmationApprenantEmail({ appName, offreTitre, prestataireSlug }: Props) {
  const ficheUrl = `${appConfig.url}/f/${prestataireSlug}`;

  return (
    <Html lang="fr">
      <Head />
      <Preview>Merci pour votre avis sur &quot;{offreTitre}&quot; !</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>{appName}</Text>
          </Section>

          <Section style={body}>
            <Text style={{ ...paragraph, fontSize: "16px", color: "#1e293b", margin: "0 0 16px" }}>
              Merci pour votre avis !
            </Text>

            <Text style={paragraph}>
              Votre retour sur <strong>&quot;{offreTitre}&quot;</strong> a bien
              été enregistré. Il aidera d&apos;autres personnes à faire le bon
              choix.
            </Text>

            <Section style={thankBox}>
              <Text style={thankText}>
                Votre avis contribue à une communauté d&apos;apprentissage plus
                transparente et plus fiable. Merci de prendre le temps de
                partager votre expérience.
              </Text>
            </Section>

            <Button href={ficheUrl} style={button}>
              Voir la fiche publique
            </Button>

            <Hr style={hr} />

            <Text style={footer}>
              Vous avez reçu cet email car vous avez soumis un avis via{" "}
              {appName}.
              <br />
              Cet email est envoyé une seule fois et ne nécessite aucune action
              de votre part.
              <br />
              <Link href={appConfig.url} style={{ color: "#64748b" }}>
                {appName}
              </Link>{" "}
              · {appConfig.supportEmail}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
