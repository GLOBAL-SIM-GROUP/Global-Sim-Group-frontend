# Guide d'utilisation — Module Résidence

Ce dossier contient le guide utilisateur du module Résidence de GLOBAL SIM GROUP.

## Fichiers

- `residence.tex` : source LaTeX du guide.
- `residence.pdf` : version PDF compilée (31 pages).
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

Le serveur de développement a rencontré des erreurs qui ont empêché la capture complète des soumissions de formulaires :

- `500` sur `GET /api/v1/residence/logements` lors de la création d'un logement (« Erreur base de données »).
- Aucune option de logement n'apparaissait ensuite dans les formulaires de contrat, séjour et charge.
- Une erreur `403` est survenue lors de l'ouverture du menu des services dans le formulaire d'abonnement.

Ces erreurs sont documentées dans l'annexe du PDF. Elles semblent liées au backend de développement ou au jeu de données de test, pas au guide lui-même.

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
