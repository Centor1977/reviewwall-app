-- ============================================================
-- ReviewWall — Migration 008 : Profils apprenant par verticale
-- ============================================================
-- Remplace le champ profil jsonb monolithique par :
--   • des champs généraux sur apprenants (age_range, situation, localisation)
--   • une table apprenant_profils_verticales (1 ligne par vertical)
-- ============================================================

-- ── 1. Évolution de la table apprenants ──────────────────────

-- Supprime l'ancien champ profil générique
ALTER TABLE apprenants DROP COLUMN IF EXISTS profil;

-- Champs universels (toutes verticales)
ALTER TABLE apprenants
  ADD COLUMN IF NOT EXISTS age_range   text,
  ADD COLUMN IF NOT EXISTS situation   text,
  ADD COLUMN IF NOT EXISTS localisation text;

-- ── 2. Table profils par verticale ───────────────────────────

CREATE TABLE apprenant_profils_verticales (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  apprenant_id uuid        NOT NULL REFERENCES apprenants(id) ON DELETE CASCADE,
  vertical     text        NOT NULL,
  profil       jsonb       NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (apprenant_id, vertical)
);

-- Mise à jour automatique de updated_at (réutilise set_updated_at de la migration 007)
CREATE TRIGGER apprenant_profils_updated_at
  BEFORE UPDATE ON apprenant_profils_verticales
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 3. RLS — apprenant_profils_verticales ────────────────────

ALTER TABLE apprenant_profils_verticales ENABLE ROW LEVEL SECURITY;

-- Lecture, écriture et suppression uniquement pour le propriétaire
CREATE POLICY "apprenant_profil_vertical_own"
  ON apprenant_profils_verticales
  FOR ALL
  USING (
    apprenant_id = (SELECT id FROM apprenants WHERE user_id = auth.uid())
  )
  WITH CHECK (
    apprenant_id = (SELECT id FROM apprenants WHERE user_id = auth.uid())
  );

-- ── 4. RLS — avis (ajout policy DELETE) ──────────────────────
-- Nécessaire pour le bouton "Supprimer" de l'espace personnel

CREATE POLICY "avis_apprenant_delete_own" ON avis
  FOR DELETE USING (
    apprenant_id IS NOT NULL AND
    apprenant_id = (SELECT id FROM apprenants WHERE user_id = auth.uid())
  );
