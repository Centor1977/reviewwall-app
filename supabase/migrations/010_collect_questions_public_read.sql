-- ============================================================
-- ReviewWall — Migration 010 : Lecture publique questions
-- ============================================================
-- Le formulaire de collecte (client anon) doit pouvoir lire :
--   1. Les questions associées à l'offre (offre_questions + questions_bibliotheque)
--   2. Les réponses publiques (via question_reponses_public_read)
--
-- La policy question_reponses_public_read de la migration 009
-- utilise offre_questions dans son USING — sans cette migration,
-- le subquery échoue silencieusement car l'anon n'a pas
-- de SELECT policy sur offre_questions.
-- ============================================================

-- Lecture publique des associations offre ↔ question
CREATE POLICY "offre_questions_public_read"
  ON offre_questions FOR SELECT
  USING (true);

-- Lecture publique des questions (texte, type, options affichés dans le formulaire)
CREATE POLICY "questions_bibliotheque_public_read"
  ON questions_bibliotheque FOR SELECT
  USING (true);
