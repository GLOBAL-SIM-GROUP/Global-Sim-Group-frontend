# Guide d'utilisation — Module Rapports

Ce dossier contient le guide utilisateur du module Rapports de GLOBAL SIM GROUP.

## Fichiers

- `rapports.tex` : source LaTeX du guide.
- `rapports.pdf` : version PDF compilée.
- `build-guide.ps1` : script de compilation (3 passages pdflatex).
- `screenshots/rapports/` : captures d'écran générées avec Playwright.

## Captures disponibles

Les captures couvrent :

- Page d'entrée des rapports (choix du type et de la période).
- Menus déroulants type et période ouverts.
- Période personnalisée (champs de date vides et remplis).
- Rapport de synthèse globale (indicateurs + recettes par activité).
- Rapport financier (encaissements, dépenses, impayés).
- Rapport RH (synthèse de la paie).
- Rapports par activité : Résidence (indicateurs + payeurs), Market, Pressing, Restaurant, Salle de fête.
- Vue mobile (320 px) : page d'entrée et synthèse globale.

## Régénérer le PDF

```bash
cd docs/guides-utilisation/rapports
.\build-guide.ps1
```

Ou manuellement :

```bash
cd docs/guides-utilisation/rapports
pdflatex -interaction=nonstopmode rapports.tex
pdflatex -interaction=nonstopmode rapports.tex
```

## Régénérer les captures

```bash
cd ../..
node scripts/capture-rapports-guide.mjs
```

Le script utilise par défaut `http://localhost:3000` avec l'utilisateur `admin`.
Tu peux surcharger les variables d'environnement :

```bash
BASE_URL=http://localhost:3002 LOGIN=admin PASSWORD=... node scripts/capture-rapports-guide.mjs
```

## Erreurs rencontrées pendant la génération

- Avertissement React « Each child in a list should have a unique key prop » dans `SectionTableau` (rapport financier) — sans impact visuel sur les captures.
