# Guide d'utilisation — Module Résidence

Ce dossier contient le guide utilisateur du module Résidence de GLOBAL SIM GROUP.

## Fichiers

- `residence.tex` : source LaTeX du guide.
- `residence.pdf` : version PDF compilée (63 pages).
- `PROMPT-guide-residence.md` : prompt réutilisable pour faire générer/mettre à jour ce guide par une IA.
- `screenshots/residence/` : captures d'écran générées automatiquement avec Playwright.

## Captures disponibles

Les captures couvrent :

- Connexion et tableau de bord.
- Menu Résidence.
- Liste, création et détails des bâtiments.
- Liste, création des logements.
- Liste des contrats et formulaire de création jusqu'à la sélection du bâtiment/logement.
- Listes des séjours courts, charges et abonnements, ainsi que leurs formulaires vides.
- Liste des échéances.
- Portail résident.

## Erreurs rencontrées pendant la génération

Les erreurs backend initiales (500 sur les logements, 403 sur les services
d'abonnement) sont résolues : les captures ont été refaites depuis.

Scripts complémentaires : `scripts/capture-residence-fix.mjs`
(2026-09-21 — formulaire séjour sans acompte, formulaire abonnement avec
le bandeau « résidents uniquement » et le bouton « Créer un locataire »).

## Regénérer le PDF

```bash
cd docs/guides-utilisation
pdflatex -interaction=nonstopmode residence.tex
pdflatex -interaction=nonstopmode residence.tex
```

## Régénérer les captures

```bash
cd ../..
node scripts/capture-residence-guide.mjs
```

Le script utilise par défaut `http://localhost:3000` avec l'utilisateur `admin`.
Tu peux surcharger les variables d'environnement :

```bash
BASE_URL=https://dev.sim.strife-cyber.org LOGIN=admin PASSWORD=... node scripts/capture-residence-guide.mjs
```
