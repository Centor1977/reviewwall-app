-- Stocke l'email dans prestataires pour éviter les requêtes sur auth.users
ALTER TABLE prestataires ADD COLUMN IF NOT EXISTS email text;
