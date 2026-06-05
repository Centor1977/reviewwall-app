import {
  Html, Head, Body, Container, Section,
  Text, Button, Hr, Link, Preview,
} from "@react-email/components";
import { appConfig } from "@/config/app";

type Props = {
  appName: string;
  prenom: string;
  corps: string;
  collectUrl: string;
  nomFormateur: string;
};

const main = {
  backgroundColor: "#f8fafc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};
const container = {
  backgroundColor: "#ffffff",
  margin: "40px auto",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  maxWidth: "560px",
  overflow: "hidden" as const,
};
const header = { backgroundColor: "#2563EB", padding: "28px 40px" };
const headerText = { color: "#ffffff", fontSize: "22px", fontWeight: "700", margin: "0" };
const body = { padding: "32px 40px" };
const paragraph = { fontSize: "14px", lineHeight: "24px", color: "#475569", margin: "0 0 20px" };
const button = {
  backgroundColor: "#2563EB", borderRadius: "8px", color: "#ffffff",
  fontSize: "14px", fontWeight: "600", padding: "12px 32px",
  textDecoration: "none", display: "inline-block",
};
const hr = { borderColor: "#e2e8f0", margin: "28px 0 20px" };
const footer = { fontSize: "12px", color: "#94a3b8", lineHeight: "20px", margin: "0" };

export function LienCollecteEmail({ appName, prenom, corps, collectUrl, nomFormateur }: Props) {
  // Transforme les sauts de ligne en paragraphes
  const paragraphs = corps.split("\n").filter((l) => l.trim());

  return (
    <Html lang="fr">
      <Head />
      <Preview>Donnez votre avis — {appName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>{appName}</Text>
          </Section>

          <Section style={body}>
            <Text style={{ ...paragraph, fontSize: "16px", color: "#1e293b", margin: "0 0 20px" }}>
              Bonjour {prenom},
            </Text>

            {paragraphs.map((p, i) => (
              <Text key={i} style={paragraph}>{p}</Text>
            ))}

            <div style={{ textAlign: "center", margin: "28px 0" }}>
              <Button href={collectUrl} style={button}>
                Donner mon avis
              </Button>
            </div>

            <Hr style={hr} />

            <Text style={footer}>
              Cet email vous a été envoyé par <strong>{nomFormateur}</strong> via{" "}
              {appName}.
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
