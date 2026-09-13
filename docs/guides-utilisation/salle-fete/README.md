# Guide utilisateur — Module Salle de fête

Guide d'utilisation du module **Salle de fête** (réservations, calendrier,
encaissements) de la plateforme GLOBAL SIM GROUP.

## Contenu

| Fichier | Rôle |
|---------|------|
| `salle-fete.tex` | Source LaTeX du guide |
| `salle-fete.pdf` | PDF compilé, prêt à distribuer |
| `build-guide.ps1` | Compile le PDF (3 passages `pdflatex`) |
| `screenshots/salle-fete/` | Captures Playwright réelles de l'application |

Les scripts de capture sont à la racine du projet :

- `scripts/capture-salle-fete-guide.mjs` — liste, création, calendrier, mobile.
- `scripts/capture-salle-fete-fiche.mjs` — fiche + cycle Confirmer / Réaliser
  (re-capture ciblée, retrouve la réservation via le filtre « Manifestation »).

## Ce que couvre le guide

- La liste des réservations : colonnes (client, date, manifestation, tarif,
  acompte, solde, statut), filtres (statut, manifestation, période).
- Créer une réservation : recherche/création de client, date, heure, durée,
  type de manifestation, tarif, acompte, observations.
- La fiche : informations, observations, tableau des paiements
  (`FINANCES.VOIR`).
- Le cycle de vie : Réservée → Confirmée → Réalisée, avec encaissement à
  chaque étape ; annulation.
- Le calendrier mensuel : navigation, étiquettes colorées, légende.
- Vue mobile (320 px), FAQ et récapitulatif des permissions.

## Regénérer les captures

Prérequis : serveur dev lancé (`npm run dev`) avec le backend réel.

```bash
node scripts/capture-salle-fete-guide.mjs
node scripts/capture-salle-fete-fiche.mjs   # complément fiche/cycle
```

Variables d'environnement optionnelles : `BASE_URL` (défaut
`http://localhost:3000`), `LOGIN` (défaut `admin`), `PASSWORD`, `OUT_DIR`.

> **Attention** : le script crée une vraie réservation « Mariage Guide » et
> de vrais encaissements dans la base de dev. Le statut est poussé jusqu'à
> « Réalisée » pour documenter le cycle complet.

## Compiler le PDF

Depuis ce dossier, dans PowerShell :

```powershell
.\build-guide.ps1
```

## Permissions documentées

| Action | Permission(s) |
|--------|---------------|
| Voir réservations + calendrier | `SALLE_FETE.VOIR` |
| Nouvelle réservation | `SALLE_FETE.CREER` |
| Modifier / annuler | `SALLE_FETE.MODIFIER` |
| Confirmer / réaliser (encaisser) | `SALLE_FETE.MODIFIER` + `FINANCES.VOIR` |
| Voir le tableau des paiements | `FINANCES.VOIR` |
