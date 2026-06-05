# Thèmes de l'application

## Dashboard formateur

**Thème :** sombre (#0f0f0f)  
**Classe racine :** `dashboard-dark` (posée sur le wrapper du layout)  
**Tokens :** `src/styles/dashboard-dark.css`  
**Activé dans :** `src/app/(dashboard)/layout.tsx`

Fonctionnement : `.dashboard-dark` surcharge les custom properties Tailwind v4
(`--color-white`, `--color-slate-*`, etc.) pour tous ses descendants via
l'héritage CSS natif. Aucun changement dans les composants nécessaire.

## Espace apprenant

**Thème :** clair (par défaut)  
**Classe racine :** aucune  
**Pour activer dark :** ajouter la classe `apprenant-dark` sur le wrapper
du layout apprenant et créer `src/styles/apprenant-dark.css` (mêmes tokens
`--dash-*` mais avec les valeurs souhaitées).

## Pages publiques

**Thème :** clair (par défaut)  
Ne jamais appliquer de thème forcé ici — ces pages sont indexées et
doivent rester en mode système.

## Console admin

**Thème :** propre (fond slate-900, sidebar slate-900)  
Défini directement dans `src/app/(admin)/layout.tsx` — ne pas y toucher.
