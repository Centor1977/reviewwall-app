-- ============================================================
-- ReviewWall — Migration 004 : Séances & Participants
-- Nouveau modèle de collecte d'avis
-- ============================================================

-- ── 1. Table séances ─────────────────────────────────────────

CREATE TABLE seances (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offre_id               uuid REFERENCES offres NOT NULL,
  titre                  text NOT NULL,
  mode                   text NOT NULL CHECK (mode IN ('presentiel', 'distance', 'video')),
  date_session           timestamptz,
  lieu                   text,
  statut                 text NOT NULL DEFAULT 'en_cours'
                           CHECK (statut IN ('en_cours', 'cloturee', 'archivee')),
  nb_participants_attendus integer,
  created_at             timestamptz DEFAULT now()
);

-- ── 2. Table participants ────────────────────────────────────

CREATE TABLE participants (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seance_id        uuid REFERENCES seances NOT NULL,
  token_id         uuid REFERENCES collecte_tokens,
  prenom           text,
  nom              text,
  email            text,
  telephone        text,
  identifiant_anon text,
  mode_ajout       text NOT NULL CHECK (mode_ajout IN ('manuel', 'csv', 'anonyme', 'photo')),
  statut_avis      text NOT NULL DEFAULT 'en_attente'
                     CHECK (statut_avis IN ('en_attente', 'soumis')),
  created_at       timestamptz DEFAULT now()
);

-- ── 3. Lien séance dans collecte_tokens ──────────────────────
-- Permet à la page de collecte d'afficher le titre de la séance

ALTER TABLE collecte_tokens
  ADD COLUMN seance_id uuid REFERENCES seances;

-- ── 4. Row Level Security ────────────────────────────────────

ALTER TABLE seances      ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Séances : le prestataire gère uniquement les séances de ses offres

CREATE POLICY "seances_prestataire" ON seances
  FOR ALL USING (
    offre_id IN (
      SELECT id FROM offres
      WHERE prestataire_id = (
        SELECT id FROM prestataires WHERE user_id = auth.uid()
      )
    )
  );

-- Participants : le prestataire gère uniquement les participants de ses séances

CREATE POLICY "participants_prestataire" ON participants
  FOR ALL USING (
    seance_id IN (
      SELECT s.id FROM seances s
      JOIN offres o ON o.id = s.offre_id
      WHERE o.prestataire_id = (
        SELECT id FROM prestataires WHERE user_id = auth.uid()
      )
    )
  );

-- Participants : lecture publique via token valide
-- (page de collecte : afficher "Bonjour [prénom]")

CREATE POLICY "participants_public_read" ON participants
  FOR SELECT USING (
    token_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM collecte_tokens ct
      WHERE ct.id = token_id AND ct.used = false
    )
  );

-- Participants : mise à jour statut_avis par le flux de collecte anonyme

CREATE POLICY "participants_public_update_statut" ON participants
  FOR UPDATE
  USING (
    token_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM collecte_tokens ct
      WHERE ct.id = token_id AND ct.used = false
    )
  )
  WITH CHECK (statut_avis = 'soumis');
