-- ============================================================
-- ReviewWall — Migration 002 : Multi-verticales
-- Exécuté dans Supabase SQL Editor le 2026-05-29
-- ATTENTION : la suppression des colonnes profil_* est destructive
-- ============================================================

-- ── 1. Renommer les tables ──────────────────────────────────
ALTER TABLE formateurs RENAME TO prestataires;
ALTER TABLE formations RENAME TO offres;

-- ── 2. Renommer les FK ─────────────────────────────────────
ALTER TABLE offres
  RENAME COLUMN formateur_id TO prestataire_id;

ALTER TABLE collecte_tokens
  RENAME COLUMN formation_id TO offre_id;

ALTER TABLE avis
  RENAME COLUMN formation_id TO offre_id;

-- ── 3. Colonne vertical ────────────────────────────────────
ALTER TABLE prestataires
  ADD COLUMN vertical text NOT NULL DEFAULT 'formation';

ALTER TABLE offres
  ADD COLUMN vertical text NOT NULL DEFAULT 'formation';

-- ── 4. Profil jsonb dans avis ─────────────────────────────
ALTER TABLE avis
  DROP COLUMN IF EXISTS profil_niveau,
  DROP COLUMN IF EXISTS profil_objectif,
  DROP COLUMN IF EXISTS profil_situation,
  DROP COLUMN IF EXISTS profil_age_range,
  DROP COLUMN IF EXISTS profil_domaine_avant,
  ADD COLUMN profil jsonb NOT NULL DEFAULT '{}';

-- ── 5. Policies RLS — Prestataires ────────────────────────
DROP POLICY IF EXISTS "formateur_select_own"    ON prestataires;
DROP POLICY IF EXISTS "formateur_insert_own"    ON prestataires;
DROP POLICY IF EXISTS "formateur_public_select" ON prestataires;

CREATE POLICY "prestataire_select_own" ON prestataires
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "prestataire_insert_own" ON prestataires
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "prestataire_public_select" ON prestataires
  FOR SELECT USING (true);

-- ── 6. Policies RLS — Offres ──────────────────────────────
DROP POLICY IF EXISTS "formations_select_own"   ON offres;
DROP POLICY IF EXISTS "formation_public_select" ON offres;

CREATE POLICY "offres_select_own" ON offres
  FOR ALL USING (
    prestataire_id = (
      SELECT id FROM prestataires WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "offre_public_select" ON offres
  FOR SELECT USING (active = true);

-- ── 7. Policies RLS — collecte_tokens ────────────────────
DROP POLICY IF EXISTS "tokens_select_own" ON collecte_tokens;

CREATE POLICY "tokens_select_own" ON collecte_tokens
  FOR ALL USING (
    offre_id IN (
      SELECT id FROM offres
      WHERE prestataire_id = (
        SELECT id FROM prestataires WHERE user_id = auth.uid()
      )
    )
  );

-- ── 8. Policies RLS — Avis ───────────────────────────────
-- avis_public_read et avis_public_insert : logique inchangée
