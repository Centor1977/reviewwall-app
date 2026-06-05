-- ============================================================
-- ReviewWall — Migration 009 : Questions formateur
-- ============================================================

-- ── 1. Bibliothèque de questions ─────────────────────────────

CREATE TABLE questions_bibliotheque (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  prestataire_id     uuid        NOT NULL REFERENCES prestataires,
  texte              text        NOT NULL,
  type_reponse       text        NOT NULL,
  -- texte | note | oui_non | choix_unique | choix_multiple
  options            jsonb       DEFAULT NULL,
  -- null si texte/note/oui_non ; ["Option A","Option B"] si choix
  visibilite_defaut  text        NOT NULL DEFAULT 'publique',
  -- publique | privee
  dimension_profil   text        DEFAULT NULL,
  -- null si pas de lien profil
  -- ex: "formation.niveau" — uniquement pour questions publiques
  utilisable_matching boolean    DEFAULT false,
  -- uniquement pertinent pour questions privées
  validee            boolean     DEFAULT false,
  validation_ia      jsonb       DEFAULT NULL,
  -- { statut: "ok"|"warning"|"error", message: "..." }
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER questions_bibliotheque_updated_at
  BEFORE UPDATE ON questions_bibliotheque
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 2. Association question ↔ offre ──────────────────────────

CREATE TABLE offre_questions (
  id           uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  offre_id     uuid    NOT NULL REFERENCES offres,
  question_id  uuid    NOT NULL REFERENCES questions_bibliotheque,
  ordre        integer NOT NULL DEFAULT 0,
  visibilite   text    NOT NULL,
  -- hérite de visibilite_defaut, surchargeable par offre
  UNIQUE (offre_id, question_id)
);

-- ── 3. Réponses aux questions ─────────────────────────────────

CREATE TABLE question_reponses (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  avis_id          uuid        NOT NULL REFERENCES avis,
  question_id      uuid        NOT NULL REFERENCES questions_bibliotheque,
  reponse_texte    text        DEFAULT NULL,
  reponse_note     integer     DEFAULT NULL,
  reponse_booleen  boolean     DEFAULT NULL,
  reponse_choix    jsonb       DEFAULT NULL,
  -- ["Option A"] pour choix_unique
  -- ["Option A","Option C"] pour choix_multiple
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ── 4. Consentement matching privé ───────────────────────────

ALTER TABLE apprenants
  ADD COLUMN IF NOT EXISTS consent_matching_prive boolean DEFAULT true;

-- ── 5. RLS ───────────────────────────────────────────────────

ALTER TABLE questions_bibliotheque ENABLE ROW LEVEL SECURITY;
ALTER TABLE offre_questions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_reponses       ENABLE ROW LEVEL SECURITY;

-- Prestataire : accès total à ses questions
CREATE POLICY "questions_prestataire_own"
  ON questions_bibliotheque FOR ALL
  USING (
    prestataire_id = (SELECT id FROM prestataires WHERE user_id = auth.uid())
  )
  WITH CHECK (
    prestataire_id = (SELECT id FROM prestataires WHERE user_id = auth.uid())
  );

-- Prestataire : accès total aux associations de ses offres
CREATE POLICY "offre_questions_prestataire_own"
  ON offre_questions FOR ALL
  USING (
    offre_id IN (
      SELECT o.id FROM offres o
      WHERE o.prestataire_id = (SELECT id FROM prestataires WHERE user_id = auth.uid())
    )
  )
  WITH CHECK (
    offre_id IN (
      SELECT o.id FROM offres o
      WHERE o.prestataire_id = (SELECT id FROM prestataires WHERE user_id = auth.uid())
    )
  );

-- Lecture publique : la question doit être publique dans l'offre
-- spécifique de l'avis (pas dans n'importe quelle offre)
CREATE POLICY "question_reponses_public_read"
  ON question_reponses FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM avis a
      JOIN collecte_tokens ct ON ct.id = a.token_id
      JOIN offre_questions oq ON oq.offre_id    = ct.offre_id
                              AND oq.question_id = question_reponses.question_id
                              AND oq.visibilite  = 'publique'
      WHERE a.id = question_reponses.avis_id
    )
  );

-- Apprenant : lecture de toutes ses propres réponses
CREATE POLICY "question_reponses_apprenant_own"
  ON question_reponses FOR SELECT
  USING (
    avis_id IN (
      SELECT id FROM avis
      WHERE apprenant_id = (SELECT id FROM apprenants WHERE user_id = auth.uid())
    )
  );

-- Prestataire : lecture de toutes les réponses de ses offres
CREATE POLICY "question_reponses_prestataire_own"
  ON question_reponses FOR SELECT
  USING (
    avis_id IN (
      SELECT a.id FROM avis a
      JOIN collecte_tokens ct ON ct.id = a.token_id
      JOIN offres o           ON o.id  = ct.offre_id
      WHERE o.prestataire_id = (SELECT id FROM prestataires WHERE user_id = auth.uid())
    )
  );

-- Insert public (soumission formulaire anonyme)
CREATE POLICY "question_reponses_public_insert"
  ON question_reponses FOR INSERT
  WITH CHECK (true);
