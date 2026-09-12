# Guide d'utilisation — Accueil & Tableau de bord global

Ce dossier contient le guide utilisateur des pages Accueil et Tableau de bord global de GLOBAL SIM GROUP.

## Fichiers

- `accueil-tableau-de-bord.tex` : source LaTeX du guide.
- `accueil-tableau-de-bord.pdf` : version PDF compilée.
- `build-guide.ps1` : script de compilation (3 passages pdflatex).
- `screenshots/accueil-dashboard/` : captures d'écran générées avec Playwright.

## Captures disponibles

Les captures couvrent :

- Connexion (page de login, identifiants remplis).
- Page d'accueil desktop et mobile (tuiles de modules, survol, menu utilisateur, notifications).
- Menu latéral mobile (burger déployé).
- Tableau de bord global (vue d'ensemble, filtre de période, période personnalisée).
- Sections du tableau de bord : Résidence, Vue financière, Recettes par activité, Services, Market & Inventaire, Blanchisserie, Ressources humaines.
- Tableau de bord sur téléphone (320 px).

## Régénérer le PDF

```bash
cd docs/guides-utilisation/accueil-dashboard
.\build-guide.ps1
```

Ou manuellement :

```bash
cd docs/guides-utilisation/accueil-dashboard
pdflatex -interaction=nonstopmode accueil-tableau-de-bord.tex
pdflatex -interaction=nonstopmode accueil-tableau-de-bord.tex
```

## Régénérer les captures

```bash
cd ../..
node scripts/capture-accueil-dashboard-guide.mjs
```

Le script utilise par défaut `http://localhost:3000` avec l'utilisateur `admin`.
Tu peux surcharger les variables d'environnement :

```bash
BASE_URL=https://dev.sim.strife-cyber.org LOGIN=admin PASSWORD=... node scripts/capture-accueil-dashboard-guide.mjs
```

## Erreurs rencontrées pendant la génération

- Avertissement React « two children with the same key » sur la page d'accueil (clé `2026-07` dupliquée) — sans impact visuel sur les captures.
