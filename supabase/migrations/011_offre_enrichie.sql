-- ============================================================
-- ReviewWall — Migration 011 : Fiche offre enrichie
-- ============================================================

ALTER TABLE offres
  ADD COLUMN IF NOT EXISTS description_courte  text,
  -- Accroche 1-2 phrases (max 200 chars recommandé)
  ADD COLUMN IF NOT EXISTS description_longue  text,
  -- Rich text au format Markdown
  ADD COLUMN IF NOT EXISTS image_url           text,
  -- URL image de couverture (Cloudflare R2 ou externe)
  ADD COLUMN IF NOT EXISTS niveau              text,
  -- debutant | intermediaire | avance | tous_niveaux
  ADD COLUMN IF NOT EXISTS duree               text,
  -- Texte libre : "14h", "2 jours", "6 semaines"
  ADD COLUMN IF NOT EXISTS format              text,
  -- presentiel | distanciel | blended | video | mixte
  ADD COLUMN IF NOT EXISTS langue              text DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS prix                numeric(10,2),
  -- null si non renseigné / inclus dans financement
  ADD COLUMN IF NOT EXISTS tags                jsonb DEFAULT '[]',
  -- ["Excel", "Bureautique", "Microsoft Office"]
  ADD COLUMN IF NOT EXISTS metadata_vertical   jsonb DEFAULT '{}';
  -- Champs spécifiques à la verticale.
  -- Formation :
  --   { objectifs: string[], prerequis: string[],
  --     public_cible: string,
  --     programme: [{titre: string, contenu: string}],
  --     competences: string[],
  --     cpf: boolean, opco: boolean,
  --     certification: boolean, certification_detail: string }
