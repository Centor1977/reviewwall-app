-- ============================================================
-- ReviewWall — Migration 007 : Espace apprenant
-- ============================================================

-- ── 1. Table apprenants ──────────────────────────────────────

CREATE TABLE apprenants (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users NOT NULL UNIQUE,
  prenom     text,
  nom        text,
  email      text,
  telephone  text,
  profil     jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER apprenants_updated_at
  BEFORE UPDATE ON apprenants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 2. Rattachement des avis à un apprenant ──────────────────

ALTER TABLE avis
  ADD COLUMN apprenant_id uuid REFERENCES apprenants(id) ON DELETE SET NULL;

-- ── 3. Row Level Security — apprenants ───────────────────────

ALTER TABLE apprenants ENABLE ROW LEVEL SECURITY;

-- Un apprenant lit uniquement son propre profil
CREATE POLICY "apprenant_select_own" ON apprenants
  FOR SELECT USING (user_id = auth.uid());

-- Un apprenant crée son propre profil
CREATE POLICY "apprenant_insert_own" ON apprenants
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Un apprenant modifie uniquement son propre profil
CREATE POLICY "apprenant_update_own" ON apprenants
  FOR UPDATE USING (user_id = auth.uid());

-- Un apprenant peut supprimer son compte
CREATE POLICY "apprenant_delete_own" ON apprenants
  FOR DELETE USING (user_id = auth.uid());

-- ── 4. Row Level Security — avis (ajouts) ────────────────────

-- Un apprenant peut modifier ses propres avis
CREATE POLICY "avis_apprenant_update_own" ON avis
  FOR UPDATE USING (
    apprenant_id IS NOT NULL AND
    apprenant_id = (SELECT id FROM apprenants WHERE user_id = auth.uid())
  );

-- ── NOTE ─────────────────────────────────────────────────────
-- Les prestataires n'ont aucune policy sur apprenants :
-- ils ne peuvent ni lire ni écrire les profils apprenants.
-- La policy "apprenant_select_own" étant la seule SELECT,
-- un prestataire (user_id différent) obtient toujours 0 lignes.
-- ─────────────────────────────────────────────────────────────
