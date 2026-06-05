-- ============================================================
-- ReviewWall — Migration 006 : Politiques publiques collecte
-- Le flux de collecte utilise le client anon (pas d'auth).
-- Ces policies sont nécessaires pour que la page /collect
-- puisse lire les tokens, insérer les avis et marquer les
-- tokens comme utilisés.
-- ============================================================

-- Lecture publique des tokens (pour vérifier qu'un token existe
-- et n'est pas encore utilisé, sans connaître l'identité de l'appelant)
CREATE POLICY "collecte_tokens_public_read" ON collecte_tokens
  FOR SELECT USING (true);

-- Mise à jour publique pour marquer un token comme utilisé
-- (WITH CHECK garantit qu'on ne peut que passer used à true)
CREATE POLICY "collecte_tokens_public_update" ON collecte_tokens
  FOR UPDATE
  USING (NOT used)
  WITH CHECK (used = true);

-- Insertion publique d'avis (le client anon crée l'avis après soumission)
CREATE POLICY "avis_public_insert" ON avis
  FOR INSERT WITH CHECK (true);
