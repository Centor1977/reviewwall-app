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
  nom: string;
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
  margin: "0 0 24px",
};

const stepsBox = {
  backgroundColor: "#f1f5f9",
  borderRadius: "8px",
  padding: "20px 24px",
  margin: "0 0 28px",
};

const stepText = {
  fontSize: "14px",
  color: "#334155",
  margin: "0 0 10px",
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

export function BienvenueEmail({ appName, nom }: Props) {
  const dashboardUrl = `${appConfig.url}/login`;

  return (
    <Html lang="fr">
      <Head />
      <Preview>Bienvenue sur {appName} — votre plateforme d&apos;avis vérifiés</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>{appName}</Text>
          </Section>

          <Section style={body}>
            <Text style={{ ...paragraph, margin: "0 0 16px", fontSize: "16px", color: "#1e293b" }}>
              Bonjour {nom},
            </Text>

            <Text style={paragraph}>
              Bienvenue sur {appName} ! Votre compte est prêt. Voici comment
              démarrer en 3 étapes simples :
            </Text>

            <Section style={stepsBox}>
              <Text style={stepText}>
                <strong>1. Complétez votre profil</strong>
                <br />
                Ajoutez votre nom, organisme et une courte biographie.
              </Text>
              <Text style={stepText}>
                <strong>2. Créez votre première offre</strong>
                <br />
                Formation, coaching, prestation — ajoutez ce que vous proposez.
              </Text>
              <Text style={{ ...stepText, margin: "0" }}>
                <strong>3. Collectez vos premiers avis</strong>
                <br />
                Générez un lien unique et envoyez-le à vos apprenants.
              </Text>
            </Section>

            <Button href={dashboardUrl} style={button}>
              Accéder à mon tableau de bord
            </Button>

            <Hr style={hr} />

            <Text style={footer}>
              Vous recevez cet email car vous venez de créer un compte sur{" "}
              {appName}.
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
