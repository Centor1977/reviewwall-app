-- ============================================================
-- ReviewWall — Migration 012 : Catalogue public (Option D)
-- ============================================================
-- Option D : avant le premier avis → le formateur contrôle
-- la visibilité. Dès le premier avis vérifié → publication
-- automatique et définitive (impossible à annuler).
-- ============================================================

-- ── 1. Colonnes catalogue sur offres ─────────────────────────

ALTER TABLE offres
  ADD COLUMN IF NOT EXISTS catalogue_visible boolean NOT NULL DEFAULT false,
  -- Contrôlé par le formateur AVANT le premier avis vérifié
  ADD COLUMN IF NOT EXISTS catalogue_force   boolean NOT NULL DEFAULT false,
  -- Mis à true automatiquement dès le premier avis → verrouille
  ADD COLUMN IF NOT EXISTS premier_avis_at   timestamptz;
  -- Date du premier avis vérifié, déclenche le verrouillage

-- ── 2. Trigger : verrouillage au premier avis ────────────────
-- Hypothèse : la colonne publie sur avis vaut true par défaut
-- pour tous les avis soumis via le formulaire de collecte.
-- Si publie est géré manuellement, ajuster la condition.

CREATE OR REPLACE FUNCTION lock_offre_catalogue()
RETURNS TRIGGER AS $$
BEGIN
  -- Premier avis vérifié sur cette offre → verrouillage
  IF NEW.offre_id IS NOT NULL THEN
    UPDATE offres
    SET
      catalogue_force   = true,
      catalogue_visible = true,
      premier_avis_at   = COALESCE(premier_avis_at, now())
    WHERE id               = NEW.offre_id
      AND catalogue_force  = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_lock_offre_catalogue
  AFTER INSERT ON avis
  FOR EACH ROW EXECUTE FUNCTION lock_offre_catalogue();

-- ── 3. Trigger : empêcher le retrait une fois verrouillé ─────

CREATE OR REPLACE FUNCTION prevent_catalogue_unlist()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.catalogue_force = true AND NEW.catalogue_visible = false THEN
    RAISE EXCEPTION
      'Cette offre a des avis vérifiés et ne peut plus être retirée du catalogue.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_catalogue_unlist
  BEFORE UPDATE ON offres
  FOR EACH ROW EXECUTE FUNCTION prevent_catalogue_unlist();

-- ── 4. Index performances ─────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_offres_catalogue
  ON offres(catalogue_visible, active)
  WHERE catalogue_visible = true AND active = true;

CREATE INDEX IF NOT EXISTS idx_offres_fts
  ON offres USING gin(
    to_tsvector('french',
      coalesce(titre, '') || ' ' ||
      coalesce(description_courte, '') || ' ' ||
      coalesce(description_longue, '')
    )
  );
