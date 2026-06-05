import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type Props = {
  appName: string;
  avisId: string;
  avisExtrait: string;
  raison: string;
  detail: string;
  adminUrl: string;
};

export function SignalementAdminEmail({
  appName,
  avisId,
  avisExtrait,
  raison,
  detail,
  adminUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Nouveau signalement sur {appName}</Preview>
      <Body style={{ backgroundColor: "#f8fafc", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: 560, margin: "40px auto", background: "#fff", borderRadius: 8, padding: "32px 40px", border: "1px solid #e2e8f0" }}>
          <Heading style={{ color: "#dc2626", fontSize: 20, marginBottom: 8 }}>
            Nouveau signalement
          </Heading>
          <Text style={{ color: "#475569", marginBottom: 24 }}>
            Un avis a été signalé sur {appName}.
          </Text>

          <Section style={{ background: "#f8fafc", borderRadius: 6, padding: "16px 20px", marginBottom: 16 }}>
            <Text style={{ margin: 0, fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
              Avis concerné
            </Text>
            <Text style={{ margin: "4px 0 0", color: "#1e293b", fontSize: 14 }}>
              {avisExtrait || "(pas de texte)"}
            </Text>
          </Section>

          <Section style={{ marginBottom: 16 }}>
            <Text style={{ margin: 0 }}>
              <strong>Raison :</strong> {raison}
            </Text>
            {detail && (
              <Text style={{ margin: "4px 0 0", color: "#475569" }}>
                <strong>Détail :</strong> {detail}
              </Text>
            )}
          </Section>

          <Text>
            <a href={adminUrl} style={{ color: "#dc2626", fontWeight: 600 }}>
              Voir les signalements → {adminUrl}
            </a>
          </Text>

          <Text style={{ fontSize: 11, color: "#94a3b8", marginTop: 32 }}>
            ID avis : {avisId}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
