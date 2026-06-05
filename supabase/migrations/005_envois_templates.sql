-- ============================================================
-- ReviewWall — Migration 005 : Envois & Templates de messages
-- ============================================================

-- ── 1. Templates de messages ─────────────────────────────────

CREATE TABLE message_templates (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prestataire_id uuid REFERENCES prestataires NOT NULL,
  nom            text NOT NULL,
  objet          text NOT NULL,
  corps          text NOT NULL,
  canal          text NOT NULL DEFAULT 'email' CHECK (canal IN ('email')),
  created_at     timestamptz DEFAULT now()
);

-- ── 2. Historique d'envois ────────────────────────────────────

CREATE TABLE envois (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seance_id      uuid REFERENCES seances NOT NULL,
  participant_id uuid REFERENCES participants NOT NULL,
  objet          text,
  corps          text,
  canal          text NOT NULL DEFAULT 'email',
  statut         text NOT NULL DEFAULT 'envoye'
                   CHECK (statut IN ('envoye', 'echec')),
  envoye_at      timestamptz DEFAULT now()
);

-- ── 3. Dernière date d'envoi sur participants ─────────────────

ALTER TABLE participants
  ADD COLUMN dernier_envoi_at timestamptz;

-- ── 4. Row Level Security ────────────────────────────────────

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE envois             ENABLE ROW LEVEL SECURITY;

-- Templates : le prestataire gère ses propres templates
CREATE POLICY "templates_prestataire" ON message_templates
  FOR ALL USING (
    prestataire_id = (SELECT id FROM prestataires WHERE user_id = auth.uid())
  );

-- Envois : le prestataire voit les envois de ses séances
CREATE POLICY "envois_prestataire" ON envois
  FOR ALL USING (
    seance_id IN (
      SELECT s.id FROM seances s
      JOIN offres o ON o.id = s.offre_id
      WHERE o.prestataire_id = (
        SELECT id FROM prestataires WHERE user_id = auth.uid()
      )
    )
  );
