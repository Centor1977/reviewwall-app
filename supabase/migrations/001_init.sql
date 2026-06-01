-- ============================================================
-- ReviewWall — schéma initial
-- Source de vérité du projet (tables déjà appliquées en prod)
-- ============================================================

-- Formateurs
create table formateurs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  nom text not null,
  slug text unique not null,
  organisme text,
  site_url text,
  plan text default 'freemium',
  created_at timestamptz default now()
);

-- Formations
create table formations (
  id uuid primary key default gen_random_uuid(),
  formateur_id uuid references formateurs not null,
  titre text not null,
  slug text unique not null,
  description text,
  categorie text,
  url_externe text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Tokens de collecte
create table collecte_tokens (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  formation_id uuid references formations not null,
  email_apprenant text,
  used boolean default false,
  used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Avis
create table avis (
  id uuid primary key default gen_random_uuid(),
  token_id uuid references collecte_tokens not null,
  formation_id uuid references formations not null,
  profil_niveau text,
  profil_objectif text,
  profil_situation text,
  profil_age_range text,
  profil_domaine_avant text,
  note integer check (note between 1 and 5),
  recommande boolean,
  avis_texte text,
  point_fort text,
  point_amelioration text,
  badge text default 'invite',
  modere boolean default false,
  publie boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table formateurs enable row level security;
alter table formations enable row level security;
alter table collecte_tokens enable row level security;
alter table avis enable row level security;

-- Formateurs : accès à son propre profil uniquement
create policy "formateur_select_own" on formateurs
  for select using (user_id = auth.uid());

create policy "formateur_insert_own" on formateurs
  for insert with check (user_id = auth.uid());

-- Formations : toutes opérations sur ses propres formations
create policy "formations_select_own" on formations
  for all using (
    formateur_id = (select id from formateurs where user_id = auth.uid())
  );

-- Tokens : toutes opérations via la chaîne formations → formateurs
create policy "tokens_select_own" on collecte_tokens
  for all using (
    formation_id in (
      select id from formations where formateur_id = (
        select id from formateurs where user_id = auth.uid()
      )
    )
  );

-- Avis : lecture publique des avis publiés
create policy "avis_public_read" on avis
  for select using (publie = true);
