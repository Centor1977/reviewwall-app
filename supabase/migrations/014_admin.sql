-- ============================================================
-- ReviewWall — Migration 014 : Console admin
-- ============================================================
-- Tables   : admin_users, signalements, admin_logs
-- Colonnes : prestataires.statut / plan_expire_at
--            avis.masque
-- Trigger  : prevent_catalogue_unlist étendu (bypass admin)
-- RLS      : accès admin sur toutes les tables métier
-- ============================================================

-- ── 1. Table admin_users (en premier — référencée par is_admin) ──────────

CREATE TABLE admin_users (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        REFERENCES auth.users NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- ── 2. Fonction is_admin ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = p_user_id
  );
$$;

-- ── 3. Colonnes admin sur prestataires ───────────────────────────────────
-- plan existe déjà (migration 001) — on ajoute statut + plan_expire_at

ALTER TABLE prestataires
  ADD COLUMN IF NOT EXISTS statut         text        NOT NULL DEFAULT 'actif',
  ADD COLUMN IF NOT EXISTS plan_expire_at timestamptz;

ALTER TABLE prestataires
  ADD CONSTRAINT prestataires_statut_check
    CHECK (statut IN ('actif', 'suspendu', 'banni')),
  ADD CONSTRAINT prestataires_plan_check
    CHECK (plan IN ('freemium', 'starter', 'pro', 'scale'));

-- ── 4. Colonne masque sur avis ────────────────────────────────────────────
-- Distinct de publie (flux normal prestataire) :
-- masque = true → retiré de l'affichage public par décision admin.

ALTER TABLE avis
  ADD COLUMN IF NOT EXISTS masque boolean NOT NULL DEFAULT false;

-- Met à jour la policy publique pour exclure les avis masqués par l'admin.
-- La policy existante avis_public_read ne filtre que publie = true.
DROP POLICY IF EXISTS "avis_public_read" ON avis;
CREATE POLICY "avis_public_read" ON avis
  FOR SELECT USING (publie = true AND masque = false);

-- ── 5. Bypass admin sur le trigger prevent_catalogue_unlist ─────────────
-- Le trigger original (migration 012) bloque catalogue_visible = false
-- quand catalogue_force = true.
-- L'admin doit pouvoir dépublier une offre problématique — on lève l'exception
-- si l'utilisateur courant est dans admin_users.

CREATE OR REPLACE FUNCTION prevent_catalogue_unlist()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.catalogue_force = true
     AND NEW.catalogue_visible = false
     AND NOT is_admin(auth.uid())
  THEN
    RAISE EXCEPTION
      'Cette offre a des avis vérifiés et ne peut plus être retirée du catalogue.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── 6. Table signalements ─────────────────────────────────────────────────

CREATE TABLE signalements (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  avis_id     uuid        REFERENCES avis NOT NULL,
  signale_par uuid        REFERENCES auth.users,
  -- null = signalement anonyme
  raison      text        NOT NULL,
  detail      text,
  statut      text        NOT NULL DEFAULT 'en_attente',
  traite_par  uuid        REFERENCES admin_users(id),
  traite_at   timestamptz,
  created_at  timestamptz DEFAULT now(),

  CONSTRAINT signalements_raison_check
    CHECK (raison IN ('spam', 'faux_avis', 'contenu_inapproprie', 'autre')),
  CONSTRAINT signalements_statut_check
    CHECK (statut IN ('en_attente', 'traite', 'rejete'))
);

-- ── 7. Table admin_logs ───────────────────────────────────────────────────

CREATE TABLE admin_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    uuid        REFERENCES admin_users(id) NOT NULL,
  action      text        NOT NULL,
  -- suspend_prestataire | unsuspend_prestataire | ban_prestataire
  -- mask_avis | restore_avis | delete_avis
  -- change_plan | force_unpublish_offre
  -- treat_signalement | reject_signalement
  cible_type  text        NOT NULL,
  -- prestataire | avis | offre | signalement
  cible_id    uuid        NOT NULL,
  detail      jsonb       NOT NULL DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

-- ── 8. Index ──────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_prestataires_statut
  ON prestataires(statut);

CREATE INDEX IF NOT EXISTS idx_prestataires_plan
  ON prestataires(plan);

CREATE INDEX IF NOT EXISTS idx_avis_masque
  ON avis(masque)
  WHERE masque = true;

CREATE INDEX IF NOT EXISTS idx_signalements_statut
  ON signalements(statut, created_at DESC)
  WHERE statut = 'en_attente';

CREATE INDEX IF NOT EXISTS idx_signalements_avis
  ON signalements(avis_id);

CREATE INDEX IF NOT EXISTS idx_admin_logs_cible
  ON admin_logs(cible_type, cible_id);

CREATE INDEX IF NOT EXISTS idx_admin_logs_created
  ON admin_logs(created_at DESC);

-- ── 9. RLS — nouvelles tables ─────────────────────────────────────────────

ALTER TABLE admin_users  ENABLE ROW LEVEL SECURITY;
ALTER TABLE signalements ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs   ENABLE ROW LEVEL SECURITY;

-- admin_users : chaque admin ne voit que sa propre ligne
CREATE POLICY "admin_users_self"
  ON admin_users FOR ALL
  USING (user_id = auth.uid());

-- signalements : insert public (anonyme ou authentifié)
CREATE POLICY "signalement_public_insert"
  ON signalements FOR INSERT
  WITH CHECK (true);

-- signalements : lecture admin uniquement
CREATE POLICY "signalement_admin_read"
  ON signalements FOR SELECT
  USING (is_admin(auth.uid()));

-- signalements : mise à jour admin uniquement (traitement)
CREATE POLICY "signalement_admin_update"
  ON signalements FOR UPDATE
  USING (is_admin(auth.uid()));

-- admin_logs : toutes opérations réservées à l'admin
-- (l'INSERT est déclenché par les Server Actions admin)
CREATE POLICY "admin_logs_admin_only"
  ON admin_logs FOR ALL
  USING (is_admin(auth.uid()));

-- ── 10. RLS — accès admin sur tables métier existantes ───────────────────

-- Prestataires
CREATE POLICY "prestataires_admin_all"
  ON prestataires FOR ALL
  USING (is_admin(auth.uid()));

-- Offres
CREATE POLICY "offres_admin_all"
  ON offres FOR ALL
  USING (is_admin(auth.uid()));

-- Avis (lecture + masquage + suppression)
CREATE POLICY "avis_admin_all"
  ON avis FOR ALL
  USING (is_admin(auth.uid()));

-- ── 11. Enregistrement de l'admin initial ─────────────────────────────────
-- À exécuter manuellement dans Supabase SQL Editor après la migration :
--
-- INSERT INTO admin_users (user_id)
-- VALUES ('[TON USER_ID SUPABASE]');
--
-- Récupérer l'UUID dans : Authentication > Users > ton compte
